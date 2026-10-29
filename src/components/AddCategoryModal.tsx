import React, { useState } from 'react';
import { X, Plus, Palette, CheckCircle2, AlertCircle } from 'lucide-react';
import { CategoryItem } from '../types/task';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: CategoryItem) => void;
}

const PRESET_COLORS = [
  { color: '#10b981', label: 'เขียวสดใส' },
  { color: '#3b82f6', label: 'น้ำเงินฟ้า' },
  { color: '#8b5cf6', label: 'ม่วง' },
  { color: '#ec4899', label: 'ชมพู' },
  { color: '#f59e0b', label: 'อำพัน/เหลือง' },
  { color: '#f97316', label: 'ส้ม' },
  { color: '#ef4444', label: 'แดง' },
  { color: '#06b6d4', label: 'ฟ้าคราม' },
  { color: '#14b8a6', label: 'เขียวมิ้นต์' },
  { color: '#6366f1', label: 'คราม/อินดิโก' },
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณาระบุชื่อหมวดหมู่');
      return;
    }

    const id = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newCategory: CategoryItem = {
      id,
      name: name.trim(),
      color,
      bgLight: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      borderLight: 'border-slate-200',
      textColor: 'text-slate-900',
      dotColor: 'bg-indigo-500',
      isDefault: false
    };

    onAddCategory(newCategory);
    setName('');
    setColor('#6366f1');
    setError('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-cat-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 id="add-cat-title" className="text-base font-bold text-slate-900 font-prompt">
                เพิ่มหมวดหมู่งานใหม่
              </h3>
              <p className="text-xs text-slate-500">
                สร้างหมวดหมู่เฉพาะสำหรับงานหรือกิจกรรมในโรงเรียน
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ชื่อหมวดหมู่ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="เช่น งานแนะแนว, งานสหกรณ์โรงเรียน, ชมรมดนตรี..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              เลือกสีประจำหมวดหมู่
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {PRESET_COLORS.map((item) => (
                <button
                  key={item.color}
                  type="button"
                  onClick={() => setColor(item.color)}
                  className={`h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    color === item.color ? 'ring-2 ring-offset-2 ring-indigo-600 scale-105' : 'hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: item.color }}
                  title={item.label}
                >
                  {color === item.color && (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">ตัวอย่างป้าย: </span>
            <span 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold ml-1.5 shadow-2xs"
              style={{ 
                backgroundColor: `${color}15`, 
                color: color, 
                borderColor: `${color}40`,
                borderWidth: '1px'
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span>{name || 'ชื่อหมวดหมู่'}</span>
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มหมวดหมู่</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
