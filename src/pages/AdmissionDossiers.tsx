import React, { useState } from 'react';
import { DataRepository } from '../services/repository';
import { AdmissionDossier } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  AlertTriangle,
  FolderArchive,
  Upload,
} from 'lucide-react';

export const AdmissionDossiers: React.FC<{ onNavigateDetail: (id: string) => void }> = ({ onNavigateDetail }) => {
  const { canApprove, currentUser, canDelete } = useAuth();
  const [dossiers, setDossiers] = useState<AdmissionDossier[]>(() => DataRepository.getAdmissionDossiers());
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  // Modal Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDossierId, setEditingDossierId] = useState<string | null>(null);
  const [candidateFullName, setCandidateFullName] = useState('');
  const [policyCode, setPolicyCode] = useState('HD-06-TW-2026');

  // Delete modal
  const [deletingDossier, setDeletingDossier] = useState<AdmissionDossier | null>(null);

  const refreshData = () => {
    setDossiers(DataRepository.getAdmissionDossiers());
  };

  const filteredDossiers = dossiers.filter((d) => {
    if (activeTab === 'ARCHIVED') return d.isArchived === true;
    return !d.isArchived;
  });

  const handleOpenAdd = () => {
    setEditingDossierId(null);
    setCandidateFullName('');
    setPolicyCode('HD-06-TW-2026');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: AdmissionDossier, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDossierId(d.id);
    setCandidateFullName(d.candidateFullName);
    setPolicyCode(d.requirementsSnapshot.policyCode || 'HD-06-TW-2026');
    setIsModalOpen(true);
  };

  const handleSaveDossier = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDossierId) {
      const existing = dossiers.find((d) => d.id === editingDossierId);
      if (existing) {
        existing.candidateFullName = candidateFullName;
        existing.requirementsSnapshot.policyCode = policyCode;
        DataRepository.saveAdmissionDossier(existing, currentUser?.email || 'admin');
      }
    } else {
      const newDossier: AdmissionDossier = {
        id: `adm-dos-${Date.now()}`,
        candidateId: `cand-${Date.now()}`,
        candidateFullName,
        candidateEmail: 'quanchung@ctump.edu.vn',
        requirementsSnapshot: {
          policyVersionId: 'pv-01',
          policyVersionName: 'Hướng dẫn 01-HD/TW',
          policyCode: policyCode || '01-HD/TW',
          snapshotAt: new Date().toISOString(),
          items: [],
        },
        items: [],
        itemsGroupA: [
          { id: `ga-1-${Date.now()}`, group: 'GROUP_A', order: 1, code: 'A1', name: 'Lý lịch của người vào Đảng (Mẫu 1-KNĐ)', description: 'Mẫu 1-KNĐ', mandatory: true, status: 'NEEDS_SUPPLEMENT' },
          { id: `ga-2-${Date.now()}`, group: 'GROUP_A', order: 2, code: 'A2', name: 'Giấy giới thiệu của 02 Đảng viên chính thức được phân công', description: 'Giấy giới thiệu', mandatory: true, status: 'VALID' },
          { id: `ga-3-${Date.now()}`, group: 'GROUP_A', order: 3, code: 'A3', name: 'Nghị quyết giới thiệu quần chúng của Chi đoàn / Công đoàn', description: 'Nghị quyết đoàn thể', mandatory: true, status: 'PENDING_REVIEW' },
        ],
        itemsGroupB: [
          { id: `gb-1-${Date.now()}`, group: 'GROUP_B', order: 4, code: 'B1', name: 'Nghị quyết của Chi bộ xét kết nạp Đảng viên', description: 'Nghị quyết Chi bộ', mandatory: true, status: 'PENDING_REVIEW' },
          { id: `gb-2-${Date.now()}`, group: 'GROUP_B', order: 5, code: 'B2', name: 'Báo cáo thẩm tra lý lịch người vào Đảng', description: 'Báo cáo thẩm tra', mandatory: true, status: 'NEEDS_SUPPLEMENT' },
        ],
        itemsGroupC: [
          { id: `gc-1-${Date.now()}`, group: 'GROUP_C', order: 6, code: 'C1', name: 'Giấy chứng nhận học lớp Bồi dưỡng nhận thức về Đảng', description: 'Giấy chứng nhận', mandatory: true, status: 'VALID' },
          { id: `gc-2-${Date.now()}`, group: 'GROUP_C', order: 7, code: 'C2', name: 'Đơn xin vào Đảng (Viết tay)', description: 'Đơn xin vào Đảng', mandatory: true, status: 'VALID' },
        ],
        progressPercentage: 50,
        overallStatus: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };
      DataRepository.saveAdmissionDossier(newDossier, currentUser?.email || 'admin');
    }

    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingDossier || !canDelete()) return;
    DataRepository.deleteAdmissionDossier(deletingDossier.id, currentUser?.email || 'admin');
    refreshData();
    setDeletingDossier(null);
  };

  const handleToggleArchive = (dossier: AdmissionDossier, e: React.MouseEvent) => {
    e.stopPropagation();
    DataRepository.toggleArchiveAdmissionDossier(dossier.id, !dossier.isArchived, currentUser?.email || 'admin');
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-red-800" />
            <span>Quản lý Tiến độ Hồ sơ Kết nạp Đảng</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Quy trình chuẩn hóa 3 nhóm danh mục hồ sơ (A, B, C) theo Hướng dẫn 06-HD/TW & Hướng dẫn 01-HD/TW
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {canApprove() && (
            <button
              onClick={handleOpenAdd}
              className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Hồ sơ kết nạp</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Active / Archive */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 text-xs">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 font-bold rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'ACTIVE'
                ? 'bg-red-900 text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Hồ sơ đang xử lý ({dossiers.filter((d) => !d.isArchived).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ARCHIVED')}
            className={`px-4 py-2 font-bold rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'ARCHIVED'
                ? 'bg-red-900 text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Hồ sơ đã lưu trữ kho ({dossiers.filter((d) => d.isArchived).length})</span>
          </button>
        </div>
      </div>

      {/* Checklist Cards List */}
      {filteredDossiers.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-xs">
          Chưa có hồ sơ nào trong mục này.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDossiers.map((dos) => (
            <div
              key={dos.id}
              className={`bg-white rounded-xl border shadow-xs hover:shadow-md transition p-5 space-y-4 ${
                dos.isArchived ? 'bg-gray-50/80 border-gray-300' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-red-950 uppercase flex items-center space-x-2">
                    <span>{dos.candidateFullName}</span>
                    {dos.isArchived && (
                      <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded font-bold">
                        Đã lưu trữ
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Căn cứ quy định: <span className="font-semibold text-red-900">{dos.requirementsSnapshot.policyCode}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-red-800">{dos.progressPercentage}%</span>
                  <p className="text-[10px] text-gray-500">Hoàn thiện</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-red-700 h-full transition-all duration-500" style={{ width: `${dos.progressPercentage}%` }} />
              </div>

              {/* Groups A, B, C summary counts */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-center font-bold">
                <div className="bg-red-50 p-2 rounded border border-red-100">
                  <p className="text-red-900">Nhóm A (Lý lịch)</p>
                  <p className="text-gray-600 mt-0.5">
                    {dos.itemsGroupA.filter((i) => i.status === 'VALID').length}/{dos.itemsGroupA.length} đạt
                  </p>
                </div>
                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                  <p className="text-blue-900">Nhóm B (Nghị quyết)</p>
                  <p className="text-gray-600 mt-0.5">
                    {dos.itemsGroupB.filter((i) => i.status === 'VALID').length}/{dos.itemsGroupB.length} đạt
                  </p>
                </div>
                <div className="bg-amber-50 p-2 rounded border border-amber-100">
                  <p className="text-amber-900">Nhóm C (Văn bằng)</p>
                  <p className="text-gray-600 mt-0.5">
                    {dos.itemsGroupC.filter((i) => i.status === 'VALID').length}/{dos.itemsGroupC.length} đạt
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t">
                <span className="text-gray-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Cập nhật: {new Date(dos.updatedAt).toLocaleDateString('vi-VN')}</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onNavigateDetail(dos.id)}
                    className="bg-red-800 hover:bg-red-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi tiết & Upload</span>
                  </button>

                  <button
                    onClick={(e) => handleOpenEdit(dos, e)}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg"
                    title="Sửa tên / snapshot"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleToggleArchive(dos, e)}
                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg"
                    title={dos.isArchived ? "Mở khóa lưu trữ" : "Lưu trữ vào kho"}
                  >
                    {dos.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                  </button>

                  {canDelete() && (
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
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Admission Dossier */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDossierId ? "Sửa Hồ Sơ Kết Nạp" : "Thêm Hồ Sơ Kết Nạp Đảng Mới"}>
        <form onSubmit={handleSaveDossier} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Họ và tên Quần chúng *</label>
            <input
              type="text"
              required
              value={candidateFullName}
              onChange={(e) => setCandidateFullName(e.target.value)}
              className="w-full border rounded-lg p-2 font-bold uppercase"
              placeholder="VD: NGUYỄN VĂN AN"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Áp dụng Văn bản Hướng dẫn / Snapshot *</label>
            <select
              value={policyCode}
              onChange={(e) => setPolicyCode(e.target.value)}
              className="w-full border rounded-lg p-2 font-bold bg-white"
            >
              <option value="HD-06-TW-2026">Hướng dẫn 06-HD/TW (Thẩm định danh mục A, B, C)</option>
              <option value="HD-01-HD/TW">Hướng dẫn 01-HD/TW (Quy định chi tiết thi hành Điều lệ Đảng)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-2 border rounded-lg">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg">
              {editingDossierId ? "Cập nhật hồ sơ" : "Tạo mới hồ sơ"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirm Delete */}
      <Modal isOpen={!!deletingDossier} onClose={() => setDeletingDossier(null)} title="Xác nhận Xóa Hồ Sơ Kết Nạp">
        <div className="space-y-4 text-xs">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa vĩnh viễn tiến độ hồ sơ kết nạp Đảng của quần chúng <strong className="text-red-900 uppercase">{deletingDossier?.candidateFullName}</strong>?
          </p>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 font-medium flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>Thao tác này sẽ xóa sạch danh mục tài liệu nhóm A, B, C đã theo dõi.</span>
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
