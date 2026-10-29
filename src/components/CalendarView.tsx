import React, { useState, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Sparkles, 
  Layers, 
  Flag, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  X,
  List
} from 'lucide-react';
import { CategoryItem, Task } from '../types/task';
import { 
  generateCalendarGrid, 
  THAI_MONTH_NAMES, 
  THAI_DAY_NAMES_SHORT, 
  toBuddhistYear, 
  PRIORITY_CONFIG, 
  getTasksForDate,
  formatThaiDate 
} from '../utils/calendar';

interface CalendarViewProps {
  currentDate: Date;
  tasks: Task[];
  categories: CategoryItem[];
  selectedCategoryFilter: string | 'all';
  onCategoryFilterChange: (catId: string | 'all') => void;
  onOpenAddCategoryModal: () => void;
  onOpenDownloadImageModal: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSetMonth: (month: number) => void;
  onSetYear: (year: number) => void;
  onGoToToday: () => void;
  onSelectTask: (task: Task) => void;
  onAddTaskForDate: (dateString: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  tasks,
  categories,
  selectedCategoryFilter,
  onCategoryFilterChange,
  onOpenAddCategoryModal,
  onOpenDownloadImageModal,
  onPrevMonth,
  onNextMonth,
  onSetMonth,
  onSetYear,
  onGoToToday,
  onSelectTask,
  onAddTaskForDate
}) => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Collapsible category state & search
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);

  // Selected Day Sheet Modal State (for easy viewing on mobile)
  const [selectedDayForSheet, setSelectedDayForSheet] = useState<string | null>(null);

  // Generate the days grid
  const daysGrid = useMemo(() => {
    return generateCalendarGrid(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Year options for navigation (range: 2023 - 2032)
  const yearOptions = useMemo(() => {
    const list: number[] = [];
    for (let y = 2023; y <= 2032; y++) {
      list.push(y);
    }
    return list;
  }, []);

  // Category map for fast lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, CategoryItem>();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filtered categories based on search input
  const searchedCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return categories;
    const q = categorySearchQuery.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(q));
  }, [categories, categorySearchQuery]);

  // Filter tasks based on category selector
  const filteredTasks = useMemo(() => {
    if (selectedCategoryFilter === 'all') return tasks;
    return tasks.filter(t => t.categoryId === selectedCategoryFilter);
  }, [tasks, selectedCategoryFilter]);

  const handleScrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const offset = direction === 'left' ? -200 : 200;
      categoryScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const tasksForSelectedDaySheet = useMemo(() => {
    if (!selectedDayForSheet) return [];
    return getTasksForDate(filteredTasks, selectedDayForSheet);
  }, [filteredTasks, selectedDayForSheet]);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      
      {/* Calendar Header / Navigation Bar */}
      <div className="p-3.5 sm:p-5 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 space-y-3">
        
        {/* Row 1: Month & Year Controls, Download Image Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Month & Year Navigation Controls */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            
            {/* Prev / Next Arrows */}
            <div className="inline-flex rounded-xl shadow-2xs border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={onPrevMonth}
                aria-label="เดือนก่อนหน้า"
                className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-[1px] bg-slate-200 my-1" />
              <button
                type="button"
                onClick={onNextMonth}
                aria-label="เดือนถัดไป"
                className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Month Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                aria-label="เลือกเดือน"
                value={currentMonth}
                onChange={(e) => onSetMonth(parseInt(e.target.value, 10))}
                className="w-full sm:w-auto appearance-none bg-white border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm rounded-xl pl-3 pr-7 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-2xs"
              >
                {THAI_MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>

            {/* Quick Year Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                aria-label="เลือกปี"
                value={currentYear}
                onChange={(e) => onSetYear(parseInt(e.target.value, 10))}
                className="w-full sm:w-auto appearance-none bg-white border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm rounded-xl pl-3 pr-7 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-2xs"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year} (พ.ศ. {toBuddhistYear(year)})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>

            {/* Today Jump Button */}
            <button
              type="button"
              onClick={onGoToToday}
              aria-label="กลับไปเดือนปัจจุบัน"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 active:bg-sky-200 transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-sky-600" />
              <span>วันนี้</span>
            </button>
          </div>

          {/* Right Action: Download Schedule Image */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenDownloadImageModal}
              title="ดาวน์โหลดรูปภาพตารางงาน เลือกได้หลายเดือน"
              aria-label="ดาวน์โหลดรูปภาพตารางงาน"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 active:scale-95 shadow-sm shadow-amber-200 transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-slate-950" />
              <span>ดาวน์โหลดรูปภาพตารางงาน</span>
            </button>
          </div>

        </div>

        {/* Row 2: Collapsible & Searchable Categories Bar */}
        <div className="pt-2 border-t border-slate-200/60">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <button
              type="button"
              onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-sky-600 cursor-pointer"
              aria-label="ย่อหรือขยายหมวดหมู่"
            >
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              <span>หมวดหมู่งาน ({categories.length})</span>
              {isCategoryExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Search Input for categories */}
            {isCategoryExpanded && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    placeholder="ค้นหาหมวดหมู่..."
                    className="pl-7 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 w-32 sm:w-44"
                  />
                  {categorySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCategorySearchQuery('')}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px]"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Scroll arrows */}
                <div className="hidden sm:inline-flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleScrollCategories('left')}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                    title="เลื่อนซ้าย"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollCategories('right')}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                    title="เลื่อนขวา"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Category Chips */}
          {isCategoryExpanded && (
            <div 
              ref={categoryScrollRef}
              className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth pt-1 touch-pan-x"
            >
              <button
                type="button"
                onClick={() => onCategoryFilterChange('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด ({tasks.length})
              </button>

              {searchedCategories.map((cat) => {
                const isSelected = selectedCategoryFilter === cat.id;
                const count = tasks.filter(t => t.categoryId === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onCategoryFilterChange(isSelected ? 'all' : cat.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-2xs ring-2 ring-sky-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}

              {/* Add custom category button */}
              <button
                type="button"
                onClick={onOpenAddCategoryModal}
                title="เพิ่มหมวดหมู่ใหม่"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>เพิ่มหมวดหมู่</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Calendar Grid Header: Days of the Week */}
      <div className="grid grid-cols-7 border-b border-slate-200/90 bg-slate-50/80 text-center font-bold text-[11px] sm:text-sm text-slate-700 select-none">
        {THAI_DAY_NAMES_SHORT.map((dayName, idx) => {
          const isWeekend = idx === 0 || idx === 6;
          return (
            <div
              key={dayName}
              className={`py-2 px-0.5 sm:px-1 border-r last:border-r-0 border-slate-200/60 ${
                isWeekend ? 'text-rose-600 bg-rose-50/20' : ''
              }`}
            >
              <span className="hidden sm:inline">{['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'][idx]}</span>
              <span className="sm:hidden">{dayName}</span>
            </div>
          );
        })}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200/80 bg-slate-100">
        {daysGrid.map((day) => {
          const dayTasks = getTasksForDate(filteredTasks, day.dateString);
          // On mobile screens, limit to 2 visible task ribbons to maintain clean spacing
          const maxVisibleTasks = 2;
          const visibleTasks = dayTasks.slice(0, maxVisibleTasks);
          const remainingCount = dayTasks.length - maxVisibleTasks;
          const dayOfWeek = day.date.getDay();

          let cellBgClass = 'bg-white hover:bg-slate-50/60';
          if (day.isToday) {
            cellBgClass = 'bg-sky-50/80 hover:bg-sky-50/95 ring-2 ring-inset ring-sky-300';
          } else if (!day.isCurrentMonth) {
            cellBgClass = 'bg-slate-50/30 text-slate-400 opacity-60 hover:opacity-90 hover:bg-slate-50';
          } else if (day.isWeekend) {
            cellBgClass = 'bg-slate-50/50 hover:bg-white';
          }

          return (
            <div
              key={day.dateString}
              onClick={() => {
                // If cell has tasks or user taps cell on mobile, select day for quick sheet or add task
                if (dayTasks.length > 0) {
                  setSelectedDayForSheet(day.dateString);
                }
              }}
              className={`group relative min-h-[92px] sm:min-h-[142px] py-1 transition-colors flex flex-col justify-between overflow-visible cursor-pointer ${cellBgClass}`}
            >
              {/* Day Cell Header */}
              <div className="flex items-center justify-between mb-1 px-1 sm:px-2">
                <div className="flex items-center gap-1">
                  <span
                    className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                      day.isToday
                        ? 'text-sky-800 font-extrabold'
                        : day.isCurrentMonth
                          ? day.isWeekend
                            ? 'text-rose-600'
                            : 'text-slate-800'
                          : 'text-slate-400'
                    }`}
                    title={day.isToday ? 'วันนี้' : day.dateString}
                  >
                    {day.dayNumber}
                  </span>

                  {day.isToday && (
                    <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-sky-500 text-white shadow-2xs">
                      วันนี้
                    </span>
                  )}
                </div>

                {/* Quick Add Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTaskForDate(day.dateString);
                  }}
                  title={`บันทึกงานสำหรับวันที่ ${day.dateString}`}
                  aria-label={`บันทึกงานสำหรับวันที่ ${day.dateString}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Task Highlights Ribbon */}
              <div className="space-y-0.5 sm:space-y-1 flex-1 w-full">
                {visibleTasks.map((task) => {
                  const cat = categoryMap.get(task.categoryId) || categories[0];
                  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.low;
                  const isCompleted = task.status === 'completed';

                  const isRange = task.hasDeadline && (task.startDate !== task.endDate);
                  const isStartDay = (day.dateString === task.startDate);
                  const isEndDay = (day.dateString === task.endDate);
                  const isBetween = isRange && !isStartDay && !isEndDay;

                  const isWeekStart = dayOfWeek === 0;
                  const isWeekEnd = dayOfWeek === 6;

                  let roundingClass = 'rounded-md mx-0.5 sm:mx-1';

                  if (isRange) {
                    if (isStartDay) {
                      roundingClass = isWeekEnd 
                        ? 'rounded-md mx-0.5 sm:mx-1' 
                        : 'rounded-l-md rounded-r-none ml-0.5 sm:ml-1 mr-0';
                    } else if (isEndDay) {
                      roundingClass = isWeekStart 
                        ? 'rounded-md mx-0.5 sm:mx-1' 
                        : 'rounded-r-md rounded-l-none mr-0.5 sm:mr-1 ml-0';
                    } else if (isBetween) {
                      if (isWeekStart && isWeekEnd) {
                        roundingClass = 'rounded-md mx-0.5 sm:mx-1';
                      } else if (isWeekStart) {
                        roundingClass = 'rounded-l-md rounded-r-none ml-0.5 sm:ml-1 mr-0';
                      } else if (isWeekEnd) {
                        roundingClass = 'rounded-r-md rounded-l-none mr-0.5 sm:mr-1 ml-0';
                      } else {
                        roundingClass = 'rounded-none mx-0 border-x-0';
                      }
                    }
                  }

                  const taskBgColor = isCompleted 
                    ? '#f1f5f9' 
                    : `${cat?.color || '#3b82f6'}20`;
                  const taskTextColor = isCompleted 
                    ? '#94a3b8' 
                    : (cat?.color || '#1e293b');
                  const taskBorderColor = isCompleted 
                    ? '#cbd5e1' 
                    : `${cat?.color || '#3b82f6'}60`;

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(task);
                      }}
                      data-testid={`task-highlight-${task.id}`}
                      aria-label={`เปิดดูรายละเอียดงาน ${task.title}`}
                      className={`w-full text-left px-1 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs transition-all duration-150 transform hover:brightness-95 hover:shadow-2xs cursor-pointer flex items-center gap-1 border ${roundingClass} ${
                        isCompleted ? 'line-through' : ''
                      }`}
                      style={{
                        backgroundColor: taskBgColor,
                        borderColor: taskBorderColor,
                        color: taskTextColor,
                        borderLeftWidth: (isStartDay || !isRange || isWeekStart) ? '3px' : '1px',
                        borderLeftColor: isCompleted ? '#94a3b8' : cat?.color
                      }}
                      title={`${task.title} (${task.startDate} ถึง ${task.endDate})`}
                    >
                      {/* Priority Dot */}
                      {!isCompleted && (isStartDay || !isRange || isWeekStart) && (
                        <span 
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: priorityConfig.color }}
                        />
                      )}

                      {/* Deadline Tag */}
                      {isRange && isEndDay && (
                        <span className="text-[9px] font-bold px-0.5 rounded bg-rose-500 text-white flex-shrink-0 flex items-center gap-0.5">
                          <Flag className="w-2 h-2" />
                          <span className="hidden sm:inline">Deadline</span>
                        </span>
                      )}

                      {isRange && isStartDay && (
                        <span className="text-[9px] font-bold px-0.5 rounded bg-sky-600 text-white flex-shrink-0">
                          เริ่ม
                        </span>
                      )}

                      {/* Title truncate */}
                      <span className="font-semibold truncate flex-1 leading-tight text-slate-900">
                        {task.title}
                      </span>
                    </button>
                  );
                })}

                {/* Show "+X งาน" on cell */}
                {remainingCount > 0 && (
                  <div className="px-0.5 sm:px-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDayForSheet(day.dateString);
                      }}
                      aria-label={`ดูอีก ${remainingCount} งานสำหรับวันนี้`}
                      className="w-full text-center py-0.5 rounded text-[10px] sm:text-[11px] font-bold text-sky-700 bg-sky-100/90 hover:bg-sky-200 transition-colors cursor-pointer"
                    >
                      +{remainingCount} งานเพิ่มเติม
                    </button>
                  </div>
                )}
              </div>

              <div />
            </div>
          );
        })}
      </div>

      {/* Calendar Bottom Legend & Credit */}
      <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            คำอธิบายปฏิทิน:
          </span>
          <span className="text-[11px] sm:text-xs">
            กดที่วันเพื่อดูรายการงานทั้งหมด แถบสีแสดงกำหนดส่งลากยาวต่อเนื่อง
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 text-[11px]">
            By Genius Society
          </span>
        </div>
      </div>

      {/* MOBILE / QUICK DAY SCHEDULE DRAWER (Sheet) */}
      {selectedDayForSheet && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedDayForSheet(null)}
        >
          <div 
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-amber-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-prompt">
                    {formatThaiDate(selectedDayForSheet, { includeDayName: true })}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    รายการงานและกำหนดส่งทั้งหมด {tasksForSelectedDaySheet.length} งาน
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const d = selectedDayForSheet;
                    setSelectedDayForSheet(null);
                    onAddTaskForDate(d);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มงาน</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDayForSheet(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sheet Body - List of Tasks */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              {tasksForSelectedDaySheet.length > 0 ? (
                tasksForSelectedDaySheet.map((t) => {
                  const cat = categoryMap.get(t.categoryId) || categories[0];
                  const priorityConfig = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.low;
                  const isCompleted = t.status === 'completed';

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedDayForSheet(null);
                        onSelectTask(t);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs flex items-start gap-3 ${
                        isCompleted ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200 hover:border-sky-300'
                      }`}
                      style={{ borderLeftWidth: '5px', borderLeftColor: cat?.color || '#3b82f6' }}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span 
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                            style={{ backgroundColor: cat?.color || '#3b82f6' }}
                          >
                            {cat?.name}
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityConfig.bgLight} ${priorityConfig.textColor} ${priorityConfig.borderLight}`}>
                            {priorityConfig.labelTh}
                          </span>

                          {t.hasDeadline && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                              <Flag className="w-2.5 h-2.5 text-rose-500" />
                              <span>ส่ง: {t.endDate}</span>
                            </span>
                          )}
                        </div>

                        <h4 className={`text-sm font-bold text-slate-900 leading-snug font-prompt ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {t.title}
                        </h4>

                        {t.time && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>เวลา: {t.time} น.</span>
                          </p>
                        )}
                      </div>

                      {isCompleted && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 space-y-2">
                  <List className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">ไม่มีรายการงานสำหรับวันที่นี้</p>
                  <button
                    type="button"
                    onClick={() => {
                      const d = selectedDayForSheet;
                      setSelectedDayForSheet(null);
                      onAddTaskForDate(d);
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ บันทึกงานใหม่สำหรับวันนี้</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
