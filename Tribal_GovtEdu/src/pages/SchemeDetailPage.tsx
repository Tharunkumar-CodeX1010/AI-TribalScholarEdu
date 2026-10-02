import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { NavigateFn } from '../lib/navigation';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/common/EmptyState';
import { GraduationCap, Globe2, CheckCircle2, FileText, ArrowLeft, ArrowRight, ShieldCheck, HelpCircle, Calendar, DollarSign } from 'lucide-react';

interface SchemeDetailPageProps {
  schemeId: string;
  navigate: NavigateFn;
}

export const SchemeDetailPage: React.FC<SchemeDetailPageProps> = ({ schemeId, navigate }) => {
  const { schemes } = useData();
  const { notify } = useToast();
  const scheme = schemes.find((s) => s.id === schemeId);

  const handleApply = () => {
    if (!scheme?.isActive) return;
    notify(`Starting an application for ${scheme.code}.`, 'info');
    navigate('application-wizard', { schemeId: scheme.id });
  };

  const [activeSection, setActiveSection] = useState<'overview' | 'eligibility' | 'benefits' | 'documents' | 'workflow' | 'faqs'>('overview');

  /* The old `|| schemes[0]` silently showed a different scheme than the one
     requested whenever the id did not resolve. */
  if (!scheme) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={HelpCircle}
            title="Scheme not found"
            message="This scheme is not part of the current catalogue. It may have been retired or the link may be out of date."
            action={
              <button
                onClick={() => navigate('schemes')}
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg"
              >
                Browse all schemes
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Back Button & Header Banner */}
      <div>
        <button
          onClick={() => navigate('schemes')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Schemes Catalog
        </button>

        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full uppercase">
              {scheme.category} • {scheme.code}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight font-sans">
              {scheme.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Academic Year {scheme.academicYear} • Total Sanctioned Slots: {scheme.totalSlots} Seats
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => navigate('eligibility', { schemeId: scheme.id })}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold px-5 py-3 rounded-xl text-xs transition"
            >
              Check Eligibility
            </button>
            <button
              onClick={handleApply}
              disabled={!scheme.isActive}
              title={scheme.isActive ? undefined : 'Applications for this cycle are closed'}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition shadow flex items-center justify-center gap-2"
            >
              {scheme.isActive ? (
                <>
                  Apply Online <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                'Applications Closed'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white rounded-xl shadow-sm p-1.5 gap-1 text-xs font-semibold text-slate-600">
        {[
          { key: 'overview', label: '1. Overview' },
          { key: 'eligibility', label: '2. Eligibility Criteria' },
          { key: 'benefits', label: '3. Financial Benefits' },
          { key: 'documents', label: '4. Required Documents' },
          { key: 'workflow', label: '5. Selection Process' },
          { key: 'faqs', label: '6. FAQs & Help' }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveSection(t.key as any)}
            className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition ${
              activeSection === t.key ? 'bg-blue-800 text-white font-bold shadow' : 'hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Program Overview</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{scheme.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Target Cadre</span>
                <span className="font-bold text-slate-900 text-sm">{scheme.studyLevel}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Location</span>
                <span className="font-bold text-slate-900 text-sm">{scheme.location}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Closing Date</span>
                <span className="font-bold text-rose-600 text-sm">{scheme.deadline}</span>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'eligibility' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Mandatory Eligibility Criteria</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              {scheme.eligibilitySummary.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeSection === 'benefits' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Financial Assistance & Stipend Structure</h3>
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl text-blue-900 text-xs sm:text-sm leading-relaxed font-semibold">
              {scheme.financialBenefit}
            </div>
            <p className="text-xs text-slate-500">
              Note: All payments are disbursed through Public Financial Management System (PFMS) directly into Aadhaar-seeded bank accounts.
            </p>
          </div>
        )}

        {activeSection === 'documents' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Required Document Verification Checklist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {scheme.requiredDocuments.map((doc) => (
                <div key={doc.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                  <FileText className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {doc.name} {doc.mandatory && <span className="text-rose-600 font-bold">*</span>}
                    </h4>
                    <p className="text-slate-600 text-[11px] mt-1">{doc.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>Formats: {doc.allowedFormats.join(', ')}</span>
                      <span>• Max Size: {doc.maxSizeMB} MB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'workflow' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Official 5-Stage Selection Workflow</h3>
            <div className="space-y-3">
              {scheme.workflowStages.map((stg) => (
                <div key={stg.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-4 text-xs">
                  <div className="w-8 h-8 rounded-full bg-blue-800 text-white font-bold flex items-center justify-center shrink-0">
                    {stg.stepNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{stg.name}</h4>
                      <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700 uppercase font-bold">
                        {stg.responsibleRole.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs mt-1">{stg.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'faqs' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">Q: How does AI document pre-verification work?</p>
                <p className="text-slate-600 mt-1">
                  A: The system automatically reads OCR fields on your uploaded certificates to check for missing fields or name spelling mismatches. AI findings are recommendations provided to human officers for fast verification.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">Q: What happens if a deficiency is raised on my application?</p>
                <p className="text-slate-600 mt-1">
                  A: You will receive an SMS and dashboard alert. You can click "Respond to Deficiency" to upload an updated certificate without submitting a new application.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
