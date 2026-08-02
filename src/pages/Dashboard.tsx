import React from 'react';
import { DataRepository } from '../services/repository';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { GreetingBanner } from '../components/common/GreetingBanner';
import {
  Users,
  Globe,
  TrendingUp,
  FileCheck,
  CheckSquare,
  AlertTriangle,
  Award,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const Dashboard: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentRole } = useAuth();

  const members = DataRepository.getPartyMembers();
  const trips = DataRepository.getForeignTrips();
  const candidates = DataRepository.getDevelopmentCandidates();
  const admissions = DataRepository.getAdmissionDossiers();
  const officializations = DataRepository.getOfficializationDossiers();
  const changeRequests = DataRepository.getMemberChangeRequests().filter((r) => r.status === 'PENDING');

  // KPI Calculations
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.activityStatus === 'Đang sinh hoạt Đảng').length;
  const exemptedMembers = members.filter((m) => m.activityStatus === 'Miễn sinh hoạt').length;
  const abroadTrips = trips.filter((t) => t.tripStatus === 'ABROAD').length;
  const upcomingTrips = trips.filter((t) => t.tripStatus === 'UPCOMING').length;
  const trackingCandidates = candidates.filter((c) => c.stage !== 'STOPPED' && c.stage !== 'OFFICIAL_MEMBER').length;
  const pendingApprovalsCount = changeRequests.length;

  // Chart 1: Status Distribution
  const statusCounts: Record<string, number> = {};
  members.forEach((m) => {
    statusCounts[m.activityStatus] = (statusCounts[m.activityStatus] || 0) + 1;
  });
  const pieData = Object.keys(statusCounts).map((key) => ({
    name: key,
    value: statusCounts[key],
  }));
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#64748B'];

  // Chart 2: Development Stages
  const stageCounts: Record<string, number> = {
    'Đang theo dõi': 0,
    'Nhận thức về Đảng': 0,
    'Hoàn thiện hồ sơ': 0,
    'Đảng viên dự bị': 0,
  };
  candidates.forEach((c) => {
    if (c.stage === 'TRACKING') stageCounts['Đang theo dõi']++;
    if (c.stage === 'AWARENESS_CLASS') stageCounts['Nhận thức về Đảng']++;
    if (c.stage === 'DOSSIER_COMPLETION') stageCounts['Hoàn thiện hồ sơ']++;
    if (c.stage === 'PROVISIONAL_MEMBER') stageCounts['Đảng viên dự bị']++;
  });
  const barData = Object.keys(stageCounts).map((key) => ({
    stage: key,
    soLuong: stageCounts[key],
  }));

  return (
    <div className="space-y-6">
      {/* Time Greeting Banner */}
      <GreetingBanner />

      {/* Title section */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-red-900 uppercase">Bảng điều khiển & Thống kê Chi bộ</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Cập nhật theo thời gian thực – Chi bộ Khoa học cơ bản (Vai trò: <span className="font-bold text-red-700">{currentRole}</span>)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('/reports')}
            className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow transition flex items-center space-x-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Xuất báo cáo Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => onNavigate('/members')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Tổng số đảng viên</span>
            <div className="w-9 h-9 bg-red-100 text-red-800 rounded-lg flex items-center justify-center group-hover:bg-red-800 group-hover:text-white transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-gray-900">{totalMembers}</span>
            <span className="text-xs text-emerald-700 font-semibold">{activeMembers} chính thức</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Miễn sinh hoạt: {exemptedMembers} đồng chí</p>
        </div>

        {/* KPI 2 */}
        <div
          onClick={() => onNavigate('/foreign-trips')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Đang ở nước ngoài</span>
            <div className="w-9 h-9 bg-blue-100 text-blue-800 rounded-lg flex items-center justify-center group-hover:bg-blue-800 group-hover:text-white transition">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-blue-900">{abroadTrips}</span>
            <span className="text-xs text-blue-700 font-semibold">{upcomingTrips} chuyến sắp đi</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Học tập, nghiên cứu & công tác</p>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => onNavigate('/development')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Nguồn phát triển Đảng</span>
            <div className="w-9 h-9 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center group-hover:bg-amber-800 group-hover:text-white transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-amber-900">{trackingCandidates}</span>
            <span className="text-xs text-amber-700 font-semibold">quần chúng đang bồi dưỡng</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Đã phân công 2 người hướng dẫn</p>
        </div>

        {/* KPI 4 */}
        <div
          onClick={() => onNavigate('/approvals')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Yêu cầu chờ duyệt</span>
            <div className="w-9 h-9 bg-purple-100 text-purple-800 rounded-lg flex items-center justify-center group-hover:bg-purple-800 group-hover:text-white transition">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-purple-900">{pendingApprovalsCount}</span>
            <span className="text-xs text-purple-700 font-semibold">đề nghị cập nhật hồ sơ</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Cần Bí thư/Chi ủy phê duyệt</p>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Status */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <Users className="w-4 h-4 text-red-700" />
            <span>Cơ cấu trạng thái sinh hoạt Đảng</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Development Stages */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-amber-700" />
            <span>Tiến độ nguồn phát triển Đảng</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="stage" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="soLuong" name="Số lượng quần chúng" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action lists & Pending Dossiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Dossiers */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b pb-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-red-800" />
              <span>Hồ sơ kết nạp & Công nhận chính thức</span>
            </h3>
            <button
              onClick={() => onNavigate('/admission-dossiers')}
              className="text-xs font-semibold text-red-700 hover:underline flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {admissions.map((ad) => (
              <div
                key={ad.id}
                onClick={() => onNavigate(`/admission-dossiers/${ad.id}`)}
                className="p-3 bg-slate-50 hover:bg-red-50/50 rounded-lg border border-slate-200 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-xs text-gray-900">{ad.candidateFullName}</p>
                  <p className="text-[11px] text-gray-500">Hồ sơ kết nạp Đảng • {ad.requirementsSnapshot.policyCode}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-red-800">{ad.progressPercentage}%</span>
                  <div className="w-20 bg-gray-200 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-red-700 h-full" style={{ width: `${ad.progressPercentage}%` }} />
                  </div>
                </div>
              </div>
            ))}

            {officializations.map((off) => (
              <div
                key={off.id}
                onClick={() => onNavigate(`/officialization-dossiers/${off.id}`)}
                className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-lg border border-slate-200 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-xs text-gray-900">{off.memberFullName}</p>
                  <p className="text-[11px] text-gray-500">Đảng viên dự bị • Hạn: {off.expectedOfficialDate}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800">{off.progressPercentage}%</span>
                  <div className="w-20 bg-gray-200 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-emerald-600 h-full" style={{ width: `${off.progressPercentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member Abroad Alerts */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b pb-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-800" />
              <span>Đảng viên đang công tác / học tập nước ngoài</span>
            </h3>
            <button
              onClick={() => onNavigate('/foreign-trips')}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center space-x-1"
            >
              <span>Chi tiết</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {trips.map((trip) => (
              <div key={trip.id} className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-gray-900">{trip.memberFullName}</p>
                  <p className="text-[11px] text-gray-600">
                    Quốc gia: <span className="font-semibold text-blue-900">{trip.destinationCountry}</span> ({trip.startDate} - {trip.endDate})
                  </p>
                </div>
                <StatusBadge status={trip.tripStatus} type="trip" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
