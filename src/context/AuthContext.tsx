import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { DataRepository } from '../services/repository';

interface AuthContextType {
  currentUser: UserAccount | null;
  currentRole: UserRole;
  isGuest: boolean;
  isFullSecretary: boolean;
  requiresSecretaryApproval: boolean;
  canAddUser: boolean;
  loginWithEmail: (email: string, fullNameInput?: string) => UserAccount;
  loginWithMockRole: (role: UserRole) => void;
  signOut: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  canEditMember: (memberUid?: string, memberEmail?: string) => boolean;
  canApprove: () => boolean;
  canDelete: () => boolean;
  isDeviceRemembered: (email: string) => boolean;
  rememberDevice: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('qldv_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    // Không tự động chọn tài khoản mặc định.
        // Nếu không có phiên đăng nhập đã lưu, bắt buộc phải qua màn hình đăng nhập.
            return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('qldv_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('qldv_current_user');
    }
  }, [currentUser]);

  const loginWithEmail = (email: string, fullNameInput?: string): UserAccount => {
    const cleanEmail = email.trim().toLowerCase();
    const allUsers = DataRepository.getUsers();
    const match = allUsers.find((u) => u.email.trim().toLowerCase() === cleanEmail);

    let loggedUser: UserAccount;

    if (match) {
      // User is in registered list -> Assign exact configured permissions
      loggedUser = adminEmails.includes(cleanEmail)
        ? { ...match, role: 'SUPER_ADMIN', requiresSecretaryApproval: false }
        : match;
      DataRepository.addAuditLog(cleanEmail, 'LOGIN_SUCCESS', 'AUTH', loggedUser.uid, `Đăng nhập thành công với vai trò ${loggedUser.role} (${loggedUser.positionTitle || 'Đảng viên'})`);
    } else if (cleanEmail.endsWith('@ctump.edu.vn') || cleanEmail.endsWith('@student.ctump.edu.vn')) {
      // Email ends with @ctump.edu.vn or @student.ctump.edu.vn -> Log in as Party Member
      const isStudent = cleanEmail.endsWith('@student.ctump.edu.vn');
      const prefix = cleanEmail.split('@')[0];
      const isAdmin = adminEmails.includes(cleanEmail);
      loggedUser = {
        uid: `uid-pm-${Date.now()}`,
        email: cleanEmail,
        fullName: fullNameInput ? fullNameInput.trim().toUpperCase() : prefix.toUpperCase(),
        role: isAdmin ? 'SUPER_ADMIN' : 'PARTY_MEMBER',
        positionTitle: isStudent ? 'Đảng viên / Sinh viên' : 'Chi ủy viên / Quản trị viên',
        staffCode: isStudent ? prefix : `001${Math.floor(100 + Math.random() * 900)}`,
        status: 'ACTIVE',
        requiresSecretaryApproval: false,
        createdAt: new Date().toISOString(),
      };
      DataRepository.saveUserAccount(loggedUser);
      DataRepository.addAuditLog(cleanEmail, 'LOGIN_AUTO_MEMBER', 'AUTH', loggedUser.uid, `Tự động tạo tài khoản Đảng viên mới qua email ${cleanEmail}`);
    } else {
      // User email NOT in CTUMP domain -> Log in as GUEST (Read-only view)
      loggedUser = {
        uid: `guest-${Date.now()}`,
        email: cleanEmail,
        fullName: fullNameInput ? fullNameInput.trim().toUpperCase() : cleanEmail.split('@')[0].toUpperCase(),
        role: 'GUEST',
        positionTitle: 'Tài khoản khách (Chỉ xem)',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      DataRepository.addAuditLog(cleanEmail, 'LOGIN_GUEST', 'AUTH', loggedUser.uid, 'Đăng nhập ở chế độ Khách (Chỉ xem) do email nằm ngoài tên miền @ctump.edu.vn / @student.ctump.edu.vn');
    }

    // Synchronize PartyMember record so "Thông tin của tôi" and "Hồ sơ đảng viên" have exact match
    if (loggedUser.role !== 'GUEST') {
      const partyMembers = DataRepository.getPartyMembers();
      const existing = partyMembers.find(
        (m) => m.workEmail?.toLowerCase() === cleanEmail || (loggedUser.staffCode && m.staffCode === loggedUser.staffCode)
      );

      if (!existing) {
        DataRepository.savePartyMember({
          id: `pm-${loggedUser.uid}`,
          stt: partyMembers.length + 1,
          fullName: loggedUser.fullName,
          gender: 'Nam',
          dateOfBirth: '15/05/1985',
          ethnicityName: 'Kinh',
          religionName: 'Không',
          personalId: '089085' + String(Math.floor(100000 + Math.random() * 900000)),
          partyCardNumber: '370123' + String(Math.floor(100000 + Math.random() * 900000)),
          partyOrganization: 'Chi bộ Khoa học cơ bản',
          birthRegistration: { country: 'Việt Nam', province: 'Cần Thơ', detail: 'Quận Ninh Kiều' },
          hometown: { country: 'Việt Nam', province: 'Cần Thơ', detail: 'Quận Ninh Kiều' },
          permanentResidence: { country: 'Việt Nam', province: 'Cần Thơ', detail: 'Phường An Khánh' },
          partyAdmissionDate: '19/05/2015',
          officialPartyDate: '19/05/2016',
          activityStatus: 'Đang sinh hoạt Đảng',
          staffCode: loggedUser.staffCode || '000000',
          workEmail: cleanEmail,
          department: 'Chi bộ Khoa học cơ bản',
          academicTitle: loggedUser.positionTitle || 'Đảng viên Chi bộ',
          jobTitle: loggedUser.positionTitle || 'Đảng viên',
          userUid: loggedUser.uid,
        }, cleanEmail);
      }
    }

    setCurrentUser(loggedUser);
    return loggedUser;
  };

  const isDeviceRemembered = (email: string): boolean => {
    if (!email) return false;
    const key = `qldv_remembered_device_${email.trim().toLowerCase()}`;
    return localStorage.getItem(key) === 'true';
  };

  const rememberDevice = (email: string) => {
    if (!email) return;
    const key = `qldv_remembered_device_${email.trim().toLowerCase()}`;
    localStorage.setItem(key, 'true');
  };

  const loginWithMockRole = (role: UserRole) => {
    const allUsers = DataRepository.getUsers();
    const match = allUsers.find((u) => u.role === role);
    if (match) {
      setCurrentUser(match);
    } else {
      setCurrentUser({
        uid: `uid-${role.toLowerCase()}`,
        email: `${role.toLowerCase()}@ctump.edu.vn`,
        fullName: `TÀI KHOẢN (${role})`,
        role,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const signOut = () => {
    setCurrentUser(null);
  };

  const adminEmails = ['ntttram@ctump.edu.vn', 'chibokhcb@ctump.edu.vn', 'letran@ctump.edu.vn', 'nthung@ctump.edu.vn'];
  const isAdminUser = currentUser ? adminEmails.includes(currentUser.email.toLowerCase()) : false;
  const isGuest = currentUser?.role === 'GUEST';
  const isFullSecretary = isAdminUser || currentUser?.role === 'SUPER_ADMIN';
  const requiresSecretaryApproval = currentUser?.requiresSecretaryApproval === true && !isAdminUser;

  const canAddUser = currentUser ? (isAdminUser || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ORGANIZATION_ADMIN') : false;

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'GUEST') return false; // Guests have no write/admin roles
    if (isAdminUser || currentUser.role === 'SUPER_ADMIN') return true; // Super Admin / Chi uy has full access
    return allowedRoles.includes(currentUser.role);
  };

  const canEditMember = (memberUid?: string, memberEmail?: string, memberStaffCode?: string): boolean => {
    if (!currentUser || currentUser.role === 'GUEST') return false;
    // The 4 Ban Chi ủy / Admin accounts can edit all members
    if (isAdminUser) {
      return true;
    }
    // Regular Party Member can ONLY edit/update their OWN profile/information
    if (memberUid && currentUser.uid === memberUid) return true;
    if (memberEmail && currentUser.email?.toLowerCase() === memberEmail.toLowerCase()) return true;
    if (memberStaffCode && currentUser.staffCode && currentUser.staffCode === memberStaffCode) return true;
    return false;
  };

  const canApprove = (): boolean => {
    if (!currentUser || currentUser.role === 'GUEST') return false;
    return isAdminUser;
  };

  const canDelete = (): boolean => {
    if (!currentUser || currentUser.role === 'GUEST') return false;
    return isAdminUser;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || 'GUEST',
        isGuest,
        isFullSecretary,
        requiresSecretaryApproval,
        canAddUser,
        loginWithEmail,
        loginWithMockRole,
        signOut,
        hasRole,
        canEditMember,
        canApprove,
        canDelete,
        isDeviceRemembered,
        rememberDevice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
