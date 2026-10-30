import { CategoryItem, PriorityInfo, StatusInfo, Task, TaskPriority, TaskStatus } from '../types/task';

export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export const THAI_MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTH_NAMES_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const THAI_DAY_NAMES = [
  'อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'
];

export const THAI_DAY_NAMES_SHORT = [
  'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
];

// หมวดหมู่ตั้งต้นสำหรับนักเรียน / การเรียน
export const DEFAULT_STUDENT_CATEGORIES: CategoryItem[] = [
  {
    id: 'homework',
    name: 'การบ้าน & งานเดี่ยว',
    color: '#10b981', // emerald-500
    bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    borderLight: 'border-emerald-200',
    textColor: 'text-emerald-800',
    dotColor: 'bg-emerald-500',
    isDefault: true
  },
  {
    id: 'group_project',
    name: 'โครงงาน & งานกลุ่ม',
    color: '#3b82f6', // blue-500
    bgLight: 'bg-blue-50 text-blue-800 border-blue-200',
    borderLight: 'border-blue-200',
    textColor: 'text-blue-800',
    dotColor: 'bg-blue-500',
    isDefault: true
  },
  {
    id: 'exams',
    name: 'สอบย่อย & กลางภาค/ปลายภาค',
    color: '#ef4444', // red-500
    bgLight: 'bg-red-50 text-red-800 border-red-200',
    borderLight: 'border-red-200',
    textColor: 'text-red-800',
    dotColor: 'bg-red-500',
    isDefault: true
  },
  {
    id: 'study_review',
    name: 'อ่านหนังสือ & ติวทบทวน',
    color: '#8b5cf6', // purple-500
    bgLight: 'bg-purple-50 text-purple-800 border-purple-200',
    borderLight: 'border-purple-200',
    textColor: 'text-purple-800',
    dotColor: 'bg-purple-500',
    isDefault: true
  },
  {
    id: 'activities',
    name: 'กิจกรรมชมรม & กีฬา/สายรหัส',
    color: '#ec4899', // pink-500
    bgLight: 'bg-pink-50 text-pink-800 border-pink-200',
    borderLight: 'border-pink-200',
    textColor: 'text-pink-800',
    dotColor: 'bg-pink-500',
    isDefault: true
  },
  {
    id: 'competition',
    name: 'เตรียมสอบแข่งขัน & แฟ้มสะสมงาน',
    color: '#f97316', // orange-500
    bgLight: 'bg-orange-50 text-orange-800 border-orange-200',
    borderLight: 'border-orange-200',
    textColor: 'text-orange-800',
    dotColor: 'bg-orange-500',
    isDefault: true
  },
  {
    id: 'worksheets',
    name: 'ใบงาน & งานส่งคาบหน้า',
    color: '#06b6d4', // cyan-500
    bgLight: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    borderLight: 'border-cyan-200',
    textColor: 'text-cyan-800',
    dotColor: 'bg-cyan-500',
    isDefault: true
  }
];

export const PRIORITY_CONFIG: Record<TaskPriority, PriorityInfo> = {
  urgent: {
    id: 'urgent',
    labelTh: 'ด่วนที่สุด (ใกล้ส่ง)',
    color: '#dc2626',
    bgLight: 'bg-red-50',
    borderLight: 'border-red-300',
    textColor: 'text-red-700',
    dotColor: 'bg-red-600'
  },
  high: {
    id: 'high',
    labelTh: 'สำคัญสูง',
    color: '#ea580c',
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-300',
    textColor: 'text-orange-700',
    dotColor: 'bg-orange-500'
  },
  medium: {
    id: 'medium',
    labelTh: 'ปานกลาง',
    color: '#2563eb',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-300',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500'
  },
  low: {
    id: 'low',
    labelTh: 'ทั่วไป / เรื่อยๆ',
    color: '#64748b',
    bgLight: 'bg-slate-50',
    borderLight: 'border-slate-300',
    textColor: 'text-slate-600',
    dotColor: 'bg-slate-400'
  }
};

