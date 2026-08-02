import React, { useState } from 'react';
import { DataRepository } from '../services/repository';
import { PolicyRequirement } from '../types';
import { BookOpen, CheckCircle } from 'lucide-react';

export const PolicyVersions: React.FC = () => {
  const [policies] = useState<PolicyRequirement[]>(() => DataRepository.getPolicyRequirements());

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-red-800" />
          <span>Quản lý Phiên bản Quy định & Căn cứ Pháp lý</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Quản lý các văn bản hướng dẫn công tác Đảng (06-HD/TW, 01-HD/TW) và lưu snapshot vào hồ sơ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="bg-red-100 text-red-900 font-extrabold text-xs px-2.5 py-1 rounded">
                  {p.code}
                </span>
                <h3 className="font-extrabold text-sm text-gray-900 mt-2">{p.title}</h3>
                <p className="text-xs text-gray-500">Ban hành: {p.issuedDate} bởi {p.issuedBy}</p>
              </div>
              {p.isCurrentActive && (
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Đang áp dụng</span>
                </span>
              )}
            </div>

            <p className="text-xs text-gray-700">{p.summary}</p>

            <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-lg border">
              <p className="font-bold text-gray-900">Danh mục văn bản yêu cầu:</p>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <p>• Nhóm A (Lý lịch): {p.admissionGroupA.length} mục</p>
                <p>• Nhóm B (Nghị quyết): {p.admissionGroupB.length} mục</p>
                <p>• Nhóm C (Bằng cấp): {p.admissionGroupC.length} mục</p>
                <p>• Hồ sơ Chính thức: {p.officializationItems.length} mục</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
