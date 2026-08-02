import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MeetingAbsenceRequest,
  MeetingAbsenceStatus,
  AbsenceReason,
  PartyMember,
} from '../types';
import { DataRepository } from '../services/repository';
import { PartyLogo } from '../components/common/PartyLogo';
import { Modal } from '../components/common/Modal';
import {
  CalendarOff,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Upload,
  UserCheck,
  Search,
  Filter,
  BarChart3,
  Calendar,
  AlertCircle,
  Download,
  Trash2,
  Check,
  X,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';

export const MeetingAbsences: React.FC = () => {
  const { currentUser, canApprove, canDelete } = useAuth();
  const isAdmin = canApprove();

  // Active Tab: 'my_list' (or 'all_list' for admin), 'pending_approvals', 'statistics'
  const [activeTab, setActiveTab] = useState<'list' | 'approvals' | 'statistics'>(
    isAdmin ? 'approvals' : 'list'
  );

  const [requests, setRequests] = useState<MeetingAbsenceRequest[]>([]);
  const [members, setMembers] = useState<PartyMember[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');
  const [meetingPeriodFilter, setMeetingPeriodFilter] = useState<string>('ALL');

  // Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MeetingAbsenceRequest | null>(null);

  // Form State for Request Submission
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberFullName, setMemberFullName] = useState('');
  const [staffCode, setStaffCode] = useState('');
  const [partyCardNumber, setPartyCardNumber] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [meetingPeriod, setMeetingPeriod] = useState('Kỳ họp Chi bộ tháng 08/2026');
  const [customMeetingPeriod, setCustomMeetingPeriod] = useState('');
  const [meetingDate, setMeetingDate] = useState('15/08/2026');
  const [reason, setReason] = useState<AbsenceReason>('Đi công tác');
  const [reasonDetail, setReasonDetail] = useState('');
  const [notes, setNotes] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; url: string; size?: number; type?: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Form State for Review / Approval
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewNotes, setReviewNotes] = useState('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = () => {
    const allMembers = DataRepository.getPartyMembers();
    setMembers(allMembers);

    let allReqs: MeetingAbsenceRequest[] = [];
    if (isAdmin) {
      allReqs = DataRepository.getAbsenceRequests();
    } else if (currentUser?.email) {
      allReqs = DataRepository.getAbsenceRequestsByMember(currentUser.email);
    }
    setRequests(allReqs);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Create Modal
  const handleOpenSubmitModal = () => {
    // Find current user's profile in members list or default
    const matched = members.find((m) => m.workEmail?.toLowerCase() === currentUser?.email?.toLowerCase());
    const defaultMember = matched || members[0];

    setSelectedMemberId(defaultMember?.id || '');
    setMemberFullName(defaultMember?.fullName || (currentUser?.email ? currentUser.email.split('@')[0].toUpperCase() : 'ĐẢNG VIÊN'));
    setStaffCode(defaultMember?.staffCode || '000000');
    setPartyCardNumber(defaultMember?.partyCardNumber || '');
    setMemberEmail(defaultMember?.workEmail || currentUser?.email || 'chibokhcb@ctump.edu.vn');
    setMeetingPeriod('Kỳ họp Chi bộ tháng 08/2026');
    setCustomMeetingPeriod('');
    setMeetingDate('15/08/2026');
    setReason('Đi công tác');
    setReasonDetail('');
    setNotes('');
    setAttachedFiles([]);
    setIsSubmitModalOpen(true);
  };

  // Handle Member Select change
  const handleMemberSelect = (mId: string) => {
    setSelectedMemberId(mId);
    const m = members.find((item) => item.id === mId);
    if (m) {
      setMemberFullName(m.fullName);
      setStaffCode(m.staffCode);
      setPartyCardNumber(m.partyCardNumber || '');
      setMemberEmail(m.workEmail || currentUser?.email || 'chibokhcb@ctump.edu.vn');
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const resultUrl = reader.result as string;
      const newFile = {
        name: file.name,
        url: resultUrl,
        size: file.size,
        type: file.type,
      };
      setAttachedFiles((prev) => [...prev, newFile]);
      setIsUploading(false);
      showToast(`Đã tải lên tệp: ${file.name}`);
    };

    reader.onerror = () => {
      setIsUploading(false);
      alert('Không thể đọc file. Vui lòng thử lại.');
    };

    reader.readAsDataURL(file);
  };

  // Submit Request
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFullName.trim()) {
      alert('Vui lòng điền họ và tên.');
      return;
    }

    const finalPeriod = meetingPeriod === 'Khác' ? customMeetingPeriod.trim() : meetingPeriod;
    if (!finalPeriod) {
      alert('Vui lòng chọn hoặc nhập kỳ họp.');
      return;
    }

    const actorEmail = currentUser?.email || 'chibokhcb@ctump.edu.vn';

    DataRepository.saveAbsenceRequest(
      {
        memberId: selectedMemberId,
        memberFullName: memberFullName.toUpperCase(),
        staffCode: staffCode || '000000',
        partyCardNumber,
        memberEmail: memberEmail || actorEmail,
        meetingPeriod: finalPeriod,
        meetingDate,
        reason,
        reasonDetail,
        notes,
        attachedFiles,
        status: 'PENDING',
      },
      actorEmail
    );

    setIsSubmitModalOpen(false);
    loadData();
    showToast('Đã gửi đơn xin vắng họp thành công! Đang chờ Ban Chi ủy phê duyệt.');
  };

  // Open Review Modal
  const handleOpenReviewModal = (req: MeetingAbsenceRequest, initialStatus: 'APPROVED' | 'REJECTED') => {
    setSelectedRequest(req);
    setReviewStatus(initialStatus);
    setReviewNotes(initialStatus === 'APPROVED' ? 'Đồng ý duyệt cho vắng mặt.' : 'Lý do chưa phù hợp.');
    setIsReviewModalOpen(true);
  };

  // Handle Approve / Reject
  const handleConfirmReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    // Determine reviewer role based on user email / role
    let reviewerRole = 'Chi ủy viên Chi bộ';
    const cleanEmail = currentUser?.email?.toLowerCase() || '';

    if (cleanEmail === 'ntttram@ctump.edu.vn' || cleanEmail === 'chibokhcb@ctump.edu.vn') {
      reviewerRole = 'Bí thư Chi bộ';
    } else if (cleanEmail === 'nthung@ctump.edu.vn') {
      reviewerRole = 'Phó Bí thư Chi bộ';
    } else if (cleanEmail === 'letran@ctump.edu.vn') {
      reviewerRole = 'Chi ủy viên';
    }

    const reviewerName =
      members.find((m) => m.workEmail?.toLowerCase() === cleanEmail)?.fullName ||
      currentUser?.email?.split('@')[0].toUpperCase() ||
      'BAN CHI ỦY';

    DataRepository.reviewAbsenceRequest(
      selectedRequest.id,
      reviewStatus,
      reviewNotes,
      {
        uid: currentUser?.uid,
        email: cleanEmail,
        name: reviewerName,
        role: reviewerRole,
      }
    );

    setIsReviewModalOpen(false);
    loadData();
    showToast(
      reviewStatus === 'APPROVED'
        ? `Đã phê duyệt đơn vắng họp của ${selectedRequest.memberFullName}`
        : `Đã từ chối đơn vắng họp của ${selectedRequest.memberFullName}`
    );
  };

  // Delete Request
  const handleDeleteRequest = (id: string) => {
    if (!canDelete()) return;
    if (confirm('Bạn có chắc chắn muốn xóa đơn xin vắng họp này không?')) {
      DataRepository.deleteAbsenceRequest(id, currentUser?.email || 'chibokhcb@ctump.edu.vn');
      loadData();
      showToast('Đã xóa đơn xin vắng họp.');
    }
  };

  // Filtered requests list
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.memberFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.meetingPeriod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.staffCode.includes(searchQuery) ||
      (r.reasonDetail && r.reasonDetail.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesReason = reasonFilter === 'ALL' || r.reason === reasonFilter;
    const matchesPeriod = meetingPeriodFilter === 'ALL' || r.meetingPeriod === meetingPeriodFilter;

    return matchesSearch && matchesStatus && matchesReason && matchesPeriod;
  });

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const approvedRequests = requests.filter((r) => r.status === 'APPROVED');
  const rejectedRequests = requests.filter((r) => r.status === 'REJECTED');

  // Meeting Period Options for filter
  const meetingPeriodsList = Array.from(new Set(requests.map((r) => r.meetingPeriod)));

  // --- STATISTICS CALCULATIONS ---
  const totalRequestsCount = requests.length;
  const approvedCount = approvedRequests.length;
  const pendingCount = pendingRequests.length;
  const rejectedCount = rejectedRequests.length;

  // Member absence statistics table
  const memberAbsenceMap = new Map<
    string,
    {
      fullName: string;
      staffCode: string;
      email: string;
      totalAbsences: number;
      approvedAbsences: number;
      pendingAbsences: number;
      rejectedAbsences: number;
      reasons: Record<string, number>;
      latestMeeting: string;
    }
  >();

  requests.forEach((r) => {
    const key = r.memberFullName;
    const existing = memberAbsenceMap.get(key) || {
      fullName: r.memberFullName,
      staffCode: r.staffCode,
      email: r.memberEmail,
      totalAbsences: 0,
      approvedAbsences: 0,
      pendingAbsences: 0,
      rejectedAbsences: 0,
      reasons: {},
      latestMeeting: r.meetingPeriod,
    };

    existing.totalAbsences += 1;
    if (r.status === 'APPROVED') existing.approvedAbsences += 1;
    if (r.status === 'PENDING') existing.pendingAbsences += 1;
    if (r.status === 'REJECTED') existing.rejectedAbsences += 1;

    existing.reasons[r.reason] = (existing.reasons[r.reason] || 0) + 1;
    existing.latestMeeting = r.meetingPeriod;

    memberAbsenceMap.set(key, existing);
  });

  const memberAbsenceList = Array.from(memberAbsenceMap.values()).sort(
    (a, b) => b.approvedAbsences - a.approvedAbsences || b.totalAbsences - a.totalAbsences
  );

  // Reasons Breakdown
  const reasonBreakdown: Record<string, number> = {
    'Đi công tác': 0,
    'Bệnh / Sức khỏe': 0,
    'Việc gia đình / Việc riêng': 0,
    'Lý do khác': 0,
  };
  requests.forEach((r) => {
    reasonBreakdown[r.reason] = (reasonBreakdown[r.reason] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-emerald-700 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-red-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <PartyLogo className="w-12 h-12 shrink-0 drop-shadow-md" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full">
                CHI BỘ KHOA HỌC CƠ BẢN
              </span>
              {pendingCount > 0 && isAdmin && (
                <span className="bg-amber-500 text-red-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                  {pendingCount} ĐƠN CHỜ DUYỆT
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1">
              Quản Lý Xin Vắng Họp Chi Bộ
            </h1>
            <p className="text-xs text-red-100/90 mt-0.5">
              Gửi đơn, xét duyệt tập trung (1 người duyệt), theo dõi trạng thái &amp; thống kê chi tiết
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
          <button
            onClick={handleOpenSubmitModal}
            className="inline-flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-red-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo đơn xin vắng họp</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-1.5 shadow-2xs flex flex-wrap gap-1">
        {isAdmin && (
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'approvals'
                ? 'bg-red-900 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Duyệt xin vắng ({pendingCount})</span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-red-950 text-[10px] font-black rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'list'
              ? 'bg-red-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isAdmin ? 'Toàn bộ danh sách đơn' : 'Đơn xin vắng của tôi'}</span>
          <span className="text-[10px] opacity-80">({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'statistics'
              ? 'bg-red-900 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Thống kê vắng họp cụ thể</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Tổng số đơn</p>
            <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1">{totalRequestsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <CalendarOff className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-amber-800 uppercase tracking-wider">Chờ duyệt</p>
            <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider">Đã duyệt</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{approvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-red-800 uppercase tracking-wider">Từ chối</p>
            <p className="text-xl sm:text-2xl font-black text-red-600 mt-1">{rejectedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Rules Banner */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-start space-x-3 shadow-2xs">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">Quy định Phê duyệt Vắng họp Chi bộ:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-gray-800">
            <li>
              <strong>Thẩm quyền duyệt:</strong> Bí thư Chi bộ, Phó Bí thư Chi bộ, hoặc Chi ủy viên Chi bộ.
            </li>
            <li>
              <strong>Cơ chế 1 người duyệt:</strong> Chỉ cần một trong ba người thuộc Ban Chi ủy bấm “Phê duyệt”, đơn xin vắng họp sẽ ngay lập tức chuyển sang trạng thái <strong>“Đã duyệt”</strong> (không đòi hỏi các chi ủy viên khác duyệt lại).
            </li>
            <li>
              <strong>Minh bạch thông tin:</strong> Đơn sau khi duyệt sẽ hiển thị rõ Họ tên người duyệt, Vai trò (Bí thư/Phó Bí thư/Chi ủy viên), Thời gian duyệt và Ghi chú.
            </li>
          </ul>
        </div>
      </div>

      {/* TAB 1: LIST / TAB 2: APPROVALS */}
      {(activeTab === 'list' || activeTab === 'approvals') && (
        <div className="space-y-4">
          {/* Search & Filter Controls */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên Đảng viên, kỳ họp, MSCB..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs bg-gray-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-red-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-700">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span>Trạng thái:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg p-1.5 text-xs bg-white font-medium"
              >
                <option value="ALL">-- Tất cả trạng thái --</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>

              <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 ml-2">
                <span>Lý do:</span>
              </div>
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="border border-gray-300 rounded-lg p-1.5 text-xs bg-white font-medium"
              >
                <option value="ALL">-- Tất cả lý do --</option>
                <option value="Đi công tác">Đi công tác</option>
                <option value="Bệnh / Sức khỏe">Bệnh / Sức khỏe</option>
                <option value="Việc gia đình / Việc riêng">Việc gia đình / Việc riêng</option>
                <option value="Lý do khác">Lý do khác</option>
              </select>

              {meetingPeriodsList.length > 0 && (
                <select
                  value={meetingPeriodFilter}
                  onChange={(e) => setMeetingPeriodFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg p-1.5 text-xs bg-white font-medium max-w-[180px] truncate"
                >
                  <option value="ALL">-- Tất cả kỳ họp --</option>
                  {meetingPeriodsList.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Table of Absence Requests */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-800">
                <thead className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-[11px] text-gray-700 tracking-wider">
                  <tr>
                    <th className="p-3 text-center w-12">STT</th>
                    <th className="p-3">Đảng viên xin vắng</th>
                    <th className="p-3">Kỳ họp &amp; Ngày họp</th>
                    <th className="p-3">Lý do xin vắng</th>
                    <th className="p-3 text-center">Tài liệu kèm</th>
                    <th className="p-3 text-center">Trạng thái</th>
                    <th className="p-3">Thông tin duyệt</th>
                    <th className="p-3 text-center w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        <CalendarOff className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="font-bold text-sm">Chưa có đơn xin vắng họp nào</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Bấm nút “Tạo đơn xin vắng họp” phía trên để gửi đơn mới.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests
                      .filter((r) => (activeTab === 'approvals' ? r.status === 'PENDING' : true))
                      .map((r, idx) => (
                        <tr key={r.id} className="hover:bg-amber-50/30 transition">
                          <td className="p-3 text-center font-bold text-gray-500">{idx + 1}</td>
                          <td className="p-3">
                            <p className="font-bold text-red-950 uppercase">{r.memberFullName}</p>
                            <p className="text-[11px] font-mono text-gray-500">MSCB: {r.staffCode}</p>
                            {r.partyCardNumber && (
                              <p className="text-[10px] text-gray-400">Thẻ ĐV: {r.partyCardNumber}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-gray-900">{r.meetingPeriod}</p>
                            <div className="flex items-center space-x-1 text-[11px] text-gray-600 mt-0.5">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{r.meetingDate}</span>
                            </div>
                          </td>
                          <td className="p-3 max-w-[200px]">
                            <span className="inline-block bg-gray-100 border border-gray-200 text-gray-800 font-bold px-2 py-0.5 rounded text-[11px]">
                              {r.reason}
                            </span>
                            {r.reasonDetail && (
                              <p className="text-[11px] text-gray-600 truncate mt-1" title={r.reasonDetail}>
                                {r.reasonDetail}
                              </p>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {r.attachedFiles && r.attachedFiles.length > 0 ? (
                              <a
                                href={r.attachedFiles[0].url}
                                download={r.attachedFiles[0].name}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 text-xs text-blue-700 hover:underline font-bold"
                                title={r.attachedFiles[0].name}
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                                <span>Xem tệp</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-gray-400">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {r.status === 'PENDING' && (
                              <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full text-[11px]">
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>Chờ duyệt</span>
                              </span>
                            )}
                            {r.status === 'APPROVED' && (
                              <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-full text-[11px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                <span>Đã duyệt</span>
                              </span>
                            )}
                            {r.status === 'REJECTED' && (
                              <span className="inline-flex items-center space-x-1 bg-red-100 text-red-900 border border-red-300 font-bold px-2 py-0.5 rounded-full text-[11px]">
                                <XCircle className="w-3 h-3 text-red-700" />
                                <span>Từ chối</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {r.status !== 'PENDING' ? (
                              <div className="space-y-0.5 text-[11px]">
                                <p className="font-bold text-gray-900">
                                  {r.reviewedByName || 'Người duyệt'}{' '}
                                  <span className="font-normal text-gray-500">
                                    ({r.reviewedByRole || 'Chi ủy'})
                                  </span>
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  Lúc:{' '}
                                  {r.reviewedAt
                                    ? new Date(r.reviewedAt).toLocaleString('vi-VN')
                                    : 'N/A'}
                                </p>
                                {r.reviewNotes && (
                                  <p className="text-[11px] italic text-gray-700 bg-gray-50 p-1 rounded border border-gray-100">
                                    “{r.reviewNotes}”
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">Chưa có phê duyệt</span>
                            )}
                          </td>
                          <td className="p-3 text-center space-y-1">
                            {isAdmin && r.status === 'PENDING' && (
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => handleOpenReviewModal(r, 'APPROVED')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 rounded-lg text-xs transition shadow-2xs"
                                  title="Duyệt đơn này"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenReviewModal(r, 'REJECTED')}
                                  className="bg-red-600 hover:bg-red-700 text-white font-bold p-1.5 rounded-lg text-xs transition shadow-2xs"
                                  title="Từ chối đơn này"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-center space-x-2 pt-1">
                              <button
                                onClick={() => {
                                  setSelectedRequest(r);
                                  setIsDetailModalOpen(true);
                                }}
                                className="text-blue-700 hover:text-blue-900 font-bold text-[11px]"
                              >
                                Chi tiết
                              </button>
                              {canDelete() && (
                                <button
                                  onClick={() => handleDeleteRequest(r.id)}
                                  className="text-red-600 hover:text-red-800 p-0.5"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DETAILED STATISTICS */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          {/* Header & Export Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-gray-900 uppercase">
                Thống Kê Chi Tiết Vắng Họp Chi Bộ
              </h2>
              <p className="text-xs text-gray-500">
                Tổng hợp tình hình vắng họp, lý do vắng và tần suất vắng theo từng Đảng viên
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-lg text-xs border border-gray-300 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In báo cáo</span>
              </button>
            </div>
          </div>

          {/* Reason Distribution Bars */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">
              Phân Phối Theo Lý Do Xin Vắng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(reasonBreakdown).map(([rName, count]) => {
                const percentage = totalRequestsCount > 0 ? Math.round((count / totalRequestsCount) * 100) : 0;
                return (
                  <div key={rName} className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-700">{rName}</p>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-xl font-black text-red-950">{count} lượt</span>
                      <span className="text-xs font-bold text-gray-500">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-red-800 h-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Member Absence Leaderboard Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase">
                Bảng Thống Kê Vắng Họp Theo Từng Đảng Viên
              </h3>
              <span className="text-xs font-semibold text-gray-500">
                Tổng số {memberAbsenceList.length} Đảng viên có lượt xin vắng
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-800">
                <thead className="bg-gray-100 border-b border-gray-200 font-bold uppercase text-[11px] text-gray-700">
                  <tr>
                    <th className="p-3 text-center w-12">STT</th>
                    <th className="p-3">Họ và tên Đảng viên</th>
                    <th className="p-3 text-center">MSCB</th>
                    <th className="p-3 text-center">Tổng lượt xin vắng</th>
                    <th className="p-3 text-center">Đã duyệt</th>
                    <th className="p-3 text-center">Chờ duyệt</th>
                    <th className="p-3 text-center">Từ chối</th>
                    <th className="p-3">Lý do chính</th>
                    <th className="p-3">Kỳ họp gần nhất xin vắng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {memberAbsenceList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-gray-500">
                        Chưa có dữ liệu thống kê vắng họp.
                      </td>
                    </tr>
                  ) : (
                    memberAbsenceList.map((m, idx) => {
                      const topReason = Object.entries(m.reasons).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
                      return (
                        <tr key={m.fullName} className="hover:bg-amber-50/30 transition">
                          <td className="p-3 text-center font-bold text-gray-500">{idx + 1}</td>
                          <td className="p-3">
                            <p className="font-bold text-red-950 uppercase">{m.fullName}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{m.email}</p>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-gray-700">{m.staffCode}</td>
                          <td className="p-3 text-center font-black text-gray-900">{m.totalAbsences}</td>
                          <td className="p-3 text-center">
                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              {m.approvedAbsences}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              {m.pendingAbsences}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                              {m.rejectedAbsences}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-gray-800">{topReason}</td>
                          <td className="p-3 text-gray-600 italic">{m.latestMeeting}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Submit Absence Request */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Nộp Đơn Xin Vắng Họp Chi Bộ"
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Chọn Hồ sơ Đảng viên *
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => handleMemberSelect(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white font-bold"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} (MSCB: {m.staffCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên *</label>
              <input
                type="text"
                required
                value={memberFullName}
                onChange={(e) => setMemberFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-bold uppercase text-red-950 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mã số cán bộ (MSCB)
              </label>
              <input
                type="text"
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono font-bold bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mã số thẻ Đảng viên</label>
              <input
                type="text"
                value={partyCardNumber}
                onChange={(e) => setPartyCardNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono bg-white"
                placeholder="VD: 370001002001"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email hệ thống</label>
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Kỳ họp Chi bộ xin vắng *
              </label>
              <select
                value={meetingPeriod}
                onChange={(e) => setMeetingPeriod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-bold bg-white"
              >
                <option value="Kỳ họp Chi bộ tháng 08/2026">Kỳ họp Chi bộ tháng 08/2026</option>
                <option value="Kỳ họp Chi bộ tháng 09/2026">Kỳ họp Chi bộ tháng 09/2026</option>
                <option value="Kỳ họp Chi bộ chuyên đề quý III/2026">Kỳ họp Chi bộ chuyên đề quý III/2026</option>
                <option value="Kỳ họp Chi bộ chuyên đề quý IV/2026">Kỳ họp Chi bộ chuyên đề quý IV/2026</option>
                <option value="Khác">Kỳ họp khác (Tự nhập)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ngày họp *</label>
              <input
                type="text"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs font-medium bg-white"
                placeholder="dd/MM/yyyy"
              />
            </div>
          </div>

          {meetingPeriod === 'Khác' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nhập tên Kỳ họp cụ thể *
              </label>
              <input
                type="text"
                required
                value={customMeetingPeriod}
                onChange={(e) => setCustomMeetingPeriod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white"
                placeholder="VD: Họp Chi bộ mở rộng tháng 10/2026"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Lý do xin vắng họp *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as AbsenceReason)}
              className="w-full border border-gray-300 rounded-lg p-2 text-xs font-bold bg-white"
            >
              <option value="Đi công tác">Đi công tác</option>
              <option value="Bệnh / Sức khỏe">Bệnh / Lý do sức khỏe</option>
              <option value="Việc gia đình / Việc riêng">Việc gia đình / Việc riêng</option>
              <option value="Lý do khác">Lý do khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Diễn giải chi tiết lý do
            </label>
            <textarea
              rows={2}
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white"
              placeholder="VD: Tham gia đoàn công tác của Đại học Y Dược Cần Thơ tại Hà Nội từ ngày 14/08 đến 18/08/2026..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Ghi chú thêm (nếu có)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white"
              placeholder="Ghi chú thêm cho Ban Chi ủy..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Upload Đơn xin vắng / Tài liệu minh chứng (PDF, DOCX, Ảnh)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <label className="cursor-pointer font-bold text-xs text-red-900 hover:underline">
                <span>Chọn tệp đính kèm từ máy tính</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-gray-400 mt-1">Chấp nhận định dạng: PDF, DOCX, PNG, JPG (Dưới 10MB)</p>
            </div>

            {isUploading && (
              <p className="text-xs text-amber-700 font-bold mt-2 animate-pulse">
                Đang xử lý tài liệu đính kèm...
              </p>
            )}

            {attachedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs border border-gray-200"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold truncate">{f.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-red-900 hover:bg-red-800 rounded-lg shadow-md transition"
            >
              Gửi Đơn Xin Vắng
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Review / Approval Action */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={reviewStatus === 'APPROVED' ? 'Phê Duyệt Đơn Xin Vắng Họp' : 'Từ Chối Đơn Xin Vắng Họp'}
      >
        {selectedRequest && (
          <form onSubmit={handleConfirmReview} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
              <p>
                <strong>Đảng viên:</strong>{' '}
                <span className="text-red-950 font-bold uppercase">{selectedRequest.memberFullName}</span>{' '}
                (MSCB: {selectedRequest.staffCode})
              </p>
              <p>
                <strong>Kỳ họp:</strong> {selectedRequest.meetingPeriod} ({selectedRequest.meetingDate})
              </p>
              <p>
                <strong>Lý do:</strong>{' '}
                <span className="font-bold text-gray-800">{selectedRequest.reason}</span>
              </p>
              {selectedRequest.reasonDetail && (
                <p>
                  <strong>Diễn giải:</strong> {selectedRequest.reasonDetail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Quyết định phê duyệt *
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center space-x-2 text-xs font-bold cursor-pointer text-emerald-800">
                  <input
                    type="radio"
                    name="reviewStatus"
                    checked={reviewStatus === 'APPROVED'}
                    onChange={() => setReviewStatus('APPROVED')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Đồng ý phê duyệt (Đã duyệt)</span>
                </label>
                <label className="inline-flex items-center space-x-2 text-xs font-bold cursor-pointer text-red-800">
                  <input
                    type="radio"
                    name="reviewStatus"
                    checked={reviewStatus === 'REJECTED'}
                    onChange={() => setReviewStatus('REJECTED')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>Từ chối</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ghi chú / Ý kiến của Ban Chi ủy
              </label>
              <textarea
                rows={3}
                required
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white"
                placeholder="Nhập ý kiến chỉ đạo hoặc lý do..."
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-md transition ${
                  reviewStatus === 'APPROVED'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                {reviewStatus === 'APPROVED' ? 'Xác Nhận Phê Duyệt' : 'Xác Nhận Từ Chối'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: Detailed View */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi Tiết Đơn Xin Vắng Họp Chi Bộ"
      >
        {selectedRequest && (
          <div className="space-y-4 text-xs">
            <div className="bg-red-950 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-300">THÔNG TIN ĐẢNG VIÊN</p>
                <h3 className="text-base font-black uppercase mt-0.5">{selectedRequest.memberFullName}</h3>
                <p className="text-xs opacity-90 font-mono">
                  MSCB: {selectedRequest.staffCode} | Email: {selectedRequest.memberEmail}
                </p>
              </div>
              <div className="text-right">
                {selectedRequest.status === 'APPROVED' && (
                  <span className="bg-emerald-500 text-white font-bold px-3 py-1 rounded-full text-xs">
                    ĐÃ DUYỆT
                  </span>
                )}
                {selectedRequest.status === 'PENDING' && (
                  <span className="bg-amber-400 text-red-950 font-bold px-3 py-1 rounded-full text-xs">
                    CHỜ DUYỆT
                  </span>
                )}
                {selectedRequest.status === 'REJECTED' && (
                  <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-full text-xs">
                    TỪ CHỐI
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-500 block font-medium">Kỳ họp Chi bộ:</span>
                <span className="font-bold text-gray-900">{selectedRequest.meetingPeriod}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Ngày họp:</span>
                <span className="font-bold text-gray-900">{selectedRequest.meetingDate}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Lý do vắng mặt:</span>
                <span className="font-bold text-red-900">{selectedRequest.reason}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Thời gian gửi đơn:</span>
                <span className="font-mono text-gray-800">
                  {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {selectedRequest.reasonDetail && (
              <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-800 block">Diễn giải chi tiết lý do:</span>
                <p className="text-gray-700 leading-relaxed">{selectedRequest.reasonDetail}</p>
              </div>
            )}

            {selectedRequest.notes && (
              <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-800 block">Ghi chú thêm:</span>
                <p className="text-gray-700 italic">{selectedRequest.notes}</p>
              </div>
            )}

            {selectedRequest.attachedFiles && selectedRequest.attachedFiles.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-1">
                <span className="font-bold text-blue-900 block">Đơn / Minh chứng kèm theo:</span>
                {selectedRequest.attachedFiles.map((f, i) => (
                  <a
                    key={i}
                    href={f.url}
                    download={f.name}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-700 font-bold hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{f.name}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Approval Details Section */}
            {selectedRequest.status !== 'PENDING' ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-emerald-900 font-bold uppercase text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Thông Tin Phê Duyệt Chi Bộ</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 border-t border-emerald-200 text-gray-800">
                  <div>
                    <span className="text-gray-500 text-[10px] block">Người duyệt:</span>
                    <strong className="text-emerald-950 uppercase">{selectedRequest.reviewedByName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block">Vai trò Ban Chi ủy:</span>
                    <strong className="text-emerald-900">{selectedRequest.reviewedByRole || 'Chi ủy viên'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] block">Thời gian duyệt:</span>
                    <span className="font-mono text-gray-800">
                      {selectedRequest.reviewedAt ? new Date(selectedRequest.reviewedAt).toLocaleString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                </div>
                {selectedRequest.reviewNotes && (
                  <div className="mt-2 pt-2 border-t border-emerald-200">
                    <span className="text-gray-500 text-[10px] block">Ý kiến / Ghi chú phê duyệt:</span>
                    <p className="font-medium text-emerald-950 bg-white p-2 rounded border border-emerald-200 italic">
                      “{selectedRequest.reviewNotes}”
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-xs flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Đơn đang trong danh sách chờ Ban Chi ủy xem xét phê duyệt.</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MeetingAbsences;
