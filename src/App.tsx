import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ToastProvider } from './context/ToastContext';
import { TopGovBanner } from './components/common/TopGovBanner';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ApplicantChatbot } from './components/ai/ApplicantChatbot';
import { EmptyState } from './components/common/EmptyState';
import { ShieldAlert } from 'lucide-react';
import { NavigateFn, TabId, ROLE_GATED, ROLE_LANDING } from './lib/navigation';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SchemesPage } from './pages/SchemesPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { EligibilityCheckerPage } from './pages/EligibilityCheckerPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ApplicantDashboardPage } from './pages/ApplicantDashboardPage';
import { ApplicationWizardPage } from './pages/ApplicationWizardPage';
import { OfficerScrutinyPage } from './pages/OfficerScrutinyPage';
import { ScreeningDashboardPage } from './pages/ScreeningDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SchemeConfigPage } from './pages/SchemeConfigPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { HelpFAQPage } from './pages/HelpFAQPage';

export type { TabId } from './lib/navigation';

const MainContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabId>('landing');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('sch-nfst');
  const [focusApplicationId, setFocusApplicationId] = useState<string | undefined>(undefined);

  /** Single navigation entry point so scheme / application context is never silently dropped. */
  const navigate = useCallback((tab: TabId, opts?: { schemeId?: string; applicationId?: string }) => {
    if (opts?.schemeId) setSelectedSchemeId(opts.schemeId);
    if (opts?.applicationId) setFocusApplicationId(opts.applicationId);
    setCurrentTab(tab);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  const allowed = useMemo(() => {
    const gate = ROLE_GATED[currentTab];
    return !gate || gate.includes(currentUser.role);
  }, [currentTab, currentUser.role]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <TopGovBanner />
      <Header currentTab={currentTab} navigate={navigate} />

      <main className="flex-1">
        {!allowed ? (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <EmptyState
                icon={ShieldAlert}
                title="Access restricted for your role"
                message={`This workspace is reserved for ${
                  (ROLE_GATED[currentTab] ?? []).map((r) => r.replace(/_/g, ' ').toLowerCase()).join(' / ')
                } accounts. You are currently signed in as ${currentUser.role.replace(/_/g, ' ').toLowerCase()}.`}
                action={
                  <button
                    onClick={() => navigate(ROLE_LANDING[currentUser.role])}
                    className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition"
                  >
                    Go to my dashboard
                  </button>
                }
              />
            </div>
          </div>
        ) : (
          <>
            {currentTab === 'landing' && <LandingPage navigate={navigate} />}
            {currentTab === 'schemes' && <SchemesPage navigate={navigate} />}
            {currentTab === 'scheme-detail' && <SchemeDetailPage schemeId={selectedSchemeId} navigate={navigate} />}
            {currentTab === 'eligibility' && <EligibilityCheckerPage schemeId={selectedSchemeId} navigate={navigate} />}
            {currentTab === 'auth-login' && <LoginPage navigate={navigate} />}
            {currentTab === 'auth-register' && <RegisterPage navigate={navigate} />}
            {currentTab === 'applicant-dashboard' && <ApplicantDashboardPage navigate={navigate} />}
            {currentTab === 'application-wizard' && <ApplicationWizardPage initialSchemeId={selectedSchemeId} navigate={navigate} />}
            {currentTab === 'officer-dashboard' && (
              <OfficerScrutinyPage navigate={navigate} focusApplicationId={focusApplicationId} />
            )}
            {currentTab === 'screening-dashboard' && <ScreeningDashboardPage navigate={navigate} />}
            {currentTab === 'admin-dashboard' && <AdminDashboardPage navigate={navigate} />}
            {currentTab === 'scheme-config' && <SchemeConfigPage navigate={navigate} />}
            {currentTab === 'audit-logs' && <AuditLogPage navigate={navigate} />}
            {currentTab === 'help' && <HelpFAQPage navigate={navigate} />}
          </>
        )}
      </main>

      <ApplicantChatbot />
      <Footer navigate={navigate} />
    </div>
  );
};

export default function App() {
  return (
    <AccessibilityProvider>
      <ToastProvider>
        <DataProvider>
          <AuthProvider>
            <MainContent />
          </AuthProvider>
        </DataProvider>
      </ToastProvider>
    </AccessibilityProvider>
  );
}
