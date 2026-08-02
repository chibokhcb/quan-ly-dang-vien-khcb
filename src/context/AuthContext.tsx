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
    // Default system admin if no saved user
    const allUsers = DataRepository.getUsers();
    return allUsers[0] || null;
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

    if (match) {
      // User is in registered list -> Assign exact configured permissions
      setCurrentUser(match);
      DataRepository.addAuditLog(cleanEmail, 'LOGIN_SUCCESS', 'AUTH', match.uid, `Đăng nhập thành công với vai trò ${match.role} (${match.positionTitle || 'Đảng viên'})`);
      return match;
    } else if (cleanEmail.endsWith('@ctump.edu.vn') || cleanEmail.endsWith('@student.ctump.edu.vn')) {
      // Email ends with @ctump.edu.vn or @student.ctump.edu.vn -> Log in as Party Member
      const isStudent = cleanEmail.endsWith('@student.ctump.edu.vn');
      const newPartyMemberUser: UserAccount = {
        uid: `uid-pm-${Date.now()}`,
        email: cleanEmail,
        fullName: fullNameInput ? fullNameInput.trim().toUpperCase() : cleanEmail.split('@')[0].toUpperCase(),
        role: 'PARTY_MEMBER',
        positionTitle: isStudent ? 'Đảng viên / Sinh viên' : 'Đảng viên Chi bộ',
        status: 'ACTIVE',
        requiresSecretaryApproval: false,
        createdAt: new Date().toISOString(),
      };
      DataRepository.saveUserAccount(newPartyMemberUser);
      setCurrentUser(newPartyMemberUser);
      DataRepository.addAuditLog(cleanEmail, 'LOGIN_AUTO_MEMBER', 'AUTH', newPartyMemberUser.uid, `Tự động tạo tài khoản Đảng viên mới qua email ${cleanEmail}`);
      return newPartyMemberUser;
    } else {
      // User email NOT in CTUMP domain -> Log in as GUEST (Read-only view)
      const guestUser: UserAccount = {
        uid: `guest-${Date.now()}`,
        email: cleanEmail,
        fullName: fullNameInput ? fullNameInput.trim().toUpperCase() : cleanEmail.split('@')[0].toUpperCase(),
        role: 'GUEST',
        positionTitle: 'Tài khoản khách (Chỉ xem)',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(guestUser);
      DataRepository.addAuditLog(cleanEmail, 'LOGIN_GUEST', 'AUTH', guestUser.uid, 'Đăng nhập ở chế độ Khách (Chỉ xem) do email nằm ngoài tên miền @ctump.edu.vn / @student.ctump.edu.vn');
      return guestUser;
    }
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

  const isGuest = currentUser?.role === 'GUEST';
  const isFullSecretary = currentUser?.email === 'ntttram@ctump.edu.vn' || currentUser?.email === 'chibokhcb@ctump.edu.vn';
  const requiresSecretaryApproval = currentUser?.requiresSecretaryApproval === true;

  const adminEmails = ['ntttram@ctump.edu.vn', 'chibokhcb@ctump.edu.vn', 'letran@ctump.edu.vn', 'nthung@ctump.edu.vn'];
  const canAddUser = currentUser ? (adminEmails.includes(currentUser.email.toLowerCase()) || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ORGANIZATION_ADMIN') : false;

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'GUEST') return false; // Guests have no write/admin roles
    if (currentUser.role === 'SUPER_ADMIN') return true; // Super Admin has full access
    return allowedRoles.includes(currentUser.role);
  };

  const canEditMember = (memberUid?: string, memberEmail?: string): boolean => {
    if (!currentUser || currentUser.role === 'GUEST') return false;
    // Admins (Secretary, Vice Secretary, Committee member, Super Admin, Org Admin) can edit all members
    if (isFullSecretary || requiresSecretaryApproval || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ORGANIZATION_ADMIN') {
      return true;
    }
    // Regular Party Member can ONLY edit/update their OWN profile/information
    if (currentUser.role === 'PARTY_MEMBER') {
      if (memberUid && currentUser.uid === memberUid) return true;
      if (memberEmail && currentUser.email.toLowerCase() === memberEmail.toLowerCase()) return true;
      return false;
    }
    return false;
  };

  const canApprove = (): boolean => {
    if (!currentUser || currentUser.role === 'GUEST') return false;
    return currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ORGANIZATION_ADMIN';
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
