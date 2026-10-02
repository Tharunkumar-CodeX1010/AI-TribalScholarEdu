import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Send, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate, STAGE_ORDER, stageProgress } from '../../lib/format';

type Msg = { id: string; sender: 'user' | 'bot'; text: string; time: string };

let msgCounter = 0;
const makeMsg = (sender: Msg['sender'], text: string): Msg => ({
  id: `m-${++msgCounter}`,
  sender,
  text,
  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
});

const SUGGESTIONS = [
  'What is my application status?',
  'What does deficiency mean?',
  'What documents are required?',
  'How long does scrutiny take?'
];

export const ApplicantChatbot: React.FC = () => {
  const { currentUser } = useAuth();
  const { applications, schemes } = useData();

  const isApplicant = currentUser.role === 'APPLICANT';

  /* Scope strictly to the signed-in applicant. Never fall back to another record. */
  const myApplications = useMemo(
    () =>
      applications
        .filter((a) => a.applicantId === currentUser.id || a.applicantEmail.toLowerCase() === currentUser.email.toLowerCase())
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()),
    [applications, currentUser.id, currentUser.email]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const timers = useRef<number[]>([]);

  /* A fresh conversation whenever the acting user changes, so one role never
     sees the previous role's conversation. */
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyping(false);
    setInput('');
    setMessages([
      makeMsg(
        'bot',
        isApplicant
          ? `Namaste ${currentUser.name}! I am Sahayatri AI, your virtual assistant for Tribal Govt-Edu, the Ministry of Tribal Affairs (MoTA) scholarship system. How can I help you today?`
          : `Namaste ${currentUser.name}. Sahayatri AI answers applicant questions about schemes and required documents. Switch to the Applicant role to query a personal application record.`
      )
    ]);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [currentUser.id, currentUser.role, isApplicant]);

  const answer = (query: string): string => {
    const q = query.toLowerCase();
    const latest = myApplications[0];

    if (q.includes('status') || q.includes('my application') || q.includes('progress')) {
      if (!isApplicant) return 'Personal application records are only available in the Applicant workspace. Switch to the Applicant role to continue.';
      if (!latest) return 'You have no submitted application yet. Open "All Schemes & Grants" to start an application for an eligible fellowship.';
      const done = stageProgress(latest.stage);
      return `Your most recent application (${latest.applicationNo}, ${latest.schemeCode}) is at stage "${latest.stage.replace(/_/g, ' ')}" — step ${done} of ${STAGE_ORDER.length}. Last updated ${formatDate(latest.lastUpdated)}.`;
    }

    if (q.includes('deficien') || q.includes('correct') || q.includes('reject')) {
      if (!isApplicant) return 'Deficiency records belong to individual applicants. Switch to the Applicant role to view your notices.';
      const open = latest?.deficiencies.filter((d) => d.status === 'OPEN' || d.status === 'RESUBMITTED') ?? [];
      if (open.length === 0) {
        return 'You have no open deficiency notices. If an officer raises one, you will be able to respond with a corrected document from your dashboard.';
      }
      return open
        .map(
          (d) =>
            `"${d.title}" (${d.category.toLowerCase().replace(/_/g, ' ')}) — ${d.description} Respond by ${formatDate(d.deadlineDate)}.`
        )
        .join(' ');
    }

    if (q.includes('document') || q.includes('require') || q.includes('upload')) {
      const scheme = latest ? schemes.find((s) => s.code === latest.schemeCode) : schemes[0];
      if (!scheme) return 'No scheme configuration is available right now.';
      return `Documents required for ${scheme.code} (${scheme.title}): ${scheme.requiredDocuments.map((d, i) => `${i + 1}. ${d.name}`).join('; ')}.`;
    }

    if (q.includes('nfst') || q.includes('fellowship') || q.includes('national fellowship')) {
      const s = schemes.find((x) => x.code === 'NFST');
      return s
        ? `${s.title}: ${s.description} Financial benefit: ${s.financialBenefit}. Study level: ${s.studyLevel}, for ${s.academicYear}.`
        : 'The NFST scheme configuration is not available right now.';
    }

    if (q.includes('nos') || q.includes('overseas') || q.includes('abroad')) {
      const s = schemes.find((x) => x.code === 'NOS');
      return s
        ? `${s.title}: ${s.description} Financial benefit: ${s.financialBenefit}. Study level: ${s.studyLevel}, for ${s.academicYear}.`
        : 'The NOS scheme configuration is not available right now.';
    }

    if (q.includes('time') || q.includes('how long') || q.includes('duration') || q.includes('when')) {
      return 'Typical progression: submission to scrutiny, then deficiency notice if needed, then screening committee recommendation, and finally award sanction by the Ministry. Officer updates appear on your dashboard as each step completes.';
    }

    return 'I can help with application status, deficiency notices, required documents and scheme details. For anything else, use the Helpdesk & FAQs page or call the MoTA helpline on 1800-11-2000.';
  };

  const handleSend = (preset?: string) => {
    const query = (preset ?? input).trim();
    if (!query || typing) return;

    setMessages((prev) => [...prev, makeMsg('user', query)]);
    setInput('');
    setTyping(true);

    const t = window.setTimeout(() => {
      setMessages((prev) => [...prev, makeMsg('bot', answer(query))]);
      setTyping(false);
    }, 450);
    timers.current.push(t);
  };

  /* The widget is applicant-facing: officers, committee members and
     administrators already have their own desks, so it is not rendered for them. */
  if (!isApplicant) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Sahayatri AI assistant"
          className="fixed bottom-6 right-6 z-50 bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 border-2 border-amber-400 transition-transform hover:scale-105"
        >
          <Bot className="w-6 h-6 text-amber-400" />
          <span className="font-bold text-xs pr-1 hidden sm:inline">Sahayatri AI Helper</span>
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="Sahayatri AI assistant"
          className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden text-slate-900"
        >
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-700 rounded-full flex items-center justify-center border border-amber-400">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  Sahayatri AI <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <p className="text-[10px] text-slate-400">Rule-based prototype assistant &mdash; not a live service</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close assistant" className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 h-80 overflow-y-auto space-y-3 bg-slate-50 text-xs" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-blue-700 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <span className={`block text-[9px] mt-1 text-right ${m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-3 py-2 text-slate-500">
                  <span className="inline-flex gap-1" aria-label="Assistant is typing">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                disabled={typing}
                className="text-[10px] bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full font-medium disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Sahayatri AI a question..."
              aria-label="Message Sahayatri AI"
              className="flex-1 bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button type="submit" disabled={typing || !input.trim()} aria-label="Send message" className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white p-2 rounded-lg transition">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
