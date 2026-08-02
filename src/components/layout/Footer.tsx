import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1E1E1B] border-t border-[#333] text-[#7A7670] text-xs py-3 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
        <div className="flex items-center space-x-2 text-[#FFD700] font-medium text-[11px]">
          <AlertTriangle className="w-4 h-4 text-[#FFD700] shrink-0" />
          <span>
            CẢNH BÁO: Danh mục hồ sơ và căn cứ áp dụng phải được Chi ủy xác nhận trước khi sử dụng chính thức.
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-[#A09C94]">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bảo mật dữ liệu nội bộ vi-VN</span>
          </span>
          <span>•</span>
          <span>Bảo lưu mọi quyền © 2026 Chi bộ Khoa học Cơ bản</span>
        </div>
      </div>
    </footer>
  );
};
