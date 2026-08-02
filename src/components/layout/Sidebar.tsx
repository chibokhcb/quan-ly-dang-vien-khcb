import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Globe,
  TrendingUp,
  FileCheck,
  Award,
  FileText,
  CheckSquare,
  BarChart3,
  Shield,
  History,
  BookOpen,
  Settings,
} from 'lucide-react';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[]; // Allowed roles. If empty, visible to all authenticated
  badgeCount?: number;
}

export const Sidebar: React.FC<{ activePath: string; onNavigate: (path: string) => void }> = ({
  activePath,
  onNavigate,
}) => {
  const { currentRole, hasRole } = useAuth();

  const menuItems: MenuItem[] = [
    {
      title: 'Tổng quan',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: [],
    },
    {
      title: 'Hồ sơ đảng viên',
      path: '/members',
      icon: Users,
      roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'AUDITOR'],
    },
    {
      title: 'Thông tin của tôi',
      path: '/me',
      icon: UserCheck,
      roles: ['PARTY_MEMBER', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'MENTOR'],
    },
    {
      title: 'Đi nước ngoài',
      path: '/foreign-trips',
      icon: Globe,
      roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'PARTY_MEMBER', 'AUDITOR'],
    },
    {
      title: 'Phát triển Đảng',
      path: '/development',
      icon: TrendingUp,
      roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'MENTOR', 'CANDIDATE', 'AUDITOR'],
    },
    {
      title: 'Hồ sơ kết nạp',
      path: '/admission-dossiers',
      icon: FileCheck,
      roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'MENTOR', 'CANDIDATE', 'AUDITOR'],
    },
    {
      title: 'Công nhận chính thức',
      path: '/officialization-dossiers',
      icon: Award,
      roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'PARTY_MEMBER', 'AUDITOR'],
    },
    {
      title: 'Biểu mẫu – Tài liệu mẫu',
      path: '/templates',
      icon: FileText,
      roles: [],
    },
    {
      title: 'Phê duyệt thay đổi',
      path: '/approvals',
      icon: CheckSquare,
      roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN'],
      badgeCount: 1,
    },
    {
      title: 'Báo cáo – Xuất Excel',
      path: '/reports',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'AUDITOR'],
    },
    {
      title: 'Người dùng – Phân quyền',
      path: '/users',
      icon: Shield,
      roles: ['SUPER_ADMIN'],
    },
    {
      title: 'Nhật ký hệ thống',
      path: '/audit-logs',
      icon: History,
      roles: ['SUPER_ADMIN', 'AUDITOR'],
    },
    {
      title: 'Phiên bản quy định',
      path: '/policy-versions',
      icon: BookOpen,
      roles: ['SUPER_ADMIN', 'ORGANIZATION_ADMIN'],
    },
    {
      title: 'Cài đặt',
      path: '/settings',
      icon: Settings,
      roles: ['SUPER_ADMIN'],
    },
  ];

  // Filter items based on user role
  const visibleItems = menuItems.filter((item) => {
    if (item.roles.length === 0) return true;
    return hasRole(item.roles);
  });

  return (
    <aside className="w-64 bg-[#1E1E1B] text-[#E5E5E5] border-r border-[#333] flex flex-col shrink-0 min-h-[calc(100vh-60px)]">
      <div className="px-4 py-3 bg-[#151513] border-b border-[#333]">
        <p className="text-[11px] font-semibold text-[#7A7670] uppercase tracking-wider">
          DANH MỤC QUẢN LÝ
        </p>
        <p className="text-xs font-bold text-[#FFD700] mt-0.5">Vai trò: {currentRole}</p>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path || (item.path !== '/' && activePath.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#2D2D2B] text-white font-bold shadow border-l-4 border-[#FFD700]'
                  : 'text-[#D4D0C8] hover:bg-[#2A2A27] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFD700]' : 'text-[#7A7670]'}`} />
                <span className="truncate">{item.title}</span>
              </div>
              {item.badgeCount && item.badgeCount > 0 && (
                <span className="ml-2 bg-[#FFD700] text-[#8B1D1D] text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info in sidebar */}
      <div className="p-3 bg-[#151513] border-t border-[#333] text-[11px] text-[#7A7670] space-y-1">
        <p className="font-semibold text-[#D4D0C8]">Chi bộ Khoa học Cơ bản</p>
        <p className="text-[10px]">ĐẢNG ỦY TRƯỜNG ĐẠI HỌC Y DƯỢC CẦN THƠ</p>
        <p className="text-[10px] text-[#7A7670]">Phiên bản 4.0 Pro (2026)</p>
      </div>
    </aside>
  );
};
