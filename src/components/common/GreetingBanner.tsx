import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sun, Sunset, Moon, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

export const GreetingBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentUser, isGuest, requiresSecretaryApproval } = useAuth();

  if (!currentUser) return null;

  const currentHour = new Date().getHours();
  let timeOfDay = 'buổi sáng';
  let greetingTitle = 'Chào buổi sáng!';
  let IconComponent = Sun;
  let bgGradient = 'from-amber-500 via-amber-600 to-amber-700';

  if (currentHour >= 12 && currentHour < 18) {
    timeOfDay = 'buổi chiều';
    greetingTitle = 'Chào buổi chiều!';
    IconComponent = Sunset;
    bgGradient = 'from-orange-600 via-red-600 to-amber-700';
  } else if (currentHour >= 18 || currentHour < 5) {
    timeOfDay = 'buổi tối';
    greetingTitle = 'Chào buổi tối!';
    IconComponent = Moon;
    bgGradient = 'from-slate-800 via-indigo-900 to-red-950';
  }

  const memberName = currentUser.fullName || currentUser.email.split('@')[0].toUpperCase();

  return (
    <div className={`bg-gradient-to-r ${bgGradient} text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-amber-300/30 relative overflow-hidden ${className}`}>
      {/* Background Decorative Element */}
      <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
        <Sparkles className="w-44 h-44 text-white" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl text-amber-200 border border-white/20 shrink-0">
            <IconComponent className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-200/90">
                {greetingTitle}
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-medium text-white/90">
                {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight">
              Chúc Đ/c <span className="text-[#FFD700] uppercase underline decoration-amber-400/50 underline-offset-4">{memberName}</span> {timeOfDay} an lành.
            </h2>
            <p className="text-xs text-amber-100/90 mt-1 flex items-center space-x-1.5">
              <span>Được xác thực từ Email công tác:</span>
              <code className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-200">{currentUser.email}</code>
            </p>
          </div>
        </div>

        {/* Approval / Status Badge */}
        <div className="shrink-0 flex items-center">
          {requiresSecretaryApproval ? (
            <div className="bg-amber-100 text-amber-950 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span className="block text-[10px] text-amber-800 uppercase font-black">Trạng thái Cấp ủy</span>
                <span>Cần Bí thư phê duyệt</span>
              </div>
            </div>
          ) : isGuest ? (
            <div className="bg-stone-800/80 text-stone-200 border border-stone-600 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Quyền Khách (Chỉ xem)</span>
            </div>
          ) : (
            <div className="bg-emerald-950/70 border border-emerald-400/40 text-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-emerald-300 uppercase font-extrabold">Đã xác thực</span>
                <span>{currentUser.positionTitle || 'Đảng viên Chi bộ'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
