import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  generateCalendarGrid, 
  toBuddhistYear, 
  formatThaiDate, 
  getTasksForDate,
  formatDateString,
  isDateInRange,
  calculateDateRangeDays,
  DEFAULT_STUDENT_CATEGORIES,
  formatThaiDateRange,
  getRealTodayDateString
} from './calendar';
import { Task } from '../types/task';

test('DEFAULT_STUDENT_CATEGORIES contains student-focused categories', () => {
  assert.ok(DEFAULT_STUDENT_CATEGORIES.length >= 6);
  const homework = DEFAULT_STUDENT_CATEGORIES.find(c => c.id === 'homework');
  assert.ok(homework);
  assert.match(homework!.name, /การบ้าน/);
  
  const project = DEFAULT_STUDENT_CATEGORIES.find(c => c.id === 'group_project');
  assert.ok(project);
  assert.match(project!.name, /โครงงาน/);
});

test('hasDeadline: false only shows task on startDate', () => {
  const noDeadlineTask: Task = {
    id: 'no-dl-1',
    title: 'อ่านทบทวนชีววิทยาบทที่ 4',
    description: '',
    startDate: '2026-10-25',
    endDate: '2026-10-29',
    hasDeadline: false,
    isAllDay: true,
    categoryId: 'study_review',
    priority: 'medium',
    status: 'todo',
    subtasks: [],
    attachments: [],
    history: [],
    createdAt: '',
    updatedAt: ''
  };

  // Only shows on startDate when hasDeadline is false
  assert.equal(getTasksForDate([noDeadlineTask], '2026-10-25').length, 1);
  assert.equal(getTasksForDate([noDeadlineTask], '2026-10-26').length, 0);
});

test('hasDeadline: true spans across full range until deadline', () => {
  const deadlineTask: Task = {
    id: 'dl-1',
    title: 'ส่งรายงานโครงงานวิทยาศาสตร์',
    description: '',
    startDate: '2026-10-25',
    endDate: '2026-10-28',
    hasDeadline: true,
    isAllDay: true,
    categoryId: 'group_project',
    priority: 'urgent',
    status: 'in_progress',
    subtasks: [],
    attachments: [],
    history: [],
    createdAt: '',
    updatedAt: ''
  };

  assert.equal(getTasksForDate([deadlineTask], '2026-10-25').length, 1);
  assert.equal(getTasksForDate([deadlineTask], '2026-10-27').length, 1);
  assert.equal(getTasksForDate([deadlineTask], '2026-10-28').length, 1);
  assert.equal(getTasksForDate([deadlineTask], '2026-10-29').length, 0);
});

test('formatThaiDateRange formats properly for both deadline and no deadline', () => {
  const withDl = formatThaiDateRange('2026-10-20', '2026-10-25', true);
  assert.match(withDl, /รวม 6 วัน/);

  const withoutDl = formatThaiDateRange('2026-10-20', '2026-10-25', false);
  assert.match(withoutDl, /ไม่มี Deadline/);
});

test('getRealTodayDateString returns valid YYYY-MM-DD in Thailand timezone', () => {
  const dateStr = getRealTodayDateString();
  assert.match(dateStr, /^\d{4}-\d{2}-\d{2}$/);
  const formatted = formatThaiDate(dateStr, { includeDayName: true });
  assert.match(formatted, /^วัน/);
  assert.match(formatted, /25\d{2}$/);
});
