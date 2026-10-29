import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Image as ImageIcon, 
  Check, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { CategoryItem, Task } from '../types/task';
import { 
  THAI_MONTH_NAMES, 
  THAI_MONTH_NAMES_SHORT,
  THAI_DAY_NAMES_SHORT, 
  generateCalendarGrid, 
  toBuddhistYear, 
  getTasksForDate 
} from '../utils/calendar';

interface DownloadScheduleImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  categories: CategoryItem[];
  initialYear: number;
  initialMonth: number;
}

export const DownloadScheduleImageModal: React.FC<DownloadScheduleImageModalProps> = ({
  isOpen,
  onClose,
  tasks,
  categories,
  initialYear,
  initialMonth
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([initialMonth]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sync with initial
  useEffect(() => {
    if (isOpen) {
      setSelectedYear(initialYear);
      setSelectedMonths([initialMonth]);
    }
  }, [isOpen, initialYear, initialMonth]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleMonth = (mIdx: number) => {
    if (selectedMonths.includes(mIdx)) {
      if (selectedMonths.length === 1) return;
      setSelectedMonths(selectedMonths.filter(m => m !== mIdx));
    } else {
      setSelectedMonths([...selectedMonths, mIdx].sort((a, b) => a - b));
    }
  };

  const handleSelectQuick = (type: 'current' | 'next3' | 'term') => {
    if (type === 'current') {
      setSelectedMonths([initialMonth]);
    } else if (type === 'next3') {
      const list = [initialMonth, (initialMonth + 1) % 12, (initialMonth + 2) % 12];
      setSelectedMonths(Array.from(new Set(list)).sort((a, b) => a - b));
    } else if (type === 'term') {
      const list = [
        initialMonth, 
        (initialMonth + 1) % 12, 
        (initialMonth + 2) % 12, 
        (initialMonth + 3) % 12, 
        (initialMonth + 4) % 12
      ];
      setSelectedMonths(Array.from(new Set(list)).sort((a, b) => a - b));
    }
  };

  // Generate Image onto Canvas with Yellow & Blue Theme
  const generateImage = () => {
    setIsGenerating(true);

    setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Dimensions
        const width = 1200;
        const monthCardHeight = 680;
        const headerHeight = 160;
        const footerHeight = 90;
        const spacing = 40;

        const totalHeight = headerHeight + (monthCardHeight * selectedMonths.length) + (spacing * (selectedMonths.length - 1)) + footerHeight;

        // Retina scale 2x
        const dpr = 2;
        canvas.width = width * dpr;
        canvas.height = totalHeight * dpr;
        ctx.scale(dpr, dpr);

        const categoryMap = new Map<string, CategoryItem>();
        categories.forEach(c => categoryMap.set(c.id, c));

        // Background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, totalHeight);

        // Header Background Banner - Sky Blue to Deep Cyan
        const grad = ctx.createLinearGradient(0, 0, width, headerHeight);
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(0.5, '#0369a1');
        grad.addColorStop(1, '#0c4a6e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, headerHeight);

        // Header Text
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 14px "Prompt", sans-serif';
        ctx.fillText('ตารางกำหนดการและการบ้าน • SCHEDULE PLANNER', 50, 48);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px "Prompt", sans-serif';
        ctx.fillText(`ปฏิทินแผนการเรียนและกำหนดส่งงาน (ปี พ.ศ. ${toBuddhistYear(selectedYear)})`, 50, 88);

        ctx.fillStyle = '#e0f2fe';
        ctx.font = 'normal 14px "Prompt", sans-serif';
        ctx.fillText(`บันทึกเดือน: ${selectedMonths.map(m => THAI_MONTH_NAMES[m]).join(', ')} • ทั้งหมด ${tasks.length} รายการ`, 50, 118);

        // Genius (Blue) Society (Yellow) Tag
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(width - 260, 50, 210, 46, 14);
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 16px "Prompt", sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.fillText('Genius ', width - 230, 79);
        ctx.fillStyle = '#eab308';
        ctx.fillText('Society', width - 170, 79);

        // Render each month card
        let currentY = headerHeight + 30;

        selectedMonths.forEach((mIdx) => {
          const monthGrid = generateCalendarGrid(selectedYear, mIdx);
          const cardX = 40;
          const cardWidth = width - 80;
          const cardHeight = monthCardHeight - 20;

          // Card Container
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(cardX, currentY, cardWidth, cardHeight, 16);
          ctx.fill();
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Month Header Bar
          ctx.fillStyle = '#f0f9ff';
          ctx.beginPath();
          ctx.roundRect(cardX, currentY, cardWidth, 54, [16, 16, 0, 0]);
          ctx.fill();
          ctx.strokeStyle = '#bae6fd';
          ctx.stroke();

          ctx.fillStyle = '#0369a1';
          ctx.font = 'bold 20px "Prompt", sans-serif';
          ctx.fillText(`${THAI_MONTH_NAMES[mIdx]} ${toBuddhistYear(selectedYear)}`, cardX + 24, currentY + 34);

          // 7 Day Week Header
          const dayColWidth = cardWidth / 7;
          const weekHeaderY = currentY + 54;
          const weekHeaderHeight = 32;

          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(cardX, weekHeaderY, cardWidth, weekHeaderHeight);

          THAI_DAY_NAMES_SHORT.forEach((dayLabel, idx) => {
            ctx.fillStyle = (idx === 0 || idx === 6) ? '#e11d48' : '#0284c7';
            ctx.font = 'bold 13px "Prompt", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(dayLabel, cardX + (idx * dayColWidth) + (dayColWidth / 2), weekHeaderY + 21);
          });
          ctx.textAlign = 'left';

          // Calendar Grid Cells
          const gridStartY = weekHeaderY + weekHeaderHeight;
          const totalRows = Math.ceil(monthGrid.length / 7);
          const rowHeight = (cardHeight - 54 - weekHeaderHeight) / totalRows;

          ctx.strokeStyle = '#f1f5f9';
          ctx.lineWidth = 1;

          monthGrid.forEach((cell, idx) => {
            const col = idx % 7;
            const row = Math.floor(idx / 7);
            const cellX = cardX + (col * dayColWidth);
            const cellY = gridStartY + (row * rowHeight);

            if (cell.isToday) {
              ctx.fillStyle = '#e0f2fe';
            } else if (!cell.isCurrentMonth) {
              ctx.fillStyle = '#fafafa';
            } else if (cell.isWeekend) {
              ctx.fillStyle = '#fef2f2';
            } else {
              ctx.fillStyle = '#ffffff';
            }
            ctx.fillRect(cellX, cellY, dayColWidth, rowHeight);
            ctx.strokeRect(cellX, cellY, dayColWidth, rowHeight);

            ctx.font = cell.isToday ? 'bold 13px "Prompt", sans-serif' : 'normal 12px "Prompt", sans-serif';
            ctx.fillStyle = cell.isToday ? '#0284c7' : cell.isCurrentMonth ? '#1e293b' : '#cbd5e1';
            ctx.fillText(String(cell.dayNumber), cellX + 10, cellY + 20);

            const cellTasks = getTasksForDate(tasks, cell.dateString);
            let taskOffsetY = cellY + 28;

            cellTasks.slice(0, 2).forEach((task) => {
              const cat = categoryMap.get(task.categoryId) || categories[0];
              const isDeadlineDay = task.hasDeadline && (task.endDate === cell.dateString);

              ctx.fillStyle = isDeadlineDay ? '#fef3c7' : `${cat?.color || '#0284c7'}20`;
              ctx.strokeStyle = isDeadlineDay ? '#f59e0b' : `${cat?.color || '#0284c7'}70`;
              ctx.lineWidth = 1;

              ctx.beginPath();
              ctx.roundRect(cellX + 4, taskOffsetY, dayColWidth - 8, 18, 4);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = isDeadlineDay ? '#b45309' : (cat?.color || '#0369a1');
              ctx.font = isDeadlineDay ? 'bold 9px "Prompt", sans-serif' : 'normal 9px "Prompt", sans-serif';
              
              const titleText = isDeadlineDay ? `🏁 ${task.title}` : task.title;
              const truncated = titleText.length > 14 ? titleText.slice(0, 14) + '...' : titleText;
              ctx.fillText(truncated, cellX + 8, taskOffsetY + 12);

              taskOffsetY += 21;
            });

            if (cellTasks.length > 2) {
              ctx.fillStyle = '#64748b';
              ctx.font = 'normal 9px "Prompt", sans-serif';
              ctx.fillText(`+${cellTasks.length - 2} งาน`, cellX + 8, taskOffsetY + 10);
            }
          });

          currentY += cardHeight + spacing;
        });

        // Bottom Watermark & Footer
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, totalHeight - footerHeight, width, footerHeight);
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(0, totalHeight - footerHeight);
        ctx.lineTo(width, totalHeight - footerHeight);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = 'normal 13px "Prompt", sans-serif';
        ctx.fillText('แอปพลิเคชันบันทึกตารางการเรียนและติดตามงาน (Schedule & Task Planner)', 50, totalHeight - footerHeight + 42);

        ctx.font = 'bold 16px "Prompt", sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.fillText('By Genius ', width - 180, totalHeight - footerHeight + 42);
        ctx.fillStyle = '#eab308';
        ctx.fillText('Society', width - 100, totalHeight - footerHeight + 42);

        const dataUrl = canvas.toDataURL('image/png');
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate image:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 150);
  };

  useEffect(() => {
    if (isOpen) {
      generateImage();
    }
  }, [isOpen, selectedYear, selectedMonths]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `ตารางงาน_${selectedYear}_By_Genius_Society.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-sky-100 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sticky Header */}
        <div className="p-3.5 sm:p-5 border-b-2 border-sky-100 bg-gradient-to-r from-sky-50 via-white to-amber-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-200 flex-shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] sm:text-xs font-extrabold text-sky-600 font-prompt">Genius</span>
                <span className="text-[11px] sm:text-xs font-extrabold text-amber-500 font-prompt">Society</span>
              </div>
              <h2 id="download-modal-title" className="text-base sm:text-xl font-bold text-slate-900 font-prompt leading-tight">
                ดาวน์โหลดรูปภาพตารางงาน
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างดาวน์โหลดรูปภาพ"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body (Month selection + Live Preview) */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
          
          {/* Controls Container */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            
            {/* Year & Quick Selections */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  เลือกปี:
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 rounded-xl border-2 border-slate-200 text-xs font-bold bg-white text-slate-900 shadow-2xs"
                >
                  {[2024, 2025, 2026, 2027, 2028].map(y => (
                    <option key={y} value={y}>{y} (พ.ศ. {toBuddhistYear(y)})</option>
                  ))}
                </select>
              </div>

              {/* Quick selection chips */}
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                <span className="text-slate-400 font-medium text-[11px]">เลือกเร็ว:</span>
                <button
                  type="button"
                  onClick={() => handleSelectQuick('current')}
                  className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer shadow-2xs text-[11px]"
                >
                  เดือนนี้
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuick('next3')}
                  className="px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-700 font-bold cursor-pointer text-[11px]"
                >
                  3 เดือน
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectQuick('term')}
                  className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 font-bold cursor-pointer text-[11px]"
                >
                  5 เดือน (เทอม)
                </button>
              </div>
            </div>

            {/* Month Checkbox Chips */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">
                เลือกเดือนที่ต้องการออกตารางรูปภาพ ({selectedMonths.length} เดือนที่เลือก):
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {THAI_MONTH_NAMES.map((name, idx) => {
                  const isSelected = selectedMonths.includes(idx);
                  const shortName = THAI_MONTH_NAMES_SHORT[idx];
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleMonth(idx)}
                      className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500 text-white border-sky-500 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <span className="truncate">{shortName}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Live Image Preview Area */}
          <div className="bg-slate-100 p-3 sm:p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center min-h-[220px]">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 text-sky-600 py-8">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-xs font-semibold text-slate-600">กำลังประมวลผลรูปภาพตารางงาน...</span>
              </div>
            ) : previewUrl ? (
              <div className="w-full bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 space-y-1.5 text-center">
                <p className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>ตัวอย่างรูปภาพตารางงาน (คมชัดพร้อมพิมพ์/ส่งให้เพื่อน)</span>
                </p>
                <img 
                  src={previewUrl} 
                  alt="Preview schedule" 
                  className="w-full h-auto rounded-xl border border-slate-200 object-contain max-h-[40vh] mx-auto shadow-2xs"
                />
              </div>
            ) : null}
          </div>

        </div>

        {/* Sticky Footer Action Bar */}
        <div className="p-3.5 sm:p-5 border-t border-slate-200 bg-white flex items-center justify-between gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold">
            <span className="text-sky-600">Genius</span>
            <span className="text-amber-500">Society</span>
            <span className="text-slate-400 font-normal">• รูปภาพความละเอียดสูง 2X</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating || !previewUrl}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-amber-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>ดาวน์โหลดรูปภาพ (.PNG)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
