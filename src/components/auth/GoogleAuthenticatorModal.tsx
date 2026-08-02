import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, QrCode, Copy, Check, Smartphone, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TotpService, TotpSetupData } from '../../services/totpService';

interface GoogleAuthenticatorModalProps {
  userEmail: string;
  existingSecretKey?: string;
  onVerifySuccess: (secretKey: string) => void;
  onClose?: () => void;
  isSetupMode?: boolean;
}

export const GoogleAuthenticatorModal: React.FC<GoogleAuthenticatorModalProps> = ({
  userEmail,
  existingSecretKey,
  onVerifySuccess,
  onClose,
  isSetupMode = false,
}) => {
  const [setupData, setSetupData] = useState<TotpSetupData | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [remainingTime, setRemainingTime] = useState(TotpService.getRemainingSeconds());
  const [liveTokenPreview, setLiveTokenPreview] = useState('');

  useEffect(() => {
    let isMounted = true;
    TotpService.createTotpSetup(userEmail, existingSecretKey).then((data) => {
      if (isMounted) {
        setSetupData(data);
        setLiveTokenPreview(TotpService.getCurrentLiveToken(data.secretKey, userEmail));
      }
    });

    const timer = setInterval(() => {
      if (isMounted) {
        const secs = TotpService.getRemainingSeconds();
        setRemainingTime(secs);
        if (setupData?.secretKey) {
          setLiveTokenPreview(TotpService.getCurrentLiveToken(setupData.secretKey, userEmail));
        }
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [userEmail, existingSecretKey]);

  const handleCopyKey = () => {
    if (!setupData) return;
    navigator.clipboard.writeText(setupData.secretKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleFillLiveToken = () => {
    if (!setupData) return;
    const current = TotpService.getCurrentLiveToken(setupData.secretKey, userEmail);
    setTokenInput(current);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData) return;

    const isValid = TotpService.verifyToken(setupData.secretKey, userEmail, tokenInput);
    if (!isValid) {
      setErrorMsg('Mã xác thực Google Authenticator không chính xác hoặc đã hết hạn. Vui lòng kiểm tra mã 6 số nhảy trên ứng dụng điện thoại.');
      return;
    }

    setErrorMsg('');
    onVerifySuccess(setupData.secretKey);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden text-gray-800 max-w-md w-full mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B1D1D] to-[#6e1616] p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white/10 rounded-xl">
            <Shield className="w-5 h-5 text-[#FFD700]" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Xác Thực Google Authenticator (2FA)</h3>
            <p className="text-[11px] text-amber-200/90 font-mono">{userEmail}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition cursor-pointer"
          >
            Đóng
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Setup instruction box if setup mode or new key */}
        {(isSetupMode || !existingSecretKey) && setupData && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-start space-x-2 text-xs font-bold text-[#8B1D1D]">
              <QrCode className="w-4 h-4 text-[#8B1D1D] shrink-0 mt-0.5" />
              <div>
                <span>Hướng dẫn liên kết Google Authenticator:</span>
                <p className="text-[11px] font-normal text-gray-600 mt-0.5">
                  1. Mở ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Microsoft Authenticator</strong> trên điện thoại.
                  <br />
                  2. Chọn quét mã QR hoặc nhập Khóa bí mật bên dưới.
                </p>
              </div>
            </div>

            {/* QR Code and Secret Key */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-amber-200">
              {setupData.qrCodeDataUrl ? (
                <img
                  src={setupData.qrCodeDataUrl}
                  alt="Google Authenticator QR Code"
                  className="w-32 h-32 border rounded-lg shadow-xs"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded-lg">
                  Đang tạo mã QR...
                </div>
              )}

              <div className="flex-1 space-y-2 text-left w-full">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Khóa bí mật (Secret Key):</span>
                  <div className="flex items-center justify-between bg-gray-50 border px-2 py-1 rounded text-xs font-mono font-black text-[#8B1D1D]">
                    <span className="truncate pr-1">{setupData.secretKey}</span>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="text-gray-500 hover:text-[#8B1D1D] p-1 rounded cursor-pointer shrink-0"
                      title="Sao chép khóa"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-lg text-[11px] text-stone-700 space-y-1">
                  <p className="font-semibold text-[#8B1D1D] flex items-center space-x-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Sau khi quét mã QR hoặc nhập khóa:</span>
                  </p>
                  <p className="text-[11px] text-stone-600">
                    Mã 6 chữ số sẽ tự động xuất hiện trên ứng dụng điện thoại của bạn và thay đổi mỗi 30 giây.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form to enter 6-digit TOTP */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <KeyRound className="w-3.5 h-3.5 text-[#8B1D1D]" />
                <span>Nhập mã 6 số từ Google Authenticator:</span>
              </span>
              <span className="text-[10px] text-gray-500 font-normal">Đổi mã mỗi 30s ({remainingTime}s)</span>
            </label>

            <input
              type="text"
              required
              maxLength={6}
              placeholder="000 000"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value.replace(/\D/g, ''));
                setErrorMsg('');
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-center text-xl font-mono font-black text-gray-900 tracking-[0.25em] focus:bg-white focus:ring-2 focus:ring-[#8B1D1D] focus:outline-hidden transition shadow-xs"
            />

            {errorMsg && (
              <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-start space-x-1 bg-red-50 p-2 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#8B1D1D] hover:bg-[#711717] text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 transition cursor-pointer active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4 h-4 text-[#FFD700]" />
            <span>Xác nhận Google Authenticator</span>
          </button>
        </form>

        <div className="text-[11px] text-gray-500 text-center flex items-center justify-center space-x-1 border-t pt-3">
          <Smartphone className="w-3.5 h-3.5 text-gray-400" />
          <span>Tương thích 100% với Google Authenticator, Authy, Microsoft Authenticator</span>
        </div>
      </div>
    </div>
  );
};
