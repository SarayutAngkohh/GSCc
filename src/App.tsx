/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CategoryItem, Task, TaskHistoryItem } from './types/task';
import { MemberAccount, GENIUS_MEMBERS } from './types/auth';
import { getInitialSeedTasks } from './data/seedTasks';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskFormModal } from './components/TaskFormModal';
import { AllTasksModal } from './components/AllTasksModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { DownloadScheduleImageModal } from './components/DownloadScheduleImageModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { LoginModal } from './components/LoginModal';
import { Toast, ToastMessage } from './components/Toast';
import { ListOrdered, PlusCircle, Sparkles, UserCheck } from 'lucide-react';
import { DEFAULT_STUDENT_CATEGORIES, formatThaiDate } from './utils/calendar';
import { 
  testConnection, 
  subscribeToTasks, 
  saveTaskToFirestore, 
  deleteTaskFromFirestore,
  subscribeToCategories,
  saveCategoryToFirestore,
  subscribeToMembers,
  seedMembersIfEmpty,
  initAuthListener
} from './utils/firebase';

const TASKS_STORAGE_KEY = 'genius_society_clean_tasks_v1';
const CATEGORIES_STORAGE_KEY = 'genius_society_categories_v1';

export default function App() {
  // Current logged in member state
  const [currentMember, setCurrentMember] = useState<MemberAccount | null>(null);

  // Members state synced with Firestore
  const [members, setMembers] = useState<MemberAccount[]>(GENIUS_MEMBERS);

  // Categories state
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse categories from localStorage:', e);
    }
    return DEFAULT_STUDENT_CATEGORIES;
  });

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved tasks:', e);
    }
    return getInitialSeedTasks();
  });

  // Toast state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: String(Date.now()),
      type,
      message
    });
  }, []);

  // Initialize Firebase Firestore & Auth
  useEffect(() => {
    // 1. Test connection
    testConnection();

    // 2. Auth state
    const unsubscribeAuth = initAuthListener();

    // 3. Seed & Realtime Firestore Members Subscription (Passcodes & Member accounts)
    seedMembersIfEmpty(GENIUS_MEMBERS);
    const unsubscribeMembers = subscribeToMembers((firestoreMembers) => {
      if (firestoreMembers && firestoreMembers.length > 0) {
        setMembers(firestoreMembers);
      }
    });

    // 4. Realtime Firestore Tasks Subscription
    const unsubscribeTasks = subscribeToTasks((firestoreTasks) => {
      if (firestoreTasks && firestoreTasks.length > 0) {
        setTasks(firestoreTasks);
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(firestoreTasks));
      } else {
        // First initialization: seed tasks into Firestore if empty
        const initialSeed = getInitialSeedTasks();
        initialSeed.forEach((t) => saveTaskToFirestore(t));
      }
    });

    // 5. Realtime Firestore Categories Subscription
    const unsubscribeCategories = subscribeToCategories((firestoreCategories) => {
      if (firestoreCategories && firestoreCategories.length > 0) {
        setCategories(firestoreCategories);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(firestoreCategories));
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMembers();
      unsubscribeTasks();
      unsubscribeCategories();
    };
  }, []);

  // Calendar navigation state: current viewed month and year
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Category filter state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | 'all'>('all');

  // Modal states
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isDownloadImageModalOpen, setIsDownloadImageModalOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultDateForCreate, setDefaultDateForCreate] = useState<string | undefined>(undefined);
  const [isAllTasksModalOpen, setIsAllTasksModalOpen] = useState(false);

  // Calendar month/year navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSetMonth = (monthIndex: number) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), monthIndex, 1));
  };

  const handleSetYear = (year: number) => {
    setCurrentDate((prev) => new Date(year, prev.getMonth(), 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // Add new category
  const handleAddCategory = (newCategory: CategoryItem) => {
    setCategories((prev) => [...prev, newCategory]);
    saveCategoryToFirestore(newCategory);
    showToast(`เพิ่มหมวดหมู่ "${newCategory.name}" สำเร็จและบันทึกลง Firestore แล้ว`, 'success');
  };

  // Login handler
  const handleLoginSuccess = (member: MemberAccount) => {
    setCurrentMember(member);
    showToast(`เข้าสู่ระบบในฐานะ "${member.name}" สำเร็จ`, 'success');
  };

  // Task creation & editing
  const handleOpenCreateModal = (dateStr?: string) => {
    setEditingTask(null);
    setDefaultDateForCreate(dateStr);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, 
    editId?: string,
    editorName: string = currentMember?.name || 'ตนเอง',
    changeNote: string = ''
  ) => {
    const nowIso = new Date().toISOString();
    const authorName = currentMember ? currentMember.name : (editorName || 'ตนเอง');

    if (editId) {
      const newHistoryEntry: TaskHistoryItem = {
        id: `hist-${Date.now()}`,
        timestamp: nowIso,
        author: authorName,
        action: changeNote || 'แก้ไขรายละเอียดงานและกำหนดส่ง',
        note: taskData.hasDeadline ? `กำหนดส่ง: ${taskData.endDate}` : 'ไม่มีกำหนดส่ง (ไม่มี Deadline)'
      };

      const updatedTask: Task = {
        ...(tasks.find((t) => t.id === editId) || { id: editId, createdAt: nowIso }),
        ...taskData,
        id: editId,
        history: [newHistoryEntry, ...((tasks.find((t) => t.id === editId)?.history) || [])],
        updatedAt: nowIso
      };

      setTasks((prev) => prev.map((t) => (t.id === editId ? updatedTask : t)));
      saveTaskToFirestore(updatedTask);

      if (selectedTaskForDetail && selectedTaskForDetail.id === editId) {
        setSelectedTaskForDetail(updatedTask);
      }
      showToast(`อัปเดตงาน "${taskData.title}" เรียบร้อยแล้ว`, 'success');
    } else {
      const initialHistory: TaskHistoryItem = {
        id: `hist-${Date.now()}`,
        timestamp: nowIso,
        author: authorName,
        action: 'บันทึกงานใหม่',
        note: taskData.hasDeadline ? `กำหนดส่ง: ${taskData.endDate}` : 'ไม่มีกำหนดส่ง (ไม่มี Deadline)'
      };

      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...taskData,
        history: [initialHistory],
        createdAt: nowIso,
        updatedAt: nowIso
      };
      setTasks((prev) => [newTask, ...prev]);
      saveTaskToFirestore(newTask);
      showToast(`บันทึก "${taskData.title}" โดย ${authorName} เรียบร้อยแล้ว`, 'success');
    }
  };

  // Add history log entry manually
  const handleAddHistoryEntry = (taskId: string, entry: Omit<TaskHistoryItem, 'id' | 'timestamp'>) => {
    const nowIso = new Date().toISOString();
    const newEntry: TaskHistoryItem = {
      id: `hist-${Date.now()}`,
      timestamp: nowIso,
      author: entry.author || currentMember?.name || 'ตนเอง',
      action: entry.action,
      note: entry.note
    };

    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      const updatedTask: Task = {
        ...target,
        history: [newEntry, ...(target.history || [])],
        updatedAt: nowIso
      };
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      saveTaskToFirestore(updatedTask);

      if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
        setSelectedTaskForDetail(updatedTask);
      }
      showToast('บันทึกประวัติการดำเนินงานแล้ว', 'success');
    }
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteTaskFromFirestore(taskId);

    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail(null);
    }
    showToast(`ลบงาน "${target?.title || ''}" เรียบร้อยแล้ว`, 'info');
  };

  // Toggle complete / todo
  const handleToggleStatus = (taskId: string) => {
    const nowIso = new Date().toISOString();
    const authorName = currentMember?.name || 'ตนเอง';

    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const newStatus = target.status === 'completed' ? 'todo' : 'completed';
    const historyEntry: TaskHistoryItem = {
      id: `hist-${Date.now()}`,
      timestamp: nowIso,
      author: authorName,
      action: newStatus === 'completed' ? 'ทำเครื่องหมายว่าเสร็จสิ้นแล้ว' : 'เปลี่ยนสถานะเป็นยังไม่เสร็จ'
    };

    const updatedTask: Task = {
      ...target,
      status: newStatus,
      history: [historyEntry, ...(target.history || [])],
      updatedAt: nowIso
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    saveTaskToFirestore(updatedTask);

    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail(updatedTask);
    }

    showToast(
      newStatus === 'completed' ? 'ทำเสร็จสิ้นแล้ว 🎉' : 'เปลี่ยนสถานะเป็นยังไม่เสร็จ',
      'success'
    );
  };

  // Toggle subtask inside task
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const nowIso = new Date().toISOString();
    const authorName = currentMember?.name || 'ตนเอง';

    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    let toggledTitle = '';
    let isNowCompleted = false;

    const updatedSubtasks = (target.subtasks || []).map((st) => {
      if (st.id === subtaskId) {
        toggledTitle = st.title;
        isNowCompleted = !st.completed;
        return { 
          ...st, 
          completed: !st.completed,
          completedAt: !st.completed ? nowIso : undefined,
          completedBy: authorName
        };
      }
      return st;
    });

    const historyEntry: TaskHistoryItem = {
      id: `hist-${Date.now()}`,
      timestamp: nowIso,
      author: authorName,
      action: `${isNowCompleted ? 'ทำเช็คลิสต์สำเร็จ' : 'ยกเลิกเช็คลิสต์'}: "${toggledTitle}"`
    };

    const updatedTask: Task = {
      ...target,
      subtasks: updatedSubtasks,
      history: [historyEntry, ...(target.history || [])],
      updatedAt: nowIso
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    saveTaskToFirestore(updatedTask);

    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail(updatedTask);
    }
  };

  // Import tasks from Google Sheets
  const handleImportTasksFromSheets = (importedTasks: Task[]) => {
    importedTasks.forEach((t) => {
      saveTaskToFirestore(t);
    });
    setTasks((prev) => [...importedTasks, ...prev]);
  };

  const todayDateStr = new Date().toISOString().slice(0, 10);
  const activeTodayTasks = tasks.filter(
    (t) => (t.startDate <= todayDateStr && todayDateStr <= t.endDate && t.hasDeadline) || t.startDate === todayDateStr
  );

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-prompt selection:bg-sky-200 selection:text-sky-900">
      
      {/* Top Header */}
      <Header
        currentMember={currentMember}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Banner with Date & Schedule Context & Action Buttons */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden border border-sky-700/40">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-28 -top-8 w-36 h-36 bg-sky-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-1 flex-wrap">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>แผนการเรียน การบ้าน และกำหนดส่ง</span>
                <span className="text-[10px] bg-slate-950/40 px-2.5 py-0.5 rounded-full font-bold text-white border border-sky-400/30">
                  By <span className="text-sky-400 font-extrabold">Genius</span> <span className="text-amber-400 font-extrabold">Society</span>
                </span>

                {currentMember && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-sky-500/30 text-sky-100 px-2.5 py-0.5 rounded-full border border-sky-400/30">
                    <UserCheck className="w-3 h-3 text-amber-300" />
                    <span>ผู้บันทึก: {currentMember.name}</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-prompt">
                {formatThaiDate(todayDateStr, { includeDayName: true })}
              </h2>
              <p className="text-sm text-sky-100/90 mt-1">
                {activeTodayTasks.length > 0 
                  ? `วันนี้มี ${activeTodayTasks.length} งานที่อยู่ในกำหนดการหรือต้องส่ง (${activeTodayTasks.filter(t => t.status === 'completed').length} งานเสร็จแล้ว)`
                  : 'ยังไม่มีงานหรือการบ้านสำหรับวันนี้ สามารถกดปุ่มบันทึกงานใหม่เพื่อเริ่มวางแผนได้ทันที'}
              </p>
            </div>

            {/* Action buttons inside hero */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Button 1: กดเพื่อบันทึก */}
              <button
                type="button"
                onClick={() => handleOpenCreateModal(todayDateStr)}
                data-testid="btn-create-task"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-amber-400 text-slate-950 hover:bg-amber-500 active:bg-amber-600 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>+ กดเพื่อบันทึกงานใหม่</span>
              </button>

              {/* Button 2: กดเพื่อดูรายการงานทั้งหมด */}
              <button
                type="button"
                onClick={() => setIsAllTasksModalOpen(true)}
                data-testid="btn-view-all-tasks"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-sky-300/30 transition-all cursor-pointer"
              >
                <ListOrdered className="w-4 h-4 text-sky-200" />
                <span>ดูรายการงานทั้งหมด ({tasks.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View Component */}
        <section aria-label="ปฏิทินงานและกำหนดการ">
          <CalendarView
            currentDate={currentDate}
            tasks={tasks}
            categories={categories}
            selectedCategoryFilter={selectedCategoryFilter}
            onCategoryFilterChange={setSelectedCategoryFilter}
            onOpenAddCategoryModal={() => setIsAddCategoryModalOpen(true)}
            onOpenDownloadImageModal={() => setIsDownloadImageModalOpen(true)}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onSetMonth={handleSetMonth}
            onSetYear={handleSetYear}
            onGoToToday={handleGoToToday}
            onSelectTask={(task) => setSelectedTaskForDetail(task)}
            onAddTaskForDate={(dateString) => handleOpenCreateModal(dateString)}
          />
        </section>

      </main>

      {/* Task Details Modal */}
      <TaskDetailModal
        task={selectedTaskForDetail}
        isOpen={Boolean(selectedTaskForDetail)}
        categories={categories}
        currentMember={currentMember}
        onClose={() => setSelectedTaskForDetail(null)}
        onEdit={(task) => handleOpenEditModal(task)}
        onDelete={(taskId) => handleDeleteTask(taskId)}
        onToggleStatus={(taskId) => handleToggleStatus(taskId)}
        onToggleSubtask={(taskId, subtaskId) => handleToggleSubtask(taskId, subtaskId)}
        onAddHistoryEntry={handleAddHistoryEntry}
      />

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        categories={categories}
        currentMember={currentMember}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onOpenAddCategoryModal={() => setIsAddCategoryModalOpen(true)}
        editingTask={editingTask}
        defaultDate={defaultDateForCreate}
      />

      {/* Add Custom Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
      />

      {/* Download Schedule Image Modal */}
      <DownloadScheduleImageModal
        isOpen={isDownloadImageModalOpen}
        onClose={() => setIsDownloadImageModalOpen(false)}
        tasks={tasks}
        categories={categories}
        initialYear={currentDate.getFullYear()}
        initialMonth={currentDate.getMonth()}
      />

      {/* Google Sheets Sync Modal */}
      <GoogleSheetsSyncModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        tasks={tasks}
        categories={categories}
        currentMember={currentMember}
        onImportTasks={handleImportTasksFromSheets}
        showToast={showToast}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={!currentMember || isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentMember={currentMember}
        membersList={members}
      />

      {/* All Tasks Modal */}
      <AllTasksModal
        isOpen={isAllTasksModalOpen}
        tasks={tasks}
        categories={categories}
        onClose={() => setIsAllTasksModalOpen(false)}
        onSelectTask={(task) => {
          setSelectedTaskForDetail(task);
        }}
        onEditTask={(task) => handleOpenEditModal(task)}
        onDeleteTask={(taskId) => handleDeleteTask(taskId)}
        onToggleStatus={(taskId) => handleToggleStatus(taskId)}
        onToggleSubtask={(taskId, subtaskId) => handleToggleSubtask(taskId, subtaskId)}
        onOpenCreateModal={() => handleOpenCreateModal()}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Footer */}
      <footer className="mt-auto border-t border-sky-100 bg-white py-4 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <p>แอปบันทึกตารางแผนงาน การบ้าน และกำหนดส่ง • รองรับ Firebase Realtime DB & Google Sheets Sync</p>
          <span className="font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-full border border-sky-200 shadow-2xs">
            By <span className="text-sky-600 font-extrabold font-prompt">Genius</span> <span className="text-amber-500 font-extrabold font-prompt">Society</span>
          </span>
        </div>
      </footer>

    </div>
  );
}
