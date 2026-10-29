import { GENIUS_MEMBERS, MemberAccount } from '../types/auth';

/**
 * Normalize passcode string by trimming and removing extra spaces around slashes
 */
export function normalizePasscode(code: string): string {
  if (!code) return '';
  return code
    .trim()
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, '');
}

/**
 * Verify member passcode against member list (fetched from Firestore or default)
 */
export function verifyMemberPasscode(
  memberName: string, 
  inputPasscode: string, 
  memberList: MemberAccount[] = GENIUS_MEMBERS
): boolean {
  const list = memberList && memberList.length > 0 ? memberList : GENIUS_MEMBERS;
  const member = list.find(m => m.name === memberName);
  if (!member || member.isOther) return false;

  const normalizedInput = normalizePasscode(inputPasscode);
  const normalizedExpected = normalizePasscode(member.passcode);

  return normalizedInput === normalizedExpected;
}

/**
 * Get member by name
 */
export function getMemberByName(
  name: string, 
  memberList: MemberAccount[] = GENIUS_MEMBERS
): MemberAccount | undefined {
  const list = memberList && memberList.length > 0 ? memberList : GENIUS_MEMBERS;
  return list.find(m => m.name === name);
}
