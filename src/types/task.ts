export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string; // URL or Data URL (for drag-and-drop local files)
  type?: 'link' | 'drive' | 'document' | 'meeting' | 'image' | 'file' | 'other';
  fileSize?: string;
  isUploadedFile?: boolean;
}

export interface TaskHistoryItem {
  id: string;
  timestamp: string; // ISO string
  author: string;
  action: string;
  note?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
  bgLight: string;
  borderLight: string;
  textColor: string;
  dotColor: string;
  isDefault?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  hasDeadline: boolean; // มีกำหนดส่ง หรือ ไม่มี deadline
  time?: string;     // HH:mm
  isAllDay: boolean;
  categoryId: string;
  priority: TaskPriority;
  status: TaskStatus;
  subtasks: SubTask[];
  attachments: TaskAttachment[]; // รองรับลิงก์และไฟล์ที่ลากมาวาง
  history: TaskHistoryItem[];    // ประวัติการบันทึกและการทำ
  createdAt: string;
  updatedAt: string;
}

export interface PriorityInfo {
  id: TaskPriority;
  labelTh: string;
  color: string;
  bgLight: string;
  borderLight: string;
  textColor: string;
  dotColor: string;
}

export interface StatusInfo {
  id: TaskStatus;
  labelTh: string;
  color: string;
  bgLight: string;
  textColor: string;
  badgeClass: string;
}
