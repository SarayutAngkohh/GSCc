import { Task } from '../types/task';
import { getRealTodayDateString } from './calendar';

export interface NotificationSettings {
  notifyToday: boolean;
  notifyThreeDays: boolean;
  soundEnabled: boolean;
}

const SETTINGS_KEY = 'genius_society_notification_settings_v1';
const LAST_ALERT_DATE_KEY = 'genius_society_last_alert_date_v1';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  notifyToday: true,
  notifyThreeDays: true,
  soundEnabled: true
};

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to parse notification settings:', e);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveNotificationSettings(settings: NotificationSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notification settings:', e);
  }
}

/**
 * Flag to indicate notification system maintenance status
 */
export const IS_NOTIFICATION_MAINTENANCE = true;

/**
 * Synthesizes a pleasant, crystal-clear notification chime using Web Audio API
 */
export function playNotificationSound(ignoreMaintenance = false) {
  if (IS_NOTIFICATION_MAINTENANCE && !ignoreMaintenance) {
    return;
  }
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    // 3-note harmonic chime (C5, E5, G5)
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const noteTimes = [0, 0.09, 0.18];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + noteTimes[idx]);

      gain.gain.setValueAtTime(0.001, now + noteTimes[idx]);
      gain.gain.exponentialRampToValueAtTime(0.28, now + noteTimes[idx] + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + noteTimes[idx] + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + noteTimes[idx]);
      osc.stop(now + noteTimes[idx] + 0.6);
    });
  } catch (err) {
    console.warn('Could not play synthesized sound effect:', err);
  }
}

/**
 * Request Browser Web Notification Permission
 */
export async function requestWebNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Send Browser Web Notification
 */
export function sendWebNotification(title: string, body: string, ignoreMaintenance = false) {
  if (IS_NOTIFICATION_MAINTENANCE && !ignoreMaintenance) {
    return;
  }
  const settings = getNotificationSettings();
  if (settings.soundEnabled) {
    playNotificationSound(ignoreMaintenance);
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const baseUrl = import.meta.env.BASE_URL.startsWith('http')
      ? import.meta.env.BASE_URL
      : new URL(import.meta.env.BASE_URL, window.location.origin).href;
    const iconUrl = new URL('icon-192.png', baseUrl).href;
    new Notification(title, {
      body,
      icon: iconUrl,
      badge: iconUrl,
      tag: 'genius-schedule-reminder',
    });
  } catch (e) {
    console.warn('Failed to send browser notification:', e);
  }
}

/**
 * Helper to calculate difference in calendar days
 */
export function getDaysDiff(targetDateStr: string, fromDate = new Date()): number {
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const current = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const diffTime = target.getTime() - current.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export interface OverdueTaskItem {
  task: Task;
  daysOverdue: number;
}

/**
 * Filter overdue tasks, tasks due today, and tasks due in next 3 days
 * Note: Tasks with hasDeadline: false are NEVER counted as overdue (per user requirement)
 */
export function getUpcomingDueTasks(tasks: Task[]) {
  const todayStr = getRealTodayDateString();
  
  const overdueTasks: OverdueTaskItem[] = [];
  const dueTodayTasks: Task[] = [];
  const dueInThreeDaysTasks: { task: Task; daysLeft: number }[] = [];

  tasks.forEach((t) => {
    if (t.status === 'completed') return;

    // "ไม่นับงานที่ไม่มีกำหนด"
    // Tasks with no deadline are NEVER overdue!
    if (!t.hasDeadline) {
      if (t.startDate === todayStr) {
        dueTodayTasks.push(t);
      }
      return;
    }

    const deadlineDate = t.endDate || t.startDate;
    if (!deadlineDate) return;

    const daysLeft = getDaysDiff(deadlineDate);

    if (daysLeft < 0) {
      overdueTasks.push({ task: t, daysOverdue: Math.abs(daysLeft) });
    } else if (daysLeft === 0) {
      dueTodayTasks.push(t);
    } else if (daysLeft > 0 && daysLeft <= 3) {
      dueInThreeDaysTasks.push({ task: t, daysLeft });
    }
  });

  // Sort overdue tasks by most overdue first
  overdueTasks.sort((a, b) => b.daysOverdue - a.daysOverdue);

  return {
    overdueTasks,
    dueTodayTasks,
    dueInThreeDaysTasks
  };
}

/**
 * Check and trigger auto notification once per day
 */
export function checkAndTriggerDueNotifications(tasks: Task[]) {
  // If notification system is under maintenance, do not trigger auto alerts
  if (IS_NOTIFICATION_MAINTENANCE) {
    return;
  }

  const todayStr = getRealTodayDateString();
  const lastAlertDate = localStorage.getItem(LAST_ALERT_DATE_KEY);

  // If already alerted today, skip auto push to prevent annoying spam
  if (lastAlertDate === todayStr) {
    return;
  }

  const settings = getNotificationSettings();
  const { dueTodayTasks, dueInThreeDaysTasks } = getUpcomingDueTasks(tasks);

  let notified = false;

  if (settings.notifyToday && dueTodayTasks.length > 0) {
    const taskNames = dueTodayTasks.map(t => `"${t.title}"`).slice(0, 2).join(', ');
    const moreText = dueTodayTasks.length > 2 ? ` และอีก ${dueTodayTasks.length - 2} งาน` : '';
    sendWebNotification(
      `🚨 มีงานที่ต้องส่งวันนี้ ${dueTodayTasks.length} งาน!`,
      `อย่าลืมส่ง: ${taskNames}${moreText}`
    );
    notified = true;
  }

  if (settings.notifyThreeDays && dueInThreeDaysTasks.length > 0 && !notified) {
    const urgentCount = dueInThreeDaysTasks.length;
    sendWebNotification(
      `⏰ มีงานใกล้ถึงกำหนดส่งใน 3 วันข้างหน้า (${urgentCount} งาน)`,
      `โปรดตรวจสอบตารางแผนงานของ Genius Society`
    );
    notified = true;
  }

  if (notified) {
    localStorage.setItem(LAST_ALERT_DATE_KEY, todayStr);
  }
}
