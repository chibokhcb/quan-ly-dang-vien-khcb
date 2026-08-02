import React from 'react';
import { Settings, AlertTriangle, ShieldCheck, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const isMockMode = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
          <Settings className="w-5 h-5 text-red-800" />
          <span>Cài đặt Hệ thống & Kết nối Firebase</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Cấu hình môi trường lưu trữ, tham số bảo mật và quyền truy cập
        </p>
      </div>

      {/* Warning banner */}
      <div className="bg-red-50 border-2 border-red-300 text-red-950 p-5 rounded-xl text-xs space-y-2 shadow-xs">
        <div className="flex items-center space-x-2 text-red-900 font-extrabold text-sm uppercase">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
          <span>QUY ĐỊNH BẮT BUỘC KHI VẬN HÀNH CHÍNH THỨC</span>
        </div>
        <p className="leading-relaxed font-semibold">
          &quot;Danh mục hồ sơ và căn cứ áp dụng phải được Chi ủy xác nhận trước khi sử dụng chính thức.&quot;
        </p>
      </div>

      {/* Database connection status */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-2">
          <Database className="w-4 h-4 text-blue-800" />
          <span>Trạng thái Lưu trữ Dữ liệu</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
            <p className="font-bold text-gray-700">Chế độ hiện tại:</p>
            <p className="text-sm font-extrabold text-red-900">
              {isMockMode ? 'Giả lập Dữ liệu Mẫu (Mock / LocalStorage)' : 'Kết nối Trực tiếp Firebase Firestore'}
            </p>
            <p className="text-[11px] text-gray-500">
              {isMockMode
                ? 'Đang bật VITE_USE_MOCK_DATA = true để phục vụ xem trước và kiểm thử.'
                : 'Đã sẵn sàng kết nối Firebase Firestore & Authentication.'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
            <p className="font-bold text-gray-700">Quy tắc Bảo mật Dữ liệu cá nhân (PII):</p>
            <p className="text-emerald-800 font-bold flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Đã kích hoạt che dấu CCCD & Thẻ Đảng</span>
            </p>
            <p className="text-[11px] text-gray-500">
              Chỉ các tài khoản được ủy quyền mới có thể bấm nút mở xem và hành động được ghi vào Audit Logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
