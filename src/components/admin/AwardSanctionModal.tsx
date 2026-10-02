import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Application } from '../../types';
import { X, Gavel, CheckCircle2, AlertTriangle } from 'lucide-react';
import { downloadSanctionOrder } from '../../lib/awardDocument';
import { formatINR, formatDate } from '../../lib/format';

/**
 * Award sanction desk. Only files the Screening Committee has recommended
 * (stage ELIGIBLE) can be sanctioned, which is the point of separating
 * recommendation from sanction.
 */
export const AwardSanctionModal: React.FC<{
  app: Application;
  defaultAmount: number;
  onClose: () => void;
}> = ({ app, defaultAmount, onClose }) => {
  const { currentUser } = useAuth();
  const { recordAwardSelection } = useData();
  const { notify } = useToast();

  const [amount, setAmount] = useState(String(defaultAmount));
  const [confirmText, setConfirmText] = useState('');
  const [amountError, setAmountError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const panelRef = useRef<HTMLDivElement>(null);

  /* Escape closes, and focus moves into the dialog when it opens. */
  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const recommendation = app.screeningReview;

  /* A file that is already sanctioned, or is not at the recommendation stage,
     must not be sanctioned a second time. */
  const sanctionable = app.stage === 'ELIGIBLE';

  const parsedAmount = Number(amount);
  const isAboveSchemeCap = parsedAmount > defaultAmount;

  const handleConfirm = () => {
    if (!sanctionable) return;

    const errs: Record<string, string> = {};
    if (!amount.trim()) errs.amount = 'Enter the sanctioned amount.';
    else if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) errs.amount = 'Enter a positive amount.';
    if (confirmText.trim().toUpperCase() !== 'SANCTION') {
      errs.confirm = 'Type SANCTION to confirm this irreversible award decision.';
    }
    setAmountError(errs.amount ?? '');
    setConfirmError(errs.confirm ?? '');
    if (Object.keys(errs).length > 0) return;

    recordAwardSelection(app.id, parsedAmount, { id: currentUser.id, name: currentUser.name });
    notify(
      `Award sanctioned for ${app.applicantName}. The sanction order is now available on the applicant's dashboard.`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="sanction-title">
      <button aria-label="Close award sanction dialog" onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto bg-white rounded-t-xl sm:rounded-xl shadow-2xl focus:outline-none"
      >
        <div className="bg-gov-navy text-white px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="sanction-title" className="text-base font-bold flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-400" /> Sanction Fellowship Award
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {app.applicationNo} &middot; {app.schemeCode}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded hover:bg-white/15">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!sanctionable && (
          <div className="px-5 pt-5">
            <SanctionedAwardPanel app={app} />
          </div>
        )}

        <div className="px-5 py-5 space-y-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Fellow</p>
            <p className="font-bold text-slate-900 text-sm">{app.applicantName}</p>
            <p className="text-slate-600">
              {app.academicDetails.targetInstitution} &middot; {app.academicDetails.targetCourse}
            </p>
          </div>

          {recommendation ? (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-purple-700 font-bold">Screening Committee Recommendation</p>
              <p className="text-purple-900">
                Score {recommendation.totalScore}/30 &middot; Decision{' '}
                <strong>{recommendation.decision}</strong>
              </p>
              <p className="text-purple-800 italic">&ldquo;{recommendation.remarks}&rdquo;</p>
              <p className="text-[10px] text-purple-700">
                {recommendation.reviewerName} &middot; {formatDate(recommendation.reviewedDate)}
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p>
                No committee recommendation is recorded on this file. Sanctioning without a recommendation is
                outside the scheme workflow, but the Ministry may still act under delegated powers.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="sanctionAmount" className="block font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
              Sanctioned Annual Grant (₹)
            </label>
            <input
              id="sanctionAmount"
              type="number"
              min="1"
              step="1000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setAmountError('');
              }}
              aria-invalid={Boolean(amountError)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-slate-900"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
              <span className="text-[10px] text-slate-500">
                Scheme indicative ceiling: {formatINR(defaultAmount)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAmount(String(defaultAmount));
                  setAmountError('');
                }}
                className="text-[10px] font-bold text-blue-700 hover:underline"
              >
                Use ceiling
              </button>
            </div>
            {amountError && <p className="text-[11px] text-rose-700 font-medium mt-1">{amountError}</p>}
            {isAboveSchemeCap && (
              <p className="text-[11px] text-amber-800 font-medium mt-1">
                Above the indicative scheme ceiling. This will be recorded in the audit trail.
              </p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900 leading-relaxed">
            This decision generates a sanction order, moves the file to <strong>Selected</strong>, notifies the
            applicant and writes a permanent audit entry. It cannot be undone from this screen.
          </div>

          <div>
            <label htmlFor="sanctionConfirm" className="block font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
              Type <span className="font-mono text-rose-700">SANCTION</span> to confirm
            </label>
            <input
              id="sanctionConfirm"
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setConfirmError('');
              }}
              aria-invalid={Boolean(confirmError)}
              aria-describedby={confirmError ? 'sanctionConfirm-err' : undefined}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-sm text-slate-900"
            />
            {confirmError && (
              <p id="sanctionConfirm-err" className="text-[11px] text-rose-700 font-medium mt-1">
                {confirmError}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={handleConfirm}
              disabled={!sanctionable}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm Sanction
            </button>
            <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-5 py-2.5 rounded-lg text-xs">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Read-only view of an already sanctioned award. */
export const SanctionedAwardPanel: React.FC<{ app: Application }> = ({ app }) => {
  const award = app.awardDetails;
  const sanctioned = useMemo(() => award?.sanctionedAmount ?? 0, [award]);

  if (!award) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">Award Sanctioned</p>
        <p className="text-emerald-900 font-bold mt-0.5">
          {formatINR(sanctioned)} per annum &middot; {award.awardLetterNo}
        </p>
      </div>
      <button
        onClick={() => downloadSanctionOrder(award, app.schemeTitle, app.applicantName)}
        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-2 rounded-lg text-[10px]"
      >
        View sanction order
      </button>
    </div>
  );
};
