import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Clock, 
  Flag, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Settings, 
  ListTodo, 
  AlertTriangle,
  Play,
  Send,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Task, CategoryItem } from '../types/task';
import { 
  NotificationSettings, 
  getNotificationSettings, 
  saveNotificationSettings, 
  playNotificationSound, 
  requestWebNotificationPermission, 
  sendWebNotification, 
  getUpcomingDueTasks, 
  IS_NOTIFICATION_MAINTENANCE
} from '../utils/notifications';
import { formatThaiDate } from '../utils/calendar';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  categories: CategoryItem[];
  onSelectTask: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  tasks,
  categories,
  onSelectTask,
  onToggleStatus,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'settings'>('tasks');
  const [settings, setSettings] = useState<NotificationSettings>(() => getNotificationSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => {
    return typeof Notification !== 'undefined' ? Notification.permission : 'denied';
  });

  if (!isOpen) return null;

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const { overdueTasks, dueTodayTasks, dueInThreeDaysTasks, noDeadlineTasks } = getUpcomingDueTasks(tasks);
  const totalUpcomingCount = overdueTasks.length + dueTodayTasks.length + dueInThreeDaysTasks.length;

  const handleUpdateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTestSound = () => {
    if (IS_NOTIFICATION_MAINTENANCE) {
      showToast('ระบบแจ้งเตือนและเสียงกำลังปิดปรับปรุงชั่วคราว', 'info');
      return;
    }
    playNotificationSound(true);
    showToast('กำลังเล่นเสียงเอฟเฟกต์แจ้งเตือน 🔔', 'info');
  };

  const handleRequestPermission = async () => {
    if (IS_NOTIFICATION_MAINTENANCE) {
      showToast('ระบบแจ้งเตือนกำลังปิดปรับปรุงชั่วคราว', 'info');
      return;
    }
    const res = await requestWebNotificationPermission();
    setPermissionStatus(res);
    if (res === 'granted') {
      showToast('เปิดรับการแจ้งเตือนผ่านเบราว์เซอร์สำเร็จแล้ว!', 'success');
      sendWebNotification('เปิดการแจ้งเตือนสำเร็จ!', 'ระบบจะแจ้งเตือนงานที่ต้องส่งวันนี้และอีก 3 วันข้างหน้า', true);
    } else {
      showToast('ไม่สามารถเปิดการแจ้งเตือนได้ โปรดตรวจสอบการอนุญาตในเบราว์เซอร์', 'error');
    }
  };

  const handleTestNotification = () => {
    if (IS_NOTIFICATION_MAINTENANCE) {
      showToast('ระบบแจ้งเตือนกำลังปิดปรับปรุงชั่วคราว', 'info');
      return;
    }
    sendWebNotification(
      '🔔 ทดสอบการแจ้งเตือนจาก Genius Society',
      'ระบบการแจ้งเตือนงานและการบ้านทำงานได้ตามปกติแล้วครับ!',
      true
    );
    showToast('ส่งการแจ้งเตือนทดสอบเรียบร้อยแล้ว', 'success');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border-2 border-sky-100 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-amber-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-200 flex-shrink-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] sm:text-xs font-extrabold text-sky-600 font-prompt">Genius</span>
                <span className="text-[11px] sm:text-xs font-extrabold text-amber-500 font-prompt">Society</span>
                {totalUpcomingCount > 0 && (
                  <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.2 rounded-full">
                    {totalUpcomingCount} งาน
                  </span>
                )}
              </div>
              <h2 id="notification-modal-title" className="text-sm sm:text-lg font-bold text-slate-900 font-prompt truncate">
                การแจ้งเตือนงาน & กำหนดส่ง
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างการแจ้งเตือน"
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1 sm:p-1.5 gap-1 sm:gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-2 px-2 sm:px-3 rounded-2xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-white text-sky-800 shadow-xs border border-sky-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 flex-shrink-0" />
            <span className="truncate">งานที่ต้องส่ง ({totalUpcomingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 px-2 sm:px-3 rounded-2xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-sky-800 shadow-xs border border-sky-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 flex-shrink-0" />
            <span className="truncate">ตั้งค่าระบบ<span className="hidden sm:inline"> & เสียง</span></span>
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 flex-1">
          {/* Maintenance Notice Banner (Requested by user) */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-300 text-amber-950 flex items-start gap-2.5 sm:gap-3 shadow-2xs">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 flex-shrink-0 mt-0.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-slate-950" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold font-prompt text-amber-950">
                  ระบบการแจ้งเตือนกำลังปิดปรับปรุงชั่วคราว
                </h3>
                <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Under Maintenance
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed">
                ขณะนี้ระบบเสียงเอฟเฟกต์และ Web Push Notification กำลังปิดปรับปรุงชั่วคราวตามคำสั่งของผู้ดูแล แต่คุณยังคงสามารถตรวจสอบรายการงานที่ต้องส่งวันนี้และอีก 3 วันข้างหน้าได้ตามปกติด้านล่างนี้ครับ
              </p>
            </div>
          </div>

          {activeTab === 'tasks' ? (
            <div className="space-y-4">
              
              {/* SECTION 0: OVERDUE TASKS (เลยกำหนดแล้ว - ไม่นับงานที่ไม่มีกำหนด) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wide">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>งานที่เลยกำหนดส่งแล้ว (Overdue)</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${overdueTasks.length > 0 ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-slate-100 text-slate-500'}`}>
                    {overdueTasks.length} งาน
                  </span>
                </div>

                {overdueTasks.length > 0 ? (
                  <div className="space-y-2">
                    {overdueTasks.map(({ task, daysOverdue }) => {
                      const cat = categoryMap.get(task.categoryId) || categories[0];
                      return (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-2xl border-2 border-red-300 bg-red-50/70 hover:bg-red-100/70 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-xs"
                          onClick={() => {
                            onClose();
                            onSelectTask(task);
                          }}
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span 
                                className="px-2 py-0.2 rounded-md text-[10px] font-bold text-white"
                                style={{ backgroundColor: cat?.color || '#3b82f6' }}
                              >
                                {cat?.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-red-600 text-white flex items-center gap-1 shadow-2xs">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>เลยกำหนดมาแล้ว {daysOverdue} วัน!</span>
                              </span>
                              <span className="text-[11px] text-red-700 font-medium">
                                (กำหนดส่ง: {formatThaiDate(task.endDate || task.startDate, { short: true })})
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug font-prompt">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-slate-600 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus(task.id);
                            }}
                            className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-200 transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
                            title="ทำเครื่องหมายว่าเสร็จแล้ว"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800 text-center font-medium">
                    ไม่มีงานค้างที่เลยกำหนดส่ง เยี่ยมมาก! 🎉
                  </div>
                )}
              </div>

              {/* SECTION 1: DUE TODAY */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wide">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>งานที่ต้องส่งวันนี้ (Due Today)</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    {dueTodayTasks.length} งาน
                  </span>
                </div>

                {dueTodayTasks.length > 0 ? (
                  <div className="space-y-2">
                    {dueTodayTasks.map((task) => {
                      const cat = categoryMap.get(task.categoryId) || categories[0];
                      return (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-2xl border-2 border-rose-200 bg-rose-50/40 hover:bg-rose-50/80 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-2xs"
                          onClick={() => {
                            onClose();
                            onSelectTask(task);
                          }}
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span 
                                className="px-2 py-0.2 rounded-md text-[10px] font-bold text-white"
                                style={{ backgroundColor: cat?.color || '#3b82f6' }}
                              >
                                {cat?.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-rose-500 text-white flex items-center gap-1">
                                <Flag className="w-2.5 h-2.5" />
                                <span>ส่งวันนี้!</span>
                              </span>
                              {task.time && (
                                <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{task.time} น.</span>
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug font-prompt">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-slate-600 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus(task.id);
                            }}
                            className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-200 transition-colors flex-shrink-0 cursor-pointer"
                            title="ทำเครื่องหมายว่าเสร็จแล้ว"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                    ไม่มีงานหรือการบ้านที่ต้องส่งวันนี้ 🎉
                  </div>
                )}
              </div>

              {/* SECTION 2: DUE IN 3 DAYS */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wide">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>งานที่ต้องส่งในอีก 3 วันข้างหน้า (Next 3 Days)</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {dueInThreeDaysTasks.length} งาน
                  </span>
                </div>

                {dueInThreeDaysTasks.length > 0 ? (
                  <div className="space-y-2">
                    {dueInThreeDaysTasks.map(({ task, daysLeft }) => {
                      const cat = categoryMap.get(task.categoryId) || categories[0];
                      return (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-2xl border-2 border-amber-200 bg-amber-50/30 hover:bg-amber-50/70 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-2xs"
                          onClick={() => {
                            onClose();
                            onSelectTask(task);
                          }}
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span 
                                className="px-2 py-0.2 rounded-md text-[10px] font-bold text-white"
                                style={{ backgroundColor: cat?.color || '#3b82f6' }}
                              >
                                {cat?.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-amber-500 text-white flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>อีก {daysLeft} วัน (ส่ง: {task.endDate})</span>
                              </span>
                              {task.time && (
                                <span className="text-[11px] text-slate-500">
                                  {task.time} น.
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug font-prompt">
                              {task.title}
                            </h4>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus(task.id);
                            }}
                            className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-200 transition-colors flex-shrink-0 cursor-pointer"
                            title="ทำเครื่องหมายว่าเสร็จแล้ว"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                    ไม่มีงานที่ใกล้ถึงกำหนดส่งใน 3 วันข้างหน้า
                  </div>
                )}
              </div>

              {/* SECTION 3: NO DEADLINE (งานที่ไม่มีกำหนดส่ง) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>งานที่ไม่มีกำหนดส่ง (No Deadline)</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {noDeadlineTasks.length} งาน
                  </span>
                </div>

                {noDeadlineTasks.length > 0 ? (
                  <div className="space-y-2">
                    {noDeadlineTasks.map((task) => {
                      const cat = categoryMap.get(task.categoryId) || categories[0];
                      return (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-2xs"
                          onClick={() => {
                            onClose();
                            onSelectTask(task);
                          }}
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span 
                                className="px-2 py-0.2 rounded-md text-[10px] font-bold text-white"
                                style={{ backgroundColor: cat?.color || '#3b82f6' }}
                              >
                                {cat?.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-200 text-slate-700 flex items-center gap-1">
                                <span>ไม่มีกำหนดส่ง</span>
                              </span>
                              <span className="text-[11px] text-slate-500">
                                (วันที่บันทึก: {formatThaiDate(task.startDate, { short: true })})
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug font-prompt">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-slate-600 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus(task.id);
                            }}
                            className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-200 transition-colors flex-shrink-0 cursor-pointer"
                            title="ทำเครื่องหมายว่าเสร็จแล้ว"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                    ไม่มีงานที่ไม่มีกำหนดส่ง
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* SETTINGS TAB */
            <div className="space-y-4">
              
              {/* Toggles */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 opacity-80">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-sky-600" />
                    <span>ตัวเลือกการแจ้งเตือน (Preferences)</span>
                  </h3>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    ปิดปรับปรุงชั่วคราว
                  </span>
                </div>

                {/* Toggle: Notify Today */}
                <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-not-allowed opacity-75">
                  <div>
                    <p className="text-xs font-bold text-slate-900">แจ้งเตือนงานที่ต้องส่งวันนี้</p>
                    <p className="text-[11px] text-slate-500">แจ้งเตือนเมื่อมีงานหรือการบ้านที่มีกำหนดส่งในวันปัจจุบัน (ปิดปรับปรุงอยู่)</p>
                  </div>
                  <input
                    type="checkbox"
                    disabled
                    checked={false}
                    className="w-5 h-5 rounded text-slate-400 cursor-not-allowed"
                  />
                </label>

                {/* Toggle: Notify 3 Days */}
                <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-not-allowed opacity-75">
                  <div>
                    <p className="text-xs font-bold text-slate-900">แจ้งเตือนงานล่วงหน้า 3 วัน</p>
                    <p className="text-[11px] text-slate-500">แจ้งเตือนเตรียมตัวล่วงหน้าสำหรับงานที่มีกำหนดส่งในอีก 3 วัน (ปิดปรับปรุงอยู่)</p>
                  </div>
                  <input
                    type="checkbox"
                    disabled
                    checked={false}
                    className="w-5 h-5 rounded text-slate-400 cursor-not-allowed"
                  />
                </label>

                {/* Toggle: Sound effect */}
                <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 cursor-not-allowed opacity-75">
                  <div className="flex items-center gap-2.5">
                    <VolumeX className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">เสียงเอฟเฟกต์แจ้งเตือน (Sound Chime)</p>
                      <p className="text-[11px] text-slate-500">ปิดปรับปรุงชั่วคราวตามคำสั่งของผู้ดูแล</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    disabled
                    checked={false}
                    className="w-5 h-5 rounded text-slate-400 cursor-not-allowed"
                  />
                </label>
              </div>

              {/* Sound Test Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestSound}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 text-slate-500" />
                  <span>ทดสอบฟังเสียงแจ้งเตือน (ระบบปิดปรับปรุงชั่วคราว)</span>
                </button>
              </div>

              {/* Browser Web Push Notification Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3 opacity-90">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-slate-500" />
                    <span>การแจ้งเตือนผ่านเบราว์เซอร์ (Web Push Notifications)</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    ปิดปรับปรุงชั่วคราว
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ฟังก์ชันการแจ้งเตือนเบราว์เซอร์กำลังอยู่ระหว่างการปิดปรับปรุงระบบชั่วคราวตามที่กำหนด
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4 text-slate-600" />
                    <span>ส่งการแจ้งเตือนทดสอบ (ปิดปรับปรุงอยู่)</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            ระบบจะตรวจสอบกำหนดส่งงานอัตโนมัติ
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
};
