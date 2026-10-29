export interface MemberAccount {
  id: string;
  name: string;
  passcode: string;
  avatarColor: string;
  role: string;
  isOther?: boolean;
}

export const GENIUS_MEMBERS: MemberAccount[] = [
  {
    id: 'ceasar',
    name: 'ซีซ่า',
    passcode: '3/ตุลาคม/2551',
    avatarColor: '#6366f1', // Indigo
    role: 'สมาชิกกลุ่ม Genius Society'
  },
  {
    id: 'wan',
    name: 'ว่าน',
    passcode: '2/เมษายน/2552',
    avatarColor: '#10b981', // Emerald
    role: 'สมาชิกกลุ่ม Genius Society'
  },
  {
    id: 'khanomtom',
    name: 'ขนมต้ม',
    passcode: '29/มีนาคม/2552',
    avatarColor: '#f59e0b', // Amber
    role: 'สมาชิกกลุ่ม Genius Society'
  },
  {
    id: 'stang',
    name: 'สตางค์',
    passcode: '17/กุมภาพันธ์/2552',
    avatarColor: '#ec4899', // Pink
    role: 'สมาชิกกลุ่ม Genius Society'
  },
  {
    id: 'tonkla',
    name: 'ต้นกล้า',
    passcode: '6/มีนาคม/2552',
    avatarColor: '#06b6d4', // Cyan
    role: 'สมาชิกกลุ่ม Genius Society'
  },
  {
    id: 'other',
    name: 'อื่นๆ',
    passcode: '',
    avatarColor: '#64748b', // Slate
    role: 'ผู้เยี่ยมชม / สมาชิกใหม่',
    isOther: true
  }
];
