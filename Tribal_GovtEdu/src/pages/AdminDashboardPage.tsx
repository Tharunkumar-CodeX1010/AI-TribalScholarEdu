import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { AdminAIAssistant } from '../components/ai/AdminAIAssistant';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { AwardSanctionModal, SanctionedAwardPanel } from '../components/admin/AwardSanctionModal';
import { downloadSanctionOrder } from '../lib/awardDocument';
import { Application } from '../types';
import { NavigateFn } from '../lib/navigation';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  TrendingUp, 
  Search, 
  ShieldCheck, 
  PieChart as PieIcon,
  BarChart3,
  Sliders,
  Sparkles,
  ArrowRight,
  Gavel
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export const AdminDashboardPage: React.FC<{ navigate: NavigateFn }> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const { applications, schemes } = useData();
  const { notify } = useToast();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'analytics' | 'applications'>('analytics');
  /* Set when the AI assistant or a deep link asks for a specific file. */
  const [focusedAppId, setFocusedAppId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sanctionTarget, setSanctionTarget] = useState<Application | null>(null);

  // Metrics calculation
  const totalApps = applications.length;
  const pendingApps = applications.filter((a) => a.stage === 'UNDER_VERIFICATION' || a.stage === 'SUBMITTED').length;
  const deficiencyApps = applications.filter((a) => a.stage === 'DEFICIENCY_RAISED' || a.deficiencies.some((d) => d.status === 'OPEN')).length;
  const eligibleApps = applications.filter((a) => a.stage === 'ELIGIBLE' || a.stage === 'UNDER_SCREENING').length;
  const selectedApps = applications.filter((a) => a.stage === 'SELECTED').length;

  /* Every chart is derived from the actual application records. Nothing is
     padded with invented numbers to make a demo look busier than it is. */
  const schemeChartData = useMemo(
    () =>
      schemes.map((s) => ({
        name: s.code === 'NFST' ? 'NFST Fellowship' : `${s.code} Scheme`,
        value: applications.filter((a) => a.schemeId === s.id).length
      })),
    [schemes, applications]
  );

  const stageChartData = useMemo(
    () => [
      { stage: 'Submitted', count: applications.filter((a) => a.stage === 'SUBMITTED').length },
      { stage: 'AI Processing', count: applications.filter((a) => a.stage === 'AI_PROCESSING').length },
      { stage: 'Under Scrutiny', count: applications.filter((a) => a.stage === 'UNDER_VERIFICATION').length },
      { stage: 'Deficiency Raised', count: deficiencyApps },
      { stage: 'Recommended', count: eligibleApps },
      { stage: 'Under Screening', count: applications.filter((a) => a.stage === 'UNDER_SCREENING').length },
      { stage: 'Selected / Awarded', count: selectedApps }
    ],
    [applications, deficiencyApps, eligibleApps, selectedApps]
  );

  const stateChartData = useMemo(() => {
    const counts = new Map<string, number>();
    applications.forEach((a) => {
      const state = a.personalDetails.state || 'Not recorded';
      counts.set(state, (counts.get(state) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);
  }, [applications]);

  /* Files the committee has recommended and that still need an award decision. */
  const recommendedForSanction = useMemo(
    () => applications.filter((a) => a.stage === 'ELIGIBLE'),
    [applications]
  );

  /* Indicative ceiling: kept explicit per scheme rather than invented per row. */
  const SANCTION_CEILING: Record<string, number> = { NFST: 372000, NOS: 1250000 };
  const indicativeAmountFor = (app: Application): number => SANCTION_CEILING[app.schemeCode] ?? 372000;

  const sanctionedApps = useMemo(() => applications.filter((a) => a.stage === 'SELECTED'), [applications]);

  useEffect(() => {
    if (!focusedAppId || activeAdminSubTab !== 'applications') return;
    const row = document.getElementById(`row-${focusedAppId}`);
    row?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focusedAppId, activeAdminSubTab]);

  const totalSanctioned = useMemo(
    () => applications.reduce((sum, a) => sum + (a.stage === 'SELECTED' ? (a.awardDetails?.sanctionedAmount ?? 0) : 0), 0),
    [applications]
  );

  const COLORS = ['#1d4ed8', '#d97706', '#059669', '#6d28d9', '#dc2626'];

  const filteredApps = applications.filter((a) =>
    a.applicationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.schemeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full uppercase">
            Ministry Administrator Control Center
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Platform Analytics & Management</h1>
          <p className="text-xs text-slate-400">Directorate of Education & Fellowships • Govt of India</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('scheme-config')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4" /> Scheme Configurator
          </button>
          <button
            onClick={() => navigate('audit-logs')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Audit Trail
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Total Applications</span>
          <span className="text-2xl font-extrabold text-blue-900 block">{totalApps}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Active Portal Volume</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Pending Scrutiny</span>
          <span className="text-2xl font-extrabold text-amber-600 block">{pendingApps}</span>
          <span className="text-[10px] text-amber-600 font-semibold">In Officer Queue</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Deficiencies Open</span>
          <span className="text-2xl font-extrabold text-orange-600 block">{deficiencyApps}</span>
          <span className="text-[10px] text-orange-600 font-semibold">Resubmission Notice</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Screening Desk</span>
          <span className="text-2xl font-extrabold text-purple-700 block">{eligibleApps}</span>
          <span className="text-[10px] text-purple-600 font-semibold">Board Recommended</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Awards Released</span>
          <span className="text-2xl font-extrabold text-emerald-700 block">{selectedApps}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">DBT Sanctioned</span>
        </div>
      </div>

      {/* Admin AI Assistant Engine Component */}
      <AdminAIAssistant
        onSelectApp={(id) => {
          /* The old handler ignored the id, so clicking a result in the AI
             answer only switched tabs without selecting that application. */
          setFocusedAppId(id);
          setSearchQuery('');
          setActiveAdminSubTab('applications');
          notify(`Loaded ${id} in the master applications directory.`, 'info');
        }}
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 gap-1 text-xs font-semibold text-slate-600 shadow-sm">
        <button
          onClick={() => setActiveAdminSubTab('analytics')}
          className={`px-4 py-2.5 rounded-lg transition ${activeAdminSubTab === 'analytics' ? 'bg-blue-800 text-white font-bold shadow' : 'hover:bg-slate-100'}`}
        >
          Analytics & Visualizations
        </button>
        <button
          onClick={() => setActiveAdminSubTab('applications')}
          className={`px-4 py-2.5 rounded-lg transition ${activeAdminSubTab === 'applications' ? 'bg-blue-800 text-white font-bold shadow' : 'hover:bg-slate-100'}`}
        >
          Master Applications Directory
        </button>
      </div>

      {/* Sub-Tab 1: Analytics Charts */}
      {activeAdminSubTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Applications by Scheme Pie Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-600" /> Application Distribution by Scheme
            </h3>
            <div className="h-64">
              {schemeChartData.every((d) => d.value === 0) ? (
                <EmptyState
                  icon={PieIcon}
                  compact
                  title="No applications to chart"
                  message="Submit an application in the applicant workspace to populate this distribution."
                />
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={schemeChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {schemeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Applications Stage Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" /> Processing Lifecycle Stage Breakdown
            </h3>
            <div className="h-64">
              {totalApps === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  compact
                  title="No lifecycle data yet"
                  message="Stage volumes appear here once applications enter the workflow."
                />
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageChartData}>
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* State Wise Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> State-wise Tribal Scholarship Applications
            </h3>
            <div className="h-64">
              {stateChartData.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  compact
                  title="No state distribution yet"
                  message="Applicant home states appear here once applications are submitted."
                />
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateChartData}>
                  <XAxis dataKey="state" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Sub-Tab 2: Master Directory */}
      {activeAdminSubTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          {filteredApps.length === 0 && (
            <EmptyState
              icon={Search}
              title={applications.length === 0 ? 'No applications on record' : 'No matching applications'}
              message={
                applications.length === 0
                  ? 'The portal has no application records yet.'
                  : 'No application number, applicant name or scheme code matches that search.'
              }
              compact
            />
          )}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Application No or Applicant Name..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {sanctionedApps.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="font-bold text-xs text-slate-900 mb-3">Sanctioned Awards</h4>
              <ul className="space-y-2">
                {sanctionedApps.map((app) => (
                  <li key={app.id}>
                    <SanctionedAwardPanel app={app} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendedForSanction.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                <Gavel className="w-4 h-4 text-emerald-700" /> Awaiting Award Sanction
              </h4>
              <p className="text-[11px] text-emerald-800 mt-0.5 mb-3">
                Recommended by the Screening Committee. Final sanction rests with this desk.
              </p>
              <ul className="space-y-2">
                {recommendedForSanction.map((app) => (
                  <li
                    key={app.id}
                    className="flex flex-wrap items-center justify-between gap-3 bg-white border border-emerald-200 rounded-lg px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs">{app.applicantName}</p>
                      <p className="text-[10px] text-slate-500">
                        {app.applicationNo} &middot; {app.schemeCode} &middot; Committee score{' '}
                        {app.screeningReview?.totalScore ?? 0}/30
                      </p>
                    </div>
                    <button
                      onClick={() => setSanctionTarget(app)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-2 rounded-lg text-[10px] shrink-0"
                    >
                      Review &amp; Sanction
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Application No</th>
                  <th className="p-3">Applicant</th>
                  <th className="p-3">Scheme</th>
                  <th className="p-3">Submission Date</th>
                  <th className="p-3">AI Score</th>
                  <th className="p-3 text-center">Current Stage</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    id={`row-${app.id}`}
                    className={`hover:bg-slate-50 ${
                      app.id === focusedAppId ? 'bg-blue-50 ring-2 ring-inset ring-blue-500' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-slate-900">{app.applicationNo}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{app.applicantName}</p>
                      <p className="text-[10px] text-slate-500">{app.applicantEmail}</p>
                    </td>
                    <td className="p-3 font-semibold text-blue-800">{app.schemeCode}</td>
                    <td className="p-3 text-slate-600">{new Date(app.submissionDate).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                        {app.aiVerificationSummary.overallScore}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={app.stage} size="sm" />
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {app.stage === 'ELIGIBLE' && (
                        <button
                          onClick={() => setSanctionTarget(app)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                        >
                          Sanction Award
                        </button>
                      )}
                      {app.stage === 'SELECTED' && app.awardDetails && (
                        <button
                          onClick={() => {
                            const award = app.awardDetails;
                            if (award) downloadSanctionOrder(award, app.schemeTitle, app.applicantName);
                          }}
                          className="bg-slate-700 hover:bg-slate-800 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                        >
                          Sanction Order
                        </button>
                      )}
                      <button
                        onClick={() => navigate('officer-dashboard', { applicationId: app.id })}
                        className="bg-blue-700 hover:bg-blue-800 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                      >
                        Inspect File
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sanctionTarget && (
        <AwardSanctionModal
          app={sanctionTarget}
          defaultAmount={indicativeAmountFor(sanctionTarget)}
          onClose={() => setSanctionTarget(null)}
        />
      )}

    </div>
  );
};
