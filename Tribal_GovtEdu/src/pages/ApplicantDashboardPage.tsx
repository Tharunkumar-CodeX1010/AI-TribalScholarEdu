import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Application, Deficiency } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/StatusBadge';
import { VisualTracker } from '../components/common/VisualTracker';
import { DeficiencyResponderModal } from '../components/applicant/DeficiencyResponderModal';
import { AwardTracker } from '../components/applicant/AwardTracker';
import { NavigateFn } from '../lib/navigation';
import { AlertTriangle, Plus, FolderOpen, Inbox } from 'lucide-react';

export const ApplicantDashboardPage: React.FC<{ navigate: NavigateFn }> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const { applications } = useData();

  /* Scoped to the signed-in applicant. The previous `|| applications[0]` fallback
     exposed another applicant's file to anyone without an application record. */
  const email = currentUser.email.toLowerCase();
  const userApps = applications.filter((a) => a.applicantId === currentUser.id || a.applicantEmail.toLowerCase() === email);

  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const activeApp: Application | undefined =
    userApps.find((a) => a.id === activeAppId) ?? userApps[0];

  const openDeficiency = activeApp?.deficiencies.find((d) => d.status === 'OPEN' || d.status === 'RESUBMITTED');
  const profileComplete = Boolean(currentUser.profileCompleted && currentUser.stCertNo);

  const [selectedDeficiency, setSelectedDeficiency] = useState<Deficiency | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Welcome Banner & Profile Meter */}
      <div className="bg-gradient-to-r from-gov-navy to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full uppercase">
            Applicant Control Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            ST Certificate:{' '}
            <strong className="text-amber-300">
              {currentUser.stCertNo || 'Not recorded in profile'}
            </strong>{' '}
            &bull; State: {currentUser.state || 'Not recorded'}
          </p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 space-y-2 text-xs text-right shrink-0">
          <div className="flex items-center justify-between gap-4 font-bold text-slate-300">
            <span>Profile completion:</span>
            <span className={profileComplete ? 'text-emerald-400' : 'text-amber-400'}>
              {profileComplete ? 'Complete' : 'Incomplete'}
            </span>
          </div>
          <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={profileComplete ? 'bg-emerald-500 h-full w-full' : 'bg-amber-500 h-full w-1/3'}
            />
          </div>
        </div>
      </div>

      {/* Multiple applications under the same login */}
      {userApps.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
            Your applications ({userApps.length})
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {userApps.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setActiveAppId(a.id)}
                  aria-current={activeApp?.id === a.id}
                  className={`w-full text-left rounded-xl border px-3.5 py-3 transition text-[11px] ${
                    activeApp?.id === a.id
                      ? 'bg-blue-50 border-blue-600'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{a.schemeCode}</span>
                    <StatusBadge status={a.stage} />
                  </span>
                  <span className="block text-slate-500 mt-1">
                    {a.applicationNo} &middot; {a.schemeTitle}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Active Application Section */}
      {activeApp ? (
        <div className="space-y-8">
          
          {/* Status Overview Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {activeApp.schemeCode} • Application No: {activeApp.applicationNo}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{activeApp.schemeTitle}</h2>
                <p className="text-xs text-slate-500">Submitted on: {new Date(activeApp.submissionDate).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={activeApp.stage} size="lg" />
              </div>
            </div>

            {/* Deficiency Alert Banner if open */}
            {openDeficiency && (
              <div className="bg-orange-50 border-2 border-orange-300 p-5 rounded-xl text-orange-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-orange-900">Deficiency Response Required</h4>
                    <p className="text-xs mt-0.5 text-slate-800">
                      <strong>{openDeficiency.title}:</strong> {openDeficiency.description}
                    </p>
                    <span className="text-[10px] text-rose-700 font-bold block mt-1">
                      Deadline: {new Date(openDeficiency.deadlineDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDeficiency(openDeficiency)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition shadow shrink-0"
                >
                  Respond to Deficiency Now
                </button>
              </div>
            )}

            {/* Visual Stage Tracker */}
            <VisualTracker currentStage={activeApp.stage} hasDeficiency={Boolean(openDeficiency)} />

          </div>

          {/* Award Tracker if Selected */}
          {activeApp.stage === 'SELECTED' && activeApp.awardDetails && (
            <AwardTracker
              award={activeApp.awardDetails}
              schemeTitle={activeApp.schemeTitle}
              applicantName={activeApp.applicantName}
            />
          )}

        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={Inbox}
            title="No applications under this login"
            message={
              userApps.length === 0
                ? 'Applications submitted with this email address will appear here with their live scrutiny, screening and award status.'
                : 'Select an application above to continue.'
            }
            action={
              <button
                onClick={() => navigate('schemes')}
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Browse open schemes
              </button>
            }
          />
        </div>
      )}

      {/* Modal for Deficiency Response */}
      {selectedDeficiency && activeApp && (
        <DeficiencyResponderModal
          application={activeApp}
          deficiency={selectedDeficiency}
          onClose={() => setSelectedDeficiency(null)}
        />
      )}

    </div>
  );
};
