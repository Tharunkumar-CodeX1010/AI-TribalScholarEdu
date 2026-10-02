import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { ScreeningReview } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Award, CheckCircle2, Star, FileText, UserCheck, ShieldCheck, Award as AwardIcon } from 'lucide-react';
import { NavigateFn } from '../lib/navigation';

export const ScreeningDashboardPage: React.FC<{ navigate: NavigateFn }> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const { applications, recordScreeningReview } = useData();
  const { notify } = useToast();

  /* The committee reviews files forwarded by scrutiny officers. Recommended files
     then sit in ELIGIBLE until an Administrator sanctions the award. */
  const screeningQueue = useMemo(
    () => applications.filter((a) => a.stage === 'UNDER_SCREENING' || a.stage === 'ELIGIBLE'),
    [applications]
  );
  const alreadyDecided = useMemo(
    () => applications.filter((a) => a.stage === 'SELECTED' || a.stage === 'REJECTED' || a.stage === 'NOT_SELECTED'),
    [applications]
  );

  const [selectedAppId, setSelectedAppId] = useState<string | null>(screeningQueue[0]?.id ?? null);

  const activeApp =
    applications.find((a) => a.id === selectedAppId) ?? screeningQueue[0] ?? alreadyDecided[0];

  // Scoring states
  const [academicScore, setAcademicScore] = useState<number>(0);
  const [researchScore, setResearchScore] = useState<number>(0);
  const [socioScore, setSocioScore] = useState<number>(0);
  const [decision, setDecision] = useState<'RECOMMENDED' | 'REJECTED' | 'WAITLISTED'>('RECOMMENDED');
  const [remarks, setRemarks] = useState('');
  const [scoreError, setScoreError] = useState<string>('');
  const [remarkError, setRemarkError] = useState<string>('');

  const totalScore = academicScore + researchScore + socioScore;

  const isReadOnly = activeApp?.stage !== 'UNDER_SCREENING';

  const handleRecordDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp || isReadOnly) return;

    /* The board must genuinely score the file before it can recommend it. */
    if (academicScore === 0 || researchScore === 0 || socioScore === 0) {
      setScoreError('Award a score in all three categories before recording a decision.');
      notify('All three scoring categories must be assessed.', 'error');
      return;
    }
    if (remarks.trim().length < 15) {
      setRemarkError('Record the reasoning behind this decision for the audit trail.');
      notify('Committee remarks are mandatory.', 'error');
      return;
    }
    setScoreError('');
    setRemarkError('');

    const review: ScreeningReview = {
      id: `scr-${Date.now()}`,
      applicationId: activeApp.id,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      academicMeritScore: academicScore,
      researchProposalScore: researchScore,
      socioEconomicScore: socioScore,
      totalScore,
      decision,
      remarks: remarks.trim(),
      reviewedDate: new Date().toISOString()
    };

    /* Recommendation only. The Administrator performs final award sanction. */
    recordScreeningReview(activeApp.id, review);

    notify(
      decision === 'RECOMMENDED'
        ? `${activeApp.applicationNo} recommended and forwarded to the Administrator for award sanction.`
        : `Decision "${decision}" recorded for ${activeApp.applicationNo}.`,
      'success'
    );

    setAcademicScore(0);
    setResearchScore(0);
    setSocioScore(0);
    setRemarks('');
    setDecision('RECOMMENDED');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 bg-purple-950/80 border border-purple-500/40 px-3 py-1 rounded-full uppercase">
            National Academic Screening Board
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Screening & Selection Desk</h1>
          <p className="text-xs text-slate-400">Board Reviewer: {currentUser.name} • {currentUser.department || 'Academic Committee'}</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 font-semibold">
          Candidates for Evaluation: <strong className="text-purple-400">{screeningQueue.length} Scholars</strong>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Candidates Matrix List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            Screening Candidates Matrix
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {screeningQueue.map((app) => {
              const isSelected = activeApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                    isSelected ? 'bg-purple-50 border-purple-600 shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{app.applicantName}</span>
                    <StatusBadge status={app.stage} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{app.schemeCode} • {app.academicDetails.targetInstitution}</p>
                  {app.screeningReview && (
                    <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                      <span>Committee Score: {app.screeningReview.totalScore}/30</span>
                      <span>{app.screeningReview.decision}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Candidate Assessment & Scoring Form (8 cols) */}
        {activeApp && (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  {activeApp.schemeCode} Candidate Evaluation
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">{activeApp.applicantName}</h2>
                <p className="text-xs text-slate-500">Degree: {activeApp.academicDetails.highestQualification} ({activeApp.academicDetails.percentageOrCGPA})</p>
              </div>

              <StatusBadge status={activeApp.stage} size="lg" />
            </div>

            {/* Academic & Research Profile */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <p><strong>Target Varsity:</strong> {activeApp.academicDetails.targetInstitution}</p>
              <p><strong>Research Topic:</strong> {activeApp.academicDetails.researchTopic || 'N/A'}</p>
                  <p><strong>Officer Verification Notes:</strong> {activeApp.stage === 'UNDER_SCREENING' ? 'The scrutiny officer has forwarded this file. Review the officer remarks in the audit trail if you need context.' : 'This file already carries a recorded screening outcome and is read-only.'}</p>
            </div>

            {isReadOnly && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                <AwardIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <strong>Awaiting award sanction.</strong> {activeApp.screeningReview
                    ? `The committee recorded "${activeApp.screeningReview.decision}" with a score of ${activeApp.screeningReview.totalScore}/30. An Administrator must now sanction or decline the award.`
                    : 'This file has already left the committee desk.'}
                </div>
              </div>
            )}

            {/* Committee Evaluation Form */}
            <form
              onSubmit={handleRecordDecisionSubmit}
              className={`space-y-6 text-xs border-t border-slate-200 pt-4 ${isReadOnly ? 'opacity-60 pointer-events-none' : ''}`}
              aria-disabled={isReadOnly}
            >
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Academic Board Scoring Matrix (Max 30 Marks)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <label className="block font-bold text-slate-800">Academic Record (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={academicScore}
                    onChange={(e) => {
                      setAcademicScore(Number(e.target.value));
                      if (scoreError) setScoreError('');
                    }}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-sm font-bold text-slate-900"
                    required
                  />
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <label className="block font-bold text-slate-800">Research Merit (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={researchScore}
                    onChange={(e) => {
                      setResearchScore(Number(e.target.value));
                      if (scoreError) setScoreError('');
                    }}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-sm font-bold text-slate-900"
                    required
                  />
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <label className="block font-bold text-slate-800">Socioeconomic (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={socioScore}
                    onChange={(e) => {
                      setSocioScore(Number(e.target.value));
                      if (scoreError) setScoreError('');
                    }}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-sm font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="bg-purple-900 text-white p-4 rounded-xl flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider">Total Committee Score:</span>
                <span className="font-extrabold text-2xl text-amber-300">{totalScore} / 30</span>
              </div>

              {scoreError && (
                <p className="text-[11px] text-rose-700 font-medium" role="alert">
                  {scoreError}
                </p>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">Committee Verdict</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as typeof decision)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold"
                >
                  <option value="RECOMMENDED">Recommend for award sanction by the Ministry</option>
                  <option value="WAITLISTED">Waitlist for Slot Availability</option>
                  <option value="REJECTED">Do Not Recommend</option>
                </select>
              </div>

              <div>
                <label htmlFor="committeeRemarks" className="block font-bold text-slate-800 mb-1">
                  Official Committee Remarks <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id="committeeRemarks"
                  rows={3}
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value);
                    if (remarkError) setRemarkError('');
                  }}
                  aria-invalid={Boolean(remarkError)}
                  aria-describedby={remarkError ? 'committeeRemarks-err' : undefined}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
                />
                {remarkError && (
                  <p id="committeeRemarks-err" className="text-[11px] text-rose-700 font-medium mt-1" role="alert">
                    {remarkError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl transition shadow flex items-center justify-center gap-2 text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                {decision === 'RECOMMENDED' ? 'Record Recommendation' : 'Record Decision'}
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
