import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataRepository } from '../services/repository';
import { MaskedText } from '../components/common/MaskedText';
import { StatusBadge } from '../components/common/StatusBadge';
import { User, Edit3, Send, CheckCircle } from 'lucide-react';

export const MyProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const members = DataRepository.getPartyMembers();
  // Find party member matching current user email or memberId
  const member = members.find((m) => m.workEmail === currentUser?.email || m.id === currentUser?.memberId) || members[2];

  const [isEditing, setIsEditing] = useState(false);
  const [requestedPhone, setRequestedPhone] = useState(member.phone || '');
  const [requestedAcademicTitle, setRequestedAcademicTitle] = useState(member.academicTitle || '');
  const [reason, setReason] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmitChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    DataRepository.saveMemberChangeRequest(
      {
        id: `cr-${Date.now()}`,
        memberId: member.id,
        memberFullName: member.fullName,
        requestedByUid: currentUser?.uid || 'user-uid',
        requestedByEmail: currentUser?.email || 'user@ctump.edu.vn',
        requestedAt: new Date().toISOString(),
        beforeData: { phone: member.phone, academicTitle: member.academicTitle },
        requestedData: { phone: requestedPhone, academicTitle: requestedAcademicTitle },
        changedFields: ['phone', 'academicTitle'],
        reason: reason || 'Đảng viên tự cập nhật thông tin cá nhân',
        status: 'PENDING',
      },
      currentUser?.email || 'user@ctump.edu.vn'
    );

    setIsEditing(false);
    setSubmittedMessage(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
            <User className="w-5 h-5 text-red-800" />
            <span>Hồ sơ cá nhân của tôi</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Mọi yêu cầu điều chỉnh thông tin chính thức sẽ qua quy trình &quot;Chờ duyệt → Phê duyệt/Từ chối&quot;
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'Hủy chỉnh sửa' : 'Đề nghị cập nhật hồ sơ'}</span>
        </button>
      </div>

      {submittedMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Yêu cầu điều chỉnh hồ sơ đã được gửi thành công đến Chi ủy! Đơn đề nghị đang ở trạng thái <strong>Chờ duyệt</strong>.
          </span>
        </div>
      )}

      {/* Main Details */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center space-x-4 border-b pb-4">
          <div className="w-16 h-16 rounded-full bg-red-800 text-yellow-300 flex items-center justify-center font-bold text-xl border-2 border-yellow-400">
            {member.fullName.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-red-950 uppercase">{member.fullName}</h3>
            <p className="text-xs text-gray-600">
              MSCB: <span className="font-mono font-bold">{member.staffCode}</span> • Đơn vị: {member.department || 'Chi bộ KHCB'}
            </p>
            <div className="mt-1">
              <StatusBadge status={member.activityStatus} type="activity" />
            </div>
          </div>
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <p className="text-gray-500 font-semibold">Số CCCD (12 số)</p>
              <div className="mt-1">
                <MaskedText value={member.personalId} label="Số CCCD" />
              </div>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Số thẻ Đảng (12 số)</p>
              <div className="mt-1">
                <MaskedText value={member.partyCardNumber} label="Số thẻ Đảng" />
              </div>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Email công tác</p>
              <p className="font-semibold text-gray-900 mt-1">{member.workEmail || currentUser?.email}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Số điện thoại</p>
              <p className="font-semibold text-gray-900 mt-1">{member.phone || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Chức danh / Học vị</p>
              <p className="font-semibold text-gray-900 mt-1">{member.academicTitle || 'Giảng viên'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-semibold">Ngày vào Đảng</p>
              <p className="font-bold text-red-900 mt-1">{member.partyAdmissionDate}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitChangeRequest} className="space-y-4 bg-red-50/50 p-4 rounded-xl border border-red-200">
            <h4 className="font-bold text-red-900 text-xs uppercase">Đề nghị cập nhật thông tin cá nhân</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại mới</label>
                <input
                  type="text"
                  value={requestedPhone}
                  onChange={(e) => setRequestedPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Chức danh / Học vị mới</label>
                <input
                  type="text"
                  value={requestedAcademicTitle}
                  onChange={(e) => setRequestedAcademicTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Lý do đề nghị cập nhật *</label>
              <textarea
                required
                rows={3}
                placeholder="Nêu rõ lý do thay đổi và căn cứ kèm theo..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg text-xs flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi đề nghị phê duyệt</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
