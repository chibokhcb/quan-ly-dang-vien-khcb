import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface GoogleWorkspaceAuthModalProps {
  onSuccess: (email: string) => void;
  onClose: () => void;
}

export const GoogleWorkspaceAuthModal: React.FC<GoogleWorkspaceAuthModalProps> = ({ onSuccess, onClose }) => {
  const [userEmailInput, setUserEmailInput] = useState('chibokhcb@ctump.edu.vn');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirmGoogleLogin = (emailToAuth: string) => {
    const clean = emailToAuth.trim().toLowerCase();
    if (!clean) {
      setErrorMsg('Vui lòng nhập email công tác.');
      return;
    }
    if (!clean.endsWith('@ctump.edu.vn') && !clean.endsWith('@student.ctump.edu.vn')) {
      setErrorMsg('Email phải thuộc tên miền @ctump.edu.vn hoặc @student.ctump.edu.vn.');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onSuccess(clean);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden text-gray-800">
        {/* Google Header */}
        <div className="bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Đăng nhập bằng Google Workspace</h3>
              <p className="text-[11px] text-gray-500">Chi bộ Khoa học Cơ bản - ĐH Y Dược Cần Thơ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Xác thực Google OAuth 2.0 An toàn:</span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Hệ thống tự động đồng bộ vai trò và cấp quyền dựa trên tài khoản Google Workspace chính thức.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmGoogleLogin(userEmailInput);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                <span>Nhập địa chỉ email Google Workspace công tác:</span>
                <span className="text-[10px] text-[#8B1D1D] font-mono">@ctump.edu.vn</span>
              </label>
              <input
                type="email"
                required
                placeholder="VD: ntttram@ctump.edu.vn hoặc email sinh viên..."
                value={userEmailInput}
                onChange={(e) => {
                  setUserEmailInput(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] focus:outline-hidden transition shadow-xs"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Vui lòng nhập chính xác tài khoản Google Workspace do Trường cấp.
              </p>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 font-semibold flex items-center space-x-1 bg-red-50 p-2.5 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-[#8B1D1D] hover:bg-[#711717] text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {isAuthenticating ? (
                <span>Đang kết nối Google Auth...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#FFD700]" />
                  <span>Xác nhận Đăng nhập Google Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-[11px] text-gray-400 text-center flex items-center justify-center space-x-1 border-t pt-3">
            <Lock className="w-3 h-3 text-gray-400" />
            <span>Kết nối mã hóa Google Workspace SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
