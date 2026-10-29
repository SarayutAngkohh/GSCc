import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  LogIn,
  Sparkles
} from 'lucide-react';
import { Task, CategoryItem } from '../types/task';
import { MemberAccount } from '../types/auth';
import { 
  googleSignIn, 
  getAccessToken, 
  auth 
} from '../utils/firebase';
import { 
  createAndExportToGoogleSheet, 
  importTasksFromGoogleSheet 
} from '../utils/googleSheets';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  categories: CategoryItem[];
  currentMember: MemberAccount | null;
  onImportTasks: (importedTasks: Task[]) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  tasks,
  categories,
  currentMember,
  onImportTasks,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [importUrlOrId, setImportUrlOrId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setErrorMsg(null);
    setIsProcessing(true);
    setExportedUrl(null);

    try {
      let token = getAccessToken();
      if (!token || !auth.currentUser) {
        const result = await googleSignIn();
        token = result?.accessToken || null;
      }

      if (!token) {
        throw new Error('กรุณาลงชื่อเข้าใช้ Google เพื่อเข้าถึง Google Sheets');
      }

      const result = await createAndExportToGoogleSheet(tasks, categories, token);
      setExportedUrl(result.spreadsheetUrl);
      showToast('ส่งออกตารางงานไปยัง Google Sheets สำเร็จ!', 'success');
    } catch (err: any) {
      console.error('Export error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการส่งออกไปยัง Google Sheets');
      showToast('ส่งออกล้มเหลว กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrlOrId.trim()) {
      setErrorMsg('กรุณากรอก URL หรือ ID ของ Google Sheet');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      let token = getAccessToken();
      if (!token || !auth.currentUser) {
        const result = await googleSignIn();
        token = result?.accessToken || null;
      }

      if (!token) {
        throw new Error('กรุณาลงชื่อเข้าใช้ Google เพื่อเข้าถึง Google Sheets');
      }

      const imported = await importTasksFromGoogleSheet(importUrlOrId, categories, token);
      if (imported.length === 0) {
        throw new Error('ไม่พบข้อมูลงานใน Google Sheet ดังกล่าว');
      }

      onImportTasks(imported);
      showToast(`นำเข้างานจำนวน ${imported.length} รายการจาก Google Sheets สำเร็จ!`, 'success');
      onClose();
    } catch (err: any) {
      console.error('Import error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลจาก Google Sheets');
      showToast('นำเข้าล้มเหลว กรุณาตรวจสอบลิงก์และสิทธิ์เข้าถึง', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheets-sync-modal-title"
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-emerald-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 font-prompt">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Google Sheets Integration</span>
              </div>
              <h3 id="sheets-sync-modal-title" className="text-base font-bold text-slate-900 font-prompt">
                เชื่อมต่อตารางงานกับ Google Sheets
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('export');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>ส่งออกไปยัง Google Sheets</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('import');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>นำเข้าจาก Google Sheets</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">เกิดข้อผิดพลาด</p>
                <p className="mt-0.5 text-[11px] text-rose-600 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>สร้าง Google Spreadsheet ใหม่พร้อมส่งออกตารางงาน ({tasks.length} รายการ)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ระบบจะสร้างไฟล์ Google Sheets ในบัญชี Google ของคุณ โดยรวบรวมข้อมูลชื่อการบ้าน, หมวดหมู่, กำหนดส่ง, สถานะ และเช็คลิสต์ย่อยไว้ในสเปรดชีตอย่างเป็นระเบียบ
                </p>
              </div>

              {exportedUrl ? (
                <div className="p-4 rounded-2xl bg-emerald-100/80 border-2 border-emerald-400 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-prompt">
                      ส่งออกสเปรดชีตสำเร็จแล้ว!
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      สามารถกดปุ่มด้านล่างเพื่อเปิดดู Google Sheets ได้ทันที
                    </p>
                  </div>

                  <a
                    href={exportedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>เปิดสเปรดชีตใน Google Sheets</span>
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>กำลังส่งออกไปยัง Google Sheets...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>กดเพื่อส่งออกตารางงาน ({tasks.length} รายการ) ไปยัง Google Sheets</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            /* Import Tab */
            <form onSubmit={handleImport} className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sky-800">
                  <Upload className="w-4 h-4 text-sky-600" />
                  <span>นำเข้างานจากการบ้านหรือไฟล์ Google Sheets</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  วางลิงก์ Google Sheet หรือ Spreadsheet ID ที่คุณมี เพื่อนำเข้ารายการงานเข้าสู่ปฏิทินของ Genius Society โดยอัตโนมัติ
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  URL หรือ ID ของ Google Sheet:
                </label>
                <input
                  type="text"
                  required
                  value={importUrlOrId}
                  onChange={(e) => setImportUrlOrId(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1ABC.../edit"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-slate-900 shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-sky-200 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>กำลังนำเข้าข้อมูลจาก Google Sheets...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>นำเข้างานเข้าสู่ปฏิทิน</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
