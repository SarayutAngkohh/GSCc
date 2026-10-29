import React, { useState, useMemo } from 'react';
import { 
  X, 
  Lock, 
  UserCheck, 
  Sparkles, 
  AlertCircle, 
  KeyRound, 
  ArrowLeft, 
  MessageCircle
} from 'lucide-react';
import { GENIUS_MEMBERS, MemberAccount } from '../types/auth';
import { verifyMemberPasscode } from '../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (member: MemberAccount) => void;
  currentMember: MemberAccount | null;
  membersList?: MemberAccount[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentMember,
  membersList
}) => {
  // Ensure "อื่นๆ" (isOther) is strictly placed at the very end of the login members grid
  const displayMembers = useMemo(() => {
    const base = membersList && membersList.length > 0 ? membersList : GENIUS_MEMBERS;
    const regular = base.filter((m) => !m.isOther);
    const other = base.filter((m) => m.isOther);
    return [...regular, ...other];
  }, [membersList]);

  const [selectedMember, setSelectedMember] = useState<MemberAccount | null>(null);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showOtherNotice, setShowOtherNotice] = useState(false);

  if (!isOpen) return null;

  const handleSelectMember = (member: MemberAccount) => {
    setError('');
    setPasscode('');
    if (member.isOther) {
      setShowOtherNotice(true);
      setSelectedMember(null);
    } else {
      setSelectedMember(member);
      setShowOtherNotice(false);
    }
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    if (!passcode.trim()) {
      setError('กรุณาใส่รหัสบุคคล');
      return;
    }

    const isValid = verifyMemberPasscode(selectedMember.name, passcode, displayMembers);
    if (isValid) {
      onLoginSuccess(selectedMember);
      onClose();
    } else {
      setError('รหัสบุคคลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border-2 border-sky-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Sky Blue & Yellow Theme */}
        <div className="p-6 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-sky-50 via-sky-100/50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-200 flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-sky-600 font-prompt">Genius</span>
                <span className="text-sm font-extrabold text-amber-500 font-prompt">Society</span>
              </div>
              <h3 id="login-modal-title" className="text-base font-bold text-slate-900 font-prompt">
                เข้าสู่ระบบ (บันทึกในฐานะ)
              </h3>
              <p className="text-[11px] text-slate-500">
                กรุณาเลือกชื่อผู้ใช้งานก่อนเริ่มใช้งานระบบ
              </p>
            </div>
          </div>

          {/* Close button ONLY if already logged in */}
          {currentMember && (
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่างเข้าสู่ระบบ"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* NOTICE FOR "อื่นๆ" */}
          {showOtherNotice ? (
            <div className="space-y-4 text-center py-2 animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-500 flex items-center justify-center shadow-xs">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 font-prompt">
                  ติดต่อผู้พัฒนาเพื่อเป็นส่วนหนึ่งของพวกเรา
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed px-4">
                  ยินดีต้อนรับ! หากต้องการเพิ่มชื่อของคุณลงในระบบและร่วมเป็นส่วนหนึ่งของกลุ่ม Genius Society สามารถติดต่อผู้พัฒนาได้โดยตรง
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-slate-600 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>
                  <strong className="text-sky-600">Genius</strong> <strong className="text-amber-500">Society</strong> Workspace
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowOtherNotice(false)}
                className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-200 transition-all cursor-pointer"
              >
                กลับไปเลือกชื่อสมาชิก
              </button>
            </div>
          ) : !selectedMember ? (
            /* STEP 1: SELECT PERSON */
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
                <span>เลือกชื่อของคุณเพื่อเข้าใช้งาน:</span>
                {currentMember && (
                  <span className="text-sky-600 font-bold">ปัจจุบัน: {currentMember.name}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {displayMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleSelectMember(member)}
                    className="p-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50/50 text-left transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer shadow-2xs group flex items-center gap-3"
                  >
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs flex-shrink-0"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-sky-600 truncate font-prompt">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {member.isOther ? 'ผู้เยี่ยมชม' : 'สมาชิก'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* STEP 2: ENTER PASSCODE */
            <form onSubmit={handleVerifyPasscode} className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-sky-50 border border-sky-200">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-xs"
                  style={{ backgroundColor: selectedMember.avatarColor }}
                >
                  {selectedMember.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-sky-700 font-medium">บันทึกในฐานะ:</p>
                  <p className="text-base font-bold text-slate-900 truncate font-prompt">
                    {selectedMember.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(null);
                    setError('');
                  }}
                  className="text-xs text-sky-600 hover:text-sky-800 cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>เปลี่ยน</span>
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-sky-600" />
                  <span>รหัสบุคคล</span>
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder=""
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-slate-900 text-base font-medium shadow-2xs"
                />
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(null);
                    setError('');
                  }}
                  className="px-4 py-3 rounded-2xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>ยืนยันเข้าสู่ระบบ</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
