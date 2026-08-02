import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PartyLogo } from '../components/common/PartyLogo';
import { Lock, LogIn, AlertCircle, CheckCircle2, Shield, KeyRound, ArrowLeft, Copy, Check, Smartphone, Laptop } from 'lucide-react';

export const Login: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const { loginWithEmail, isDeviceRemembered, rememberDevice } = useAuth();

  const [inputEmail, setInputEmail] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [rememberThisDevice, setRememberThisDevice] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [copiedOtp, setCopiedOtp] = useState(false);

  const handleSendOtp = (emailToUse: string) => {
    const clean = emailToUse.trim().toLowerCase();
    if (!clean) {
      setEmailError('Vui lòng nhập địa chỉ email công tác.');
      return;
    }
    setEmailError('');

    // Check if device is already remembered for this email
    if (isDeviceRemembered(clean)) {
      loginWithEmail(clean);
      onLoginSuccess();
      return;
    }

    // Otherwise, generate 6-digit OTP code and proceed to OTP step
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpCode('');
    setOtpError('');
    setStep('OTP');
  };

  const handleEmailFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendOtp(inputEmail);
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() !== generatedOtp) {
      setOtpError('Mã xác thực OTP không chính xác. Vui lòng kiểm tra lại mã đã nhận.');
      return;
    }

    if (rememberThisDevice) {
      rememberDevice(inputEmail.trim().toLowerCase());
    }

    loginWithEmail(inputEmail.trim().toLowerCase());
    onLoginSuccess();
  };

  const handleCopyOtp = () => {
    setOtpCode(generatedOtp);
    navigator.clipboard.writeText(generatedOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-4 text-[#2D2D2D]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#E5E1DA] overflow-hidden">
        {/* Header */}
        <div className="bg-[#8B1D1D] text-white p-6 text-center border-b-4 border-[#FFD700]">
          <div className="flex justify-center mb-3">
            <PartyLogo size="xl" />
          </div>
          <p className="text-[10px] tracking-widest font-black text-[#FFD700] uppercase">
            ĐẢNG CỘNG SẢN VIỆT NAM
          </p>
          <h2 className="text-lg font-black uppercase mt-1">HỆ THỐNG QUẢN LÝ ĐẢNG VIÊN</h2>
          <p className="text-xs text-amber-100/90 mt-0.5">Chi bộ Khoa học cơ bản – ĐH Y Dược Cần Thơ</p>
        </div>

        <div className="p-6 space-y-5">
          {step === 'EMAIL' ? (
            <>
              <div className="bg-[#F9F8F6] border border-[#E5E1DA] rounded-xl p-3.5 text-xs text-[#2D2D2D] space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-[#8B1D1D]">
                  <Shield className="w-4 h-4 text-[#8B1D1D] shrink-0" />
                  <span>Xác thực Email & Bảo mật thiết bị</span>
                </div>
                <p className="text-[11px] text-[#555] leading-relaxed">
                  Nhập địa chỉ email công tác của Bạn để đăng nhập hệ thống:
                </p>
                <ul className="text-[11px] text-gray-700 space-y-1 pl-2">
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span><strong>Email Chi bộ & Sinh viên:</strong> Tự động kích hoạt quyền tương ứng.</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <Laptop className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span><strong>Thiết bị đã ghi nhớ:</strong> Đi thẳng vào hệ thống mà không cần OTP.</span>
                  </li>
                </ul>
              </div>

              {/* Email Input Form */}
              <form onSubmit={handleEmailFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Nhập email của bạn (@ctump.edu.vn / @student.ctump.edu.vn) <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Nhập email mà bạn đã được cung cấp..."
                    value={inputEmail}
                    onChange={(e) => {
                      setInputEmail(e.target.value);
                      setEmailError('');
                    }}
                    className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] focus:outline-hidden transition shadow-xs"
                  />
                  {emailError && (
                    <p className="text-xs text-red-600 font-semibold mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{emailError}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Chỉ cần nhập đúng email, hệ thống sẽ tự động gửi mã OTP xác thực tới thiết bị mới hoặc cho phép vào thẳng nếu máy tính/điện thoại này đã được lưu.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#8B1D1D] hover:bg-[#711717] text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 transition cursor-pointer active:scale-[0.99]"
                >
                  <LogIn className="w-4 h-4 text-[#FFD700]" />
                  <span>Đăng nhập hệ thống</span>
                </button>
              </form>
            </>
          ) : (
            /* OTP Verification Step */
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="text-xs font-bold text-[#8B1D1D] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại nhập email khác</span>
              </button>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-2">
                <div className="flex items-center justify-between font-bold text-[#8B1D1D]">
                  <span className="flex items-center space-x-1.5">
                    <KeyRound className="w-4 h-4 text-[#8B1D1D]" />
                    <span>Mã xác thực OTP gửi đến:</span>
                  </span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 text-gray-900">
                    {inputEmail}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Mã OTP mô phỏng hệ thống:</span>
                    <span className="font-mono text-sm font-black text-[#8B1D1D] tracking-wider">{generatedOtp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="w-full py-1 px-2 bg-amber-100 hover:bg-amber-200 text-[#8B1D1D] font-bold text-[10px] rounded flex items-center justify-center space-x-1 transition cursor-pointer"
                  >
                    {copiedOtp ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>Đã điền mã OTP!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Tự động nhấp để điền nhanh mã OTP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Nhập mã OTP 6 chữ số: <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="VD: 123456"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, ''));
                      setOtpError('');
                    }}
                    className="w-full px-3.5 py-3 bg-gray-50 border border-gray-300 rounded-xl text-center text-lg font-mono font-black text-gray-900 tracking-widest focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] focus:outline-hidden transition shadow-xs"
                  />
                  {otpError && (
                    <p className="text-xs text-red-600 font-semibold mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{otpError}</span>
                    </p>
                  )}
                </div>

                <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl flex items-start space-x-2.5">
                  <input
                    type="checkbox"
                    id="rememberDeviceCheck"
                    checked={rememberThisDevice}
                    onChange={(e) => setRememberThisDevice(e.target.checked)}
                    className="mt-0.5 rounded text-[#8B1D1D] focus:ring-[#8B1D1D] cursor-pointer"
                  />
                  <label htmlFor="rememberDeviceCheck" className="text-xs text-gray-700 leading-tight cursor-pointer">
                    <strong className="font-bold text-gray-900 block">Ghi nhớ thiết bị (Máy tính / Điện thoại này)</strong>
                    <span className="text-[11px] text-gray-500">
                      Từ lần sau, bạn sẽ đi thẳng vào hệ thống trên thiết bị này mà không cần gửi OTP lại.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#8B1D1D] hover:bg-[#711717] text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 transition cursor-pointer active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#FFD700]" />
                  <span>Xác nhận OTP & Đăng nhập</span>
                </button>
              </form>
            </div>
          )}

          <div className="text-center text-[11px] text-[#7A7670] flex items-center justify-center space-x-1 pt-1">
            <Lock className="w-3 h-3 text-[#7A7670]" />
            <span>Mã hóa SSL 256-bit & Giám sát nhật ký Audit Log</span>
          </div>
        </div>
      </div>
    </div>
  );
};
