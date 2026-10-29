import React from 'react';
import { 
  CalendarCheck2, 
  Sparkles,
  ChevronDown,
  LogIn,
  FileSpreadsheet
} from 'lucide-react';
import { MemberAccount } from '../types/auth';

interface HeaderProps {
  currentMember: MemberAccount | null;
  onOpenLoginModal: () => void;
  onOpenGoogleSheetsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMember,
  onOpenLoginModal,
  onOpenGoogleSheetsModal
}) => {
  return (
    <header className="bg-white border-b-2 border-sky-100 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Branding: Genius (Blue), Society (Yellow) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-100 flex-shrink-0">
              <CalendarCheck2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-prompt">
                  ตารางบันทึกแผนงาน & กำหนดส่ง
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-sky-600">Genius</span>
                  <span className="text-amber-500">Society</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                ระบบจัดการตารางการเรียน การบ้าน และกำหนดส่ง (เชื่อมต่อ Firebase & Google Sheets)
              </p>
            </div>
          </div>

          {/* Action Buttons: Google Sheets Sync + Account Status Pill */}
          <div className="flex items-center gap-2">
            
            {/* Google Sheets Sync Button */}
            <button
              type="button"
              onClick={onOpenGoogleSheetsModal}
              title="ส่งออกหรือนำเข้าตารางงานกับ Google Sheets"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Google Sheets</span>
            </button>

            {/* Account Status Pill / Login Button */}
            {currentMember ? (
              <button
                type="button"
                onClick={onOpenLoginModal}
                aria-label={`เข้าสู่ระบบในฐานะ ${currentMember.name} คลิกเพื่อสลับบัญชี`}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border-2 border-sky-200 bg-sky-50/70 hover:bg-sky-100/70 hover:border-sky-300 transition-all cursor-pointer shadow-2xs group"
                title="คลิกเพื่อสลับบัญชีผู้บันทึก"
              >
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0"
                  style={{ backgroundColor: currentMember.avatarColor }}
                >
                  {currentMember.name.slice(0, 1)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] text-sky-800 font-medium leading-tight">
                    บันทึกในฐานะ:
                  </p>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-sky-600 leading-tight font-prompt">
                    {currentMember.name}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-sky-500 group-hover:text-sky-700" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal}
                aria-label="เข้าสู่ระบบ บันทึกในฐานะ"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 shadow-sm shadow-amber-200 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-slate-900" />
                <span>เข้าสู่ระบบ (บันทึกในฐานะ...)</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
