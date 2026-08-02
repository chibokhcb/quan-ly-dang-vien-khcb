import React, { useState } from 'react';
import { DataRepository } from '../services/repository';
import { MemberChangeRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Check, X, Clock, AlertCircle } from 'lucide-react';

export const Approvals: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<MemberChangeRequest[]>(() => DataRepository.getMemberChangeRequests());

  const refreshData = () => {
    setRequests(DataRepository.getMemberChangeRequests());
  };

  const handleApprove = (req: MemberChangeRequest) => {
    req.status = 'APPROVED';
    req.reviewedByEmail = currentUser?.email || 'admin@ctump.edu.vn';
    req.reviewedAt = new Date().toISOString();

    // Apply changes to party member
    const members = DataRepository.getPartyMembers();
    const target = members.find((m) => m.id === req.memberId);
    if (target && req.requestedData) {
      Object.assign(target, req.requestedData);
      DataRepository.savePartyMember(target, currentUser?.email || 'admin');
    }

    DataRepository.saveMemberChangeRequest(req, currentUser?.email || 'admin');
    refreshData();
  };

  const handleReject = (req: MemberChangeRequest) => {
    req.status = 'REJECTED';
    req.reviewedByEmail = currentUser?.email || 'admin@ctump.edu.vn';
    req.reviewedAt = new Date().toISOString();
    req.reviewNotes = 'Chi ủy chưa duyệt do thiếu căn cứ xác minh.';

    DataRepository.saveMemberChangeRequest(req, currentUser?.email || 'admin');
    refreshData();
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const processedRequests = requests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-red-800" />
          <span>Hộp thư Phê duyệt Thay đổi Hồ sơ Đảng viên</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Quy trình thẩm định và phê duyệt các đề nghị cập nhật thông tin cá nhân từ Đảng viên
        </p>
      </div>

      {/* Pending Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Yêu cầu đang chờ phê duyệt ({pendingRequests.length})</span>
        </h3>

        {pendingRequests.map((req) => (
          <div key={req.id} className="bg-white p-5 rounded-xl border border-amber-300 shadow-xs space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-red-950 uppercase">{req.memberFullName}</h4>
                <p className="text-xs text-gray-500">
                  Gửi bởi: {req.requestedByEmail} • Thời gian: {new Date(req.requestedAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded">
                Chờ duyệt
              </span>
            </div>

            <p className="text-xs text-gray-700">
              Lý do đề nghị: <strong className="text-gray-900">&quot;{req.reason}&quot;</strong>
            </p>

            {/* Diff View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="font-bold text-red-900 mb-1">Dữ liệu trước thay đổi:</p>
                <pre className="text-[11px] font-mono whitespace-pre-wrap text-gray-700">
                  {JSON.stringify(req.beforeData, null, 2)}
                </pre>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <p className="font-bold text-emerald-900 mb-1">Dữ liệu đề nghị cập nhật mới:</p>
                <pre className="text-[11px] font-mono whitespace-pre-wrap text-gray-800 font-bold">
                  {JSON.stringify(req.requestedData, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => handleReject(req)}
                className="bg-red-100 hover:bg-red-200 text-red-900 font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Từ chối</span>
              </button>
              <button
                onClick={() => handleApprove(req)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Phê duyệt & Đồng bộ Hồ sơ</span>
              </button>
            </div>
          </div>
        ))}

        {pendingRequests.length === 0 && (
          <div className="bg-white p-8 rounded-xl border text-center text-gray-500 text-xs">
            Không có yêu cầu điều chỉnh nào đang chờ phê duyệt.
          </div>
        )}
      </div>
    </div>
  );
};
