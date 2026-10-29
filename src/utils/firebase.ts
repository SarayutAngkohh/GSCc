import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Task, CategoryItem } from '../types/task';
import { MemberAccount } from '../types/auth';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with configured databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google Auth Provider for Google Workspace Scopes (Sheets & Drive)
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory access token cache (do not store in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Handle Firestore errors with structured JSON object
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Recursively cleans an object for Firestore by removing keys with undefined values.
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

/**
 * Test connection to Firestore on app startup
 */
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

/**
 * Subscribe to tasks from Firestore
 */
export function subscribeToTasks(onUpdate: (tasks: Task[]) => void): () => void {
  const tasksRef = collection(db, 'tasks');
  return onSnapshot(
    tasksRef,
    (snapshot) => {
      const taskList: Task[] = snapshot.docs.map((docSnap) => docSnap.data() as Task);
      taskList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(taskList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    }
  );
}

/**
 * Save or update a task in Firestore
 */
export async function saveTaskToFirestore(task: Task): Promise<void> {
  const path = `tasks/${task.id}`;
  try {
    const cleanedTask = sanitizeForFirestore(task);
    const taskRef = doc(db, 'tasks', task.id);
    await setDoc(taskRef, cleanedTask, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a task from Firestore
 */
export async function deleteTaskFromFirestore(taskId: string): Promise<void> {
  const path = `tasks/${taskId}`;
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribe to custom categories from Firestore
 */
export function subscribeToCategories(onUpdate: (categories: CategoryItem[]) => void): () => void {
  const catRef = collection(db, 'categories');
  return onSnapshot(
    catRef,
    (snapshot) => {
      const catList: CategoryItem[] = snapshot.docs.map((docSnap) => docSnap.data() as CategoryItem);
      onUpdate(catList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    }
  );
}

/**
 * Save category to Firestore
 */
export async function saveCategoryToFirestore(category: CategoryItem): Promise<void> {
  const path = `categories/${category.id}`;
  try {
    const cleanedCategory = sanitizeForFirestore(category);
    const catRef = doc(db, 'categories', category.id);
    await setDoc(catRef, cleanedCategory, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to members (including passcodes) from Firestore
 */
export function subscribeToMembers(onUpdate: (members: MemberAccount[]) => void): () => void {
  const membersRef = collection(db, 'members');
  return onSnapshot(
    membersRef,
    (snapshot) => {
      const memberList: MemberAccount[] = snapshot.docs.map((docSnap) => docSnap.data() as MemberAccount);
      onUpdate(memberList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'members');
    }
  );
}

/**
 * Save member account / passcode to Firestore
 */
export async function saveMemberToFirestore(member: MemberAccount): Promise<void> {
  const path = `members/${member.id}`;
  try {
    const cleanedMember = sanitizeForFirestore(member);
    const memberRef = doc(db, 'members', member.id);
    await setDoc(memberRef, cleanedMember, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Seed initial member accounts & passcodes into Firestore if not exists
 */
export async function seedMembersIfEmpty(defaultMembers: MemberAccount[]): Promise<void> {
  try {
    const membersRef = collection(db, 'members');
    const snapshot = await getDocs(membersRef);
    if (snapshot.empty) {
      for (const m of defaultMembers) {
        await saveMemberToFirestore(m);
      }
    }
  } catch (error) {
    console.warn('Failed to seed members:', error);
  }
}

/**
 * Init Firebase Auth listener
 */
export const initAuthListener = (
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedAccessToken && onSuccess) {
        onSuccess(user, cachedAccessToken);
      } else if (!isSigningIn && onFailure) {
        onFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onFailure) onFailure();
    }
  });
};

/**
 * Google Sign In with OAuth Popup
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google Auth.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current Google Workspace access token from memory
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
