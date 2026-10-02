import React, { useState } from 'react';
import { HelpCircle, Search, Mail, Phone, FileText, ChevronDown, ChevronUp, ArrowLeft, ArrowRight } from 'lucide-react';
import { NavigateFn } from '../lib/navigation';

export const HelpFAQPage: React.FC<{ navigate: NavigateFn }> = ({ navigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is the National Fellowship for Scheduled Tribes (NFST)?",
      a: "NFST is a flagship scheme by the Ministry of Tribal Affairs providing monthly fellowship stipends (₹31,000 to ₹35,000/month plus annual contingency) to ST scholars pursuing regular M.Phil and Ph.D degrees in recognized Indian universities."
    },
    {
      q: "What is the National Overseas Scholarship (NOS) for ST Students?",
      a: "NOS provides financial assistance to meritorious ST students for pursuing Master's, Ph.D, and Post-Doctoral research abroad in top foreign universities. It covers 100% tuition fees, economy airfare, and annual maintenance allowance."
    },
    {
      q: "How does the AI Pre-Verification system work?",
      a: "When you upload your ST certificate or marksheets, our Document AI engine reads the text (OCR) and compares fields against your application form. AI findings serve as verification recommendations to authorized Government officers."
    },
    {
      q: "What should I do if a Deficiency Notice is raised on my application?",
      a: "If an officer flags an expired or unclear document, you will receive an alert. Navigate to your Applicant Dashboard, click 'Respond to Deficiency', upload the corrected document, and resubmit. You do NOT need to file a new application."
    },
    {
      q: "How is fellowship money disbursed?",
      a: "Fellowship grants and monthly stipends are disbursed directly into your Aadhaar-seeded bank account via Public Financial Management System (PFMS) Direct Benefit Transfer (DBT)."
    }
  ];

  const term = searchQuery.trim().toLowerCase();
  const filteredFaqs = term
    ? faqs.filter((f) => f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term))
    : faqs;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <button
          onClick={() => navigate('landing')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase">
          Applicant Support & Helpdesk
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Helpdesk & Knowledge Base</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Find answers to common scheme questions, document upload formats, and technical assistance.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions e.g. 'deficiency', 'stipend', 'nos'..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 shadow-sm"
        />
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Frequently Asked Questions
        </h3>

        {filteredFaqs.length === 0 && (
          <p className="text-xs text-slate-500 text-center bg-slate-50 border border-slate-200 rounded-xl p-6">
            No question matches &ldquo;{searchQuery.trim()}&rdquo;. Try a different keyword, or contact the MoTA
            helpline on 1800-11-2000.
          </p>
        )}

        <div className="space-y-3 divide-y divide-slate-100 text-xs">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqId === idx;
            return (
              <div key={idx} className="pt-3">
                <button
                  onClick={() => setOpenFaqId(isOpen ? null : idx)}
                  className="w-full text-left font-bold text-slate-900 text-sm flex items-center justify-between gap-2 py-1 hover:text-blue-700"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <p className="mt-2 text-slate-600 text-xs leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Helpdesk Contacts */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="font-bold text-base text-amber-400">Toll-Free Government Helpline</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            For operational or technical issues regarding your application submission:
          </p>
          <div className="pt-2 text-xs space-y-1 font-semibold text-slate-200">
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" /> 1800-11-2000 (Toll Free: 9 AM - 6 PM Mon-Sat)
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" /> support-scholarship@mota.gov.in
            </p>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
          <p className="font-bold text-white">Nodal Office Address:</p>
          <p>Education Division, Ministry of Tribal Affairs,</p>
          <p>Room 411, A-Wing, Shastri Bhawan, New Delhi - 110001</p>
        </div>

        <button
          onClick={() => navigate('eligibility')}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs transition flex items-center justify-center gap-2"
        >
          Run eligibility check <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
