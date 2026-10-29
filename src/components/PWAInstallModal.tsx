import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  CheckCircle2, 
  Laptop,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [platformTab, setPlatformTab] = useState<'auto' | 'ios' | 'android' | 'desktop'>(
    isIOS ? 'ios' : 'auto'
  );
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
      }
    } else {
      // Switch to specific guide
      if (isIOS) setPlatformTab('ios');
      else setPlatformTab('android');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-modal-title"
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border-2 border-sky-100 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-amber-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-md shadow-sky-200 flex-shrink-0 flex items-center justify-center text-white border border-sky-400">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-sky-600 font-prompt">Genius</span>
                <span className="text-xs font-extrabold text-amber-500 font-prompt">Society</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full font-bold">PWA</span>
              </div>
              <h2 id="pwa-modal-title" className="text-base sm:text-lg font-bold text-slate-900 font-prompt">
                ติดตั้งแอปบนหน้าจอมือถือ (PWA)
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างติดตั้งแอป"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-700">
          
          {/* Already installed banner */}
          {isInstalled || installSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 font-prompt">
                ติดตั้งแอปพลิเคชันเรียบร้อยแล้ว!
              </h3>
              <p className="text-xs text-slate-600">
                คุณสามารถเปิดใช้งาน Genius Society ได้โดยตรงจากหน้าจอโฮมของมือถือ โดยไม่ต้องเข้าเบราว์เซอร์
              </p>
            </div>
          ) : (
            <>
              {/* Direct Install Button if supported */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 space-y-3 text-center">
                  <div className="inline-flex p-2.5 rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-200">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-prompt">
                      พร้อมติดตั้งลงเครื่องทันทีใน 1 คลิก
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      เบราว์เซอร์ของคุณรองรับการติดตั้ง Progressive Web App
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-amber-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>กดเพื่อติดตั้งแอปลงหน้าจอมือถือ</span>
                  </button>
                </div>
              )}

              {/* Platform Switch Tabs for Step-by-Step Instructions */}
              <div>
                <p className="text-xs font-bold text-slate-800 mb-2">
                  วิธีติดตั้งสำหรับแต่ละระบบปฏิบัติการ:
                </p>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPlatformTab('ios')}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      platformTab === 'ios'
                        ? 'bg-white text-sky-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    iPhone / iPad (iOS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformTab('android')}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      platformTab === 'android' || platformTab === 'auto'
                        ? 'bg-white text-sky-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Android
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformTab('desktop')}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      platformTab === 'desktop'
                        ? 'bg-white text-sky-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    คอมพิวเตอร์
                  </button>
                </div>
              </div>

              {/* Instruction Steps */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs leading-relaxed">
                {(platformTab === 'ios' || (platformTab === 'auto' && isIOS)) && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-sky-700 font-bold">
                      <Smartphone className="w-4 h-4" />
                      <span>ขั้นตอนติดตั้งบน Safari (iPhone / iPad):</span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                        <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                        <div>
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                            แตะปุ่ม <strong>"แชร์" (Share)</strong>
                            <Share className="w-3.5 h-3.5 text-sky-600" />
                          </p>
                          <p className="text-slate-500 text-[11px]">ที่แถบเมนูด้านล่างสุดของเบราว์เซอร์ Safari</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                        <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                        <div>
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                            เลื่อนลงแล้วเลือก <strong>"เพิ่มไปยังหน้าจอโฮม"</strong>
                            <PlusSquare className="w-3.5 h-3.5 text-sky-600" />
                          </p>
                          <p className="text-slate-500 text-[11px]">(Add to Home Screen)</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                        <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
                        <div>
                          <p className="font-semibold text-slate-800">แตะ <strong>"เพิ่ม" (Add)</strong> ที่มุมขวาบน</p>
                          <p className="text-slate-500 text-[11px]">จะได้ไอคอนแอป Genius Society อยู่บนหน้าจอโฮมเหมือนแอปจริง</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(platformTab === 'android' || (platformTab === 'auto' && !isIOS)) && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-sky-700 font-bold">
                      <Smartphone className="w-4 h-4" />
                      <span>ขั้นตอนติดตั้งบน Chrome (Android):</span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                        <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                        <div>
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                            แตะปุ่ม <strong>เมนูสามจุด (⋮)</strong>
                            <MoreVertical className="w-3.5 h-3.5 text-slate-600" />
                          </p>
                          <p className="text-slate-500 text-[11px]">ที่มุมขวาบนของเบราว์เซอร์ Chrome</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                        <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                        <div>
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                            เลือก <strong>"ติดตั้งแอปพลิเคชัน"</strong> หรือ <strong>"เพิ่มลงในหน้าจอหลัก"</strong>
                          </p>
                          <p className="text-slate-500 text-[11px]">(Install app / Add to Home screen)</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                        <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">3</span>
                        <div>
                          <p className="font-semibold text-slate-800">กดยืนยัน <strong>"ติดตั้ง"</strong></p>
                          <p className="text-slate-500 text-[11px]">แอปจะดาวน์โหลดและติดตั้งลงในสมาร์ตโฟนของคุณทันที</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {platformTab === 'desktop' && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-sky-700 font-bold">
                      <Laptop className="w-4 h-4" />
                      <span>ขั้นตอนติดตั้งบนคอมพิวเตอร์ (Chrome / Edge):</span>
                    </div>
                    <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
                      <p className="font-semibold text-slate-800">
                        คลิกที่ไอคอน <strong>"ติดตั้งแอป" (Install)</strong> บนแถบ Address bar ขวาบน หรือคลิกเมนู ⋮ &gt; "ติดตั้ง Genius Society"
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        แอปจะเปิดเป็นหน้าต่างแยกอิสระจากเบราว์เซอร์ ทำงานได้รวดเร็วเหมือนโปรแกรมในเครื่อง
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* PWA Perks */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>ข้อดีของการติดตั้ง Progressive Web App (PWA):</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                  <li>เปิดใช้งานแบบเต็มหน้าจอ (Standalone) ไม่มีแถบ URL มาเกะกะ</li>
                  <li>โหลดเร็ว ประหยัดอินเทอร์เน็ต และรองรับการแจ้งเตือนงานส่ง</li>
                  <li>เข้าถึงได้ทันทีจากหน้าจอโฮมบนมือถือ</li>
                </ul>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
