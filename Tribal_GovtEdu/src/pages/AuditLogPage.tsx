import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { ArrowLeft, Lock, Search, ScrollText } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { NavigateFn } from '../lib/navigation';

export const AuditLogPage: React.FC<{ navigate: NavigateFn }> = ({ navigate }) => {
  const { auditLogs } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return auditLogs;
    return auditLogs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q) ||
        l.userRole.toLowerCase().includes(q) ||
        (l.applicationNo && l.applicationNo.toLowerCase().includes(q))
    );
  }, [auditLogs, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <button
          onClick={() => navigate('admin-dashboard')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
        </button>

        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full uppercase">
              Action Audit Trail
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1">System Action & Audit Records</h1>
            <p className="text-xs text-slate-400">
              Every consequential action taken in this session, in the order it happened.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-emerald-400 font-bold">
            <Lock className="w-4 h-4" /> No edit or delete controls
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-3">
          This trail is stored in your browser only. It is an append-only record within the prototype session and is
          <strong> not</strong> a tamper-evident or certified log. Production deployment would require a
          write-once server-side store.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, user, role or application no."
            aria-label="Search audit records"
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {filteredLogs.length === 0 ? (
          <EmptyState
            compact
            icon={ScrollText}
            title={auditLogs.length === 0 ? 'No actions recorded yet' : 'No records match your search'}
            message={
              auditLogs.length === 0
                ? 'Scrutiny decisions, deficiency notices, committee recommendations and award sanctions are logged here as they occur.'
                : 'Try a different action name, user or application number.'
            }
            action={
              searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg"
                >
                  Clear search
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <caption className="sr-only">
                Audit records, newest entries recorded by this session
              </caption>
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th scope="col" className="p-3">Timestamp</th>
                  <th scope="col" className="p-3">User</th>
                  <th scope="col" className="p-3">Role</th>
                  <th scope="col" className="p-3">Action Type</th>
                  <th scope="col" className="p-3">Application No</th>
                  <th scope="col" className="p-3">Remarks / Event Details</th>
                  <th scope="col" className="p-3 text-right">Client Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500 font-sans whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold font-sans text-slate-900">{log.userName}</td>
                    <td className="p-3 font-sans">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold border">
                        {log.userRole.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-blue-700 font-sans">{log.action}</td>
                    <td className="p-3 font-bold text-slate-900 font-sans">{log.applicationNo || log.applicationId || 'N/A'}</td>
                    <td className="p-3 font-sans text-slate-600 max-w-xs">{log.remarks}</td>
                    <td className="p-3 text-right text-slate-400 text-[10px] font-sans">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-[11px] text-slate-500">
          Showing {filteredLogs.length} of {auditLogs.length} record(s). Timestamps use this device&rsquo;s clock.
        </p>
      </div>
    </div>
  );
};
