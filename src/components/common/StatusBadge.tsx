import React from 'react';
import { ActivityStatus, TripApprovalStatus, TripStatus, DevelopmentStage, DossierItemStatus } from '../../types';

interface StatusBadgeProps {
  status: string;
  type?: 'activity' | 'approval' | 'trip' | 'stage' | 'dossier';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'activity' }) => {
  let badgeClasses = 'bg-gray-100 text-gray-800 border-gray-200';
  let label = status;

  if (type === 'activity') {
    switch (status as ActivityStatus) {
      case 'Đang sinh hoạt Đảng':
        badgeClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
        break;
      case 'Miễn sinh hoạt':
        badgeClasses = 'bg-blue-50 text-blue-800 border-blue-200';
        break;
      case 'Gián đoạn sinh hoạt':
        badgeClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case 'Đình chỉ sinh hoạt':
        badgeClasses = 'bg-red-50 text-red-800 border-red-200 font-bold';
        break;
      case 'Rời khỏi Đảng':
      case 'Từ trần':
        badgeClasses = 'bg-slate-100 text-slate-700 border-slate-300';
        break;
    }
  } else if (type === 'approval') {
    switch (status as TripApprovalStatus) {
      case 'APPROVED':
        badgeClasses = 'bg-green-100 text-green-800 border-green-300 font-bold';
        label = 'Đã duyệt';
        break;
      case 'PENDING':
        badgeClasses = 'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse';
        label = 'Chờ duyệt';
        break;
      case 'REJECTED':
        badgeClasses = 'bg-red-100 text-red-800 border-red-300 font-bold';
        label = 'Từ chối';
        break;
    }
  } else if (type === 'trip') {
    switch (status as TripStatus) {
      case 'ABROAD':
        badgeClasses = 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold';
        label = 'Đang ở nước ngoài';
        break;
      case 'UPCOMING':
        badgeClasses = 'bg-blue-50 text-blue-800 border-blue-200';
        label = 'Sắp đi';
        break;
      case 'RETURNED':
        badgeClasses = 'bg-gray-100 text-gray-700 border-gray-300';
        label = 'Đã về';
        break;
      case 'OVERDUE':
        badgeClasses = 'bg-red-100 text-red-900 border-red-400 font-extrabold animate-bounce';
        label = 'Quá hạn chưa báo';
        break;
    }
  } else if (type === 'stage') {
    switch (status as DevelopmentStage) {
      case 'TRACKING':
        badgeClasses = 'bg-gray-100 text-gray-800 border-gray-300';
        label = 'Đang theo dõi';
        break;
      case 'ELITE_CITIZEN':
        badgeClasses = 'bg-sky-50 text-sky-800 border-sky-300';
        label = 'Quần chúng ưu tú';
        break;
      case 'AWARENESS_CLASS':
        badgeClasses = 'bg-purple-50 text-purple-800 border-purple-300';
        label = 'Đã học lớp nhận thức';
        break;
      case 'DOSSIER_COMPLETION':
        badgeClasses = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
        label = 'Hoàn thiện hồ sơ';
        break;
      case 'PROPOSED_ADMISSION':
        badgeClasses = 'bg-orange-100 text-orange-900 border-orange-300 font-bold';
        label = 'Đề nghị kết nạp';
        break;
      case 'PROVISIONAL_MEMBER':
        badgeClasses = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
        label = 'Đảng viên dự bị';
        break;
      case 'OFFICIAL_MEMBER':
        badgeClasses = 'bg-red-100 text-red-900 border-red-300 font-bold';
        label = 'Đảng viên chính thức';
        break;
      case 'STOPPED':
        badgeClasses = 'bg-slate-200 text-slate-700 border-slate-300';
        label = 'Dừng theo dõi';
        break;
    }
  } else if (type === 'dossier') {
    switch (status as DossierItemStatus) {
      case 'VALID':
        badgeClasses = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
        label = 'Hợp lệ';
        break;
      case 'PENDING_REVIEW':
        badgeClasses = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
        label = 'Chờ thẩm định';
        break;
      case 'UPLOADED':
        badgeClasses = 'bg-blue-100 text-blue-800 border-blue-300';
        label = 'Đã tải lên';
        break;
      case 'NEEDS_SUPPLEMENT':
        badgeClasses = 'bg-red-100 text-red-800 border-red-300 font-bold';
        label = 'Cần bổ sung';
        break;

      case 'NOT_APPLICABLE':
        badgeClasses = 'bg-gray-100 text-gray-500 border-gray-200';
        label = 'Không áp dụng';
        break;
      default:
        badgeClasses = 'bg-gray-50 text-gray-600 border-gray-200';
        label = 'Chưa có';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border leading-normal whitespace-nowrap ${badgeClasses}`}
    >
      {label}
    </span>
  );
};
