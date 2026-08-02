import React, { useState } from 'react';
import { DataRepository } from '../services/repository';
import { DevelopmentCandidate, DevelopmentStage } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Plus,
  Users,
  Search,
  CheckCircle,
  Clock,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const Development: React.FC<{ onNavigateCandidate: (id: string) => void }> = ({ onNavigateCandidate }) => {
  const { currentUser, canApprove, canDelete } = useAuth();
  const [candidates, setCandidates] = useState<DevelopmentCandidate[]>(() => DataRepository.getDevelopmentCandidates());

  const canEditCandidate = (cand: DevelopmentCandidate): boolean => {
    if (canApprove()) return true;
    if (!currentUser || currentUser.role === 'GUEST') return false;

    const userEmail = currentUser.email?.toLowerCase();
    const userName = currentUser.fullName?.toUpperCase();
    const userStaffCode = currentUser.staffCode;

    const m1 = cand.mentor1;
    const m2 = cand.mentor2;

    const isMentor1 = (m1?.email && m1.email.toLowerCase() === userEmail) ||
                      (m1?.fullName && m1.fullName.toUpperCase() === userName) ||
                      (m1?.email && userStaffCode && m1.email.includes(userStaffCode));

    const isMentor2 = (m2?.email && m2.email.toLowerCase() === userEmail) ||
                      (m2?.fullName && m2.fullName.toUpperCase() === userName) ||
                      (m2?.email && userStaffCode && m2.email.includes(userStaffCode));

    return Boolean(isMentor1 || isMentor2);
  };
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Candidate Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('Giảng viên');
  const [workplace, setWorkplace] = useState('Chi bộ Khoa học cơ bản');
  const [stage, setStage] = useState<DevelopmentStage>('TRACKING');

  // Delete Candidate State
  const [deletingCandidate, setDeletingCandidate] = useState<DevelopmentCandidate | null>(null);

  const refreshData = () => {
    setCandidates(DataRepository.getDevelopmentCandidates());
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchYear = c.trackingYear === selectedYear;
    const matchSearch = c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchYear && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingCandidateId(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setJobTitle('Giảng viên');
    setWorkplace('Chi bộ Khoa học cơ bản');
    setStage('TRACKING');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cand: DevelopmentCandidate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCandidateId(cand.id);
    setFullName(cand.fullName);
    setEmail(cand.email || '');
    setPhone(cand.phone || '');
    setJobTitle(cand.jobTitle || 'Giảng viên');
    setWorkplace(cand.workplace || 'Chi bộ Khoa học cơ bản');
    setStage(cand.stage || 'TRACKING');
    setIsModalOpen(true);
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const members = DataRepository.getPartyMembers();

    DataRepository.saveDevelopmentCandidate(
      {
        id: editingCandidateId || undefined,
        trackingYear: selectedYear,
        fullName,
        email,
        phone,
        jobTitle,
        workplace,
        stage,
        trackingStartDate: '01/01/2026',
        mentor1: {
          memberId: members[0]?.id || 'pm-001',
          fullName: members[0]?.fullName || 'ĐẢNG VIÊN MẪU 01',
          partyCardNumber: members[0]?.partyCardNumber || '370123450001',
          jobTitle: members[0]?.jobTitle || 'Trưởng Bộ môn',
          department: members[0]?.department || 'Bộ môn Toán - Tin',
          email: members[0]?.workEmail || 'chibokhcb@ctump.edu.vn',
          assignedAt: '01/01/2026',
        },
        mentor2: {
          memberId: members[1]?.id || 'pm-002',
          fullName: members[1]?.fullName || 'ĐẢNG VIÊN MẪU 02',
          partyCardNumber: members[1]?.partyCardNumber || '370123450002',
          jobTitle: members[1]?.jobTitle || 'Phó Bí thư',
          department: members[1]?.department || 'Bộ môn Lý luận chính trị',
          email: members[1]?.workEmail || 'dangvien02@ctump.edu.vn',
          assignedAt: '01/01/2026',
        },
      },
      currentUser?.email || 'admin'
    );

    refreshData();
    setIsModalOpen(false);
  };

  const handleDeleteCandidate = () => {
    if (!deletingCandidate || !canDelete()) return;
    DataRepository.deleteDevelopmentCandidate(deletingCandidate.id, currentUser?.email || 'admin');
    refreshData();
    setDeletingCandidate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-amber-700" />
            <span>Quản lý Nguồn phát triển Đảng theo năm</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Theo dõi quá trình bồi dưỡng quần chúng, 02 người hướng dẫn chính thức và lịch sử bản thân/gia đình
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold bg-white"
          >
            <option value={2026}>Kế hoạch năm 2026</option>
            <option value={2025}>Kế hoạch năm 2025</option>
          </select>

          {canApprove() && (
            <button
              onClick={handleOpenAdd}
              className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm quần chúng bồi dưỡng</span>
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên quần chúng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Candidates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((cand) => (
          <div
            key={cand.id}
            className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition p-5 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-red-950 uppercase">{cand.fullName}</h3>
                  <p className="text-xs text-gray-500">{cand.jobTitle} • {cand.workplace}</p>
                </div>
                <StatusBadge status={cand.stage} type="stage" />
              </div>

              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100 text-xs space-y-1.5">
                <p className="font-bold text-amber-900 flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>02 Người hướng dẫn được phân công:</span>
                </p>
                <div className="text-[11px] text-gray-700 space-y-0.5">
                  <p>1. {cand.mentor1?.fullName || 'Chưa phân công'}</p>
                  <p>2. {cand.mentor2?.fullName || 'Chưa phân công'}</p>
                </div>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Bắt đầu theo dõi: {cand.trackingStartDate}</span>
                </p>
                <p className="flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nhận xét định kỳ: {cand.mentorReviews.length} lượt</span>
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <button
                onClick={() => onNavigateCandidate(cand.id)}
                className="w-full bg-slate-100 hover:bg-red-800 hover:text-white text-slate-800 font-bold py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Xem chi tiết hồ sơ & Nhận xét</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                {canEditCandidate(cand) && (
                  <button
                    onClick={(e) => handleOpenEdit(cand, e)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded-md transition flex items-center space-x-1"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-700" />
                    <span>Sửa thông tin</span>
                  </button>
                )}
                {(canDelete() || canEditCandidate(cand)) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingCandidate(cand);
                    }}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-900 font-bold rounded-md transition flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-700" />
                    <span>Xóa hồ sơ</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Candidate */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCandidateId ? "Sửa Hồ sơ Quần chúng bồi dưỡng" : "Thêm Quần chúng bồi dưỡng Nguồn phát triển Đảng"}>
        <form onSubmit={handleSaveCandidate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên Quần chúng *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-lg p-2 text-xs uppercase font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Chức danh / Chức vụ</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Đơn vị công tác</label>
              <input
                type="text"
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email công tác</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Giai đoạn theo dõi *</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as DevelopmentStage)}
              className="w-full border rounded-lg p-2 text-xs bg-white font-bold"
            >
              <option value="TRACKING">Đang theo dõi bồi dưỡng</option>
              <option value="ELITE_CITIZEN">Quần chúng ưu tú</option>
              <option value="AWARENESS_CLASS">Đã học lớp nhận thức về Đảng</option>
              <option value="DOSSIER_COMPLETION">Đang hoàn thiện hồ sơ kết nạp</option>
              <option value="CELL_APPROVED">Nghị quyết Chi bộ đã thông qua</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-2 border rounded-lg text-xs">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg text-xs">
              {editingCandidateId ? "Cập nhật thông tin" : "Thêm nguồn phát triển"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirm Delete Candidate */}
      <Modal isOpen={!!deletingCandidate} onClose={() => setDeletingCandidate(null)} title="Xác nhận Xóa Quần chúng bồi dưỡng">
        <div className="space-y-4 text-xs">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa hồ sơ quần chúng ưu tú <strong className="text-red-900 uppercase">{deletingCandidate?.fullName}</strong> khỏi kế hoạch phát triển Đảng năm {selectedYear}?
          </p>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 font-medium flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>Thao tác này sẽ xóa toàn bộ lịch sử theo dõi, nhận xét của người hướng dẫn và các thông tin liên quan.</span>
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t">
            <button onClick={() => setDeletingCandidate(null)} className="px-3 py-2 border rounded-lg">
              Hủy
            </button>
            <button onClick={handleDeleteCandidate} className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg flex items-center space-x-1">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xác nhận xóa</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
