import React, { useState } from 'react';
import { maskSensitiveId } from '../../utils/crypto';
import { DataRepository } from '../../services/repository';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

interface MaskedTextProps {
  value?: string | null;
  label?: string;
  allowToggle?: boolean;
}

export const MaskedText: React.FC<MaskedTextProps> = ({ value, label = 'mã số', allowToggle = true }) => {
  const [revealed, setRevealed] = useState(false);
  const { currentUser } = useAuth();

  const handleToggle = () => {
    if (!revealed && currentUser) {
      DataRepository.addAuditLog(
        currentUser.email,
        'REVEAL_SENSITIVE_ID',
        'PARTY_MEMBER',
        'masked-field',
        `Người dùng xem đầy đủ ${label}`
      );
    }
    setRevealed(!revealed);
  };

  if (!value) return <span className="text-gray-400 font-mono text-xs">---</span>;

  return (
    <span className="inline-flex items-center space-x-1.5 font-mono text-xs font-medium">
      <span className={revealed ? 'text-red-900 bg-yellow-100 px-1 py-0.5 rounded font-bold' : 'text-gray-700'}>
        {revealed ? value : maskSensitiveId(value)}
      </span>
      {allowToggle && (
        <button
          onClick={handleToggle}
          type="button"
          className="text-gray-400 hover:text-red-700 p-0.5 rounded transition"
          title={revealed ? 'Ẩn thông tin nhạy cảm' : 'Hiện đầy đủ (sẽ ghi nhật ký)'}
        >
          {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      )}
    </span>
  );
};