export const STATUS_CONFIG: Record<TaskStatus, StatusInfo> = {
  todo: {
    id: 'todo',
    labelTh: 'ยังไม่ได้ทำ',
    color: '#64748b',
    bgLight: 'bg-slate-100',
    textColor: 'text-slate-700',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  in_progress: {
    id: 'in_progress',
    labelTh: 'กำลังทำอยู่',
    color: '#0284c7',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-700',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  completed: {
    id: 'completed',
    labelTh: 'ทำเสร็จแล้ว',
    color: '#16a34a',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
};

/** Format Date object to YYYY-MM-DD */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the real current date as YYYY-MM-DD in Thailand timezone (Asia/Bangkok, UTC+7)
 * Ensures the date on the main screen, day of week, and Buddhist year adjust to real time
 */
export function getRealTodayDateString(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  } catch {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/** Check if two dates represent the same calendar day */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/** Convert CE Year to Buddhist Era (พ.ศ.) */
export function toBuddhistYear(ceYear: number): number {
  return ceYear + 543;
}

/** Check if dateStr falls in range [startDate, endDate] inclusive */
export function isDateInRange(dateStr: string, startDateStr: string, endDateStr: string): boolean {
  const start = startDateStr <= endDateStr ? startDateStr : endDateStr;
  const end = startDateStr <= endDateStr ? endDateStr : startDateStr;
  return dateStr >= start && dateStr <= end;
}

/** Calculate number of days in range */
export function calculateDateRangeDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  const d1 = new Date(startDateStr);
  const d2 = new Date(endDateStr);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/** Format Thai date string (e.g. 2026-10-29 -> "29 ตุลาคม 2569") */
export function formatThaiDate(
  dateStr: string, 
  options: { short?: boolean; includeYear?: boolean; includeDayName?: boolean } = {}
): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const d = new Date(year, monthIdx, day);
  const dayOfWeek = d.getDay();
  
  const monthName = options.short 
    ? THAI_MONTH_NAMES_SHORT[monthIdx] || '' 
    : THAI_MONTH_NAMES[monthIdx] || '';
  
  const bYear = toBuddhistYear(year);
  
  let result = `${day} ${monthName}`;
  if (options.includeYear !== false) {
    result += ` ${bYear}`;
  }
  
  if (options.includeDayName) {
    const dayName = options.short ? THAI_DAY_NAMES_SHORT[dayOfWeek] : THAI_DAY_NAMES[dayOfWeek];
    result = `วัน${dayName}ที่ ${result}`;
  }
  
  return result;
}

/** Format Thai Date Range */
export function formatThaiDateRange(startDateStr: string, endDateStr: string, hasDeadline: boolean = true): string {
  if (!startDateStr) return '';
  if (!hasDeadline || !endDateStr || startDateStr === endDateStr) {
    return `${formatThaiDate(startDateStr, { short: true })}${!hasDeadline ? ' (ไม่มี Deadline)' : ''}`;
  }

  const days = calculateDateRangeDays(startDateStr, endDateStr);
  const startShort = formatThaiDate(startDateStr, { short: true, includeYear: false });
  const endFull = formatThaiDate(endDateStr, { short: true, includeYear: true });

  return `${startShort} ถึง ${endFull} (รวม ${days} วัน)`;
}

/** Generate a complete 35 or 42 grid array for a given year & month (month 0-indexed) */
export function generateCalendarGrid(year: number, month: number): CalendarDay[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 6 is Saturday
  const totalDaysInMonth = lastDayOfMonth.getDate();
  
  const realTodayStr = getRealTodayDateString();
  const grid: CalendarDay[] = [];
  
  // Previous month padding days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
    const dayOfWeek = prevDate.getDay();
    const dStr = formatDateString(prevDate);
    grid.push({
      date: prevDate,
      dateString: dStr,
      dayNumber: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: dStr === realTodayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6
    });
  }
  
  // Current month days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const curDate = new Date(year, month, day);
    const dayOfWeek = curDate.getDay();
    const dStr = formatDateString(curDate);
    grid.push({
      date: curDate,
      dateString: dStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dStr === realTodayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6
    });
  }
  
  // Next month padding days to fill 35 or 42 grid cells
  const remainingCells = (7 - (grid.length % 7)) % 7;
  const targetTotal = grid.length + remainingCells < 35 ? 35 : (grid.length + remainingCells);
  const extraNeeded = targetTotal - grid.length;
  
  for (let day = 1; day <= extraNeeded; day++) {
    const nextDate = new Date(year, month + 1, day);
    const dayOfWeek = nextDate.getDay();
    const dStr = formatDateString(nextDate);
    grid.push({
      date: nextDate,
      dateString: dStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dStr === realTodayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6
    });
  }
  
  return grid;
}

/** Filter tasks that are active on a specific date */
export function getTasksForDate(tasks: Task[], dateStr: string): Task[] {
  return tasks
    .filter(t => {
      // If task has no deadline, it only appears on startDate
      if (!t.hasDeadline) {
        return t.startDate === dateStr;
      }
      const start = t.startDate || t.endDate;
      const end = t.endDate || t.startDate;
      return isDateInRange(dateStr, start, end);
    })
    .sort((a, b) => {
      const priorityWeight: Record<TaskPriority, number> = {
        urgent: 4,
        high: 3,
        medium: 2,
        low: 1
      };
      const diff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (diff !== 0) return diff;
      return (a.time || '').localeCompare(b.time || '');
    });
}
