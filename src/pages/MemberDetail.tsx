import React, { useState, useEffect } from 'react';
import { DataRepository } from '../services/repository';
import { MaskedText } from '../components/common/MaskedText';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { ActivityStatus } from '../types';
import {
  User,
  Shield,
  MapPin,
  Briefcase,
  Globe,
  TrendingUp,
  FileCheck,
  Award,
  FileText,
  History,
  ArrowLeft,
  CheckCircle2,
  Type,
  Trash2,
  AlertTriangle,
  Info,
  UserMinus,
} from 'lucide-react';

export const MemberDetail: React.FC<{ memberId: string; onBack: () => void; onNavigate?: (path: string) => void }> = ({ memberId, onBack, onNavigate }) => {
  const { currentUser, canApprove, canDelete, canEditMember, isFullSecretary } = useAuth();
  const [member, setMember] = useState(() => DataRepository.getPartyMemberById(memberId));
  const [activeTab, setActiveTab] = useState<number>(1);

  const canEdit = member ? canEditMember(member.userUid, member.workEmail, member.staffCode) : false;
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [formData, setFormData] = useState<typeof member>(member);
  const [newAttName, setNewAttName] = useState('');
  const [newAttUrl, setNewAttUrl] = useState('');

  useEffect(() => {
    setFormData(member);
  }, [member]);

  const handleOpenProfileEdit = () => {
    setFormData(member);
    setIsProfileEditOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    if (canApprove()) {
      DataRepository.savePartyMember(formData, currentUser?.email || 'admin');
      refreshMember();
      setIsProfileEditOpen(false);
    } else {
      const changeReq = {
        id: `cr-${Date.now()}`,
        memberId: formData.id,
        memberFullName: formData.fullName,
        requestedByUid: currentUser?.uid || '',
        requestedByEmail: currentUser?.email || '',
        requestedAt: new Date().toISOString(),
        beforeData: member || {},
        requestedData: formData,
        changedFields: ['Hồ sơ Đảng viên (cập nhật từ trang chi tiết)'],
        reason: 'Đảng viên đề nghị cập nhật hồ sơ cá nhân từ trang Hồ sơ chi tiết',
        status: 'PENDING' as const,
      };
      DataRepository.saveMemberChangeRequest(changeReq as any, currentUser?.email || 'user');
      alert('Đã gửi yêu cầu cập nhật hồ sơ! Thay đổi sẽ có hiệu lực sau khi 1 trong 4 tài khoản Ban Chi ủy (chibokhcb, ntttram, nthung, letran) phê duyệt.');
      setIsProfileEditOpen(false);
    }
  };

  const handleAddAttachment = () => {
    if (!newAttName.trim() || !formData) return;
    setFormData({
      ...formData,
      attachments: [...(formData.attachments || []), { name: newAttName.trim(), url: newAttUrl.trim() || '#', size: 0 }],
    });
    setNewAttName('');
    setNewAttUrl('');
  };

  const handleRemoveAttachment = (idx: number) => {
    if (!formData) return;
    const list = [...(formData.attachments || [])];
    list.splice(idx, 1);
    setFormData({ ...formData, attachments: list });
  };

  // Rename Modal State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState(member?.fullName || '');
  const [newOtherName, setNewOtherName] = useState(member?.otherName || '');
  const [renameReason, setRenameReason] = useState('Đính chính tên gọi theo Giấy khai sinh / CCCD chính thức');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReasonCategory, setDeleteReasonCategory] = useState<
    'CHUYEN_SINH_HOAT' | 'ROI_KHOI_DANG' | 'XOA_TEN_KY_LUAT' | 'TU_TRAN' | 'KHAC'
  >('CHUYEN_SINH_HOAT');
  const [deleteNote, setDeleteNote] = useState('');
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);

  const refreshMember = () => {
    const updated = DataRepository.getPartyMemberById(memberId);
    setMember(updated);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !newFullName.trim()) return;

    DataRepository.adjustPartyMemberName(
      member.id,
      newFullName.trim(),
      newOtherName.trim(),
      renameReason.trim(),
      currentUser?.email || 'admin'
    );
    refreshMember();
    setIsRenameModalOpen(false);
  };

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !canDelete()) return;

    let categoryText = 'Chuyển sinh hoạt Đảng sang đơn vị/Chi bộ khác';
    let newStatus: ActivityStatus | undefined = 'Gián đoạn sinh hoạt';

    if (deleteReasonCategory === 'ROI_KHOI_DANG') {
      categoryText = 'Xin rời khỏi Đảng / Cho ra khỏi Đảng';
      newStatus = 'Rời khỏi Đảng';
    } else if (deleteReasonCategory === 'XOA_TEN_KY_LUAT') {
      categoryText = 'Xóa tên do vi phạm kỷ luật hoặc không tham gia sinh hoạt';
      newStatus = 'Đình chỉ sinh hoạt';
    } else if (deleteReasonCategory === 'TU_TRAN') {
      categoryText = 'Từ trần';
      newStatus = 'Từ trần';
    } else if (deleteReasonCategory === 'KHAC') {
      categoryText = 'Lý do khác';
      newStatus = undefined;
    }

    const fullReason = `${categoryText}${deleteNote ? `. Chi tiết/Số QĐ: ${deleteNote}` : ''}`;

    DataRepository.deletePartyMember(
      member.id,
      isPermanentDelete,
      fullReason,
      currentUser?.email || 'admin',
      newStatus
    );

    setIsDeleteModalOpen(false);
    onBack();
  };

  if (!member) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-3">
        <p className="text-gray-500 font-semibold">Không tìm thấy dữ liệu đảng viên yêu cầu.</p>
        <button onClick={onBack} className="text-xs text-red-700 font-bold hover:underline">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 1, title: '1. Thông tin chung', icon: User },
    { id: 2, title: '2. Thông tin Đảng', icon: Shield },
    { id: 3, title: '3. Khai sinh - Quê quán - Thường trú', icon: MapPin },
    { id: 4, title: '4. Quá trình học tập/công tác', icon: Briefcase },
    { id: 5, title: '5. Lịch sử chính trị & Nhân thân', icon: Shield },
    { id: 6, title: '6. Đi nước ngoài', icon: Globe },
    { id: 7, title: '7. Phát triển Đảng/Hướng dẫn', icon: TrendingUp },
    { id: 8, title: '8. Hồ sơ kết nạp', icon: FileCheck },
    { id: 9, title: '9. Công nhận chính thức', icon: Award },
    { id: 10, title: '10. Tệp đính kèm', icon: FileText },
    { id: 11, title: '11. Lịch sử thay đổi', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-red-950 uppercase">{member.fullName}</h2>
              <StatusBadge status={member.activityStatus} type="activity" />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              MSCB: <span className="font-mono font-bold text-gray-800">{member.staffCode}</span> • Tổ chức: {member.partyOrganization}
            </p>
          </div>
        </div>

        {canApprove() && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setNewFullName(member.fullName);
                setNewOtherName(member.otherName || '');
                setIsRenameModalOpen(true);
              }}
              className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
            >
              <Type className="w-4 h-4 text-[#FFD700]" />
              <span>Điều tên Đảng viên</span>
            </button>

            {canDelete() && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa / Điều chuyển</span>
              </button>
            )}

            <button className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Thẩm định hồ sơ</span>
            </button>
          </div>
        )}

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenProfileEdit}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
            >
              <Type className="w-4 h-4" />
              <span>{isFullSecretary ? 'Chỉnh sửa hồ sơ' : 'Đề nghị cập nhật hồ sơ của tôi'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 11 Tabs Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-x-auto">
        <div className="flex border-b border-gray-200 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition ${
                  isActive
                    ? 'border-red-800 text-red-900 bg-red-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-800' : 'text-gray-400'}`} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 text-xs text-gray-800 leading-relaxed">
          {activeTab === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Họ và tên chính thức</p>
                <p className="font-extrabold text-sm text-red-950 uppercase mt-0.5">{member.fullName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Tên gọi khác</p>
                <p className="font-semibold text-gray-900 mt-0.5">{member.otherName || '---'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Giới tính</p>
                <p className="font-semibold text-gray-900 mt-0.5">{member.gender}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Ngày sinh (dd/MM/yyyy)</p>
                <p className="font-semibold text-gray-900 mt-0.5">{member.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Dân tộc</p>
                <p className="font-semibold text-gray-900 mt-0.5">{member.ethnicityName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Tôn giáo</p>
                <p className="font-semibold text-gray-900 mt-0.5">{member.religionName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Số định danh cá nhân (CCCD 12 số)</p>
                <div className="mt-0.5">
                  <MaskedText value={member.personalId} label="Số CCCD" />
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Số CMND cũ</p>
                <p className="font-mono font-semibold text-gray-900 mt-0.5">{member.oldIdentityNumber || '---'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Chức danh / Trình độ chuyên môn</p>
                <p className="font-semibold text-gray-900 mt-0.5">{member.academicTitle || '---'}</p>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Số thẻ Đảng (12 số)</p>
                <div className="mt-0.5">
                  <MaskedText value={member.partyCardNumber} label="Số thẻ Đảng" />
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Nơi cấp thẻ Đảng</p>
                <p className="font-semibold text-gray-900 mt-0.5">{member.partyCardIssuer || '---'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Ngày cấp thẻ Đảng</p>
                <p className="font-semibold text-gray-900 mt-0.5">{member.partyCardIssueDate || '---'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Số thẻ Đảng theo QĐ 85</p>
                <p className="font-mono font-semibold text-gray-900 mt-0.5">{member.partyCardDecision85Number || '---'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Ngày vào Đảng</p>
                <p className="font-semibold text-red-900 mt-0.5">{member.partyAdmissionDate}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Ngày vào Đảng chính thức</p>
                <p className="font-semibold text-red-900 mt-0.5">{member.officialPartyDate || 'Đảng viên dự bị'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Tổ chức Đảng sinh hoạt</p>
                <p className="font-bold text-gray-900 mt-0.5">{member.partyOrganization}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] font-semibold">Trạng thái sinh hoạt hiện tại</p>
                <div className="mt-1">
                  <StatusBadge status={member.activityStatus} type="activity" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-red-900 mb-2">1. Nơi đăng ký khai sinh</h4>
                <p>Quốc gia: <strong>{member.birthRegistration.country}</strong></p>
                <p>Tỉnh/Thành: <strong>{member.birthRegistration.province}</strong></p>
                <p>Chi tiết: <strong>{member.birthRegistration.detail || '---'}</strong></p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-red-900 mb-2">2. Quê quán</h4>
                <p>Quốc gia: <strong>{member.hometown.country}</strong></p>
                <p>Tỉnh/Thành: <strong>{member.hometown.province}</strong></p>
                <p>Chi tiết: <strong>{member.hometown.detail || '---'}</strong></p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-red-900 mb-2">3. Nơi đăng ký thường trú</h4>
                <p>Quốc gia: <strong>{member.permanentResidence.country}</strong></p>
                <p>Tỉnh/Thành: <strong>{member.permanentResidence.province}</strong></p>
                <p>Chi tiết: <strong>{member.permanentResidence.detail || '---'}</strong></p>
              </div>
            </div>
          )}

          {activeTab === 4 && (
            <div className="space-y-3">
              <p className="text-gray-500 text-[11px] font-semibold">Quá trình học tập / công tác (tóm tắt)</p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-wrap font-semibold text-gray-900 min-h-[80px]">
                {member.educationWorkHistory || 'Chưa có dữ liệu. Nhấn "Chỉnh sửa hồ sơ" để bổ sung.'}
              </div>
            </div>
          )}

          {activeTab === 5 && (
            <div className="space-y-3">
              <p className="text-gray-500 text-[11px] font-semibold">Lịch sử chính trị bản thân & Nhân thân (Cha, Mẹ, Vợ/Chồng, Con...)</p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-wrap font-semibold text-gray-900 min-h-[80px]">
                {member.politicalHistoryFamily || 'Chưa có dữ liệu. Nhấn "Chỉnh sửa hồ sơ" để bổ sung.'}
              </div>
            </div>
          )}

          {activeTab === 6 && (() => {
            const trips = DataRepository.getForeignTrips().filter((t) => t.memberId === member.id);
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-[11px] font-semibold">Danh sách các đợt đi nước ngoài đã khai báo</p>
                  {onNavigate && (
                    <button onClick={() => onNavigate('/foreign-trips')} className="text-[11px] font-bold text-blue-700 hover:underline">Quản lý tại trang Đi nước ngoài →</button>
                  )}
                </div>
                {trips.length === 0 ? (
                  <p className="text-gray-500 italic">Chưa có dữ liệu đi nước ngoài.</p>
                ) : (
                  <div className="space-y-2">
                    {trips.map((t) => (
                      <div key={t.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{t.destinationCountry} {t.city ? `- ${t.city}` : ''}</p>
                          <p className="text-[11px] text-gray-500">{t.startDate} → {t.endDate}</p>
                        </div>
                        <StatusBadge status={t.approvalStatus} type="approval" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 7 && (
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <p className="font-semibold text-gray-700">Hồ sơ Phát triển Đảng viên / Người hướng dẫn được quản lý tại trang "Phát triển Đảng".</p>
              {onNavigate && (
                <button onClick={() => onNavigate('/development')} className="text-[11px] font-bold text-blue-700 hover:underline">Đi tới trang Phát triển Đảng →</button>
              )}
            </div>
          )}

          {activeTab === 8 && (
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <p className="font-semibold text-gray-700">Hồ sơ kết nạp Đảng được quản lý tại trang "Hồ sơ kết nạp".</p>
              {onNavigate && (
                <button onClick={() => onNavigate('/admission-dossiers')} className="text-[11px] font-bold text-blue-700 hover:underline">Đi tới trang Hồ sơ kết nạp →</button>
              )}
            </div>
          )}

          {activeTab === 9 && (() => {
            const offs = DataRepository.getOfficializationDossiers().filter((o) => o.memberId === member.id);
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-[11px] font-semibold">Hồ sơ công nhận Đảng viên chính thức</p>
                  {onNavigate && (
                    <button onClick={() => onNavigate('/officialization-dossiers')} className="text-[11px] font-bold text-blue-700 hover:underline">Quản lý tại trang Công nhận chính thức →</button>
                  )}
                </div>
                {offs.length === 0 ? (
                  <p className="text-gray-500 italic">Chưa có dữ liệu.</p>
                ) : (
                  <div className="space-y-2">
                    {offs.map((o) => (
                      <div key={o.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="font-bold text-gray-900">Ngày kết nạp dự bị: {o.provisionalAdmissionDate}</p>
                        <p className="text-[11px] text-gray-500">Dự kiến chính thức: {o.expectedOfficialDate} • Hạn hồ sơ: {o.dossierDueDate}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 10 && (
            <div className="space-y-3">
              <p className="text-gray-500 text-[11px] font-semibold">Tệp đính kèm hồ sơ</p>
              {(member.attachments || []).length === 0 ? (
                <p className="text-gray-500 italic">Chưa có tệp đính kèm nào.</p>
              ) : (
                <div className="space-y-2">
                  {(member.attachments || []).map((f, i) => (
                    <a key={i} href={f.url} target="_blank" rel="noreferrer" className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-blue-700 underline">{f.name}</span>
                    </a>
                  ))}
                </div>
              )}
              {canEdit && (
                <p className="text-[11px] text-gray-500 italic">Nhấn "Chỉnh sửa hồ sơ" để thêm/xóa tệp đính kèm.</p>
              )}
            </div>
          )}

          {activeTab === 11 && (() => {
            const logs = DataRepository.getAuditLogs()
              .filter((l) => l.targetId === member.id || l.resourceId === member.id)
              .sort((a, b) => new Date(b.performedAt || b.timestamp || 0).getTime() - new Date(a.performedAt || a.timestamp || 0).getTime());
            return (
              <div className="space-y-2">
                <p className="text-gray-500 text-[11px] font-semibold">Lịch sử thay đổi hồ sơ (Audit Log)</p>
                {logs.length === 0 ? (
                  <p className="text-gray-500 italic">Chưa có lịch sử thay đổi.</p>
                ) : (
                  logs.map((l) => (
                    <div key={l.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="font-bold text-gray-900">{l.action}</p>
                      <p className="text-[11px] text-gray-600">{l.details}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{l.performedByEmail || l.actorEmail} • {l.performedAt || l.timestamp}</p>
                    </div>
                  ))
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Modal: Điều tên Đảng viên */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="Điều tên / Điều chỉnh tên Đảng viên"
      >
        <form onSubmit={handleSaveRename} className="space-y-4 text-xs">
          <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E5E1DA] space-y-1">
            <p className="text-[#7A7670] font-semibold">Tên hiện tại trong hồ sơ:</p>
            <p className="font-extrabold text-sm text-[#8B1D1D] uppercase">{member.fullName}</p>
            <p className="text-[11px] text-[#7A7670]">
              MSCB: <span className="font-mono font-bold text-gray-800">{member.staffCode}</span> • Số thẻ Đảng:{' '}
              <span className="font-mono font-bold text-gray-800">{member.partyCardNumber}</span>
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Họ và tên chính thức mới * (Tự viết HOA)</label>
              <input
                type="text"
                required
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value.toUpperCase())}
                placeholder="VD: HOÀNG VĂN NGUYÊN"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-xs uppercase font-extrabold text-[#8B1D1D] focus:ring-2 focus:ring-[#8B1D1D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Tên gọi khác / Bí danh (nếu có)</label>
              <input
                type="text"
                value={newOtherName}
                onChange={(e) => setNewOtherName(e.target.value)}
                placeholder="VD: Anh Ba, Minh Trí..."
                className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#8B1D1D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Lý do điều chỉnh tên *</label>
              <textarea
                required
                rows={2}
                value={renameReason}
                onChange={(e) => setRenameReason(e.target.value)}
                placeholder="Nhập căn cứ/lý do điều chỉnh tên (Ví dụ: Theo Giấy khai sinh/CCCD mới cấp lại)..."
                className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#8B1D1D] focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Thao tác điều tên sẽ tự động lưu vết đổi tên vào <strong>Nhật ký hệ thống (Audit Log)</strong> và cập nhật từ
              khóa tìm kiếm không dấu tương ứng.
            </span>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsRenameModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#8B1D1D] hover:bg-[#711717] text-white font-bold rounded-lg shadow flex items-center space-x-1.5"
            >
              <Type className="w-4 h-4 text-[#FFD700]" />
              <span>Cập nhật Điều tên</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Xóa / Chuyển sinh hoạt Đảng viên */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xóa / Điều chuyển Đảng viên khỏi Chi bộ"
      >
        <form onSubmit={handleConfirmDelete} className="space-y-4 text-xs">
          <div className="bg-red-50 p-3 rounded-lg border border-red-200 space-y-1">
            <div className="flex items-center space-x-2 text-red-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-700" />
              <span>Xác nhận thông tin Đảng viên cần xóa / điều chuyển:</span>
            </div>
            <p className="font-extrabold text-sm text-[#8B1D1D] uppercase pl-6">{member.fullName}</p>
            <p className="text-[11px] text-gray-700 pl-6">
              MSCB: <span className="font-mono font-bold">{member.staffCode}</span> • Thẻ Đảng:{' '}
              <span className="font-mono font-bold">{member.partyCardNumber}</span>
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1.5">Hình thức / Lý do điều chuyển *</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 border p-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="deleteCategory"
                    checked={deleteReasonCategory === 'CHUYEN_SINH_HOAT'}
                    onChange={() => setDeleteReasonCategory('CHUYEN_SINH_HOAT')}
                    className="text-[#8B1D1D]"
                  />
                  <span>Chuyển sinh hoạt Đảng đến Chi bộ / Đảng bộ khác</span>
                </label>

                <label className="flex items-center space-x-2 border p-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="deleteCategory"
                    checked={deleteReasonCategory === 'ROI_KHOI_DANG'}
                    onChange={() => setDeleteReasonCategory('ROI_KHOI_DANG')}
                    className="text-[#8B1D1D]"
                  />
                  <span>Xin rời khỏi Đảng / Cho ra khỏi Đảng</span>
                </label>

                <label className="flex items-center space-x-2 border p-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="deleteCategory"
                    checked={deleteReasonCategory === 'XOA_TEN_KY_LUAT'}
                    onChange={() => setDeleteReasonCategory('XOA_TEN_KY_LUAT')}
                    className="text-[#8B1D1D]"
                  />
                  <span>Xóa tên do vi phạm kỷ luật / Bỏ sinh hoạt Đảng</span>
                </label>

                <label className="flex items-center space-x-2 border p-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="deleteCategory"
                    checked={deleteReasonCategory === 'TU_TRAN'}
                    onChange={() => setDeleteReasonCategory('TU_TRAN')}
                    className="text-[#8B1D1D]"
                  />
                  <span>Từ trần</span>
                </label>

                <label className="flex items-center space-x-2 border p-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="deleteCategory"
                    checked={deleteReasonCategory === 'KHAC'}
                    onChange={() => setDeleteReasonCategory('KHAC')}
                    className="text-[#8B1D1D]"
                  />
                  <span>Khác (Lỗi nhập trùng / Lý do nghiệp vụ khác)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Số Quyết định / Ghi chú chi tiết</label>
              <textarea
                rows={2}
                value={deleteNote}
                onChange={(e) => setDeleteNote(e.target.value)}
                placeholder="Nhập số Quyết định chuyển đi / Ngày quyết định / Ghi chú bổ sung..."
                className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#8B1D1D] focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t">
              <label className="flex items-center space-x-2 cursor-pointer text-red-800 font-bold">
                <input
                  type="checkbox"
                  checked={isPermanentDelete}
                  onChange={(e) => setIsPermanentDelete(e.target.checked)}
                  className="rounded border-red-400 text-red-700 focus:ring-red-500"
                />
                <span>Xóa vĩnh viễn khỏi CSDL (Không lưu vào danh mục Đã xóa/Lưu trữ)</span>
              </label>
              <p className="text-[10px] text-gray-500 pl-6 mt-0.5">
                Nếu không tích chọn, hệ thống sẽ thực hiện Xóa mềm (Lưu trữ trạng thái & có thể khôi phục).
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg shadow flex items-center space-x-1.5"
            >
              <UserMinus className="w-4 h-4" />
              <span>{isPermanentDelete ? 'Xóa vĩnh viễn' : 'Xác nhận Xóa / Điều chuyển'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Chỉnh sửa / Đề nghị cập nhật Hồ sơ Đảng viên (11 mục) */}
      <Modal
        isOpen={isProfileEditOpen}
        onClose={() => { setFormData(member); setIsProfileEditOpen(false); }}
        title={isFullSecretary ? 'Chỉnh sửa Hồ sơ Đảng viên' : 'Đề nghị cập nhật Hồ sơ của tôi'}
      >
        {formData && (
          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs max-h-[70vh] overflow-y-auto pr-1">
            {!isFullSecretary && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900 flex items-start space-x-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>Yêu cầu cập nhật của bạn sẽ cần 1 trong 4 tài khoản Ban Chi ủy phê duyệt trước khi có hiệu lực.</span>
              </div>
            )}

            <div>
              <h4 className="font-bold text-red-900 mb-2">1. Thông tin chung</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tên gọi khác</label>
                  <input type="text" value={formData.otherName || ''} onChange={(e) => setFormData({ ...formData, otherName: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ngày sinh</label>
                  <input type="text" value={formData.dateOfBirth || ''} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Dân tộc</label>
                  <input type="text" value={formData.ethnicityName || ''} onChange={(e) => setFormData({ ...formData, ethnicityName: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tôn giáo</label>
                  <input type="text" value={formData.religionName || ''} onChange={(e) => setFormData({ ...formData, religionName: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Chức danh / Trình độ</label>
                  <input type="text" value={formData.academicTitle || ''} onChange={(e) => setFormData({ ...formData, academicTitle: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-red-900 mb-2">2. Thông tin Đảng</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nơi cấp thẻ Đảng</label>
                  <input type="text" value={formData.partyCardIssuer || ''} onChange={(e) => setFormData({ ...formData, partyCardIssuer: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ngày cấp thẻ Đảng</label>
                  <input type="text" value={formData.partyCardIssueDate || ''} onChange={(e) => setFormData({ ...formData, partyCardIssueDate: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-red-900 mb-2">3. Khai sinh - Quê quán - Thường trú</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" placeholder="Nơi khai sinh - Tỉnh/Thành" value={formData.birthRegistration?.province || ''} onChange={(e) => setFormData({ ...formData, birthRegistration: { ...formData.birthRegistration, province: e.target.value } })} className="w-full border border-gray-300 rounded-lg p-2" />
                <input type="text" placeholder="Quê quán - Tỉnh/Thành" value={formData.hometown?.province || ''} onChange={(e) => setFormData({ ...formData, hometown: { ...formData.hometown, province: e.target.value } })} className="w-full border border-gray-300 rounded-lg p-2" />
                <input type="text" placeholder="Thường trú - Tỉnh/Thành" value={formData.permanentResidence?.province || ''} onChange={(e) => setFormData({ ...formData, permanentResidence: { ...formData.permanentResidence, province: e.target.value } })} className="w-full border border-gray-300 rounded-lg p-2" />
                <input type="text" placeholder="Chi tiết nơi khai sinh" value={formData.birthRegistration?.detail || ''} onChange={(e) => setFormData({ ...formData, birthRegistration: { ...formData.birthRegistration, detail: e.target.value } })} className="w-full border border-gray-300 rounded-lg p-2" />
                <input type="text" placeholder="Chi tiết quê quán" value={formData.hometown?.detail || ''} onChange={(e) => setFormData({ ...formData, hometown: { ...formData.hometown, detail: e.target.value } })} className="w-full border border-gray-300 rounded-lg p-2" />
                <input type="text" placeholder="Chi tiết thường trú" value={formData.permanentResidence?.detail || ''} onChange={(e) => setFormData({ ...formData, permanentResidence: { ...formData.permanentResidence, detail: e.target.value } })} className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-red-900 mb-2">4. Quá trình học tập/công tác</h4>
              <textarea rows={3} value={formData.educationWorkHistory || ''} onChange={(e) => setFormData({ ...formData, educationWorkHistory: e.target.value })} placeholder="VD: 2010-2015 học tại...; 2015-nay công tác tại..." className="w-full border border-gray-300 rounded-lg p-2" />
            </div>

            <div>
              <h4 className="font-bold text-red-900 mb-2">5. Lịch sử chính trị & Nhân thân</h4>
              <textarea rows={3} value={formData.politicalHistoryFamily || ''} onChange={(e) => setFormData({ ...formData, politicalHistoryFamily: e.target.value })} placeholder="Thông tin về bản thân, cha, mẹ, vợ/chồng, con..." className="w-full border border-gray-300 rounded-lg p-2" />
            </div>

            <div>
              <h4 className="font-bold text-red-900 mb-2">10. Tệp đính kèm</h4>
              <div className="space-y-2 mb-2">
                {(formData.attachments || []).map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2">
                    <span className="font-semibold text-gray-800 truncate">{f.name}</span>
                    <button type="button" onClick={() => handleRemoveAttachment(i)} className="text-red-600 hover:text-red-800"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Tên tệp" value={newAttName} onChange={(e) => setNewAttName(e.target.value)} className="flex-1 border border-gray-300 rounded-lg p-2" />
                <input type="text" placeholder="Đường dẫn URL (nếu có)" value={newAttUrl} onChange={(e) => setNewAttUrl(e.target.value)} className="flex-1 border border-gray-300 rounded-lg p-2" />
                <button type="button" onClick={handleAddAttachment} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-3 py-2 rounded-lg">Thêm</button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
              <button type="button" onClick={() => { setFormData(member); setIsProfileEditOpen(false); }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg">Hủy</button>
              <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg shadow">{isFullSecretary ? 'Lưu thay đổi' : 'Gửi yêu cầu cập nhật'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
