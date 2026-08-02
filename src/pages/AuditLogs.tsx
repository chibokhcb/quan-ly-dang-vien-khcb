import React, { useState } from 'react';
import { DataRepository } from '../services/repository';
import { History, Shield, Lock } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs] = useState(() => DataRepository.getAuditLogs());

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
          <History className="w-5 h-5 text-red-800" />
          <span>Nhật ký Truy vết Hệ thống & Bảo mật Dữ liệu</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Nhật ký bất biến ghi nhận mọi thao tác xem/mở che số CCCD, thay đổi dữ liệu và xuất file
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase">
              <th className="p-3">Thời gian</th>
              <th className="p-3">Tài khoản thực hiện</th>
              <th className="p-3">Hành động</th>
              <th className="p-3">Đối tượng</th>
              <th className="p-3">Chi tiết nội dung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono text-gray-500">{new Date(log.performedAt).toLocaleString('vi-VN')}</td>
                <td className="p-3 font-semibold text-gray-900">{log.performedByEmail}</td>
                <td className="p-3">
                  <span className="bg-red-100 text-red-900 font-bold px-2 py-0.5 rounded text-[10px]">
                    {log.action}
                  </span>
                </td>
                <td className="p-3 font-mono text-gray-600">{log.targetCollection} / {log.targetId}</td>
                <td className="p-3 text-gray-800">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
