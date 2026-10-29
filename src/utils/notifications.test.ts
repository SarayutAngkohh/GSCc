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
