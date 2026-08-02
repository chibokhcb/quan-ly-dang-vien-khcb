import React, { useState, useMemo, useEffect } from 'react';
import { DataRepository } from '../services/repository';
import { PartyMember, ActivityStatus } from '../types';
import { MaskedText } from '../components/common/MaskedText';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ExcelService } from '../services/excelService';
import { useAuth } from '../context/AuthContext';
import { searchMatch } from '../utils/vietnamese';
import {
  Users,
  Search,
  FileSpreadsheet,
  Upload,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  CheckCircle,
  AlertTriangle,
  Type,
  UserMinus,
  RefreshCw,
  Info,
  X,
} from 'lucide-react';

export const Members: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentUser, isFullSecretary, requiresSecretaryApproval, canEditMember, canApprove, canDelete } = useAuth();
  const [members, setMembers] = useState<PartyMember[]>(() => DataRepository.getPartyMembers());

  // Search & Filter state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [provinceFilter, setProvinceFilter] = useState<string>('ALL');

  // Debounce search query updates (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // Import Wizard Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<Partial<PartyMember>[]>([]);
  const [importErrors, setImportErrors] = useState<Array<{ row: number; field: string; value: string; error: string }>>([]);

  // Create/Edit Member Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Partial<PartyMember> | null>(null);

  // Rename Member ("Điều tên") Modal state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameMember, setRenameMember] = useState<PartyMember | null>(null);
  const [newFullName, setNewFullName] = useState('');
  const [newOtherName, setNewOtherName] = useState('');
  const [renameReason, setRenameReason] = useState('Đính chính tên gọi theo CCCD/Khai sinh chính thức');

  // Delete Member ("Xóa Đảng viên") Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMember, setDeleteMember] = useState<PartyMember | null>(null);
  const [deleteReasonCategory, setDeleteReasonCategory] = useState<
    'CHUYEN_SINH_HOAT' | 'ROI_KHOI_DANG' | 'XOA_TEN_KY_LUAT' | 'TU_TRAN' | 'KHAC'
  >('CHUYEN_SINH_HOAT');
  const [deleteNote, setDeleteNote] = useState('');
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);

  const refreshData = () => {
    setMembers(DataRepository.getPartyMembers());
  };

  // Filtered list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        searchMatch(m.fullName, debouncedSearchQuery) ||
        searchMatch(m.normalizedName || '', debouncedSearchQuery) ||
        searchMatch(m.staffCode, debouncedSearchQuery) ||
        searchMatch(m.activityStatus, debouncedSearchQuery) ||
        searchMatch(m.personalId, debouncedSearchQuery) ||
        searchMatch(m.partyCardNumber, debouncedSearchQuery) ||
        searchMatch(m.department || '', debouncedSearchQuery) ||
        searchMatch(m.jobTitle || '', debouncedSearchQuery);

      const matchStatus = statusFilter === 'ALL' || m.activityStatus === statusFilter;
      const matchProvince =
        provinceFilter === 'ALL' ||
        m.permanentResidence.province === provinceFilter ||
        m.hometown.province === provinceFilter;

      return matchSearch && matchStatus && matchProvince;
    });
  }, [members, debouncedSearchQuery, statusFilter, provinceFilter]);

  // Export handlers
  const handleExportOriginal = async () => {
    const blob = await ExcelService.exportPartyMembersToExcel(filteredMembers);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_sach_Dang_vien_KHCB_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    DataRepository.addAuditLog(
      currentUser?.email || 'admin',
      'EXPORT_EXCEL_MEMBERS',
      'PARTY_MEMBER',
      'all',
      'Xuất danh sách đảng viên tệp Excel mẫu gốc Chi bộ'
    );
  };

  // Import file handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    const buffer = await file.arrayBuffer();
    const result = await ExcelService.parsePartyMembersExcel(buffer);
    setParsedPreview(result.parsedData);
    setImportErrors(result.errors);
    setImportStep(2);
  };

  const handleConfirmImport = () => {
    parsedPreview.forEach((item) => {
      DataRepository.savePartyMember(item, currentUser?.email || 'import_admin');
    });
    refreshData();
    setIsImportModalOpen(false);
    setImportStep(1);
    setImportFile(null);
    alert(`Đã nhập thành công ${parsedPreview.length} hồ sơ đảng viên!`);
  };

  // Save member handler
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember?.fullName) return;

    if (!canApprove()) {
      // Regular member editing their own record -> requires approval from 1 of 4 admin accounts
      const changeReq: MemberChangeRequest = {
        id: `cr-${Date.now()}`,
        memberId: selectedMember.id,
        memberFullName: selectedMember.fullName,
        requestedByUid: currentUser?.uid || '',
        requestedByEmail: currentUser?.email || '',
        requestedAt: new Date().toISOString(),
        beforeData: DataRepository.getPartyMemberById(selectedMember.id) || {},
        requestedData: selectedMember,
        changedFields: ['Thông tin cá nhân'],
        reason: 'Đảng viên đề nghị cập nhật điều chỉnh thông tin cá nhân',
        status: 'PENDING',
      };
      DataRepository.saveMemberChangeRequest(changeReq, currentUser?.email || 'user');
      alert('Đã gửi yêu cầu cập nhật thông tin cá nhân! Thay đổi sẽ có hiệu lực sau khi 1 trong 4 tài khoản Ban Chi ủy (chibokhcb, ntttram, nthung, letran) phê duyệt.');
    } else {
      DataRepository.savePartyMember(selectedMember, currentUser?.email || 'admin');
    }
    refreshData();
    setIsEditModalOpen(false);
  };

  // Open Rename Modal ("Điều tên")
  const handleOpenRename = (member: PartyMember) => {
    setRenameMember(member);
    setNewFullName(member.fullName);
    setNewOtherName(member.otherName || '');
    setRenameReason('Đính chính tên gọi theo Giấy khai sinh / CCCD chính thức');
    setIsRenameModalOpen(true);
  };

  // Confirm Rename ("Điều tên")
  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameMember || !newFullName.trim()) return;

    DataRepository.adjustPartyMemberName(
      renameMember.id,
      newFullName.trim(),
      newOtherName.trim(),
      renameReason.trim(),
      currentUser?.email || 'admin'
    );
    refreshData();
    setIsRenameModalOpen(false);
  };

  // Open Delete Modal ("Xóa Đảng viên")
  const handleOpenDelete = (member: PartyMember) => {
    setDeleteMember(member);
    setDeleteReasonCategory('CHUYEN_SINH_HOAT');
    setDeleteNote('');
    setIsPermanentDelete(false);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteMember || !canDelete()) return;

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
      deleteMember.id,
      isPermanentDelete,
      fullReason,
      currentUser?.email || 'admin',
      newStatus
    );

    refreshData();
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
            <Users className="w-5 h-5 text-red-800" />
            <span>Danh sách & Hồ sơ Đảng viên Chi bộ</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Quản lý thông tin chính thức theo mẫu File nhập liệu 4.0 Chi bộ Khoa học cơ bản
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(isFullSecretary || requiresSecretaryApproval) && (
            <>
              <button
                onClick={() => {
                  setSelectedMember({
                    fullName: '',
                    gender: 'Nam',
                    dateOfBirth: '15/05/1990',
                    ethnicityName: 'Kinh',
                    religionName: 'Không',
                    personalId: '089090000000',
                    partyCardNumber: '370123450000',
                    partyOrganization: 'Chi bộ Khoa học cơ bản',
                    birthRegistration: { country: 'Việt Nam', province: 'Cần Thơ', detail: '' },
                    hometown: { country: 'Việt Nam', province: 'Cần Thơ', detail: '' },
                    permanentResidence: { country: 'Việt Nam', province: 'Cần Thơ', detail: '' },
                    partyAdmissionDate: '19/05/2015',
                    officialPartyDate: '19/05/2016',
                    activityStatus: 'Đang sinh hoạt Đảng',
                    staffCode: `001${Math.floor(100 + Math.random() * 900)}`,
                  });
                  setIsEditModalOpen(true);
                }}
                className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm mới</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Nhập Excel</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportOriginal}
            className="bg-yellow-600 hover:bg-yellow-700 text-slate-950 text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel Mẫu Gốc</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo Tên, MSCB, Trạng thái, CCCD, Thẻ Đảng..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-none transition shadow-2xs"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              title="Xóa ô tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto text-xs">
          <div className="flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-semibold text-gray-600">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Đang sinh hoạt Đảng">Đang sinh hoạt Đảng</option>
              <option value="Miễn sinh hoạt">Miễn sinh hoạt</option>
              <option value="Gián đoạn sinh hoạt">Gián đoạn sinh hoạt</option>
              <option value="Đình chỉ sinh hoạt">Đình chỉ sinh hoạt</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="font-semibold text-gray-600">Tỉnh/Thành:</span>
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none"
            >
              <option value="ALL">Tất cả Tỉnh/Thành</option>
              <option value="Cần Thơ">Cần Thơ</option>
              <option value="An Giang">An Giang</option>
              <option value="Vĩnh Long">Vĩnh Long</option>
              <option value="Đồng Tháp">Đồng Tháp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-red-900 text-white font-bold text-[11px] uppercase tracking-wider">
                <th className="p-3 w-12 text-center">STT</th>
                <th className="p-3">Họ và tên *</th>
                <th className="p-3">MSCB</th>
                <th className="p-3">Ngày sinh</th>
                <th className="p-3">Số CCCD (12 số)</th>
                <th className="p-3">Số thẻ Đảng</th>
                <th className="p-3">Ngày vào Đảng</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Chức danh / Học vị</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((m, idx) => (
                <tr key={m.id} className="hover:bg-red-50/40 transition">
                  <td className="p-3 text-center font-bold text-gray-500">{idx + 1}</td>
                  <td className="p-3 font-extrabold text-red-950 uppercase">{m.fullName}</td>
                  <td className="p-3 font-mono font-semibold text-gray-700">{m.staffCode}</td>
                  <td className="p-3">{m.dateOfBirth}</td>
                  <td className="p-3">
                    <MaskedText value={m.personalId} label="Số CCCD" />
                  </td>
                  <td className="p-3">
                    <MaskedText value={m.partyCardNumber} label="Số thẻ Đảng" />
                  </td>
                  <td className="p-3">{m.partyAdmissionDate}</td>
                  <td className="p-3">
                    <StatusBadge status={m.activityStatus} type="activity" />
                  </td>
                  <td className="p-3 text-gray-600">{m.academicTitle || m.jobTitle || '---'}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => onNavigate(`/members/${m.id}`)}
                        className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                        title="Xem chi tiết 11 tab hồ sơ"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(isFullSecretary || requiresSecretaryApproval) && (
                        <button
                          onClick={() => handleOpenRename(m)}
                          className="p-1.5 text-indigo-700 hover:bg-indigo-100 rounded-lg transition"
                          title="Điều tên / Đổi tên Đảng viên"
                        >
                          <Type className="w-4 h-4" />
                        </button>
                      )}
                      {canEditMember(m.userUid, m.workEmail, m.staffCode) && (
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition"
                          title={isFullSecretary ? "Chỉnh sửa toàn bộ hồ sơ" : "Đề nghị cập nhật hồ sơ cá nhân"}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete() && (
                        <button
                          onClick={() => handleOpenDelete(m)}
                          className="p-1.5 text-red-700 hover:bg-red-100 rounded-lg transition"
                          title="Xóa / Chuyển sinh hoạt Đảng viên"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    Không tìm thấy đảng viên phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Wizard Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Quy trình Nhập Excel (5 Bước)">
        <div className="space-y-4">
          {/* Stepper Header */}
          <div className="flex items-center justify-between border-b pb-3 text-xs font-bold">
            <span className={importStep === 1 ? 'text-red-700 underline' : 'text-gray-400'}>1. Chọn tệp</span>
            <span>→</span>
            <span className={importStep === 2 ? 'text-red-700 underline' : 'text-gray-400'}>2. Đọc Sheet</span>
            <span>→</span>
            <span className={importStep === 3 ? 'text-red-700 underline' : 'text-gray-400'}>3. Xem trước</span>
            <span>→</span>
            <span className={importStep === 4 ? 'text-red-700 underline' : 'text-gray-400'}>4. Kiểm tra lỗi</span>
            <span>→</span>
            <span className={importStep === 5 ? 'text-red-700 underline' : 'text-gray-400'}>5. Xác nhận</span>
          </div>

          {importStep === 1 && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center space-y-3">
              <Upload className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="font-bold text-gray-700">Tải tệp Excel nguồn (.xlsx)</p>
              <p className="text-xs text-gray-500">
                Hỗ trợ định dạng &quot;Chi bộ Khoa học cơ bản_File nhập liệu 4.0 .xlsx&quot;
              </p>
              <input type="file" accept=".xlsx" onChange={handleFileSelect} className="hidden" id="excel-upload-input" />
              <label
                htmlFor="excel-upload-input"
                className="inline-block bg-red-800 hover:bg-red-900 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition text-xs"
              >
                Chọn tệp từ máy tính
              </label>
            </div>
          )}

          {importStep >= 2 && (
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                <p className="font-bold">
                  Tệp: <span className="text-red-800">{importFile?.name}</span>
                </p>
                <p>Số dòng dữ liệu đọc được: {parsedPreview.length}</p>
                <p className="text-amber-800 font-semibold">
                  Cảnh báo trùng/lỗi: {importErrors.length} phát hiện
                </p>
              </div>

              {/* Error log if any */}
              {importErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-900 max-h-40 overflow-y-auto space-y-1">
                  <p className="font-bold flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Danh sách cảnh báo dữ liệu:</span>
                  </p>
                  {importErrors.map((err, i) => (
                    <p key={i}>
                      • Dòng {err.row}: Trường [{err.field}] = &quot;{err.value}&quot; ({err.error})
                    </p>
                  ))}
                </div>
              )}

              {/* Preview table */}
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 font-bold">
                    <tr>
                      <th className="p-2">Họ tên</th>
                      <th className="p-2">Giới tính</th>
                      <th className="p-2">CCCD</th>
                      <th className="p-2">Số thẻ Đảng</th>
                      <th className="p-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreview.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 font-bold uppercase">{item.fullName}</td>
                        <td className="p-2">{item.gender}</td>
                        <td className="p-2 font-mono">{item.personalId}</td>
                        <td className="p-2 font-mono">{item.partyCardNumber}</td>
                        <td className="p-2">{item.activityStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg flex items-center space-x-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Xác nhận nhập dữ liệu</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit / Create Member Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Cập nhật Hồ sơ Đảng viên">
        <form onSubmit={handleSaveMember} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên * (tự viết HOA)</label>
              <input
                type="text"
                required
                value={selectedMember?.fullName || ''}
                onChange={(e) => setSelectedMember({ ...selectedMember, fullName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs uppercase font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">MSCB / Mã nhân viên</label>
              <input
                type="text"
                value={selectedMember?.staffCode || ''}
                onChange={(e) => setSelectedMember({ ...selectedMember, staffCode: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Số định danh cá nhân (CCCD 12 số) *</label>
              <input
                type="text"
                required
                maxLength={12}
                value={selectedMember?.personalId || ''}
                onChange={(e) => setSelectedMember({ ...selectedMember, personalId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Số thẻ Đảng (12 số) *</label>
              <input
                type="text"
                required
                maxLength={12}
                value={selectedMember?.partyCardNumber || ''}
                onChange={(e) => setSelectedMember({ ...selectedMember, partyCardNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ngày sinh (dd/MM/yyyy)</label>
              <input
                type="text"
                value={selectedMember?.dateOfBirth || ''}
                onChange={(e) => setSelectedMember({ ...selectedMember, dateOfBirth: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Trạng thái sinh hoạt Đảng *</label>
              <select
                value={selectedMember?.activityStatus || 'Đang sinh hoạt Đảng'}
                onChange={(e) => setSelectedMember({ ...selectedMember, activityStatus: e.target.value as ActivityStatus })}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white"
              >
                <option value="Đang sinh hoạt Đảng">Đang sinh hoạt Đảng</option>
                <option value="Miễn sinh hoạt">Miễn sinh hoạt</option>
                <option value="Gián đoạn sinh hoạt">Gián đoạn sinh hoạt</option>
                <option value="Đình chỉ sinh hoạt">Đình chỉ sinh hoạt</option>
                <option value="Rời khỏi Đảng">Rời khỏi Đảng</option>
                <option value="Từ trần">Từ trần</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#8B1D1D] hover:bg-[#711717] text-white font-bold rounded-lg text-xs shadow"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Điều tên Đảng viên */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="Điều tên / Điều chỉnh tên Đảng viên"
      >
        <form onSubmit={handleSaveRename} className="space-y-4 text-xs">
          <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E5E1DA] space-y-1">
            <p className="text-[#7A7670] font-semibold">Tên hiện tại trong hồ sơ:</p>
            <p className="font-extrabold text-sm text-[#8B1D1D] uppercase">{renameMember?.fullName}</p>
            <p className="text-[11px] text-[#7A7670]">
              MSCB: <span className="font-mono font-bold text-gray-800">{renameMember?.staffCode}</span> • Số thẻ Đảng:{' '}
              <span className="font-mono font-bold text-gray-800">{renameMember?.partyCardNumber}</span>
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
            <p className="font-extrabold text-sm text-[#8B1D1D] uppercase pl-6">{deleteMember?.fullName}</p>
            <p className="text-[11px] text-gray-700 pl-6">
              MSCB: <span className="font-mono font-bold">{deleteMember?.staffCode}</span> • Thẻ Đảng:{' '}
              <span className="font-mono font-bold">{deleteMember?.partyCardNumber}</span>
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
    </div>
  );
};
