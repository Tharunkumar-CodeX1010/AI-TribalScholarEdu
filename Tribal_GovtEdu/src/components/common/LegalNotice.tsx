import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export type LegalTopic = 'privacy' | 'terms' | 'accessibility' | 'audit';

const CONTENT: Record<LegalTopic, { title: string; intro: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: 'Privacy Policy',
    intro:
      'This portal is a functional prototype. It is not connected to any production database, and every record you see is simulated sample data held only in your own browser.',
    sections: [
      {
        heading: 'What is collected in this prototype',
        body: 'Registration details, application answers, uploaded document metadata and officer remarks are entered by you and stored in this browser using localStorage. Nothing is transmitted to a server.'
      },
      {
        heading: 'Role-based visibility',
        body: 'Applicant workspaces are scoped to the signed-in applicant. Officer, screening committee and administrator workspaces show different record sets, and the portal blocks a role from opening a workspace reserved for another role.'
      },
      {
        heading: 'How to erase your data',
        body: 'Use the "Reset Demo Data" control in the header bar to clear every stored record and restore the original sample dataset.'
      }
    ]
  },
  terms: {
    title: 'Terms of Service',
    intro: 'By using this demonstration you acknowledge that it is an evaluation artefact, not a live scholarship application system.',
    sections: [
      {
        heading: 'Prototype status',
        body: 'No fellowship is awarded, no money is transferred and no legal rights arise from activity in this portal. Award letters, milestones and disbursement entries are generated sample records.'
      },
      {
        heading: 'Eligibility and AI findings',
        body: 'Rule evaluation and document AI results are deterministic simulations that illustrate how an officer-facing verification workflow could behave. They are advisory only and never constitute a decision.'
      },
      {
        heading: 'Audit trail',
        body: 'Every workflow action writes a tamper-evident style audit record to demonstrate traceability. In a live system these entries would be append-only and retained for the period prescribed by departmental rules.'
      }
    ]
  },
  accessibility: {
    title: 'Accessibility Statement',
    intro: 'This interface is designed to meet the general principles of the Guidelines for Indian Government Websites, in particular WCAG 2.1 Level AA.',
    sections: [
      {
        heading: 'Built-in support',
        body: 'A text-size control and a high-contrast mode are available from the accessibility bar. Both settings persist in this browser. All interactive controls are reachable by keyboard and carry visible focus outlines.'
      },
      {
        heading: 'Colour and contrast',
        body: 'Status is never communicated by colour alone; every status chip also carries a text label. Body text and interactive controls are checked against their background for a contrast ratio of at least 4.5:1.'
      },
      {
        heading: 'Known limitations',
        body: 'The AI assistance panels present dense tabular data and are not yet fully optimised for screen-reader traversal. Document viewing relies on the browser PDF viewer.'
      }
    ]
  },
  audit: {
    title: 'Audit Log Guidelines',
    intro: 'The audit trail exists to show who did what, to which record, and when — for every consequential workflow action.',
    sections: [
      {
        heading: 'What is recorded',
        body: 'Application submission, status changes, file assignment, deficiency notices, applicant responses, OCR field decisions, screening recommendations, award sanction, and scheme configuration changes.'
      },
      {
        heading: 'Who is recorded',
        body: 'Each entry stores the acting user identifier, display name and role, the previous and new stage, free-text remarks, and the secure gateway address attributed to the session.'
      },
      {
        heading: 'Immutability',
        body: 'Audit entries are append-only. Records are never edited or deleted in place, and the log is never filtered out of the view. The reset control restores the seeded baseline and is itself a visible, user-initiated action.'
      }
    ]
  }
};

export const LegalNotice: React.FC<{
  topic: LegalTopic | null;
  onClose: () => void;
}> = ({ topic, onClose }) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!topic) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [topic, onClose]);

  if (!topic) return null;
  const data = CONTENT[topic];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-title"
    >
      <button
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-t-xl sm:rounded-xl shadow-2xl">
        <div className="sticky top-0 bg-gov-navy text-white px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="legal-title" className="text-base font-bold">
              {data.title}
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">Ministry of Tribal Affairs &middot; Scholarship Portal Prototype</p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded hover:bg-white/15 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed bg-amber-50 border border-amber-200 rounded p-3">
            {data.intro}
          </p>
          {data.sections.map((s) => (
            <section key={s.heading}>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">{s.heading}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
