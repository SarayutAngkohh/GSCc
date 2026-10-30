import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Square, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  FileCheck2, 
  CheckSquare, 
  Clock, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { CategoryItem, Task } from '../types/task';
import { formatThaiDate, getRealTodayDateString } from '../utils/calendar';

interface AllTasksModalProps {
  isOpen: boolean;
  tasks: Task[];
  categories: CategoryItem[];
  onClose: () => void;
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenCreateModal: () => void;
}

export const AllTasksModal: React.FC<AllTasksModalProps> = ({
  isOpen,
  tasks,
  categories,
  onClose,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  onToggleSubtask,
  onOpenCreateModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  type TaskFilterTab = 'all' | 'overdue' | 'today' | 'no_deadline' | 'in_progress' | 'completed';
  const [filterTab, setFilterTab] = useState<TaskFilterTab>('all');
  const todayStr = getRealTodayDateString();

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Counts for tabs (ไม่นับงานที่ไม่มีกำหนดสำหรับ overdue และ today)
  const overdueCount = useMemo(() => {
    return tasks.filter(t => t.hasDeadline && t.status !== 'completed' && t.endDate < todayStr).length;
  }, [tasks, todayStr]);

  const todayCount = useMemo(() => {
    return tasks.filter(t => t.hasDeadline && t.status !== 'completed' && t.endDate === todayStr).length;
  }, [tasks, todayStr]);

  const noDeadlineCount = useMemo(() => {
    return tasks.filter(t => !t.hasDeadline && t.status !== 'completed').length;
  }, [tasks]);

  // Days remaining countdown calculator
  const getDaysRemaining = (endDateStr: string, hasDeadline: boolean) => {
    if (!hasDeadline || !endDateStr) {
      return { label: '📌 ไม่มีกำหนดส่ง', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
    const [y, m, d] = endDateStr.split('-').map(Number);
    const end = new Date(y, m - 1, d);
    const [ty, tm, td] = todayStr.split('-').map(Number);
    const today = new Date(ty, tm - 1, td);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { label: '🔥 ต้องส่งวันนี้!', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold animate-pulse' };
    }
    if (diffDays === 1) {
      return { label: '⚡ เหลืออีก 1 วัน (พรุ่งนี้)', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-bold' };
    }
    if (diffDays > 1) {
      return { label: `⏰ เหลืออีก ${diffDays} วัน`, badgeClass: 'bg-sky-50 text-sky-800 border-sky-300 font-semibold' };
    }
    return { label: `⚠️ เลยกำหนดส่งแล้ว ${Math.abs(diffDays)} วัน`, badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold shadow-2xs' };
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Tab filtering
        if (filterTab === 'overdue') {
          // ไม่นับงานที่ไม่มีกำหนด (hasDeadline: false is strictly ignored)
          if (!task.hasDeadline || task.status === 'completed' || task.endDate >= todayStr) {
            return false;
          }
        } else if (filterTab === 'today') {
          if (!task.hasDeadline || task.status === 'completed' || task.endDate !== todayStr) return false;
        } else if (filterTab === 'no_deadline') {
          if (task.hasDeadline || task.status === 'completed') return false;
        } else if (filterTab === 'in_progress') {
          if (task.status === 'completed') return false;
        } else if (filterTab === 'completed') {
          if (task.status !== 'completed') return false;
        }

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(q) ||
          (task.description || '').toLowerCase().includes(q) ||
          (task.subtasks || []).some(s => s.title.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (filterTab === 'overdue') {
          // Sort most overdue first
          return a.endDate.localeCompare(b.endDate);
        }
        // Sort by deadline first
        if (a.hasDeadline && b.hasDeadline) {
          return a.endDate.localeCompare(b.endDate);
        }
        if (a.hasDeadline) return -1;
        if (b.hasDeadline) return 1;
        return a.startDate.localeCompare(b.startDate);
      });
  }, [tasks, searchQuery, filterTab, todayStr]);

  // Requirement 3.5: เมื่อกดดูรายละเอียด ให้เด้งขึ้นมาพร้อมปิดหน้ารายการออกไปทันที
  const handleOpenDetail = (task: Task) => {
    onClose(); // Close AllTasksModal first
    setTimeout(() => {
      onSelectTask(task); // Open TaskDetailModal cleanly
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-tasks-title"
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border-2 border-sky-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Sky Blue & Yellow Theme */}
        <div className="p-3.5 sm:p-5 border-b-2 border-sky-100 bg-gradient-to-r from-sky-50/90 via-white to-amber-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-200 flex-shrink-0">
                <FileCheck2 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] sm:text-xs font-extrabold text-sky-600 font-prompt">Genius</span>
                  <span className="text-[11px] sm:text-xs font-extrabold text-amber-500 font-prompt">Society</span>
                  <span className="text-xs font-bold text-slate-400">•</span>
                  <span className="text-[10px] sm:text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.2 rounded-full">
                    {tasks.length} งาน
                  </span>
                </div>
                <h2 id="all-tasks-title" className="text-base sm:text-xl font-bold text-slate-900 font-prompt truncate">
                  รายการงานทั้งหมด (Task List)
                </h2>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่างรายการงานทั้งหมด"
              className="sm:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-sky-100/60">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateModal();
              }}
              aria-label="บันทึกงานใหม่"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-xs cursor-pointer flex-1 sm:flex-initial"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>+ บันทึกงานใหม่</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่างรายการงานทั้งหมด"
              className="hidden sm:inline-flex p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่องาน..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-sky-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Category & Status Filter Tabs - Scrollable on mobile */}
        <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto scrollbar-none touch-pan-x">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filterTab === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>ทั้งหมด</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterTab === 'all' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {tasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filterTab === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs shadow-rose-200'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-300'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${filterTab === 'overdue' ? 'text-white' : 'text-rose-500'}`} />
            <span>⚠️ เลยกำหนดแล้ว</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterTab === 'overdue' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'}`}>
              {overdueCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filterTab === 'today'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <span>🔥 ส่งวันนี้</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterTab === 'today' ? 'bg-amber-600 text-slate-950' : 'bg-amber-100 text-amber-900'}`}>
              {todayCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('no_deadline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filterTab === 'no_deadline'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>📌 ไม่มีกำหนด</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${filterTab === 'no_deadline' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {noDeadlineCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filterTab === 'in_progress'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>กำลังทำอยู่</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer flex-shrink-0 ${
              filterTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>เสร็จแล้ว</span>
          </button>
        </div>

        {/* Task List Items */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50/60">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-3xl bg-sky-50 border border-sky-200 text-sky-500 flex items-center justify-center mb-3">
                <FileCheck2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 font-prompt">
                {filterTab === 'overdue' 
                  ? '🎉 ไม่มีงานที่เลยกำหนดส่ง!' 
                  : (tasks.length === 0 ? 'ยังไม่มีงานที่บันทึกไว้' : 'ไม่พบงานในหมวดหมู่นี้')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {filterTab === 'overdue'
                  ? 'ยอดเยี่ยมมาก! ไม่มีงานค้างหรือการบ้านที่เลยกำหนดส่งในขณะนี้'
                  : (tasks.length === 0 ? 'เริ่มต้นกดปุ่ม "+ บันทึกงานใหม่" เพื่อวางแผนงานแรกของคุณ' : 'ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น')}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const daysInfo = getDaysRemaining(task.endDate, task.hasDeadline);
              const isCompleted = task.status === 'completed';
              const completedCount = (task.subtasks || []).filter(s => s.completed).length;
              const totalSubtasks = (task.subtasks || []).length;

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl border-2 transition-all p-3.5 sm:p-4 shadow-xs hover:border-sky-400 flex flex-col gap-3 ${
                    isCompleted ? 'border-slate-200 bg-slate-50/80 opacity-75' : 'border-sky-100 hover:shadow-sm'
                  }`}
                >
                  {/* Row 1: Status checkbox + Name + Days Remaining Countdown Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(task.id)}
                        aria-label={isCompleted ? `เปลี่ยนงาน ${task.title} เป็นยังไม่เสร็จ` : `ทำเครื่องหมายงาน ${task.title} เสร็จแล้ว`}
                        className="mt-0.5 text-slate-400 hover:text-sky-600 cursor-pointer flex-shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 hover:text-sky-600" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        {/* 1. ชื่องาน (Name) */}
                        <h4 
                          onClick={() => handleOpenDetail(task)}
                          className={`text-sm sm:text-base font-bold text-slate-900 hover:text-sky-600 transition-colors cursor-pointer break-words font-prompt ${
                            isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* 2. วันต้องส่ง (Due Date) */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 flex-wrap">
                          <Calendar className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                          <span>
                            {task.hasDeadline 
                              ? `วันต้องส่ง: ${formatThaiDate(task.endDate, { short: true })}` 
                              : `วันที่บันทึก: ${formatThaiDate(task.startDate, { short: true })}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. เหลืออีกกี่วันต้องส่ง (Days Remaining Countdown Badge) */}
                    <div className="flex-shrink-0 self-start sm:self-auto pl-7 sm:pl-0">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 rounded-full text-[11px] sm:text-xs border ${daysInfo.badgeClass}`}>
                        {daysInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* 4. เช็คลิสต์ (Checklist) */}
                  {totalSubtasks > 0 && (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600 font-semibold mb-1">
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                          <span>เช็คลิสต์</span>
                        </span>
                        <span className="text-[10px] text-sky-700 bg-sky-100 px-2 py-0.2 rounded-full font-bold">
                          {completedCount}/{totalSubtasks} เสร็จแล้ว
                        </span>
                      </div>

                      {task.subtasks.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => onToggleSubtask(task.id, st.id)}
                          className={`w-full text-left flex items-center gap-2 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer ${
                            st.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                          }`}
                        >
                          {st.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          )}
                          <span className="truncate flex-1">{st.title}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 5. ปุ่มดูรายละเอียด */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(task)}
                      aria-label={`ดูรายละเอียดงาน ${task.title}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 hover:text-sky-900 transition-colors cursor-pointer"
                    >
                      <span>ดูรายละเอียด</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onEditTask(task);
                        }}
                        aria-label={`แก้ไขงาน ${task.title}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 cursor-pointer"
                        title="แก้ไข"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === task.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-0.5 rounded-lg border border-rose-200">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(task.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
                          >
                            ลบ
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-white text-slate-700 text-[11px] font-medium border border-slate-300 hover:bg-slate-50 cursor-pointer"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(task.id);
                          }}
                          aria-label={`ลบงาน ${task.title}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium text-[11px] sm:text-xs">
            <span className="text-sky-600 font-bold">Genius</span> <span className="text-amber-500 font-bold">Society</span> Task Planner
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer text-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
