import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flag, 
  Upload, 
  File, 
  ListPlus, 
  UserCheck 
} from 'lucide-react';
import { CategoryItem, SubTask, Task, TaskAttachment, TaskPriority, TaskStatus } from '../types/task';
import { MemberAccount } from '../types/auth';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDateString } from '../utils/calendar';

interface TaskFormModalProps {
  isOpen: boolean;
  categories: CategoryItem[];
  currentMember: MemberAccount | null;
  onClose: () => void;
  onSave: (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, 
    editId?: string,
    changeNote?: string
  ) => void;
  onOpenAddCategoryModal: () => void;
  editingTask?: Task | null;
  defaultDate?: string;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  categories,
  currentMember,
  onClose,
  onSave,
  onOpenAddCategoryModal,
  editingTask,
  defaultDate
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Choice between: มีกำหนดส่ง (hasDeadline = true) vs ไม่มีกำหนดส่ง (hasDeadline = false)
  const [hasDeadline, setHasDeadline] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [time, setTime] = useState('09:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');

  // Drag and drop / Attachments
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Manual link inputs
  const [newAttName, setNewAttName] = useState('');
  const [newAttUrl, setNewAttUrl] = useState('');

  // Subtasks / Checklist
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [error, setError] = useState('');

  // Synchronize form when opened or editingTask changes
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setHasDeadline(editingTask.hasDeadline ?? (editingTask.startDate !== editingTask.endDate));
      setStartDate(editingTask.startDate);
      setEndDate(editingTask.endDate || editingTask.startDate);
      setTime(editingTask.time || '09:00');
      setIsAllDay(editingTask.isAllDay);
      setCategoryId(editingTask.categoryId || categories[0]?.id || 'homework');
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setAttachments(editingTask.attachments || []);
      setSubtasks(editingTask.subtasks || []);
    } else {
      const initialDate = defaultDate || formatDateString(new Date());
      setTitle('');
      setDescription('');
      setHasDeadline(true);
      setStartDate(initialDate);
      setEndDate(initialDate);
      setTime('09:00');
      setIsAllDay(false);
      setCategoryId(categories[0]?.id || 'homework');
      setPriority('medium');
      setStatus('todo');
      setAttachments([]);
      setSubtasks([]);
    }
    setNewAttName('');
    setNewAttUrl('');
    setNewSubtaskTitle('');
    setError('');
  }, [isOpen, editingTask, defaultDate, categories]);

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

  if (!isOpen) return null;

  // Add subtask
  const handleAddSubtask = (customText?: string) => {
    const textToAdd = (customText || newSubtaskTitle).trim();
    if (!textToAdd) return;
    const item: SubTask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: textToAdd,
      completed: false
    };
    setSubtasks([...subtasks, item]);
    if (!customText) setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  // Drag and Drop File Handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const isImg = file.type.startsWith('image/');
        const newAttachment: TaskAttachment = {
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          url: dataUrl,
          fileSize: formatFileSize(file.size),
          type: isImg ? 'image' : 'file',
          isUploadedFile: true
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Manual link addition
  const handleAddManualLink = () => {
    if (!newAttName.trim() || !newAttUrl.trim()) {
      setError('กรุณากรอกทั้งชื่อและลิงก์');
      return;
    }

    let formattedUrl = newAttUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const item: TaskAttachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newAttName.trim(),
      url: formattedUrl,
      type: 'link',
      isUploadedFile: false
    };

    setAttachments([...attachments, item]);
    setNewAttName('');
    setNewAttUrl('');
    setError('');
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('กรุณาระบุชื่องาน / รายวิชา');
      return;
    }
    if (!startDate) {
      setError('กรุณาเลือกวันที่เริ่มต้น');
      return;
    }

    const finalEndDate = hasDeadline ? (endDate || startDate) : startDate;

    if (hasDeadline && finalEndDate < startDate) {
      setError('วันกำหนดส่ง (Deadline) ต้องไม่อยู่ก่อนวันที่เริ่มต้น');
      return;
    }

    // Name is automatically locked to currentMember.name!
    onSave(
      {
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate: finalEndDate,
        hasDeadline,
        time: isAllDay ? '' : (time || ''),
        isAllDay,
        categoryId: categoryId || categories[0]?.id || 'homework',
        priority,
        status,
        subtasks,
        attachments,
        history: editingTask?.history || []
      },
      editingTask ? editingTask.id : undefined,
      editingTask ? 'แก้ไขรายละเอียดงาน' : 'บันทึกงานใหม่'
    );
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border-2 border-sky-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-sky-50/80 via-white to-amber-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold text-sky-600 font-prompt">Genius</span>
              <span className="text-xs font-extrabold text-amber-500 font-prompt">Society</span>
              {currentMember && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                  <UserCheck className="w-3 h-3 text-sky-600" />
                  <span>บันทึกในนาม: {currentMember.name} (ล็อกอัตโนมัติ)</span>
                </span>
              )}
            </div>
            <h2 id="task-form-title" className="text-lg sm:text-xl font-bold text-slate-900 font-prompt">
              {editingTask ? 'แก้ไขงาน / กำหนดการ' : 'บันทึกงานใหม่'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดแบบฟอร์ม"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ชื่องาน / การบ้าน / กิจกรรม <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="ระบุชื่องาน หรือรายวิชา..."
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900 text-sm font-medium shadow-2xs"
            />
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                หมวดหมู่
              </label>
              <button
                type="button"
                onClick={onOpenAddCategoryModal}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ เพิ่มหมวดหมู่ใหม่</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-2xl border-2 text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 text-sky-950 font-bold ring-2 ring-sky-200 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DATE CONFIGURATION: ไม่มี deadline VS มี deadline */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border-2 border-sky-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-600" />
                รูปแบบการกำหนดวัน (เลือกว่ามี Deadline หรือไม่)
              </label>

              {/* Radio choice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label 
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    !hasDeadline
                      ? 'bg-white border-sky-500 shadow-2xs ring-2 ring-sky-200 text-sky-950 font-bold'
                      : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="deadline_option"
                    checked={!hasDeadline}
                    onChange={() => setHasDeadline(false)}
                    className="text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <div>
                    <p className="text-xs font-bold">ไม่มีกำหนดส่ง (ไม่มี Deadline)</p>
                    <p className="text-[11px] text-slate-400">สำหรับอ่านทบทวนหรือกิจกรรมทั่วไป</p>
                  </div>
                </label>

                <label 
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    hasDeadline
                      ? 'bg-white border-amber-400 shadow-2xs ring-2 ring-amber-200 text-amber-950 font-bold'
                      : 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="deadline_option"
                    checked={hasDeadline}
                    onChange={() => setHasDeadline(true)}
                    className="text-amber-500 focus:ring-amber-400 w-4 h-4"
                  />
                  <div>
                    <p className="text-xs font-bold flex items-center gap-1">
                      <span>มีกำหนดส่ง (กำหนด Deadline)</span>
                      <Flag className="w-3.5 h-3.5 text-amber-500" />
                    </p>
                    <p className="text-[11px] text-slate-400">ระบุวันส่ง พร้อมแสดงแถบสีลากยาวในปฏิทิน</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {hasDeadline ? 'ตั้งแต่วันที่ (Start Date)' : 'วันที่จัดทำ / บันทึก'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setStartDate(newStart);
                    if (endDate < newStart) {
                      setEndDate(newStart);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 text-slate-800 text-xs sm:text-sm bg-white"
                />
              </div>

              {hasDeadline ? (
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                    <Flag className="w-3.5 h-3.5 text-amber-500" />
                    ถึงกำหนดส่ง (Deadline) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 text-xs sm:text-sm bg-white"
                  />
                </div>
              ) : (
                <div className="flex items-center pt-5">
                  <span className="text-xs text-slate-400 italic">
                    ✓ จะแสดงเฉพาะวันที่จัดทำ (ไม่มีแถบลากยาว Deadline)
                  </span>
                </div>
              )}
            </div>

            {/* Time & All Day */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-sky-100">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  เวลาส่ง / ดำเนินการ
                </label>
                <input
                  type="time"
                  disabled={isAllDay}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border text-slate-800 text-xs shadow-2xs ${
                    isAllDay ? 'bg-slate-100 text-slate-400 border-slate-200' : 'border-slate-300 bg-white'
                  }`}
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                  />
                  <span>กำหนดเป็น "ตลอดทั้งวัน"</span>
                </label>
              </div>
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ระดับความเร่งด่วน
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2.5 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-sky-500 text-slate-800 text-xs sm:text-sm bg-white"
              >
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((pKey) => (
                  <option key={pKey} value={pKey}>
                    {PRIORITY_CONFIG[pKey].labelTh}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                สถานะงาน
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2.5 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-sky-500 text-slate-800 text-xs sm:text-sm bg-white"
              >
                {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((sKey) => (
                  <option key={sKey} value={sKey}>
                    {STATUS_CONFIG[sKey].labelTh}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DRAG & DROP FILE ZONE + MULTI-LINK ATTACHMENTS */}
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-sky-600" />
                แนบไฟล์ (ลากไฟล์มาวางได้) & ลิงก์ที่เกี่ยวข้อง
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                {attachments.length} ไฟล์/ลิงก์
              </span>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-sky-500 bg-sky-50 scale-[1.01]' 
                  : 'border-slate-300 bg-white hover:border-sky-400 hover:bg-sky-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Upload className="w-6 h-6 text-sky-500 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-800">
                ลากไฟล์มาวางที่นี่ หรือ <span className="text-sky-600 underline">คลิกเพื่อเลือกไฟล์</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                รองรับไฟล์ PDF, รูปภาพ, สรุปบทเรียน, สไลด์, และเอกสารทุกชนิด
              </p>
            </div>

            {/* List of uploaded files & links */}
            {attachments.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <File className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-900 truncate">{att.name}</span>
                      {att.fileSize && (
                        <span className="text-[10px] text-slate-400">({att.fileSize})</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer flex-shrink-0"
                      title="ลบไฟล์นี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add manual link */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                หรือกรอกลิงก์ออนไลน์ (Google Classroom / Canva / Drive):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="ชื่อลิงก์..."
                  value={newAttName}
                  onChange={(e) => setNewAttName(e.target.value)}
                  className="sm:col-span-5 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                />
                <input
                  type="text"
                  placeholder="URL (https://...)..."
                  value={newAttUrl}
                  onChange={(e) => setNewAttUrl(e.target.value)}
                  className="sm:col-span-5 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddManualLink}
                  className="sm:col-span-2 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่ม</span>
                </button>
              </div>
            </div>
          </div>

          {/* Checklist / Subtasks */}
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ListPlus className="w-4 h-4 text-sky-600" />
                เช็คลิสต์ขั้นตอนการทำงาน
              </label>
              <span className="text-[11px] text-slate-500 font-semibold">
                {subtasks.length} รายการ
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="พิมพ์รายการเช็คลิสต์แล้วกด Enter..."
                className="flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white"
              />
              <button
                type="button"
                onClick={() => handleAddSubtask()}
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม</span>
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {subtasks.map((st, idx) => (
                  <div key={st.id} className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-400 font-mono text-[11px] w-4">{idx + 1}.</span>
                    <span className="truncate flex-1 text-slate-800 font-medium">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              บันทึกเนื้อหาเพิ่มเติม / หมายเหตุ
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุข้อกำหนด อาจารย์ผู้สอน หรือสิ่งที่ต้องเตรียม..."
              className="w-full px-3.5 py-2 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-sky-500 text-slate-800 text-xs sm:text-sm shadow-2xs"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-amber-200 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>{editingTask ? 'บันทึกการแก้ไข' : 'บันทึกงาน'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
