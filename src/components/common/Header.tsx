import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';
import { NavigateFn, ROLE_LANDING } from '../../lib/navigation';
import { 
  Building2, 
  Bell, 
  User, 
  LogOut, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  Menu,
  X,
  RotateCcw
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  navigate: NavigateFn;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, navigate }) => {
  const { currentUser, switchRole, logout } = useAuth();
  const { t } = useAccessibility();
  const { notifications, markNotificationAsRead, resetDemoData } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadNotifications = notifications.filter(
    (n) => (n.userId === 'ALL' || n.userId === currentUser.id) && !n.read
  );

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'APPLICANT':
        return { label: 'Applicant', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'SCRUTINY_OFFICER':
        return { label: 'Scrutiny Officer', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'SCREENING_COMMITTEE':
        return { label: 'Screening Committee', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'ADMINISTRATOR':
        return { label: 'Administrator', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header className="bg-gov-navy text-white sticky top-0 z-40 shadow-md border-b border-slate-700">
      {/* Role Switcher Banner for Demo Evaluation */}
      <div className="bg-slate-950 text-slate-300 px-4 py-1 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-semibold text-amber-400">{t('header.demoSwitcher')}</span>
          <span className="text-slate-400 hidden sm:inline">{t('header.demoHint')}</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {(['APPLICANT', 'SCRUTINY_OFFICER', 'SCREENING_COMMITTEE', 'ADMINISTRATOR', 'SUPER_ADMIN'] as UserRole[]).map((r) => {
            const isSelected = currentUser.role === r;
            const labels: Record<UserRole, string> = {
              APPLICANT: 'Applicant',
              SCRUTINY_OFFICER: 'Officer',
              SCREENING_COMMITTEE: 'Committee',
              ADMINISTRATOR: 'Admin',
              SUPER_ADMIN: 'Super Admin'
            };
            return (
              <button
                key={r}
                onClick={() => {
                  switchRole(r);
                  navigate(ROLE_LANDING[r]);
                }}
                className={`px-2 py-0.5 text-[11px] rounded transition font-medium ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {labels[r]}
              </button>
            );
          })}
          <button
            onClick={resetDemoData}
            className="flex items-center gap-1 ml-2 text-[10px] text-slate-400 hover:text-white underline"
            title="Reset to default initial demo dataset"
          >
            <RotateCcw className="w-3 h-3" /> {t('header.resetDemo')}
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('landing')}>
            <div className="w-12 h-12 bg-slate-900 border-2 border-amber-500 rounded-lg flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">Tribal Govt-Edu</span>
                <span className="text-[10px] uppercase tracking-wider bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded font-bold border border-blue-700">
                  MoTA Portal
                </span>
              </div>
              <p className="text-xs text-slate-300">{t('brand.subtitle')}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => navigate('landing')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                currentTab === 'landing' ? 'bg-blue-800 text-white font-semibold' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => navigate('schemes')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                currentTab === 'schemes' || currentTab === 'scheme-detail' ? 'bg-blue-800 text-white font-semibold' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t('nav.schemes')}
            </button>
            <button
              onClick={() => navigate('eligibility')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                currentTab === 'eligibility' ? 'bg-blue-800 text-white font-semibold' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t('nav.eligibility')}
            </button>

            {/* Role Specific Dashboard Navigation Link */}
            {currentUser.role === 'APPLICANT' && (
              <button
                onClick={() => navigate('applicant-dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentTab === 'applicant-dashboard' ? 'bg-blue-800 text-white font-semibold' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t('nav.myApplications')}
              </button>
            )}

            {currentUser.role === 'SCRUTINY_OFFICER' && (
              <button
                onClick={() => navigate('officer-dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentTab === 'officer-dashboard' ? 'bg-blue-800 text-white font-semibold' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t('nav.scrutiny')}
              </button>
            )}

            {currentUser.role === 'SCREENING_COMMITTEE' && (
              <button
                onClick={() => navigate('screening-dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentTab === 'screening-dashboard' ? 'bg-blue-800 text-white font-semibold' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t('nav.screening')}
              </button>
            )}

            {(currentUser.role === 'ADMINISTRATOR' || currentUser.role === 'SUPER_ADMIN') && (
              <button
                onClick={() => navigate('admin-dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentTab === 'admin-dashboard' ? 'bg-blue-800 text-white font-semibold' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t('nav.admin')}
              </button>
            )}

            <button
              onClick={() => navigate('help')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                currentTab === 'help' ? 'bg-blue-800 text-white font-semibold' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t('nav.help')}
            </button>
          </nav>

          {/* Right Action Icons: Notification Bell & User Profile */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full relative transition"
                title={t('header.notifications')}
                aria-label={`${t('header.notifications')} (${unreadNotifications.length})`}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-blue-600" /> {t('header.notifications')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {unreadNotifications.length} Unread
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-slate-500 text-center">{t('header.noNotifications')}</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition ${
                            !n.read ? 'bg-blue-50/60 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg border border-slate-700 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="text-left hidden xl:block">
                  <p className="text-xs font-semibold text-white leading-none">{currentUser.name}</p>
                  <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border mt-0.5 font-bold ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </div>
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-bold text-sm text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                    <div className="mt-2">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold border ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('auth-login');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-500" /> {t('header.switchAccount')}
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('landing');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" /> {t('header.signOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => { navigate('landing'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded"
          >
            {t('nav.home')}
          </button>
          <button
            onClick={() => { navigate('schemes'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded"
          >
            {t('nav.schemes')}
          </button>
          <button
            onClick={() => { navigate('eligibility'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded"
          >
            {t('nav.eligibility')}
          </button>

          {currentUser.role === 'APPLICANT' && (
            <button
              onClick={() => { navigate('applicant-dashboard'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-amber-400 bg-slate-800 rounded"
            >
              {t('nav.dashboard')}
            </button>
          )}

          {currentUser.role === 'SCRUTINY_OFFICER' && (
            <button
              onClick={() => { navigate('officer-dashboard'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-blue-400 bg-slate-800 rounded"
            >
              {t('nav.scrutiny')}
            </button>
          )}

          {currentUser.role === 'SCREENING_COMMITTEE' && (
            <button
              onClick={() => { navigate('screening-dashboard'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-purple-400 bg-slate-800 rounded"
            >
              {t('nav.screening')}
            </button>
          )}

          {(currentUser.role === 'ADMINISTRATOR' || currentUser.role === 'SUPER_ADMIN') && (
            <button
              onClick={() => { navigate('admin-dashboard'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-emerald-400 bg-slate-800 rounded"
            >
              {t('nav.admin')}
            </button>
          )}

          <button
            onClick={() => { navigate('help'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded"
          >
            {t('nav.help')}
          </button>
        </div>
      )}
    </header>
  );
};
