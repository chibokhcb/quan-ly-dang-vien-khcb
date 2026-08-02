import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Globe,
  CalendarOff,
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
  X,
} from 'lucide-react';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[]; // Allowed roles. If empty, visible to all authenticated
  badgeCount?: number;
}

interface SidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePath,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentRole, hasRole, canApprove } = useAuth();
  const isAdmin = canApprove();

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
      roles: [],
    },
    {
      title: 'Thông tin của tôi',
      path: '/me',
      icon: UserCheck,
      roles: [],
    },
    {
      title: 'Đi nước ngoài',
      path: '/foreign-trips',
      icon: Globe,
      roles: [],
    },
    {
      title: isAdmin ? 'Duyệt xin vắng' : 'Xin vắng họp',
      path: '/meeting-absences',
      icon: CalendarOff,
      roles: [],
    },
    {
      title: 'Phát triển Đảng',
      path: '/development',
      icon: TrendingUp,
      roles: [],
    },
    {
      title: 'Hồ sơ kết nạp',
      path: '/admission-dossiers',
      icon: FileCheck,
      roles: [],
    },
    {
      title: 'Công nhận chính thức',
      path: '/officialization-dossiers',
      icon: Award,
      roles: [],
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
      roles: [],
      badgeCount: 1,
    },
    {
      title: 'Báo cáo – Xuất Excel',
      path: '/reports',
      icon: BarChart3,
      roles: [],
    },
    {
      title: 'Người dùng – Phân quyền',
      path: '/users',
      icon: Shield,
      roles: [],
    },
    {
      title: 'Nhật ký hệ thống',
      path: '/audit-logs',
      icon: History,
      roles: [],
    },
    {
      title: 'Phiên bản quy định',
      path: '/policy-versions',
      icon: BookOpen,
      roles: [],
    },
    {
      title: 'Cài đặt',
      path: '/settings',
      icon: Settings,
      roles: [],
    },
  ];

  // Filter items based on user role
  const visibleItems = menuItems.filter((item) => {
    if (item.roles.length === 0) return true;
    return hasRole(item.roles);
  });

  const handleItemClick = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-[#1E1E1B] text-[#E5E5E5] border-r border-[#333] flex flex-col shrink-0 transition-transform duration-300 ease-in-out z-50 ${
          isOpenMobile
            ? 'fixed top-0 left-0 bottom-0 w-72 shadow-2xl translate-x-0'
            : 'fixed top-0 left-0 bottom-0 w-72 -translate-x-full md:translate-x-0 md:static md:w-64 md:min-h-[calc(100vh-60px)]'
        }`}
      >
        <div className="px-4 py-3 bg-[#151513] border-b border-[#333] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#7A7670] uppercase tracking-wider">
              DANH MỤC QUẢN LÝ
            </p>
            <p className="text-xs font-bold text-[#FFD700] mt-0.5">Vai trò: {currentRole}</p>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition md:hidden cursor-pointer"
              title="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.path || (item.path !== '/' && activePath.startsWith(item.path));

            return (
              <button
                key={item.path}
                onClick={() => handleItemClick(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2D2D2B] text-white font-bold shadow-xs border-l-4 border-[#FFD700]'
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
    </>
  );
};

