import test from 'node:test';
import assert from 'node:assert/strict';
import { getUpcomingDueTasks } from './notifications.js';
import { Task } from '../types/task.js';

test('getUpcomingDueTasks correctly identifies tasks due today and in 3 days', () => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);
  const in3DaysStr = in3Days.toISOString().slice(0, 10);

  const in10Days = new Date(today);
  in10Days.setDate(in10Days.getDate() + 10);
  const in10DaysStr = in10Days.toISOString().slice(0, 10);

  const mockTasks: Task[] = [
    {
      id: 'task-today-1',
      title: 'งานส่งวันนี้',
      category: 'homework',
      startDate: todayStr,
      endDate: todayStr,
      hasDeadline: true,
      time: '18:00',
      status: 'pending',
      priority: 'high',
      creator: 'อาร์ม',
      assignees: ['อาร์ม']
    },
    {
      id: 'task-3days-1',
      title: 'งานส่งอีก 3 วัน',
      category: 'project',
      startDate: todayStr,
      endDate: in3DaysStr,
      hasDeadline: true,
      status: 'pending',
      priority: 'medium',
      creator: 'เกม',
      assignees: ['เกม']
    },
    {
      id: 'task-completed',
      title: 'งานที่เสร็จแล้ว (ไม่ควรแจ้งเตือน)',
      category: 'reading',
      startDate: todayStr,
      endDate: todayStr,
      hasDeadline: true,
      status: 'completed',
      priority: 'low',
      creator: 'บาส',
      assignees: ['บาส']
    },
    {
      id: 'task-future',
      title: 'งานส่งอีก 10 วัน (ไม่เข้าเกณฑ์ด่วน)',
      category: 'exam',
      startDate: todayStr,
      endDate: in10DaysStr,
      hasDeadline: true,
      status: 'pending',
      priority: 'high',
      creator: 'นิว',
      assignees: ['นิว']
    }
  ];

  const result = getUpcomingDueTasks(mockTasks);

  assert.equal(result.dueTodayTasks.length, 1);
  assert.equal(result.dueTodayTasks[0].id, 'task-today-1');

  assert.equal(result.dueInThreeDaysTasks.length, 1);
  assert.equal(result.dueInThreeDaysTasks[0].task.id, 'task-3days-1');
  assert.equal(result.dueInThreeDaysTasks[0].daysLeft, 3);
});

test('getUpcomingDueTasks correctly categorizes overdue tasks and EXCLUDES tasks without deadline', () => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const pastDate = new Date(today);
  pastDate.setDate(pastDate.getDate() - 4);
  const pastDateStr = pastDate.toISOString().slice(0, 10);

  const mockTasks: Task[] = [
    {
      id: 'task-overdue-1',
      title: 'งานที่เลยกำหนดส่งแล้ว (มี deadline)',
      category: 'homework',
      startDate: pastDateStr,
      endDate: pastDateStr,
      hasDeadline: true, // มีกำหนดส่ง
      status: 'pending',
      priority: 'urgent',
      creator: 'อาร์ม',
      assignees: ['อาร์ม']
    },
    {
      id: 'task-no-deadline-past',
      title: 'งานบันทึกอ่านหนังสือเมื่อ 4 วันก่อน (ไม่มี deadline - ห้ามเข้า overdue)',
      category: 'reading',
      startDate: pastDateStr,
      endDate: pastDateStr,
      hasDeadline: false, // ไม่มีกำหนดส่ง -> ต้องไม่นับเป็นงานเลยกำหนด
      status: 'pending',
      priority: 'low',
      creator: 'เกม',
      assignees: ['เกม']
    },
    {
      id: 'task-overdue-completed',
      title: 'งานอดีตที่ส่งเสร็จแล้ว',
      category: 'project',
      startDate: pastDateStr,
      endDate: pastDateStr,
      hasDeadline: true,
      status: 'completed', // เสร็จแล้ว -> ไม่นับ
      priority: 'medium',
      creator: 'บาส',
      assignees: ['บาส']
    }
  ];

  const result = getUpcomingDueTasks(mockTasks);

  // ตรวจสอบว่า task-overdue-1 ถูกจัดเข้า overdue
  assert.equal(result.overdueTasks.length, 1);
  assert.equal(result.overdueTasks[0].task.id, 'task-overdue-1');
  assert.equal(result.overdueTasks[0].daysOverdue, 4);

  // ตรวจสอบว่า task-no-deadline-past ไม่ถูกนับใน overdue เด็ดขาด
  const hasNoDeadlineInOverdue = result.overdueTasks.some(o => o.task.id === 'task-no-deadline-past');
  assert.equal(hasNoDeadlineInOverdue, false, 'งานที่ไม่มี deadline ต้องไม่ถูกนับเป็นงานเลยกำหนด');
});

test('getUpcomingDueTasks puts tasks without deadline into noDeadlineTasks instead of dueTodayTasks', () => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const mockTasks: Task[] = [
    {
      id: 'task-no-deadline-today',
      title: 'งานบันทึกวันนี้ที่ไม่มีกำหนดส่ง',
      category: 'reading',
      startDate: todayStr,
      endDate: todayStr,
      hasDeadline: false,
      status: 'pending',
      priority: 'low',
      creator: 'เกม',
      assignees: ['เกม']
    }
  ];

  const result = getUpcomingDueTasks(mockTasks);

  assert.equal(result.dueTodayTasks.length, 0, 'งานที่ไม่มีกำหนดส่ง ต้องไม่ถูกจัดเข้า dueTodayTasks');
  assert.equal(result.noDeadlineTasks.length, 1, 'งานที่ไม่มีกำหนดส่ง ต้องจัดเข้า noDeadlineTasks');
  assert.equal(result.noDeadlineTasks[0].id, 'task-no-deadline-today');
});
