import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { EligibilityEngine, EvaluationOutcome } from '../services/EligibilityEngine';
import { CheckCircle2, AlertTriangle, Search, ArrowRight, ShieldCheck, FileQuestion } from 'lucide-react';
import { NavigateFn } from '../lib/navigation';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';

interface EligibilityCheckerProps {
  schemeId: string;
  navigate: NavigateFn;
}

type AdmissionStatus = 'CONFIRMED' | 'PROVISIONAL' | 'APPLIED';

const STYLED_FIELD =
  'w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600';
const LABEL = 'block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5';

export const EligibilityCheckerPage: React.FC<EligibilityCheckerProps> = ({ schemeId, navigate }) => {
  const { schemes } = useData();
  const activeSchemes = useMemo(() => schemes.filter((s) => s.isActive), [schemes]);

  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemeId);
  const [stCategory, setStCategory] = useState<'' | 'YES' | 'NO'>('');
  const [stCertNo, setStCertNo] = useState('');
  const [percentage, setPercentage] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [admissionStatus, setAdmissionStatus] = useState<AdmissionStatus | ''>('');
  const [targetCountry, setTargetCountry] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [outcome, setOutcome] = useState<EvaluationOutcome | null>(null);

  const currentScheme = schemes.find((s) => s.id === selectedSchemeId);

  const needsOverseasAdmission = currentScheme?.location === 'ABROAD' || currentScheme?.category === 'OVERSEAS';
  const needsIncome = currentScheme
    ? EligibilityEngine.referencesField(currentScheme, 'personalDetails.annualFamilyIncome')
    : false;

  const resetAssessment = () => {
    setOutcome(null);
    setErrors({});
  };

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentScheme) return;

    const nextErrors: Record<string, string> = {};
    if (!stCategory) nextErrors.stCategory = 'Select one of the two options.';
    if (stCategory === 'YES' && stCertNo.trim().length < 6) {
      nextErrors.stCertNo = 'Enter a valid ST certificate number (minimum 6 characters).';
    }
    if (!percentage) {
      nextErrors.percentage = 'Enter your qualifying percentage or CGPA.';
    } else {
      const marks = Number(percentage);
      if (!Number.isFinite(marks) || marks < 0 || marks > 100) {
        nextErrors.percentage = 'Enter a value between 0 and 100.';
      }
    }
    if (needsIncome) {
      if (!annualIncome) nextErrors.annualIncome = 'Enter your annual family income.';
      else if (Number(annualIncome) < 0) nextErrors.annualIncome = 'Income cannot be negative.';
    }
    if (needsOverseasAdmission && !admissionStatus) {
      nextErrors.admissionStatus = 'Select your current admission status.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setOutcome(null);
      return;
    }

    setOutcome(
      EligibilityEngine.evaluate(
        currentScheme,
        {
          stCertNumber: stCategory === 'YES' ? stCertNo.trim() : '',
          annualFamilyIncome: needsIncome ? Number(annualIncome) : 0
        },
        {
          percentageOrCGPA: percentage,
          admissionStatus: needsOverseasAdmission ? (admissionStatus as AdmissionStatus) : undefined,
          targetCountry
        }
      )
    );
  };

  if (activeSchemes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          icon={FileQuestion}
          title="No schemes are currently open"
          message="Eligibility assessment becomes available as soon as an administrator publishes a scheme. Please check back during the next application cycle."
          action={
            <button
              onClick={() => navigate('help')}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg"
            >
              View application calendar
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <PageHeader
        kicker="Interactive Assessment Tool"
        title="Scholarship Eligibility Checker"
        subtitle="Answer a few quick questions for an indicative rules check before you begin an official application."
      >
        <ShieldCheck className="w-6 h-6 text-amber-400" />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleEvaluate} noValidate className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <label htmlFor="scheme" className={LABEL}>
              Target Scheme
            </label>
            <select
              id="scheme"
              value={selectedSchemeId}
              onChange={(e) => {
                setSelectedSchemeId(e.target.value);
                resetAssessment();
              }}
              className={STYLED_FIELD}
            >
              {activeSchemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {currentScheme && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">{currentScheme.financialBenefit}</p>
              <p>
                Open for {currentScheme.studyLevel} &middot; {currentScheme.academicYear} &middot; closes{' '}
                {new Date(currentScheme.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              {currentScheme.totalSlots > 0 && (
                <p>
                  {currentScheme.totalSlots.toLocaleString('en-IN')} fellowship slots available for this cycle.
                </p>
              )}
            </div>
          )}

          <fieldset className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <legend className="text-xs font-bold text-slate-800 px-1">
              Do you belong to a recognized Scheduled Tribe (ST) category?
            </legend>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              {(['YES', 'NO'] as const).map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stCategory"
                    checked={stCategory === opt}
                    onChange={() => {
                      setStCategory(opt);
                      resetAssessment();
                    }}
                    className="text-blue-700 focus:ring-blue-600"
                  />
                  <span>{opt === 'YES' ? 'Yes, I hold an ST certificate' : 'No'}</span>
                </label>
              ))}
            </div>
            {errors.stCategory && <p className="text-[11px] text-rose-700 font-medium mt-1">{errors.stCategory}</p>}

            {stCategory === 'YES' && (
              <div className="pt-3 mt-2 border-t border-slate-200">
                <label htmlFor="stCert" className={LABEL}>
                  ST Certificate Number
                </label>
                <input
                  id="stCert"
                  type="text"
                  value={stCertNo}
                  onChange={(e) => {
                    setStCertNo(e.target.value);
                    resetAssessment();
                  }}
                  aria-invalid={Boolean(errors.stCertNo)}
                  className={STYLED_FIELD}
                  placeholder="e.g. ST/JH/RNC/2023/88921"
                />
                {errors.stCertNo && <p className="text-[11px] text-rose-700 font-medium mt-1">{errors.stCertNo}</p>}
              </div>
            )}
          </fieldset>

          <div>
            <label htmlFor="percentage" className={LABEL}>
              Qualifying Degree Percentage / CGPA (%)
            </label>
            <input
              id="percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => {
                setPercentage(e.target.value);
                resetAssessment();
              }}
              aria-invalid={Boolean(errors.percentage)}
              className={STYLED_FIELD}
              placeholder="e.g. 78.5"
            />
            {errors.percentage && <p className="text-[11px] text-rose-700 font-medium mt-1">{errors.percentage}</p>}
          </div>

          {needsIncome && (
            <div>
              <label htmlFor="income" className={LABEL}>
                Annual Family Income (₹)
              </label>
              <input
                id="income"
                type="number"
                min="0"
                step="1000"
                value={annualIncome}
                onChange={(e) => {
                  setAnnualIncome(e.target.value);
                  resetAssessment();
                }}
                aria-invalid={Boolean(errors.annualIncome)}
                className={STYLED_FIELD}
                placeholder="e.g. 450000"
              />
              {errors.annualIncome && <p className="text-[11px] text-rose-700 font-medium mt-1">{errors.annualIncome}</p>}
            </div>
          )}

          {needsOverseasAdmission && (
            <div>
              <label htmlFor="admission" className={LABEL}>
                Admission Status at Foreign University
              </label>
              <select
                id="admission"
                value={admissionStatus}
                onChange={(e) => {
                  setAdmissionStatus(e.target.value as AdmissionStatus);
                  resetAssessment();
                }}
                aria-invalid={Boolean(errors.admissionStatus)}
                className={STYLED_FIELD}
              >
                <option value="">Select a status</option>
                <option value="CONFIRMED">Confirmed &mdash; offer letter received</option>
                <option value="PROVISIONAL">Provisional &mdash; seat allotted</option>
                <option value="APPLIED">Applied &mdash; result awaited</option>
              </select>
              {errors.admissionStatus && (
                <p className="text-[11px] text-rose-700 font-medium mt-1">{errors.admissionStatus}</p>
              )}
              <div className="pt-3">
                <label htmlFor="country" className={LABEL}>
                  Target Country (optional)
                </label>
                <input
                  id="country"
                  type="text"
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className={STYLED_FIELD}
                  placeholder="e.g. United Kingdom"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition shadow flex items-center justify-center gap-2 text-sm"
          >
            <Search className="w-4 h-4 text-amber-300" /> Run Eligibility Assessment
          </button>
        </form>

        <aside className="lg:col-span-5 bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="font-bold text-base text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Preliminary Assessment Output
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Rules engine output for {currentScheme?.code ?? '—'}
              {currentScheme ? ` · ${currentScheme.financialBenefit}` : ''}
            </p>
          </div>

          {outcome ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  outcome.overallEligible
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100'
                    : 'bg-amber-950/80 border-amber-500 text-amber-100'
                }`}
              >
                {outcome.overallEligible ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-sm">
                    {outcome.overallEligible
                      ? 'Appears eligible on the information provided'
                      : 'Manual review will be required'}
                  </h3>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">{outcome.summary}</p>
                  <p className="text-[11px] mt-2 font-semibold opacity-80">
                    Criteria satisfied: {outcome.scorePercent}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Rule inspection log</p>
                <ul className="space-y-2">
                  {outcome.ruleResults.map((r) => (
                    <li
                      key={r.ruleId}
                      className="bg-slate-800 p-2.5 rounded border border-slate-700 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-200 text-xs">{r.ruleDescription}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 break-words">
                          Provided: {r.actualValue} &middot; Required: {r.expectedValue}
                        </p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-1">
                          {r.source === 'STANDARD' ? 'Standard MoTA rule' : 'Scheme-configured rule'}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                          r.passed ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                        }`}
                      >
                        {r.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {outcome.overallEligible && currentScheme && (
                <button
                  onClick={() => navigate('application-wizard', { schemeId: currentScheme.id })}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                >
                  Proceed to application for {currentScheme.code} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="py-14 text-center text-slate-400 space-y-3">
              <Search className="w-11 h-11 mx-auto text-slate-600" />
              <p className="text-xs">Complete the questions on the left and run the assessment to see a rule-by-rule breakdown.</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Disclaimer:</strong> This is an indicative check based solely on self-reported
            answers. Only a competent authority can confirm eligibility after document scrutiny.
          </div>
        </aside>
      </div>
    </div>
  );
};
