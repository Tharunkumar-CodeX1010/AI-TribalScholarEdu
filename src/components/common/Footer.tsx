import React, { useState } from 'react';
import { Building2, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';
import { NavigateFn } from '../../lib/navigation';
import { useAccessibility } from '../../context/AccessibilityContext';
import { LegalNotice, LegalTopic } from './LegalNotice';

interface FooterProps {
  navigate: NavigateFn;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const [topic, setTopic] = useState<LegalTopic | null>(null);
  const { t } = useAccessibility();

  const quickLinks: { label: string; onClick: () => void; external?: boolean; href?: string }[] = [
    { label: 'National Fellowship for ST (NFST)', onClick: () => navigate('scheme-detail', { schemeId: 'sch-nfst' }) },
    { label: 'National Overseas Scholarship (NOS)', onClick: () => navigate('scheme-detail', { schemeId: 'sch-nos' }) },
    { label: 'All Schemes & Grants', onClick: () => navigate('schemes') },
    { label: 'Interactive Eligibility Checker', onClick: () => navigate('eligibility') },
    { label: 'Helpdesk & FAQs', onClick: () => navigate('help') }
  ];

  const legalLinks: { labelKey: string; topic: LegalTopic }[] = [
    { labelKey: 'footer.privacy', topic: 'privacy' },
    { labelKey: 'footer.terms', topic: 'terms' },
    { labelKey: 'footer.accessibility', topic: 'accessibility' },
    { labelKey: 'footer.audit', topic: 'audit' }
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Col 1: MoTA Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-slate-800 border border-amber-500 rounded flex items-center justify-center">
                <Building2 className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">Ministry of Tribal Affairs</h3>
                <p className="text-xs text-slate-400">Government of India</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering Scheduled Tribe (ST) students through merit fellowships, overseas education scholarships, and direct benefit transfer (DBT).
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> Prototype session &mdash; local data only
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-3 text-amber-400">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.onClick}
                    className="text-left hover:text-white transition"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <a href="https://tribal.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1 text-slate-400">
                  MoTA Official Website <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </li>
              <li>
                <a href="https://dbtbharat.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1 text-slate-400">
                  DBT Bharat Portal <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Helpdesk Contacts */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-3 text-amber-400">
              {t('footer.support')}
            </h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" /> 1800-11-2000 (Toll Free: 9 AM - 6 PM)
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" /> support-scholarship@mota.gov.in
              </p>
              <p className="text-slate-400 pt-2 leading-relaxed">
                Education Division, Ministry of Tribal Affairs, Room 411, A-Wing, Shastri Bhawan, New Delhi - 110001
              </p>
            </div>
          </div>

          {/* Col 4: Disclaimer & Technical Notes */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-3 text-amber-400">
              {t('footer.about')}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              This is a functional demonstration of a tribal scholarship portal. It has no backend, issues no awards and transfers no funds. AI and eligibility findings are advisory inputs for a human officer.
            </p>
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700 text-[11px] text-slate-300">
              <span className="font-bold text-amber-400">Data Privacy:</span> Every record shown is simulated sample data stored only in your browser.
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; 2026 Ministry of Tribal Affairs, Government of India. {t('footer.rights')}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {legalLinks.map((link, i) => (
              <React.Fragment key={link.topic}>
                {i > 0 && <span aria-hidden="true">&bull;</span>}
                <button
                  onClick={() => setTopic(link.topic)}
                  className="hover:text-slate-300 transition underline underline-offset-2 decoration-dotted"
                >
                  {t(link.labelKey)}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <LegalNotice topic={topic} onClose={() => setTopic(null)} />
    </footer>
  );
};
