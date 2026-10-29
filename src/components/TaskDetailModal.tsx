import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Link as LinkIcon, 
  ExternalLink,
  CheckSquare, 
  Square, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  RotateCcw,
  History,
  Send,
  Flag,
  Copy,
  Check,
  Download,
  File,
  Image as ImageIcon
} from 'lucide-react';
import { CategoryItem, Task, TaskHistoryItem } from '../types/task';
import { MemberAccount } from '../types/auth';
import { 
  PRIORITY_CONFIG, 
  STATUS_CONFIG, 
  formatThaiDate, 
  calculateDateRangeDays 
} from '../utils/calendar';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  categories: CategoryItem[];
  currentMember?: MemberAccount | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddHistoryEntry: (taskId: string, entry: Omit<TaskHistoryItem, 'id' | 'timestamp'>) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  categories,
  currentMember,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleSubtask,
  onAddHistoryEntry
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [logAction, setLogAction] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const category = categories.find(c => c.id === task.categoryId) || categories[0];
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.low;
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const isCompleted = task.status === 'completed';

  const rangeDays = calculateDateRangeDays(task.startDate, task.endDate);
  const isMultiDay = task.hasDeadline && (task.startDate !== task.endDate);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logAction.trim()) return;
    onAddHistoryEntry(task.id, {
      author: currentMember?.name || 'ตนเอง',
      action: logAction.trim()
    });
    setLogAction('');
  };

  const formatHistoryTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('th-TH', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header with custom category border */}
        <div 
          className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4"
          style={{ borderTop: `5px solid ${category?.color || '#4f46e5'}` }}
        >
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2.5">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs"
                style={{ 
                  backgroundColor: `${category?.color || '#4f46e5'}15`, 
                  color: category?.color || '#4f46e5',
                  borderColor: `${category?.color || '#4f46e5'}40`
                }}
              >
                <span>{category?.name || 'หมวดหมู่'}</span>
              </span>

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${priority.bgLight} ${priority.textColor} ${priority.borderLight}`}>
                <span className={`w-2 h-2 rounded-full ${priority.dotColor}`} />
                <span>{priority.labelTh}</span>
              </span>

              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.badgeClass}`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                )}
                <span>{status.labelTh}</span>
              </span>

              {/* Deadline badge */}
              {task.hasDeadline ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <Flag className="w-3 h-3 text-rose-500" />
                  <span>มีกำหนดส่ง (Deadline)</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  ไม่มี Deadline
                </span>
              )}
            </div>

            {/* Task Title */}
            <h2 
              id="task-detail-title"
              className={`text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug break-words font-prompt ${
                isCompleted ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
            </h2>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างรายละเอียด"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 divide-y divide-slate-100 text-slate-700">
          
          {/* Schedule & Date Range Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mt-0.5">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {task.hasDeadline ? `ระยะเวลาส่ง (รวม ${rangeDays} วัน)` : 'วันที่จัดทำ / บันทึก'}
                </p>
                <div className="mt-1 space-y-1">
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>{task.hasDeadline ? 'ตั้งแต่วันที่:' : 'วันที่:'}</span>
                    <strong className="text-slate-900">{formatThaiDate(task.startDate, { short: true })}</strong>
                  </div>

                  {task.hasDeadline && (
                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>ถึง Deadline:</span>
                      <strong className="text-rose-600">{formatThaiDate(task.endDate, { short: true })}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">เวลา</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {task.isAllDay ? 'ตลอดทั้งวัน (All Day)' : task.time ? `${task.time} น.` : 'ไม่ระบุเวลา'}
                </p>
                {isMultiDay && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    แสดงเป็นแถบสีลากยาวต่อเนื่องทะลุกรอบในปฏิทิน
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Multiple Links & Drag-and-Drop Files */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-indigo-600" />
                ไฟล์แนบและลิงก์ที่เกี่ยวข้อง ({task.attachments?.length || 0})
              </h3>
            </div>

            {task.attachments && task.attachments.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {task.attachments.map((att) => {
                  const isUploaded = att.isUploadedFile;
                  const isImg = att.type === 'image';

                  return (
                    <div 
                      key={att.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-white border border-slate-200 text-indigo-600 flex-shrink-0">
                          {isImg ? (
                            <ImageIcon className="w-4 h-4 text-emerald-600" />
                          ) : isUploaded ? (
                            <File className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <LinkIcon className="w-4 h-4 text-sky-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{att.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {att.fileSize ? `ขนาดไฟล์: ${att.fileSize}` : att.url}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!isUploaded && (
                          <button
                            type="button"
                            onClick={() => handleCopyLink(att.url, att.id)}
                            title="คัดลอกลิงก์"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            {copiedId === att.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {isUploaded ? (
                          <a
                            href={att.url}
                            download={att.name}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>ดาวน์โหลดไฟล์</span>
                          </a>
                        ) : (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                          >
                            <span>เปิดลิงก์</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">ไม่มีไฟล์แนบหรือลิงก์สำหรับงานนี้</p>
            )}
          </div>

          {/* Description Section */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-slate-900 mb-2">รายละเอียด / บันทึกเพิ่มเติม</h3>
            {task.description ? (
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
                {task.description}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">ไม่มีรายละเอียดเพิ่มเติม</p>
            )}
          </div>

          {/* Subtasks / Checklist Items */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  รายการเช็คลิสต์ ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
                </h3>
                <span className="text-xs font-semibold text-indigo-600">
                  {Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }}
                />
              </div>

              <div className="space-y-2">
                {task.subtasks.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => onToggleSubtask(task.id, st.id)}
                    aria-label={`ทำเครื่องหมาย ${st.title}`}
                    className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      st.completed 
                        ? 'bg-slate-50/70 border-slate-200 text-slate-400 line-through' 
                        : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                    }`}
                  >
                    {st.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm font-medium">{st.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History / Audit Log */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-600" />
              ประวัติการแก้ไขและการดำเนินงาน (Activity Log)
            </h3>
            
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
              {task.history && task.history.length > 0 ? (
                task.history.map((hist) => (
                  <div key={hist.id} className="text-xs p-2 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                      <strong className="text-indigo-700 font-semibold">{hist.author}</strong>
                      <span>{formatHistoryTime(hist.timestamp)}</span>
                    </div>
                    <p className="text-slate-800 font-medium">{hist.action}</p>
                    {hist.note && <p className="text-slate-500 text-[11px] mt-0.5">{hist.note}</p>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">ยังไม่มีบันทึกประวัติ</p>
              )}
            </div>

            {/* Quick add history - Automatically locked to current member */}
            <form onSubmit={handleAddLog} className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-1.5 text-xs text-sky-800 bg-sky-50 px-2.5 py-1.5 rounded-xl border border-sky-200 font-semibold whitespace-nowrap self-start sm:self-auto">
                <span className="text-[10px] text-sky-600">ผู้บันทึก:</span>
                <span>{currentMember?.name || 'ตนเอง'}</span>
              </div>
              <input
                type="text"
                placeholder="บันทึกความคืบหน้า (เช่น ส่งงานเรียบร้อย, ทำแบบฝึกหัดเสร็จแล้ว)..."
                value={logAction}
                onChange={(e) => setLogAction(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border-2 border-slate-200 focus:outline-none focus:border-sky-500 bg-white"
              />
              <button
                type="submit"
                aria-label="ส่งบันทึกประวัติ"
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3 h-3 text-slate-950" />
                <span>บันทึก</span>
              </button>
            </form>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          
          {/* Quick Complete / Reactivate Toggle */}
          <button
            type="button"
            onClick={() => onToggleStatus(task.id)}
            aria-label={isCompleted ? 'เปลี่ยนสถานะเป็นยังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              isCompleted
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-200'
            }`}
          >
            {isCompleted ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>เปลี่ยนเป็นยังไม่เสร็จ</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>ทำเครื่องหมายว่าเสร็จแล้ว</span>
              </>
            )}
          </button>

          {/* Right Action buttons: Edit, Delete, Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              aria-label="แก้ไขงานนี้"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>แก้ไข</span>
            </button>

            {isConfirmingDelete ? (
              <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-in fade-in">
                <span className="text-xs text-rose-700 font-bold px-1.5">ยืนยันลบงาน?</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmingDelete(false);
                    onDelete(task.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs cursor-pointer"
                >
                  ลบเลย
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-2 py-1 rounded-lg bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 border border-slate-300 cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                aria-label="ลบงานนี้"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>ลบ</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่าง"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
            >
              ปิด
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
