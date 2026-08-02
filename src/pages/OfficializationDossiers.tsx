import React, { useState } from 'react';
import { DataRepository } from '../services/repository';
import { OfficializationDossier } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  FolderArchive,
} from 'lucide-react';

export const OfficializationDossiers: React.FC<{ onNavigateDetail: (id: string) => void }> = ({ onNavigateDetail }) => {
  const { canApprove, currentUser } = useAuth();
  const [dossiers, setDossiers] = useState<OfficializationDossier[]>(() => DataRepository.getOfficializationDossiers());
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  // Modal Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [memberFullName, setMemberFullName] = useState('');
  const [provisionalAdmissionDate, setProvisionalAdmissionDate] = useState('15/05/2025');
  const [expectedOfficialDate, setExpectedOfficialDate] = useState('15/05/2026');
  const [provisionalDecisionNumber, setProvisionalDecisionNumber] = useState('QĐ-3701/ĐU-2025');

  // Delete modal
  const [deletingDossier, setDeletingDossier] = useState<OfficializationDossier | null>(null);

  const refreshData = () => {
    setDossiers(DataRepository.getOfficializationDossiers());
  };

  const filteredDossiers = dossiers.filter((d) => {
    if (activeTab === 'ARCHIVED') return d.isArchived === true;
    return !d.isArchived;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setMemberFullName('');
    setProvisionalAdmissionDate('15/05/2025');
    setExpectedOfficialDate('15/05/2026');
    setProvisionalDecisionNumber('QĐ-3701/ĐU-2025');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: OfficializationDossier, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(d.id);
    setMemberFullName(d.memberFullName);
    setProvisionalAdmissionDate(d.provisionalAdmissionDate);
    setExpectedOfficialDate(d.expectedOfficialDate);
    setProvisionalDecisionNumber(d.provisionalDecisionNumber);
    setIsModalOpen(true);
  };

  const handleSaveDossier = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const existing = dossiers.find((d) => d.id === editingId);
      if (existing) {
        existing.memberFullName = memberFullName;
        existing.provisionalAdmissionDate = provisionalAdmissionDate;
        existing.expectedOfficialDate = expectedOfficialDate;
        existing.provisionalDecisionNumber = provisionalDecisionNumber;
        DataRepository.saveOfficializationDossier(existing, currentUser?.email || 'admin');
      }
    } else {
      const newDossier: OfficializationDossier = {
        id: `off-dos-${Date.now()}`,
        memberId: `pm-${Date.now()}`,
        memberFullName,
        partyCardNumber: '370123450005',
        provisionalAdmissionDate,
        expectedOfficialDate,
        dossierDueDate: expectedOfficialDate,
        votingThresholdsSnapshot: {
          cellThreshold: 'Ít nhất 2/3 đảng viên chính thức đồng ý',
          executiveCommitteeThreshold: 'Ít nhất 2/3 đảng ủy viên đồng ý',
          standingCommitteeThreshold: 'Trên 1/2 thành viên đồng ý',
        },
        requirementsSnapshot: {
          policyVersionId: 'pv-208',
          policyVersionName: 'Quy định 208-QĐ/TW',
          policyCode: '208-QĐ/TW',
          snapshotAt: new Date().toISOString(),
          items: [],
        },
        items: [
          { id: `off-1-${Date.now()}`, order: 1, group: 'OFFICIAL_ITEM', code: 'OFF-01', name: '1. Giấy chứng nhận học Lớp Bồi dưỡng lý luận chính trị cho Đảng viên mới', description: 'Giấy chứng nhận', mandatory: true, status: 'VALID' },
          { id: `off-2-${Date.now()}`, order: 2, group: 'OFFICIAL_ITEM', code: 'OFF-02', name: '2. Bản kiểm điểm cá nhân của Đảng viên dự bị trong 12 tháng', description: 'Bản kiểm điểm', mandatory: true, status: 'PENDING_REVIEW' },
          { id: `off-3-${Date.now()}`, order: 3, group: 'OFFICIAL_ITEM', code: 'OFF-03', name: '3. Bản nhận xét Đảng viên dự bị của Đảng viên chính thức được phân công giúp đỡ', description: 'Bản nhận xét', mandatory: true, status: 'PENDING_REVIEW' },
          { id: `off-4-${Date.now()}`, order: 4, group: 'OFFICIAL_ITEM', code: 'OFF-04', name: '4. Nhận xét của Chi ủy nơi cư trú đối với Đảng viên dự bị', description: 'Nhận xét cư trú', mandatory: true, status: 'NEEDS_SUPPLEMENT' },
          { id: `off-5-${Date.now()}`, order: 5, group: 'OFFICIAL_ITEM', code: 'OFF-05', name: '5. Văn bản nhận xét của Công đoàn / Đoàn Thanh niên nơi công tác', description: 'Văn bản nhận xét', mandatory: true, status: 'PENDING_REVIEW' },
          { id: `off-6-${Date.now()}`, order: 6, group: 'OFFICIAL_ITEM', code: 'OFF-06', name: '6. Nghị quyết của Chi bộ xét công nhận Đảng viên chính thức', description: 'Nghị quyết Chi bộ', mandatory: true, status: 'NEEDS_SUPPLEMENT' },
          { id: `off-7-${Date.now()}`, order: 7, group: 'OFFICIAL_ITEM', code: 'OFF-07', name: '7. Báo cáo tổng hợp ý kiến nhận xét của các đoàn thể và nhân dân', description: 'Báo cáo tổng hợp', mandatory: true, status: 'NEEDS_SUPPLEMENT' },
          { id: `off-8-${Date.now()}`, order: 8, group: 'OFFICIAL_ITEM', code: 'OFF-08', name: '8. Quyết định công nhận Đảng viên chính thức của Ban Thường vụ Đảng ủy', description: 'Quyết định công nhận', mandatory: true, status: 'NEEDS_SUPPLEMENT' },
        ],
        progressPercentage: 25,
        currentStatus: 'MONITORING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };
      DataRepository.saveOfficializationDossier(newDossier, currentUser?.email || 'admin');
    }

    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingDossier) return;
    DataRepository.deleteOfficializationDossier(deletingDossier.id, currentUser?.email || 'admin');
    refreshData();
    setDeletingDossier(null);
  };

  const handleToggleArchive = (dossier: OfficializationDossier, e: React.MouseEvent) => {
    e.stopPropagation();
    DataRepository.toggleArchiveOfficializationDossier(dossier.id, !dossier.isArchived, currentUser?.email || 'admin');
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-800" />
            <span>Quản lý Công nhận Đảng viên Chính thức (Dự bị 12 tháng)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Theo dõi thời hạn 12 tháng dự bị, cảnh báo mốc 90-60-30-15-7 ngày và danh mục 08 văn bản bắt buộc
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {canApprove() && (
            <button
              onClick={handleOpenAdd}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm hồ sơ dự bị</span>
            </button>
          )}
        </div>
      </div>

      {/* Deadline warning banner */}
      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs space-y-1">
        <p className="font-bold flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Cảnh báo thời hạn Công nhận Chính thức:</span>
        </p>
        <p className="text-[11px] text-amber-800">
          Trong vòng 30 ngày trước khi hết thời hạn 12 tháng dự bị, Chi bộ phải hoàn thành các bước họp xét và biểu quyết (yêu cầu &gt;= 2/3 tổng số đảng viên chính thức tán thành).
        </p>
      </div>

      {/* Tabs Active / Archive */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 text-xs">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 font-bold rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'ACTIVE'
                ? 'bg-emerald-900 text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Đang theo dõi dự bị ({dossiers.filter((d) => !d.isArchived).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ARCHIVED')}
            className={`px-4 py-2 font-bold rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'ARCHIVED'
                ? 'bg-emerald-900 text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Kho đã hoàn thành & Lưu trữ ({dossiers.filter((d) => d.isArchived).length})</span>
          </button>
        </div>
      </div>

      {/* Cards List */}
      {filteredDossiers.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-xs">
          Chưa có hồ sơ nào trong mục này.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDossiers.map((dos) => {
            const daysLeft = DataRepository.calculateDaysRemaining(dos.expectedOfficialDate);
            const isWarning = daysLeft <= 30;

            return (
              <div
                key={dos.id}
                className={`bg-white rounded-xl border shadow-xs hover:shadow-md transition p-5 space-y-4 ${
                  dos.isArchived ? 'bg-gray-50 border-gray-300' : isWarning ? 'border-amber-400 bg-amber-50/20' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between border-b pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-red-950 uppercase flex items-center space-x-2">
                      <span>{dos.memberFullName}</span>
                      {dos.isArchived && (
                        <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded font-bold">
                          Đã lưu trữ
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ngày kết nạp dự bị: <span className="font-bold text-gray-800">{dos.provisionalAdmissionDate}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-extrabold px-2 py-1 rounded ${isWarning ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                      Còn {daysLeft} ngày
                    </span>
                    <p className="text-[10px] text-gray-500 mt-1">Hạn: {dos.expectedOfficialDate}</p>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-700">Tiến độ 08 danh mục văn bản</span>
                    <span className="text-emerald-800">{dos.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${dos.progressPercentage}%` }} />
                  </div>
                </div>

                {/* Voting results summary */}
                {dos.partyCellMeeting && (
                  <div className="bg-slate-50 p-3 rounded-lg border text-xs space-y-1">
                    <p className="font-bold text-gray-900 flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-blue-800" />
                      <span>Kết quả biểu quyết Chi bộ:</span>
                    </p>
                    <p className="text-emerald-800 font-extrabold">
                      {dos.partyCellMeeting.votingApprovalCount}/{dos.partyCellMeeting.totalOfficialMembers} phiếu đồng ý ({dos.partyCellMeeting.votingPercentage}% - Đạt điều kiện &gt;= 2/3)
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t">
                  <span className="text-gray-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>QĐ kết nạp: {dos.provisionalDecisionNumber}</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onNavigateDetail(dos.id)}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết 08 mục & Upload</span>
                    </button>

                    <button
                      onClick={(e) => handleOpenEdit(dos, e)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg"
                      title="Sửa thông tin"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleToggleArchive(dos, e)}
                      className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg"
                      title={dos.isArchived ? "Phục hồi" : "Lưu trữ vào kho"}
                    >
                      {dos.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingDossier(dos);
                      }}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-800 rounded-lg"
                      title="Xóa hồ sơ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Officialization Dossier */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Sửa Hồ Sơ Dự Bị Công Nhận Chính Thức" : "Thêm Hồ Sơ Dự Bị Mới"}>
        <form onSubmit={handleSaveDossier} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Họ và tên Đảng viên dự bị *</label>
            <input
              type="text"
              required
              value={memberFullName}
              onChange={(e) => setMemberFullName(e.target.value)}
              className="w-full border rounded-lg p-2 font-bold uppercase"
              placeholder="VD: NGUYỄN VĂN AN"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Ngày kết nạp dự bị *</label>
              <input
                type="text"
                required
                value={provisionalAdmissionDate}
                onChange={(e) => setProvisionalAdmissionDate(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="dd/MM/yyyy"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Ngày hết hạn 12 tháng dự bị *</label>
              <input
                type="text"
                required
                value={expectedOfficialDate}
                onChange={(e) => setExpectedOfficialDate(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="dd/MM/yyyy"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Số Quyết định kết nạp dự bị *</label>
            <input
              type="text"
              required
              value={provisionalDecisionNumber}
              onChange={(e) => setProvisionalDecisionNumber(e.target.value)}
              className="w-full border rounded-lg p-2 font-mono"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-2 border rounded-lg">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg">
              {editingId ? "Cập nhật" : "Tạo mới hồ sơ"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirm Delete */}
      <Modal isOpen={!!deletingDossier} onClose={() => setDeletingDossier(null)} title="Xác nhận Xóa Hồ Sơ Dự Bị">
        <div className="space-y-4 text-xs">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa hồ sơ theo dõi dự bị 12 tháng của Đảng viên <strong className="text-red-900 uppercase">{deletingDossier?.memberFullName}</strong>?
          </p>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 font-medium flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>Thao tác này sẽ xóa 08 mục văn bản đã kiểm tra và kết quả biểu quyết chi bộ.</span>
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t">
            <button onClick={() => setDeletingDossier(null)} className="px-3 py-2 border rounded-lg">
              Hủy
            </button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg flex items-center space-x-1">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xác nhận xóa</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
