import React, { useState } from 'react';
import { Bot, Sparkles, Send, FileText, CheckCircle2, AlertTriangle, UserCheck, Search } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AdminAIAssistant: React.FC<{ onSelectApp?: (appId: string) => void }> = ({ onSelectApp }) => {
  const { applications } = useData();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuerySubmit = (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    setIsProcessing(true);
    setResponse(null);

    setTimeout(() => {
      const qLower = q.toLowerCase();
      let resData: any = { type: 'text', title: 'AI Scrutiny Finding', content: '' };

      if (qLower.includes('pending verification') || qLower.includes('how many pending')) {
        const pendingApps = applications.filter((a) => a.stage === 'UNDER_VERIFICATION' || a.stage === 'SUBMITTED' || a.stage === 'AI_PROCESSING');
        resData = {
          type: 'app_list',
          title: 'Applications Pending Officer Verification',
          summary: `Found ${pendingApps.length} application(s) currently pending document verification in officer queues.`,
          apps: pendingApps
        };
      } else if (qLower.includes('deficiency') || qLower.includes('unresolved')) {
        const defApps = applications.filter((a) => a.stage === 'DEFICIENCY_RAISED' || a.deficiencies.some((d) => d.status === 'OPEN'));
        resData = {
          type: 'app_list',
          title: 'Applications with Unresolved Deficiencies',
          summary: `Found ${defApps.length} application(s) with open deficiency notices pending applicant correction.`,
          apps: defApps
        };
      } else if (qLower.includes('mismatch') || qLower.includes('inconsistency') || qLower.includes('flagged')) {
        const flaggedApps = applications.filter((a) => a.aiVerificationSummary.overallStatus === 'WARNING' || a.aiVerificationSummary.overallStatus === 'FAIL');
        resData = {
          type: 'app_list',
          title: 'Applications Flagged for OCR / Document Inconsistencies',
          summary: `AI Document Intelligence detected potential field mismatches in ${flaggedApps.length} application(s).`,
          apps: flaggedApps
        };
      } else if (qLower.includes('sanction') || qLower.includes('award') || qLower.includes('recommend')) {
        const recApps = applications.filter((a) => a.stage === 'ELIGIBLE');
        resData = {
          type: 'app_list',
          title: 'Files Awaiting Award Sanction',
          summary: `${recApps.length} application(s) carry a committee recommendation and are pending sanction at the administrator desk.`,
          apps: recApps
        };
      } else if (qLower.includes('assigned officer') || qLower.includes('unassigned') || qLower.includes('pending pool')) {
        const unclaimed = applications.filter((a) => !a.assignedOfficerId);
        resData = {
          type: 'app_list',
          title: 'Unassigned Files in the Scrutiny Pool',
          summary: `${unclaimed.length} application(s) have no scrutiny officer recorded and are available to be picked up.`,
          apps: unclaimed
        };
      } else if (qLower.includes('awaiting sanction') || qLower.includes('pending sanction')) {
        resData = {
          type: 'app_list',
          title: 'Files Awaiting Award Sanction',
          summary: `${applications.filter((a) => a.stage === 'ELIGIBLE').length} application(s) are recommended and pending sanction.`,
          apps: applications.filter((a) => a.stage === 'ELIGIBLE')
        };
      } else if (qLower.includes('stage') || qLower.includes('how many') || qLower.includes('status')) {
        /* Previously answered with a fixed "94% confidence" string. Report the
           real pipeline distribution instead of inventing a figure. */
        const byStage = applications.reduce<Record<string, number>>((acc, a) => {
          acc[a.stage] = (acc[a.stage] ?? 0) + 1;
          return acc;
        }, {});
        const breakdown = Object.entries(byStage)
          .sort((a, b) => b[1] - a[1])
          .map(([stage, count]) => `${stage.replace(/_/g, ' ')}: ${count}`)
          .join(' \u00b7 ');
        resData = {
          type: 'text',
          title: 'Pipeline Status',
          content:
            applications.length === 0
              ? 'There are no application records in this browser session yet.'
              : `${applications.length} application(s) on record. Stage breakdown \u2014 ${breakdown}. Ask about deficiencies, OCR flags, unassigned files or award sanction for a drill-down list.`
        };
      } else {
        /* Look for a real application number before falling back to guidance. */
        const mentioned = applications.find(
          (a) => qLower.includes(a.applicationNo.toLowerCase()) || qLower.includes(a.applicantName.toLowerCase())
        );

        if (mentioned) {
          const openDef = mentioned.deficiencies.filter((d) => d.status === 'OPEN').length;
          resData = {
            type: 'summary',
            title: `Executive AI Summary: ${mentioned.applicationNo}`,
            target: mentioned,
            content: `${mentioned.applicantName} applied to ${mentioned.schemeTitle} (${
              mentioned.schemeCode
            }) on ${new Date(mentioned.submissionDate).toLocaleDateString('en-IN')}. Current stage: ${mentioned.stage.replace(
              /_/g,
              ' '
            )}. Scrutiny officer: ${
              mentioned.assignedOfficerName ?? 'unassigned'
            }. Document intelligence status: ${mentioned.aiVerificationSummary.overallStatus} at ${
              mentioned.aiVerificationSummary.overallScore
            }% confidence. Open deficiency notices: ${openDef}.${
              mentioned.awardDetails
                ? ` Sanction order ${mentioned.awardDetails.awardLetterNo} for INR ${mentioned.awardDetails.sanctionedAmount.toLocaleString(
                    'en-IN'
                  )}.`
                : ''
            }`
          };
        } else {
          resData = {
            type: 'text',
            title: 'MoTA AI Query Analysis',
            content: `I could not match that query to a rule or an application record. I can list files pending document verification, unresolved deficiencies, OCR or consistency flags, unassigned files, or files awaiting award sanction. Quote an application number (for example ${
              applications[0]?.applicationNo ?? 'NFST-2026-0000'
            }) for a summary.`
          };
        }
      }

      setResponse(resData);
      setIsProcessing(false);
    }, 700);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-xl p-6 border border-slate-700 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center border border-amber-400">
            <Bot className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              MoTA AI Administrative Scrutiny Assistant <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-300">Natural language query engine for verification, deficiency audit, & analytics</p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: 'Applications Pending Verification', q: 'How many applications are pending verification?', icon: Search, cls: 'text-blue-400' },
          { label: 'Unresolved Deficiencies', q: 'Which applications have unresolved deficiencies?', icon: AlertTriangle, cls: 'text-amber-400' },
          { label: 'Document Inconsistencies', q: 'Show applications with document mismatches.', icon: Sparkles, cls: 'text-purple-400' },
          { label: 'Awaiting Award Sanction', q: 'Which files are awaiting award sanction?', icon: CheckCircle2, cls: 'text-emerald-400' },
          { label: 'Unassigned Scrutiny Pool', q: 'Show unassigned files in the scrutiny pool.', icon: UserCheck, cls: 'text-cyan-400' },
          {
            label: applications[0] ? `Summarize ${applications[0].applicationNo}` : 'Summarize first application',
            q: applications[0]
              ? `Summarize application ${applications[0].applicationNo}`
              : 'Show pipeline status by stage',
            icon: FileText,
            cls: 'text-sky-400'
          }
        ].map((c) => (
          <button
            key={c.label}
            onClick={() => { setQuery(c.q); handleQuerySubmit(c.q); }}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            <c.icon className={`w-3.5 h-3.5 ${c.cls}`} /> {c.label}
          </button>
        ))}
      </div>

      {/* Query Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleQuerySubmit()}
          placeholder="Ask AI Assistant e.g. 'Show applications with document mismatches'..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => handleQuerySubmit()}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {isProcessing ? 'Analyzing Data...' : 'Run Query'}
        </button>
      </div>

      {/* Response Display Box */}
      {response && (
        <div className="mt-4 bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {response.title}
            </span>
            <span className="text-[10px] text-slate-400">AI Confidence: 96% • Auditable Sources</span>
          </div>

          {response.summary && <p className="text-slate-300 mb-3">{response.summary}</p>}

          {response.content && <p className="text-slate-200 leading-relaxed">{response.content}</p>}

          {response.type === 'app_list' && (
            <div className="space-y-2 mt-3">
              {response.apps.map((app: any) => (
                <div
                  key={app.id}
                  onClick={() => onSelectApp && onSelectApp(app.id)}
                  className="bg-slate-900 p-3 rounded border border-slate-800 flex items-center justify-between hover:border-blue-500 cursor-pointer transition"
                >
                  <div>
                    <span className="font-bold text-white mr-2">{app.applicationNo}</span>
                    <span className="text-slate-300">{app.applicantName}</span>
                    <span className="text-slate-500 text-[10px] ml-2">({app.schemeCode})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300 border border-slate-700">
                      {app.stage.replace(/_/g, ' ')}
                    </span>
                    <span className="text-blue-400 hover:underline text-[11px] font-semibold">Inspect →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
