import React from 'react';
import { 
  Sparkles,
  ChevronDown,
  LogIn,
  FileSpreadsheet,
  Smartphone,
  Bell
} from 'lucide-react';
import { MemberAccount } from '../types/auth';

interface HeaderProps {
  currentMember: MemberAccount | null;
  urgentTaskCount: number;
  onOpenLoginModal: () => void;
  onOpenGoogleSheetsModal: () => void;
  onOpenPWAModal: () => void;
  onOpenNotificationModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMember,
  urgentTaskCount,
  onOpenLoginModal,
  onOpenGoogleSheetsModal,
  onOpenPWAModal,
  onOpenNotificationModal
}) => {
  return (
    <header className="bg-white border-b-2 border-sky-100 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo with attached User Artwork & Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white border-2 border-sky-200 overflow-hidden shadow-md shadow-sky-100 flex-shrink-0 flex items-center justify-center p-0.5 hover:scale-105 transition-transform">
              <img 
                src="/favicon.png" 
                alt="Cal Genius Society" 
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 font-prompt truncate">
                  ตารางบันทึกแผนงาน
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-sky-600">Genius</span>
                  <span className="text-amber-500">Society</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                ระบบจัดการตารางการเรียน การบ้าน และกำหนดส่ง (PWA & Web Push Notification)
              </p>
            </div>
          </div>

          {/* Action Buttons: PWA Install + Notifications + Google Sheets + Account */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            {/* PWA Install Button on Nav Bar (User explicit request) */}
            <button
              type="button"
              onClick={onOpenPWAModal}
              title="ติดตั้งแอปบนหน้าจอมือถือ (Progressive Web App)"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">ติดตั้งแอป (PWA)</span>
              <span className="sm:hidden">PWA</span>
            </button>

            {/* Notification Bell with Due Tasks Badge */}
            <button
              type="button"
              onClick={onOpenNotificationModal}
              title="การแจ้งเตือนงานที่ต้องส่งวันนี้และอีก 3 วันข้างหน้า"
              className="relative inline-flex items-center justify-center p-2 sm:px-2.5 sm:py-2 rounded-2xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {urgentTaskCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs animate-bounce">
                  {urgentTaskCount}
                </span>
              )}
            </button>

            {/* Google Sheets Sync Button */}
            <button
              type="button"
              onClick={onOpenGoogleSheetsModal}
              title="ส่งออกหรือนำเข้าตารางงานกับ Google Sheets"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Google Sheets</span>
            </button>

            {/* Account Status Pill / Login Button */}
            {currentMember ? (
              <button
                type="button"
                onClick={onOpenLoginModal}
                aria-label={`เข้าสู่ระบบในฐานะ ${currentMember.name} คลิกเพื่อสลับบัญชี`}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border-2 border-sky-200 bg-sky-50/70 hover:bg-sky-100/70 hover:border-sky-300 transition-all cursor-pointer shadow-2xs group"
                title="คลิกเพื่อสลับบัญชีผู้บันทึก"
              >
                <div 
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0"
                  style={{ backgroundColor: currentMember.avatarColor }}
                >
                  {currentMember.name.slice(0, 1)}
                </div>
                <div className="text-left hidden lg:block">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 shadow-sm shadow-amber-200 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-900" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
