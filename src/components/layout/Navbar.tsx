import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PartyLogo } from '../common/PartyLogo';
import { Bell, LogOut, User, Shield, Eye } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, isGuest, signOut } = useAuth();

  return (
    <header className="bg-gradient-to-r from-[#800000] via-[#8B1D1D] to-[#700000] text-white shadow-md border-b-2 border-[#FFD700] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Party Emblem & Brand Title */}
        <div className="flex items-center space-x-3.5">
          <PartyLogo size="lg" variant="badge" className="shadow-lg rounded-[17%]" />

          <div className="leading-tight">
            <p className="text-[11px] tracking-widest font-black text-[#FFD700] uppercase flex items-center space-x-1">
              <span>ĐẢNG CỘNG SẢN VIỆT NAM</span>
            </p>
            <h1 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wide text-white drop-shadow-xs">
              HỆ THỐNG THEO DÕI & QUẢN LÝ ĐẢNG VIÊN
            </h1>
            <div className="text-xs font-bold text-amber-100/90 tracking-tight flex flex-wrap items-center gap-x-1.5">
              <span>CHI BỘ KHOA HỌC CƠ BẢN - ĐẢNG ỦY TRƯỜNG ĐẠI HỌC Y DƯỢC CẦN THƠ</span>
            </div>
          </div>
        </div>

        {/* Right: Real Status Badge, Notifications & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Real Permission Badge */}
          {isGuest ? (
            <div className="bg-amber-400 text-amber-950 font-extrabold text-[11px] px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 border border-amber-300">
              <Eye className="w-3.5 h-3.5 text-amber-900 shrink-0" />
              <span>Quyền Khách: Chỉ xem</span>
            </div>
          ) : (
            <div className="bg-[#FFD700] text-[#800000] font-black text-[11px] px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 border border-amber-300">
              <Shield className="w-3.5 h-3.5 text-[#800000] shrink-0" />
              <span className="uppercase">{currentUser?.positionTitle || currentUser?.role || 'ĐÃ XÁC THỰC'}</span>
            </div>
          )}

          {/* Notifications button */}
          <button
            className="p-2 text-amber-100 hover:text-white rounded-lg hover:bg-black/20 transition relative"
            title="Thông báo hệ thống"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FFD700] rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FFD700] rounded-full shadow" />
          </button>

          {/* Vertical Divider */}
          <div className="h-7 w-[1px] bg-amber-400/30 hidden sm:block" />

          {/* User profile & Logout */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-red-950 border-2 border-[#FFD700] flex items-center justify-center text-xs font-black text-[#FFD700] shadow-sm shrink-0">
              <User className="w-4 h-4" />
            </div>

            <div className="hidden lg:block text-left text-xs">
              <p className="font-extrabold text-white uppercase leading-tight tracking-tight truncate max-w-[180px]">
                {currentUser?.fullName || 'NGƯỜI DÙNG'}
              </p>
              <p className="text-[10px] text-amber-200/90 font-medium truncate max-w-[180px]">
                {currentUser?.email}
              </p>
            </div>

            <button
              onClick={signOut}
              className="p-2 text-amber-100/90 hover:text-[#FFD700] hover:bg-black/20 rounded-lg transition cursor-pointer"
              title="Thoát hệ thống"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
