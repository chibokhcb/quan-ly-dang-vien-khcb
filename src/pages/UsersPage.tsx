import React, { useState } from 'react';
import { DataRepository } from '../services/repository';
import { UserAccount, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Lock, 
  Mail, 
  User, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { currentUser, canAddUser, canDelete } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>(() => DataRepository.getUsers());
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<UserAccount>>({
    fullName: '',
    email: '',
    positionTitle: '',
    staffCode: '',
    role: 'PARTY_MEMBER',
    status: 'ACTIVE',
    requiresSecretaryApproval: false,
    approvalNotes: '',
  });

  const refreshUsers = () => {
    setUsers(DataRepository.getUsers());
  };

  const handleOpenAddModal = () => {
    setFormData({
      fullName: '',
      email: '',
      positionTitle: '',
      staffCode: '',
      role: 'PARTY_MEMBER',
      status: 'ACTIVE',
      requiresSecretaryApproval: false,
      approvalNotes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({
      uid: user.uid,
      fullName: user.fullName,
      email: user.email,
      positionTitle: user.positionTitle || '',
      staffCode: user.staffCode || '',
      role: user.role,
      status: user.status,
      requiresSecretaryApproval: user.requiresSecretaryApproval || false,
      approvalNotes: user.approvalNotes || '',
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim() || !formData.email?.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên và Email công tác.');
      return;
    }

    if (!formData.email.endsWith('@ctump.edu.vn') && !formData.email.endsWith('@student.ctump.edu.vn')) {
      if (!confirm('Email công tác nên dùng domain @ctump.edu.vn hoặc @student.ctump.edu.vn. Bạn có muốn tiếp tục?')) {
        return;
      }
    }

    const payload: Partial<UserAccount> = {
      ...formData,
      fullName: formData.fullName.trim().toUpperCase(),
      email: formData.email.trim().toLowerCase(),
    };

    DataRepository.saveUserAccount(payload);
    DataRepository.addAuditLog(
      currentUser?.email || 'system',
      editingUser ? 'EDIT_USER' : 'ADD_USER',
      'USER_ACCOUNT',
      payload.uid || 'new',
      `${editingUser ? 'Cập nhật' : 'Thêm mới'} tài khoản ${payload.email} - ${payload.fullName}`
    );

    refreshUsers();
    setIsAddModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = () => {
    if (!deletingUser || !canDelete()) return;
    DataRepository.deleteUser(deletingUser.uid, currentUser?.email || 'system');
    refreshUsers();
    setDeletingUser(null);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.staffCode && u.staffCode.toLowerCase().includes(q)) ||
      (u.positionTitle && u.positionTitle.toLowerCase().includes(q))
    );
  });

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Quản trị hệ thống (SUPER_ADMIN)';
      case 'ORGANIZATION_ADMIN':
        return 'Cán bộ Tổ chức (ORGANIZATION_ADMIN)';
      case 'PARTY_MEMBER':
        return 'Đảng viên (PARTY_MEMBER)';
      case 'MENTOR':
        return 'Người hướng dẫn (MENTOR)';
      case 'CANDIDATE':
        return 'Quần chúng (CANDIDATE)';
      case 'AUDITOR':
        return 'Cán bộ kiểm tra (AUDITOR)';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Banner */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-800" />
            <span>Quản lý Tài khoản & Phân quyền Người dùng</span>
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Phân quyền đăng nhập Google Workspace domain <span className="font-mono font-bold text-red-900">@ctump.edu.vn</span> - Chi bộ Khoa học cơ bản
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 bg-red-900 hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm tài khoản mới</span>
        </button>
      </div>

      {/* Rules Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2 shadow-2xs">
        <div className="flex items-center space-x-2 font-bold uppercase text-amber-950">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Quy định Phân quyền Quản trị & Chi ủy Chi bộ:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6 pt-1">
          <div className="bg-white/80 p-2.5 rounded-md border border-amber-200/80 col-span-2">
            <p className="font-bold text-red-900">Ban Chi ủy & Email Quản trị (Toàn quyền Thêm, Sửa, Xóa):</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4 mt-1 text-gray-800">
              <li>
                <strong className="text-gray-900">Bí thư NGUYỄN THỊ THU TRÂM</strong> (<span className="font-mono">ntttram@ctump.edu.vn</span>)
              </li>
              <li>
                <strong className="text-gray-900">Email hệ thống Chi bộ</strong> (<span className="font-mono">chibokhcb@ctump.edu.vn</span>)
              </li>
              <li>
                <strong className="text-gray-900">Phó Bí thư NGUYỄN THANH HÙNG</strong> (<span className="font-mono">nthung@ctump.edu.vn</span>)
              </li>
              <li>
                <strong className="text-gray-900">Chi ủy viên TRẦN THỊ HỒNG LÊ</strong> (<span className="font-mono">letran@ctump.edu.vn</span>)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, chức vụ, MSCB..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-red-800 focus:outline-hidden"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Tổng số: <strong className="text-gray-900">{filteredUsers.length}</strong> tài khoản
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-red-900 text-white font-bold uppercase tracking-wider">
                <th className="p-3 w-12 text-center">STT</th>
                <th className="p-3">Họ và tên & Chức vụ</th>
                <th className="p-3">Email công tác</th>
                <th className="p-3">MSCB</th>
                <th className="p-3">Vai trò hệ thống</th>
                <th className="p-3">Cơ chế phê duyệt</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    Không tìm thấy tài khoản người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => {
                  const adminList = ['ntttram@ctump.edu.vn', 'chibokhcb@ctump.edu.vn', 'nthung@ctump.edu.vn', 'letran@ctump.edu.vn'];
                  const isSuperAdminAll = adminList.includes(u.email.toLowerCase());
                  const isApprovalRequired = !isSuperAdminAll && u.requiresSecretaryApproval;

                  return (
                    <tr key={u.uid} className="hover:bg-gray-50 transition">
                      <td className="p-3 text-center font-bold text-gray-500">{idx + 1}</td>
                      <td className="p-3 font-medium">
                        <div className="font-bold text-gray-900 text-xs uppercase">{u.fullName}</div>
                        {u.positionTitle && (
                          <div className="text-[11px] text-red-900 font-semibold mt-0.5">
                            {u.positionTitle}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-gray-700">{u.email}</td>
                      <td className="p-3 font-mono text-gray-600">{u.staffCode || '---'}</td>
                      <td className="p-3">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="p-3">
                        {isSuperAdminAll ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-300">
                            <Check className="w-3 h-3 text-red-800" />
                            <span>Quản trị tất cả</span>
                          </span>
                        ) : isApprovalRequired ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Lock className="w-3 h-3 text-amber-700" />
                            <span>Cần Bí thư phê duyệt</span>
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[11px]">Thực thi chuẩn</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {u.status === 'ACTIVE' ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                            Tạm khóa
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Sửa tài khoản"
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-md transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {canDelete() && (
                            <button
                              onClick={() => setDeletingUser(u)}
                              title="Xóa tài khoản"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isAddModalOpen || editingUser !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Chỉnh sửa tài khoản & phân quyền' : 'Thêm tài khoản người dùng mới'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Họ và tên <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: NGUYỄN THỊ THU TRÂM"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold uppercase focus:ring-1 focus:ring-red-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Email công tác Google (@ctump.edu.vn) <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="VD: ntttram@ctump.edu.vn"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-red-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Chức vụ Đảng / Cấp ủy</label>
              <input
                type="text"
                placeholder="VD: Bí thư Chi bộ, Phó Bí thư, Chi ủy viên..."
                value={formData.positionTitle || ''}
                onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-red-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Mã số cán bộ (MSCB)</label>
              <input
                type="text"
                placeholder="VD: 001001"
                value={formData.staffCode || ''}
                onChange={(e) => setFormData({ ...formData, staffCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-red-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Vai trò phân quyền hệ thống</label>
              <select
                value={formData.role || 'PARTY_MEMBER'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-red-800 focus:outline-hidden"
              >
                <option value="SUPER_ADMIN">Bí thư / Quản trị hệ thống (SUPER_ADMIN)</option>
                <option value="ORGANIZATION_ADMIN">Cán bộ Tổ chức / Chi ủy viên (ORGANIZATION_ADMIN)</option>
                <option value="PARTY_MEMBER">Đảng viên chính thức / dự bị (PARTY_MEMBER)</option>
                <option value="MENTOR">Người hướng dẫn giúp đỡ (MENTOR)</option>
                <option value="CANDIDATE">Quần chúng ưu tú (CANDIDATE)</option>
                <option value="AUDITOR">Cán bộ kiểm tra (AUDITOR)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Trạng thái tài khoản</label>
              <select
                value={formData.status || 'ACTIVE'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:ring-1 focus:ring-red-800 focus:outline-hidden"
              >
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="INACTIVE">Tạm khóa (INACTIVE)</option>
              </select>
            </div>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 space-y-2">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requiresSecretaryApproval || false}
                onChange={(e) => setFormData({ ...formData, requiresSecretaryApproval: e.target.checked })}
                className="mt-0.5 rounded border-amber-400 text-red-900 focus:ring-red-800"
              />
              <span className="font-bold text-amber-950 text-xs">
                Yêu cầu Bí thư phê duyệt khi điều chỉnh (Dành cho Phó Bí thư & Chi ủy viên)
              </span>
            </label>
            <p className="text-[11px] text-amber-800 pl-6">
              Khi bật tùy chọn này, người dùng có đầy đủ quyền thao tác như Bí thư nhưng mọi thay đổi dữ liệu chính thức sẽ đi qua trạng thái chờ Bí thư phê duyệt.
            </p>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Ghi chú phân quyền & Phê duyệt</label>
            <textarea
              rows={2}
              placeholder="VD: Có quyền điều chỉnh tất cả như bí thư, nhưng phải có sự phê duyệt của bí thư..."
              value={formData.approvalNotes || ''}
              onChange={(e) => setFormData({ ...formData, approvalNotes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-red-800 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingUser(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 text-xs cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-900 hover:bg-red-800 text-white font-bold rounded-lg text-xs shadow-sm transition cursor-pointer"
            >
              {editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={deletingUser !== null}
        onClose={() => setDeletingUser(null)}
        title="Xác nhận xóa tài khoản người dùng"
      >
        {deletingUser && (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 bg-red-50 p-3.5 rounded-lg border border-red-200 text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Bạn có chắc chắn muốn xóa tài khoản này khỏi hệ thống?</p>
                <p className="text-xs mt-1 text-red-800">
                  Hành động này sẽ xóa quyền truy cập của người dùng đối với các dữ liệu trong hệ thống Theo dõi & Quản lý Đảng viên.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-1 text-xs">
              <p>
                <strong>Họ và tên:</strong> <span className="uppercase text-gray-900 font-bold">{deletingUser.fullName}</span>
              </p>
              <p>
                <strong>Email công tác:</strong> <span className="font-mono text-gray-800">{deletingUser.email}</span>
              </p>
              <p>
                <strong>Chức vụ:</strong> {deletingUser.positionTitle || 'Chưa cập nhật'}
              </p>
              <p>
                <strong>Vai trò:</strong> {getRoleLabel(deletingUser.role)}
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xs shadow-sm transition cursor-pointer"
              >
                Xóa tài khoản
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

