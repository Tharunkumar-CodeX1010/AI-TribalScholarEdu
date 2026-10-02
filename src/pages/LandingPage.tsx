import React from 'react';
import { 
  GraduationCap, 
  Globe2, 
  Award, 
  FileCheck, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  Search, 
  CheckCircle2, 
  HelpCircle,
  Building2,
  Lock,
  Zap
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { NavigateFn } from '../lib/navigation';

interface LandingPageProps {
  navigate: NavigateFn;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { schemes, applications } = useData();

  /* Live counts are derived from the actual demo dataset — no invented statistics. */
  const activeSchemesCount = schemes.filter((s) => s.isActive).length;
  const totalAppsCount = applications.length;
  const underReviewCount = applications.filter(
    (a) => a.stage === 'UNDER_VERIFICATION' || a.stage === 'UNDER_SCREENING' || a.stage === 'ELIGIBLE'
  ).length;
  const beneficiariesCount = applications.filter((a) => a.stage === 'SELECTED').length;

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gov-navy via-slate-900 to-blue-950 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-xl border-b border-slate-800">
        {/* Background decorative pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-900/80 border border-amber-500/40 text-amber-300 text-xs px-3.5 py-1.5 rounded-full font-semibold shadow">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>MoTA Digital Governance Portal 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white font-sans">
              Empowering Tribal Students Through <span className="text-amber-400 underline decoration-amber-500/50">Accessible Education</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              One secure digital platform for scholarship and fellowship applications, AI-assisted verification, screening committee evaluation, direct benefit transfer (DBT), and award management.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate('schemes')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2 text-base"
              >
                Explore Schemes <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('eligibility')}
                className="bg-blue-800 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl border border-blue-600 shadow hover:shadow-lg transition flex items-center gap-2 text-base"
              >
                <Search className="w-5 h-5 text-amber-300" /> Check Eligibility
              </button>
              <button
                onClick={() => navigate('application-wizard')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3.5 rounded-xl border border-slate-600 shadow transition flex items-center gap-2 text-base"
              >
                Apply Now
              </button>
              <button
                onClick={() => navigate('auth-login')}
                className="text-slate-300 hover:text-white font-semibold px-2 py-3.5 rounded-xl underline underline-offset-4 decoration-dotted transition text-sm"
              >
                Applicant / Staff Sign In
              </button>
            </div>

            {/* Micro Badge */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" /> GoI Aadhaar DBT Enabled
              </span>
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <Sparkles className="w-4 h-4" /> AI Document Pre-Scrutiny
              </span>
              <span className="flex items-center gap-1.5 text-blue-300 font-medium">
                <Lock className="w-4 h-4" /> 100% Auditable Human Review
              </span>
            </div>
          </div>

          {/* Right Card / Graphic Preview */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl text-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Active MoTA Flagship Programs
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-400/30">
                AY 2026-27 Open
              </span>
            </div>

            {/* NFST Preview Card */}
            <div
              onClick={() => {
                navigate('scheme-detail', { schemeId: 'sch-nfst' });
              }}
              className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 hover:border-amber-500 cursor-pointer transition group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded font-bold uppercase">
                    Fellowship • M.Phil / Ph.D
                  </span>
                  <h4 className="font-bold text-white text-base mt-1 group-hover:text-amber-300 transition">
                    National Fellowship for ST (NFST)
                  </h4>
                </div>
                <GraduationCap className="w-6 h-6 text-amber-400 shrink-0" />
              </div>
              <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                Monthly stipend ₹31,000 - ₹35,000 + Contingency allowance for ST scholars in Indian universities.
              </p>
            </div>

            {/* NOS Preview Card */}
            <div
              onClick={() => {
                navigate('scheme-detail', { schemeId: 'sch-nos' });
              }}
              className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 hover:border-amber-500 cursor-pointer transition group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded font-bold uppercase">
                    Overseas • Foreign Varsity
                  </span>
                  <h4 className="font-bold text-white text-base mt-1 group-hover:text-amber-300 transition">
                    National Overseas Scholarship (NOS)
                  </h4>
                </div>
                <Globe2 className="w-6 h-6 text-purple-400 shrink-0" />
              </div>
              <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                100% tuition coverage + Annual Maintenance allowance ($15,400 / £9,900) for study abroad.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Metric Counters Bar (Clear Demo Data Disclaimer) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          <div className="p-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-blue-900 font-sans">{activeSchemesCount}</p>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">Active Schemes</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">NFST, NOS & Top Class Education</span>
          </div>

          <div className="p-2 pt-4 lg:pt-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-sans">{totalAppsCount.toLocaleString()}</p>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">Applications Processed</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">AY 2025-26 & 2026-27 (Sample Stats)</span>
          </div>

          <div className="p-2 pt-4 lg:pt-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-sans">{underReviewCount.toLocaleString()}</p>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">Under Active Scrutiny</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">AI Check & Officer Verification</span>
          </div>

          <div className="p-2 pt-4 lg:pt-2">
            <p className="text-3xl sm:text-4xl font-extrabold text-purple-700 font-sans">{beneficiariesCount.toLocaleString()}</p>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">Beneficiaries Supported</p>
            <span className="text-[10px] text-slate-400 block mt-0.5">Scholarships & Grants Disbursed</span>
          </div>

        </div>
      </section>

      {/* Schemes Catalog Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider bg-blue-100 px-3 py-1 rounded-full">
            Scheme Catalog
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Scholarship & Fellowship Opportunities
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Explore government schemes with transparent eligibility criteria, automated AI verification, and direct fund transfer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {schemes.map((scheme) => (
            <div key={scheme.id} className="bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      {scheme.code} • {scheme.studyLevel}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2 leading-snug">{scheme.title}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shrink-0">
                    {scheme.code === 'NFST' ? <GraduationCap className="w-7 h-7" /> : <Globe2 className="w-7 h-7" />}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{scheme.description}</p>

                <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-800">
                    <span className="text-slate-500">Financial Benefit:</span> {scheme.financialBenefit}
                  </p>
                  <p className="font-semibold text-slate-800">
                    <span className="text-slate-500">Application Deadline:</span> <span className="text-rose-600 font-bold">{scheme.deadline}</span>
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Key Eligibility Highlights:</p>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {scheme.eligibilitySummary.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    navigate('scheme-detail', { schemeId: scheme.id });
                  }}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                >
                  View Scheme Guidelines →
                </button>
                <button
                  onClick={() => navigate('application-wizard')}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2 rounded-lg text-xs transition shadow"
                >
                  Apply Online
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Platform Architecture Features */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full">
              Platform Features
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Next-Generation Government Service Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Built in strict adherence to government digital service guidelines, human-in-the-loop AI ethics, and complete data privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">AI OCR Pre-Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated document field extraction, Aadhaar/ST certificate validation, and side-by-side consistency check reducing manual officer review time by 60%.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Human-in-the-Loop Governance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                AI provides recommendations and confidence scores only. Final approval, rejection, or award sanction authority remains 100% with designated Government officers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-4">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Deficiency Self-Correction</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applicants receive instant SMS/email notices for blurry or expired certificates and can resubmit updated documents directly without re-applying.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Workflow Step Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            End-to-End Application Lifecycle Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Transparent 6-stage digital processing from initial registration to fellowship grant disbursement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 text-center">
          {[
            { step: '01', title: 'Registration', desc: 'Aadhaar & ST cert setup' },
            { step: '02', title: 'Application', desc: 'Academic & document upload' },
            { step: '03', title: 'AI Pre-Check', desc: 'OCR & consistency audit' },
            { step: '04', title: 'Scrutiny Officer', desc: 'Human verification & audit' },
            { step: '05', title: 'Screening Desk', desc: 'Academic board evaluation' },
            { step: '06', title: 'Award Release', desc: 'DBT stipend disbursement' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-2xl font-extrabold text-amber-500 font-sans">{item.step}</span>
              <h4 className="font-bold text-xs text-slate-900 mt-2">{item.title}</h4>
              <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
