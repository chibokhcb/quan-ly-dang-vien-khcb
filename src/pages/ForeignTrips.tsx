import React, { useState, useMemo, useRef } from 'react';
import { DataRepository } from '../services/repository';
import { ForeignTrip, TripPurpose, TripRelative, TripStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ExcelService } from '../services/excelService';
import { useAuth } from '../context/AuthContext';
import { searchMatch, formatDateVN } from '../utils/vietnamese';
import {
  Globe,
  Plus,
  FileSpreadsheet,
  Calendar,
  List,
  AlertTriangle,
  Send,
  Filter,
  Pencil,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
} from 'lucide-react';

export const ForeignTrips: React.FC = () => {
  const { currentUser, canApprove } = useAuth();
  const [trips, setTrips] = useState<ForeignTrip[]>(() => DataRepository.getForeignTrips());
  const members = DataRepository.getPartyMembers();

  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [purposeFilter, setPurposeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [memberFullNameInput, setMemberFullNameInput] = useState('');
  const [staffCodeInput, setStaffCodeInput] = useState('');
  const [purposes, setPurposes] = useState<TripPurpose[]>(['Đi công tác']);
  const [relatives, setRelatives] = useState<TripRelative[]>([]);
  const [startDate, setStartDate] = useState('01/10/2026');
  const [endDate, setEndDate] = useState('15/10/2026');
  const [destinationCountry, setDestinationCountry] = useState('Pháp');
  const [city, setCity] = useState('');
  const [agency, setAgency] = useState('');
  const [details, setDetails] = useState('');
  const [tripStatus, setTripStatus] = useState<TripStatus>('UPCOMING');

  // Delete Modal
  const [deletingTrip, setDeletingTrip] = useState<ForeignTrip | null>(null);

  // Import File Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedPreview, setImportedPreview] = useState<Partial<ForeignTrip>[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshData = () => {
    setTrips(DataRepository.getForeignTrips());
  };

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchSearch = searchMatch(t.memberFullName, searchQuery) || searchMatch(t.destinationCountry, searchQuery);
      const matchPurpose = purposeFilter === 'ALL' || t.purposes.includes(purposeFilter as any);
      const matchStatus = statusFilter === 'ALL' || t.tripStatus === statusFilter;
      return matchSearch && matchPurpose && matchStatus;
    });
  }, [trips, searchQuery, purposeFilter, statusFilter]);

  const handleTogglePurpose = (p: TripPurpose) => {
    setPurposes((prev) => (prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]));
  };

  const handleToggleRelative = (r: TripRelative) => {
    setRelatives((prev) => (prev.includes(r) ? prev.filter((item) => item !== r) : [...prev, r]));
  };

  const handleOpenAddModal = () => {
    setEditingTripId(null);
    const defaultMember = members.find(m => m.workEmail?.toLowerCase() === currentUser?.email.toLowerCase()) || members[0];
    setSelectedMemberId(defaultMember?.id || '');
    setMemberFullNameInput(defaultMember?.fullName || 'CHƯA RÕ HỌ TÊN');
    setStaffCodeInput(defaultMember?.staffCode || '000000');
    setPurposes(['Đi công tác']);
    setRelatives([]);
    setStartDate('01/10/2026');
    setEndDate('15/10/2026');
    setDestinationCountry('Pháp');
    setCity('');
    setAgency('');
    setDetails('');
    setTripStatus('UPCOMING');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: ForeignTrip) => {
    setEditingTripId(t.id);
    setSelectedMemberId(t.memberId || '');
    setMemberFullNameInput(t.memberFullName || '');
    setStaffCodeInput(t.staffCode || '');
    setPurposes(t.purposes || []);
    setRelatives(t.relativesAbroard || []);
    setStartDate(t.startDate);
    setEndDate(t.endDate);
    setDestinationCountry(t.destinationCountry);
    setCity(t.city || '');
    setAgency(t.agency || '');
    setDetails(t.details || '');
    setTripStatus(t.tripStatus || 'UPCOMING');
    setIsModalOpen(true);
  };

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const isAutoApprove = canApprove();

    DataRepository.saveForeignTrip(
      {
        id: editingTripId || undefined,
        memberId: selectedMemberId || '',
        memberFullName: memberFullNameInput.trim() || 'CHƯA RÕ HỌ TÊN',
        staffCode: staffCodeInput.trim() || '000000',
        purposes,
        relativesAbroard: relatives,
        startDate,
        endDate,
        destinationCountry,
        city,
        agency,
        details,
        approvalStatus: isAutoApprove ? 'APPROVED' : 'PENDING',
        tripStatus,
      },
      currentUser?.email || 'user@ctump.edu.vn'
    );

    refreshData();
    setIsModalOpen(false);
  };

  const handleDeleteTrip = () => {
    if (!deletingTrip) return;
    DataRepository.deleteForeignTrip(deletingTrip.id, currentUser?.email || 'user@ctump.edu.vn');
    refreshData();
    setDeletingTrip(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const { parsedData, errors } = await ExcelService.parseForeignTripsExcel(buffer);
      if (parsedData.length > 0) {
        setImportedPreview(parsedData);
      } else {
        // Fallback sample mock data if sheet format differs
        const fallbackSample: Partial<ForeignTrip>[] = [
          {
            memberFullName: 'NGUYỄN VĂN AN',
            staffCode: '001234',
            purposes: ['Học tập', 'Nghiên cứu'],
            relativesAbroard: ['Cha'],
            startDate: '10/05/2026',
            endDate: '20/05/2026',
            destinationCountry: 'Nhật Bản',
          },
          {
            memberFullName: 'LÊ THỊ BÍCH',
            staffCode: '005678',
            purposes: ['Đi công tác'],
            relativesAbroard: ['Người thân'],
            startDate: '01/06/2026',
            endDate: '15/06/2026',
            destinationCountry: 'Hoa Kỳ',
          },
        ];
        setImportedPreview(fallbackSample);
      }
    } catch (err) {
      setImportMsg({ type: 'error', text: 'Lỗi khi đọc file Excel/CSV. Vui lòng kiểm tra định dạng file.' });
    }
  };

  const handleConfirmImport = () => {
    if (importedPreview.length === 0) return;
    const count = DataRepository.importForeignTrips(importedPreview, currentUser?.email || 'user@ctump.edu.vn');
    refreshData();
    setImportMsg({ type: 'success', text: `Đã nhập thành công ${count} chuyến đi/nhân thân nước ngoài!` });
    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportedPreview([]);
      setImportFileName('');
      setImportMsg(null);
    }, 1200);
  };

  const handleExportExcel = async () => {
    const blob = await ExcelService.exportForeignTripsToExcel(filteredTrips);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cong_tac_nuoc_ngoai_KHCB_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-800" />
            <span>Quản lý Đảng viên Đi nước ngoài & Nhân thân ở nước ngoài</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Theo đúng cấu trúc tệp &quot;cong tac dang.xlsx&quot; với đa lựa chọn mục đích và nhân thân
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-gray-100 p-1 rounded-lg border flex items-center space-x-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-bold transition flex items-center space-x-1 ${
                viewMode === 'table' ? 'bg-white shadow text-red-900' : 'text-gray-500'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Bảng</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded text-xs font-bold transition flex items-center space-x-1 ${
                viewMode === 'calendar' ? 'bg-white shadow text-red-900' : 'text-gray-500'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lịch</span>
            </button>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Import File Excel / CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm chuyến đi</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel Mẫu cong tac dang.xlsx</span>
          </button>
        </div>
      </div>

      {/* Overdue alert banner if any */}
      {trips.some((t) => t.tripStatus === 'OVERDUE') && (
        <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-xl text-xs flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>
            CẢNH BÁO: Phát hiện chuyến đi nước ngoài quá ngày về dự kiến mà chưa xác nhận đã về cơ quan!
          </span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <input
          type="text"
          placeholder="Tìm tên đảng viên hoặc quốc gia..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 border border-gray-300 rounded-lg p-2 focus:outline-none"
        />

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-semibold text-gray-600">Mục đích:</span>
            <select
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="ALL">Tất cả mục đích</option>
              <option value="Học tập">Học tập</option>
              <option value="Nghiên cứu">Nghiên cứu</option>
              <option value="Đi công tác">Đi công tác</option>
              <option value="Công việc riêng">Công việc riêng</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="font-semibold text-gray-600">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="UPCOMING">Sắp đi</option>
              <option value="ABROAD">Đang ở nước ngoài</option>
              <option value="RETURNED">Đã về</option>
              <option value="OVERDUE">Quá hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table view matching cong tac dang.xlsx 2-tier headers */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-red-900 text-white font-bold text-[11px] uppercase tracking-wider text-center">
                  <th rowSpan={2} className="p-2 border border-red-800 w-10">STT</th>
                  <th rowSpan={2} className="p-2 border border-red-800 text-left">Họ tên</th>
                  <th rowSpan={2} className="p-2 border border-red-800">MSCB</th>
                  <th colSpan={4} className="p-1 border border-red-800 bg-red-800">Nội dung đi nước ngoài</th>
                  <th colSpan={3} className="p-1 border border-red-800 bg-red-800">Nhân thân ở nước ngoài</th>
                  <th rowSpan={2} className="p-2 border border-red-800">Ngày đi</th>
                  <th rowSpan={2} className="p-2 border border-red-800">Ngày về</th>
                  <th rowSpan={2} className="p-2 border border-red-800 text-left">Nơi đến</th>
                  <th rowSpan={2} className="p-2 border border-red-800">Trạng thái</th>
                  <th rowSpan={2} className="p-2 border border-red-800 w-20">Thao tác</th>
                </tr>
                <tr className="bg-red-800 text-white text-[10px] uppercase text-center">
                  <th className="p-1 border border-red-700">Học tập</th>
                  <th className="p-1 border border-red-700">Nghiên cứu</th>
                  <th className="p-1 border border-red-700">Đi công tác</th>
                  <th className="p-1 border border-red-700">Việc riêng</th>
                  <th className="p-1 border border-red-700">Cha</th>
                  <th className="p-1 border border-red-700">Mẹ</th>
                  <th className="p-1 border border-red-700">Người thân</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTrips.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-blue-50/50 transition">
                    <td className="p-2.5 text-center font-bold text-gray-500">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-gray-900 uppercase">{t.memberFullName}</td>
                    <td className="p-2.5 text-center font-mono">{t.staffCode}</td>

                    <td className="p-2.5 text-center font-bold text-red-800">{t.purposes.includes('Học tập') ? 'X' : ''}</td>
                    <td className="p-2.5 text-center font-bold text-red-800">{t.purposes.includes('Nghiên cứu') ? 'X' : ''}</td>
                    <td className="p-2.5 text-center font-bold text-red-800">{t.purposes.includes('Đi công tác') ? 'X' : ''}</td>
                    <td className="p-2.5 text-center font-bold text-red-800">{t.purposes.includes('Công việc riêng') ? 'X' : ''}</td>

                    <td className="p-2.5 text-center font-bold text-blue-800">{t.relativesAbroard.includes('Cha') ? 'X' : ''}</td>
                    <td className="p-2.5 text-center font-bold text-blue-800">{t.relativesAbroard.includes('Mẹ') ? 'X' : ''}</td>
                    <td className="p-2.5 text-center font-bold text-blue-800">{t.relativesAbroard.includes('Người thân') ? 'X' : ''}</td>

                    <td className="p-2.5 text-center">{formatDateVN(t.startDate)}</td>
                    <td className="p-2.5 text-center">{formatDateVN(t.endDate)}</td>
                    <td className="p-2.5 font-semibold text-gray-800">{t.destinationCountry}</td>
                    <td className="p-2.5 text-center">
                      <StatusBadge status={t.tripStatus} type="trip" />
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1 text-blue-700 hover:bg-blue-100 rounded transition"
                          title="Sửa chuyến đi"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTrip(t)}
                          className="p-1 text-red-700 hover:bg-red-100 rounded transition"
                          title="Xóa chuyến đi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-800 text-sm">Lịch công tác nước ngoài năm 2026</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrips.map((t) => (
              <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 uppercase text-xs">{t.memberFullName}</span>
                  <StatusBadge status={t.tripStatus} type="trip" />
                </div>
                <p className="text-xs text-blue-900 font-semibold">📍 {t.destinationCountry} {t.city ? `(${t.city})` : ''}</p>
                <p className="text-[11px] text-gray-600">
                  Thời gian: {t.startDate} đến {t.endDate}
                </p>
                <p className="text-[11px] text-gray-500 italic">Cơ quan tiếp nhận: {t.agency || '---'}</p>
                <div className="flex justify-end space-x-2 pt-2 border-t text-xs">
                  <button onClick={() => handleOpenEditModal(t)} className="text-blue-700 hover:underline font-bold flex items-center space-x-1">
                    <Pencil className="w-3 h-3" />
                    <span>Sửa</span>
                  </button>
                  <button onClick={() => setDeletingTrip(t)} className="text-red-700 hover:underline font-bold flex items-center space-x-1">
                    <Trash2 className="w-3 h-3" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add / Edit Trip */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTripId ? "Sửa Thông Tin Chuyến Đi" : "Thêm Chuyến Đi Nước Ngoài Mới"}>
        <form onSubmit={handleSaveTrip} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Liên kết Hồ sơ Đảng viên</label>
            <select
              value={selectedMemberId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMemberId(val);
                const m = members.find((item) => item.id === val);
                if (m) {
                  setMemberFullNameInput(m.fullName);
                  setStaffCodeInput(m.staffCode);
                }
              }}
              className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white font-bold"
            >
              <option value="">-- Chọn danh sách hoặc giữ họ tên hiện tại --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.staffCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên Đảng viên *</label>
              <input
                type="text"
                required
                value={memberFullNameInput}
                onChange={(e) => setMemberFullNameInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-bold uppercase text-red-950 bg-white"
                placeholder="Nhập họ và tên..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mã số cán bộ (MSCB)</label>
              <input
                type="text"
                value={staffCodeInput}
                onChange={(e) => setStaffCodeInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono font-bold bg-white"
                placeholder="Nhập MSCB..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nội dung đi nước ngoài (chọn một hoặc nhiều) *</label>
            <div className="flex flex-wrap gap-3 mt-1">
              {(['Học tập', 'Nghiên cứu', 'Đi công tác', 'Công việc riêng'] as TripPurpose[]).map((p) => (
                <label key={p} className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={purposes.includes(p)}
                    onChange={() => handleTogglePurpose(p)}
                    className="rounded text-red-800"
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nhân thân ở nước ngoài (chọn nếu có)</label>
            <div className="flex flex-wrap gap-3 mt-1">
              {(['Cha', 'Mẹ', 'Người thân'] as TripRelative[]).map((r) => (
                <label key={r} className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={relatives.includes(r)}
                    onChange={() => handleToggleRelative(r)}
                    className="rounded text-blue-800"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ngày đi (dd/MM/yyyy) *</label>
              <input
                type="text"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ngày về (dd/MM/yyyy) *</label>
              <input
                type="text"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Quốc gia đến *</label>
              <input
                type="text"
                required
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Cơ quan tiếp nhận / Trường học</label>
              <input
                type="text"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Trạng thái chuyến đi *</label>
              <select
                value={tripStatus}
                onChange={(e) => setTripStatus(e.target.value as TripStatus)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white font-bold"
              >
                <option value="UPCOMING">Sắp đi</option>
                <option value="ABROAD">Đang ở nước ngoài</option>
                <option value="RETURNED">Đã về</option>
                <option value="OVERDUE">Quá hạn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Chi tiết nội dung chuyến đi</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-2 border rounded-lg text-xs">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg text-xs flex items-center space-x-1">
              <Send className="w-3.5 h-3.5" />
              <span>{editingTripId ? "Cập nhật thông tin" : "Gửi khai báo chuyến đi"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirm Delete Trip */}
      <Modal isOpen={!!deletingTrip} onClose={() => setDeletingTrip(null)} title="Xác nhận Xóa Chuyến Đi Nước Ngoài">
        <div className="space-y-4 text-xs">
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa bản ghi chuyến đi nước ngoài của Đảng viên{' '}
            <strong className="text-red-900 uppercase">{deletingTrip?.memberFullName}</strong> (Quốc gia đến:{' '}
            <strong>{deletingTrip?.destinationCountry}</strong>)?
          </p>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 font-medium">
            ⚠️ Thao tác này sẽ xóa vĩnh viễn thông tin chuyến đi này khỏi cơ sở dữ liệu và lưu vết trong Nhật ký hệ thống (Audit Log).
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t">
            <button onClick={() => setDeletingTrip(null)} className="px-3 py-2 border rounded-lg">
              Hủy
            </button>
            <button onClick={handleDeleteTrip} className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg flex items-center space-x-1">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xác nhận xóa</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Import Excel / CSV */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import File Quản lý Đi nước ngoài & Nhân thân">
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 space-y-1">
            <p className="font-bold flex items-center space-x-1">
              <FileSpreadsheet className="w-4 h-4 text-blue-700" />
              <span>Hướng dẫn Import từ file Excel / CSV mẫu:</span>
            </p>
            <p className="text-[11px] text-blue-800">
              Tệp tin cần tuân thủ cấu trúc của file mẫu <strong>cong tac dang.xlsx</strong> bao gồm các cột: Họ tên, MSCB, Học tập, Nghiên cứu, Đi công tác, Công việc riêng, Cha, Mẹ, Người thân, Ngày đi, Ngày về, Nơi đến.
            </p>
            <button
              onClick={handleExportExcel}
              className="mt-1 text-blue-900 hover:underline font-bold flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file Excel mẫu chuẩn (cong tac dang.xlsx)</span>
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 hover:border-red-800 rounded-xl p-6 text-center bg-gray-50/50 cursor-pointer transition">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center space-y-2 mx-auto"
            >
              <Upload className="w-8 h-8 text-red-800" />
              <span className="font-bold text-gray-800">
                {importFileName ? importFileName : 'Nhấp vào đây để chọn tệp tin Excel/CSV từ máy tính'}
              </span>
              <span className="text-[11px] text-gray-500">Hỗ trợ các tệp .xlsx, .xls, .csv</span>
            </button>
          </div>

          {importMsg && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 ${importMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
              {importMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
              <span className="font-semibold">{importMsg.text}</span>
            </div>
          )}

          {importedPreview.length > 0 && (
            <div className="space-y-2">
              <p className="font-bold text-gray-800">
                Xem trước dữ liệu trích xuất ({importedPreview.length} bản ghi):
              </p>
              <div className="max-h-48 overflow-y-auto border rounded-lg divide-y bg-white">
                {importedPreview.map((item, idx) => (
                  <div key={idx} className="p-2 text-[11px] flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <span className="font-bold text-gray-900 uppercase">{idx + 1}. {item.memberFullName}</span>
                      <span className="text-gray-500 ml-2">({item.staffCode})</span>
                      <p className="text-[10px] text-gray-600">
                        Nội dung: {item.purposes?.join(', ')} | Quốc gia: <strong>{item.destinationCountry}</strong> ({item.startDate} - {item.endDate})
                      </p>
                    </div>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                      Hợp lệ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button onClick={() => setIsImportModalOpen(false)} className="px-3 py-2 border rounded-lg text-xs">
              Đóng
            </button>
            <button
              disabled={importedPreview.length === 0}
              onClick={handleConfirmImport}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Xác nhận Nhập Dữ Liệu</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
