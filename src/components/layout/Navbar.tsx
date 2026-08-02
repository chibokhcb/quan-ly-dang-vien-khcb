import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PartyLogo } from '../common/PartyLogo';
import { Bell, LogOut, User, Shield, Eye, QrCode, Menu, X } from 'lucide-react';
import { GoogleAuthenticatorModal } from '../auth/GoogleAuthenticatorModal';

interface NavbarProps {
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isMobileMenuOpen, onToggleMobileMenu }) => {
  const { currentUser, isGuest, signOut } = useAuth();
  const [show2FaModal, setShow2FaModal] = useState(false);

  return (
    <header className="bg-gradient-to-r from-[#800000] via-[#8B1D1D] to-[#700000] text-white shadow-md border-b-2 border-[#FFD700] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2">
        {/* Left: Hamburger Button & Party Emblem & Brand Title */}
        <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0">
          {/* Mobile Menu Toggle Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="p-1.5 text-amber-200 hover:text-white rounded-lg hover:bg-black/20 transition md:hidden cursor-pointer shrink-0"
              aria-label="Toggle mobile menu"
              title="Danh mục menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-[#FFD700]" /> : <Menu className="w-5 h-5 text-[#FFD700]" />}
            </button>
          )}

          <PartyLogo size="md" variant="badge" className="shadow-lg rounded-[17%] shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />

          <div className="leading-tight min-w-0">
            <p className="text-[9px] sm:text-[11px] tracking-wider font-black text-[#FFD700] uppercase truncate">
              ĐẢNG CỘNG SẢN VIỆT NAM
            </p>
            <h1 className="text-xs sm:text-base md:text-lg font-black uppercase tracking-tight text-white drop-shadow-xs truncate">
              HỆ THỐNG QUẢN LÝ ĐẢNG VIÊN
            </h1>
            <div className="text-[10px] sm:text-xs font-bold text-amber-100/90 tracking-tight hidden sm:block truncate">
              CHI BỘ KHOA HỌC CƠ BẢN - ĐẢNG ỦY TRƯỜNG ĐẠI HỌC Y DƯỢC CẦN THƠ
            </div>
          </div>
        </div>

        {/* Right: Real Status Badge, Notifications & Profile */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Real Permission Badge */}
          {isGuest ? (
            <div className="bg-amber-400 text-amber-950 font-extrabold text-[10px] sm:text-[11px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-xs flex items-center space-x-1 border border-amber-300">
              <Eye className="w-3.5 h-3.5 text-amber-900 shrink-0" />
              <span className="truncate max-w-[80px] sm:max-w-none">Chỉ xem</span>
            </div>
          ) : (
            <div className="bg-[#FFD700] text-[#800000] font-black text-[10px] sm:text-[11px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-xs flex items-center space-x-1 border border-amber-300">
              <Shield className="w-3.5 h-3.5 text-[#800000] shrink-0" />
              <span className="uppercase truncate max-w-[90px] sm:max-w-[180px]">
                {currentUser?.positionTitle || currentUser?.role || 'ĐÃ XÁC THỰC'}
              </span>
            </div>
          )}

          {/* 2FA Google Authenticator quick button */}
          {!isGuest && currentUser && (
            <button
              onClick={() => setShow2FaModal(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-black/20 hover:bg-black/40 text-amber-200 border border-amber-400/30 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              title="Cài đặt Google Authenticator 2FA"
            >
              <QrCode className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#FFD700]" />
              <span className="hidden md:inline">Google Auth 2FA</span>
            </button>
          )}

          {/* Notifications button */}
          <button
            className="p-1.5 sm:p-2 text-amber-100 hover:text-white rounded-lg hover:bg-black/20 transition relative cursor-pointer"
            title="Thông báo hệ thống"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFD700] rounded-full animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFD700] rounded-full shadow-xs" />
          </button>

          {/* Vertical Divider */}
          <div className="h-6 w-[1px] bg-amber-400/30 hidden sm:block" />

          {/* User profile & Logout */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-950 border-2 border-[#FFD700] flex items-center justify-center text-xs font-black text-[#FFD700] shadow-xs shrink-0">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
              className="p-1.5 sm:p-2 text-amber-100/90 hover:text-[#FFD700] hover:bg-black/20 rounded-lg transition cursor-pointer"
              title="Thoát hệ thống"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FaModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 text-gray-900">
          <GoogleAuthenticatorModal
            userEmail={currentUser.email}
            isSetupMode={true}
            onVerifySuccess={() => {
              alert('Đã xác thực thành công Google Authenticator cho tài khoản ' + currentUser.email);
              setShow2FaModal(false);
            }}
            onClose={() => setShow2FaModal(false)}
          />
        </div>
      )}
    </header>
  );
};
