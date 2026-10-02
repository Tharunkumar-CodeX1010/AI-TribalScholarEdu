import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Application, Deficiency } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { OCRViewer } from '../components/officer/OCRViewer';
import { EmptyState } from '../components/common/EmptyState';
import { FileText, CheckCircle2, AlertTriangle, XCircle, Search, Filter, ShieldCheck, Sparkles, Send, Eye, Inbox, UserCheck } from 'lucide-react';
import { NavigateFn } from '../lib/navigation';

interface OfficerScrutinyProps {
  navigate: NavigateFn;
  focusApplicationId?: string;
}

/** Stages a scrutiny officer is expected to act on. */
const OFFICER_STAGES = ['SUBMITTED', 'AI_PROCESSING', 'UNDER_VERIFICATION', 'DEFICIENCY_RAISED', 'RESUBMITTED'] as const;
type OfficerStage = (typeof OFFICER_STAGES)[number];

const SUGGESTED_DEADLINE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
})();

export const OfficerScrutinyPage: React.FC<OfficerScrutinyProps> = ({ navigate, focusApplicationId }) => {
  const { currentUser } = useAuth();
  /* Administrators reach this page read-only through the master directory. */
  const isScrutinyOfficer = currentUser.role === 'SCRUTINY_OFFICER';
  const { applications, updateApplicationStatus, raiseDeficiency, assignApplication } = useData();
  const { notify } = useToast();

  const [selectedAppId, setSelectedAppId] = useState<string | null>(focusApplicationId ?? null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'ai' | 'deficiencies' | 'action'>('overview');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Deficiency form
  const [defCategory, setDefCategory] = useState<Deficiency['category']>('CERTIFICATE_EXPIRED');
  const [defTitle, setDefTitle] = useState('');
  const [defDescription, setDefDescription] = useState('');
  const [defDeadline, setDefDeadline] = useState(SUGGESTED_DEADLINE);
  const [defErrors, setDefErrors] = useState<Record<string, string>>({});

  // Approval / Rejection remarks
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [remarkError, setRemarkError] = useState<string>('');

  /* An officer sees the files assigned to them, plus the unassigned pool that
     they are entitled to pick up. The old "|| true" filter hid that distinction. */
  const assignedApps = useMemo(
    () => applications.filter((a) => a.assignedOfficerId === currentUser.id),
    [applications, currentUser.id]
  );
  const unassignedApps = useMemo(
    () => applications.filter((a) => !a.assignedOfficerId),
    [applications]
  );

  /* Both queues must stay reachable: the previous ternary hid the unassigned
     pool as soon as an officer held a file, so they could never take new work. */
  const [queueView, setQueueView] = useState<'MINE' | 'POOL'>('MINE');
  useEffect(() => {
    if (assignedApps.length === 0 && unassignedApps.length > 0) setQueueView('POOL');
  }, [assignedApps.length, unassignedApps.length]);

  const queueApps = queueView === 'MINE' ? assignedApps : unassignedApps;
  const poolLabel = queueView === 'MINE' ? 'My Assigned Files' : 'Unassigned Pool';

  /* A file the officer may open: their own, the unassigned pool, or an explicit
     deep link from the administrator. */
  const claimableIds = useMemo(
    () => new Set([...assignedApps, ...unassignedApps].map((a) => a.id)),
    [assignedApps, unassignedApps]
  );
  const deepLinkedApp = focusApplicationId
    ? applications.find((a) => a.id === focusApplicationId)
    : undefined;

  /* Honour a deep link from the admin dashboard, and clear it once consumed. */
  useEffect(() => {
    if (focusApplicationId) {
      setSelectedAppId(focusApplicationId);
      setActiveTab('overview');
    }
  }, [focusApplicationId]);

  /* Reset a stale selection when the officer switches queue. */
  useEffect(() => {
    if (selectedAppId && !claimableIds.has(selectedAppId)) setSelectedAppId(null);
  }, [claimableIds, selectedAppId]);

  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<'ALL' | OfficerStage>('ALL');

  const visibleApps = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return queueApps.filter((a) => {
      if (stageFilter !== 'ALL' && a.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        a.applicantName.toLowerCase().includes(q) ||
        a.applicationNo.toLowerCase().includes(q) ||
        a.schemeCode.toLowerCase().includes(q)
      );
    });
  }, [queueApps, searchTerm, stageFilter]);

  const activeApp =
    applications.find((a) => a.id === selectedAppId && claimableIds.has(a.id)) ??
    queueApps[0] ??
    deepLinkedApp;

  const isUnclaimed = Boolean(activeApp && !activeApp.assignedOfficerId);

  const TABS: { key: typeof activeTab; label: string }[] = [
    { key: 'overview', label: 'Overview & Details' },
    { key: 'documents', label: 'Document OCR Audit' },
    { key: 'ai', label: 'AI Consistency Engine' },
    ...(isScrutinyOfficer
      ? ([
          { key: 'deficiencies', label: 'Raise Deficiency' },
          { key: 'action', label: 'Scrutiny Verdict' }
        ] as { key: typeof activeTab; label: string }[])
      : [])
  ];

  useEffect(() => {
    if (!isScrutinyOfficer && (activeTab === 'deficiencies' || activeTab === 'action')) {
      setActiveTab('overview');
    }
  }, [isScrutinyOfficer, activeTab]);

  const handleClaimFile = () => {
    if (!activeApp) return;
    assignApplication(activeApp.id, currentUser.id, currentUser.name, {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role
    });
    setQueueView('MINE');
    notify(`File ${activeApp.applicationNo} assigned to you.`, 'success');
  };

  const activeDoc = activeApp?.documents.find((d) => d.id === selectedDocId) || activeApp?.documents[0];

  const handleRaiseDeficiencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp) return;

    const errs: Record<string, string> = {};
    if (defTitle.trim().length < 5) errs.title = 'Enter a short, specific notice title.';
    if (defDescription.trim().length < 15) errs.description = 'Explain what the applicant must correct.';
    if (!defDeadline) errs.deadline = 'Set a response deadline.';
    else if (new Date(defDeadline) < new Date()) errs.deadline = 'The deadline must be in the future.';
    setDefErrors(errs);
    if (Object.keys(errs).length > 0) {
      notify('Please complete the deficiency notice before raising it.', 'error');
      return;
    }

    raiseDeficiency(activeApp.id, activeDoc?.id, defTitle.trim(), defDescription.trim(), defCategory, defDeadline, {
      id: currentUser.id,
      name: currentUser.name
    });
    notify(`Deficiency notice raised on ${activeApp.applicationNo}.`, 'success');
    setDefTitle('');
    setDefDescription('');
    setDefErrors({});
  };

  const handleForwardToScreening = () => {
    if (!activeApp) return;
    if (officerRemarks.trim().length < 10) {
      setRemarkError('Record at least a sentence of verification remarks before forwarding.');
      notify('Verification remarks are mandatory for the audit trail.', 'error');
      return;
    }
    setRemarkError('');
    updateApplicationStatus(activeApp.id, 'UNDER_SCREENING', officerRemarks.trim(), {
      id: currentUser.id,
      name: currentUser.name,
      role: 'SCRUTINY_OFFICER'
    });
    notify(`${activeApp.applicationNo} forwarded to the Screening Committee.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-400 bg-blue-950/80 border border-blue-500/40 px-3 py-1 rounded-full uppercase">
            Scrutiny Officer Workspace
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Application Verification Queue</h1>
          <p className="text-xs text-slate-400">Assigned Officer: {currentUser.name} • {currentUser.department || 'Verification Division'}</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 font-semibold">
          Queue Total: <strong className="text-amber-400">{queueApps.length} Applications</strong>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Applications Queue Table (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">{poolLabel}</h3>
            <span className="text-[10px] text-slate-400 font-bold">{queueApps.length} Records</span>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg" role="tablist" aria-label="Queue selection">
            <button
              type="button"
              role="tab"
              aria-selected={queueView === 'MINE'}
              onClick={() => setQueueView('MINE')}
              className={`rounded-md px-2 py-1.5 text-[11px] font-bold transition ${
                queueView === 'MINE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mine ({assignedApps.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={queueView === 'POOL'}
              onClick={() => setQueueView('POOL')}
              className={`rounded-md px-2 py-1.5 text-[11px] font-bold transition ${
                queueView === 'POOL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Unassigned ({unassignedApps.length})
            </button>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or application no."
                aria-label="Search the verification queue"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value as typeof stageFilter)}
                aria-label="Filter queue by stage"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All stages</option>
                {OFFICER_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {visibleApps.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No matching files"
                message={
                  queueApps.length === 0
                    ? queueView === 'MINE'
                      ? 'No files are assigned to you. Switch to the unassigned tab to pick up work from the shared pool.'
                      : 'The unassigned pool is empty. New submissions will appear here for allocation.'
                    : 'No file in your queue matches the current search or stage filter.'
                }
                compact
              />
            ) : (
              visibleApps.map((app) => {
                const isSelected = activeApp?.id === app.id;
                return (
                  <button
                    type="button"
                    key={app.id}
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setSelectedDocId(null);
                      setActiveTab('overview');
                    }}
                    aria-current={isSelected}
                    className={`w-full text-left p-3.5 rounded-xl border transition text-xs ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-600 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{app.applicationNo}</span>
                      <StatusBadge status={app.stage} size="sm" />
                    </div>
                    <p className="font-semibold text-slate-800 mt-1">{app.applicantName}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>{app.schemeCode}</span>
                      <span>
                        AI score <strong className="text-emerald-700">{app.aiVerificationSummary.overallScore}%</strong>
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Application Inspection Workspace (8 cols) */}
        {activeApp && (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            {/* Header Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {activeApp.schemeCode} • Application #{activeApp.applicationNo}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">{activeApp.applicantName}</h2>
                <p className="text-xs text-slate-500">
                  Submitted: {new Date(activeApp.submissionDate).toLocaleDateString()} &bull; Assigned to{' '}
                  {activeApp.assignedOfficerName ?? 'nobody yet'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={activeApp.stage} size="lg" />
                {isUnclaimed && isScrutinyOfficer && (
                  <button
                    type="button"
                    onClick={handleClaimFile}
                    className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-3.5 py-2 rounded-lg text-[11px] inline-flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Assign to me
                  </button>
                )}
              </div>
            </div>

            {!isScrutinyOfficer && (
              <p className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-[11px] font-medium text-amber-900">
                Read-only view. As {currentUser.role.replace(/_/g, ' ').toLowerCase()} you can inspect the file, but
                only the scrutiny officer can raise deficiencies or record a verdict.
              </p>
            )}

            {/* Workspace Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 rounded-xl p-1 gap-1 text-xs font-semibold text-slate-600">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition ${
                    activeTab === t.key ? 'bg-blue-800 text-white font-bold shadow' : 'hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">Aadhaar Number:</span>
                    <span className="font-bold text-slate-900">{activeApp.personalDetails.aadhaarNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">ST Certificate No:</span>
                    <span className="font-bold text-slate-900">{activeApp.personalDetails.stCertNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">Tribe / Community:</span>
                    <span className="font-bold text-slate-900">{activeApp.personalDetails.tribeName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">Annual Family Income:</span>
                    <span className="font-bold text-slate-900">₹{activeApp.personalDetails.annualFamilyIncome.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Academic & Target Admission Information</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <p><strong>Qualifying Degree:</strong> {activeApp.academicDetails.highestQualification} ({activeApp.academicDetails.percentageOrCGPA})</p>
                    <p><strong>Target Institution:</strong> {activeApp.academicDetails.targetInstitution}</p>
                    <p><strong>Research Topic:</strong> {activeApp.academicDetails.researchTopic || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Document OCR Viewer */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <span className="text-xs font-bold text-slate-600 mr-2">Select Document:</span>
                  {activeApp.documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        activeDoc?.id === doc.id ? 'bg-blue-800 text-white shadow' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {doc.documentName}
                    </button>
                  ))}
                </div>

                {activeDoc ? (
                  <OCRViewer application={activeApp} document={activeDoc} />
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">No documents uploaded for this application.</p>
                )}
              </div>
            )}

            {/* Tab 3: AI Consistency Engine */}
            {activeTab === 'ai' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> AI Document Verification Summary
                    </span>
                    <span className="text-emerald-400 font-bold text-sm">Overall Confidence: {activeApp.aiVerificationSummary.overallScore}%</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{activeApp.aiVerificationSummary.summaryText}</p>
                  <div className="pt-2 border-t border-slate-800 text-amber-300 font-semibold">
                    Recommended Action: {activeApp.aiVerificationSummary.recommendation}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Deficiencies */}
            {activeTab === 'deficiencies' && isScrutinyOfficer && (
              <form onSubmit={handleRaiseDeficiencySubmit} className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Raise Official Deficiency Request</h4>
                
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deficiency Category</label>
                  <select
                    value={defCategory}
                    onChange={(e: any) => setDefCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold"
                  >
                    <option value="CERTIFICATE_EXPIRED">Certificate Financial Year Expired</option>
                    <option value="NAME_MISMATCH">Spelling Mismatch with Application</option>
                    <option value="DOCUMENT_BLURRY">Unreadable / Blurry Image Document</option>
                    <option value="DOCUMENT_MISSING">Mandatory Page Missing</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="defTitle" className="block font-bold text-slate-700 mb-1">
                    Deficiency Notice Title
                  </label>
                  <input
                    id="defTitle"
                    type="text"
                    value={defTitle}
                    onChange={(e) => setDefTitle(e.target.value)}
                    aria-invalid={Boolean(defErrors.title)}
                    aria-describedby={defErrors.title ? 'defTitle-err' : undefined}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
                  />
                  {defErrors.title && (
                    <p id="defTitle-err" className="text-[11px] text-rose-700 font-medium mt-1">
                      {defErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="defDesc" className="block font-bold text-slate-700 mb-1">
                    Detailed Explanation for Applicant
                  </label>
                  <textarea
                    id="defDesc"
                    rows={3}
                    value={defDescription}
                    onChange={(e) => setDefDescription(e.target.value)}
                    aria-invalid={Boolean(defErrors.description)}
                    aria-describedby={defErrors.description ? 'defDesc-err' : undefined}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
                  />
                  {defErrors.description && (
                    <p id="defDesc-err" className="text-[11px] text-rose-700 font-medium mt-1">
                      {defErrors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="defDeadline" className="block font-bold text-slate-700 mb-1">
                    Resubmission Deadline Date
                  </label>
                  <input
                    id="defDeadline"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={defDeadline}
                    onChange={(e) => setDefDeadline(e.target.value)}
                    aria-invalid={Boolean(defErrors.deadline)}
                    aria-describedby={defErrors.deadline ? 'defDeadline-err' : undefined}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
                  />
                  {defErrors.deadline && (
                    <p id="defDeadline-err" className="text-[11px] text-rose-700 font-medium mt-1">
                      {defErrors.deadline}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition shadow flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" /> Raise Deficiency Notice
                </button>
              </form>
            )}

            {/* Tab 5: Verdict Action */}
            {activeTab === 'action' && isScrutinyOfficer && (
              <div className="space-y-6 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Your remarks are written to the permanent audit trail. Forwarding a file hands it to the
                  Screening Committee for academic merit review &mdash; it does not sanction an award.
                </p>

                <div>
                  <label htmlFor="officerRemarks" className="block font-bold text-slate-800 mb-1">
                    Scrutiny Officer Audit Remarks <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    id="officerRemarks"
                    rows={3}
                    value={officerRemarks}
                    onChange={(e) => {
                      setOfficerRemarks(e.target.value);
                      if (remarkError) setRemarkError('');
                    }}
                    aria-invalid={Boolean(remarkError)}
                    aria-describedby={remarkError ? 'remarks-err' : undefined}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 font-medium"
                  />
                  {remarkError && (
                    <p id="remarks-err" className="text-[11px] text-rose-700 font-medium mt-1">
                      {remarkError}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleForwardToScreening}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition shadow flex items-center gap-2 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Verify &amp; Forward to Screening Committee
                  </button>

                  <button
                    onClick={() => {
                      if (officerRemarks.trim().length < 10) {
                        setRemarkError('A rejection reason of at least one sentence is mandatory.');
                        notify('Record a reason before rejecting.', 'error');
                        return;
                      }
                      setRemarkError('');
                      updateApplicationStatus(activeApp.id, 'REJECTED', officerRemarks.trim(), {
                        id: currentUser.id,
                        name: currentUser.name,
                        role: 'SCRUTINY_OFFICER'
                      });
                      notify(`${activeApp.applicationNo} rejected at scrutiny.`, 'success');
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-3 rounded-xl transition shadow flex items-center gap-2 text-xs"
                  >
                    <XCircle className="w-4 h-4" /> Reject Application with Reason
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
