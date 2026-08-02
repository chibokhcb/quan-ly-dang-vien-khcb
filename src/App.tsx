import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { MemberDetail } from './pages/MemberDetail';
import { MyProfile } from './pages/MyProfile';
import { ForeignTrips } from './pages/ForeignTrips';
import { Development } from './pages/Development';
import { CandidateDetail } from './pages/CandidateDetail';
import { AdmissionDossiers } from './pages/AdmissionDossiers';
import { AdmissionDossierDetail } from './pages/AdmissionDossierDetail';
import { OfficializationDossiers } from './pages/OfficializationDossiers';
import { OfficializationDossierDetail } from './pages/OfficializationDossierDetail';
import { Templates } from './pages/Templates';
import { Approvals } from './pages/Approvals';
import { Reports } from './pages/Reports';
import { UsersPage } from './pages/UsersPage';
import { AuditLogs } from './pages/AuditLogs';
import { PolicyVersions } from './pages/PolicyVersions';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { currentUser, isGuest } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');

  if (!currentUser) {
    return <Login onLoginSuccess={() => setCurrentPath('/dashboard')} />;
  }

  const renderPage = () => {
    if (currentPath === '/dashboard') return <Dashboard onNavigate={(path) => setCurrentPath(path)} />;
    if (currentPath === '/members') return <Members onNavigate={(path) => setCurrentPath(path)} />;
    if (currentPath.startsWith('/members/')) {
      const id = currentPath.split('/members/')[1];
      return <MemberDetail memberId={id} onBack={() => setCurrentPath('/members')} />;
    }
    if (currentPath === '/me') return <MyProfile />;
    if (currentPath === '/foreign-trips') return <ForeignTrips />;
    if (currentPath === '/development') {
      return <Development onNavigateCandidate={(id) => setCurrentPath(`/development/${id}`)} />;
    }
    if (currentPath.startsWith('/development/')) {
      const id = currentPath.split('/development/')[1];
      return <CandidateDetail candidateId={id} onBack={() => setCurrentPath('/development')} />;
    }
    if (currentPath === '/admission-dossiers') {
      return <AdmissionDossiers onNavigateDetail={(id) => setCurrentPath(`/admission-dossiers/${id}`)} />;
    }
    if (currentPath.startsWith('/admission-dossiers/')) {
      const id = currentPath.split('/admission-dossiers/')[1];
      return <AdmissionDossierDetail dossierId={id} onBack={() => setCurrentPath('/admission-dossiers')} />;
    }
    if (currentPath === '/officialization-dossiers') {
      return <OfficializationDossiers onNavigateDetail={(id) => setCurrentPath(`/officialization-dossiers/${id}`)} />;
    }
    if (currentPath.startsWith('/officialization-dossiers/')) {
      const id = currentPath.split('/officialization-dossiers/')[1];
      return <OfficializationDossierDetail dossierId={id} onBack={() => setCurrentPath('/officialization-dossiers')} />;
    }
    if (currentPath === '/templates') return <Templates />;
    if (currentPath === '/approvals') return <Approvals />;
    if (currentPath === '/reports') return <Reports />;
    if (currentPath === '/users') return <UsersPage />;
    if (currentPath === '/audit-logs') return <AuditLogs />;
    if (currentPath === '/policy-versions') return <PolicyVersions />;
    if (currentPath === '/settings') return <SettingsPage />;

    return <Dashboard onNavigate={(path) => setCurrentPath(path)} />;
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col font-sans text-[#2D2D2D] antialiased selection:bg-[#FFD700]/30">
      <Navbar />
      {isGuest && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-xs font-semibold text-amber-950 flex items-center justify-between">
          <span>
            ℹ️ <strong>Chế độ xem thông tin (Khách):</strong> Tài khoản email <code className="bg-amber-200 px-1 rounded font-mono text-amber-900">{currentUser.email}</code> chưa được phân quyền quản trị trong hệ thống. Bạn có quyền xem toàn bộ dữ liệu, liên hệ Bí thư để được cập nhật phân quyền bổ sung.
          </span>
        </div>
      )}
      <div className="flex flex-1">
        <Sidebar activePath={currentPath} onNavigate={(path) => setCurrentPath(path)} />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">{renderPage()}</main>
      </div>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
