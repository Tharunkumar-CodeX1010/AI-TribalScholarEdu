import React from 'react';
import { AwardDetails } from '../../types';
import { Award, CheckCircle2, Clock, Download, DollarSign, Calendar, FileText } from 'lucide-react';
import { downloadSanctionOrder } from '../../lib/awardDocument';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../lib/format';

export const AwardTracker: React.FC<{
  award: AwardDetails;
  schemeTitle: string;
  applicantName: string;
}> = ({ award, schemeTitle, applicantName }) => {
  const { notify } = useToast();
  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-bold shadow-lg">
            <Award className="w-7 h-7" />
          </div> 
          <div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded font-bold uppercase">
              Sanctioned Fellowship Award
            </span>
            <h3 className="font-extrabold text-xl text-white mt-1">{schemeTitle}</h3>
            <p className="text-xs text-slate-400">Sanction Letter No: {award.awardLetterNo} • Date: {award.awardDate}</p>
          </div>
        </div>

        <button
          onClick={() => {
            downloadSanctionOrder(award, schemeTitle, applicantName);
            notify(`Sanction order ${award.awardLetterNo} opened in the print dialog. Choose "Save as PDF" to keep a copy.`, 'info');
          }}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5 shrink-0"
        >
          <Download className="w-4 h-4" /> Download Official Sanction Order
        </button>
      </div>

      {/* Grant Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-bold block text-[10px] uppercase">Annual Sanctioned Grant</span>
          <span className="font-extrabold text-2xl text-emerald-400 mt-1 block">
            {formatINR(award.sanctionedAmount)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Tenure: {award.tenureYears} Years</span>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-bold block text-[10px] uppercase">Monthly Stipend Allowance</span>
          <span className="font-extrabold text-2xl text-amber-400 mt-1 block">
            {formatINR(award.stipendMonthly)}/mo
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">+ Contingency {formatINR(award.contingencyYearly)}/yr</span>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-bold block text-[10px] uppercase">DBT Disbursement Status</span>
          <span className="font-extrabold text-xl text-blue-400 mt-1 block uppercase">
            {award.disbursementStatus}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Aadhaar PFMS Seeded Account</span>
        </div>
      </div>

      {/* Payment Schedule Table */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wider">
          Direct Benefit Transfer (DBT) Installment History
        </h4>
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-2.5">Installment</th>
                <th className="p-2.5">Amount (INR)</th>
                <th className="p-2.5">DBT Reference No</th>
                <th className="p-2.5">Date</th>
                <th className="p-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {award.payments.map((p) => (
                <tr key={p.installmentNo}>
                  <td className="p-2.5 font-bold text-white">Installment #{p.installmentNo}</td>
                  <td className="p-2.5 font-mono text-emerald-400 font-bold">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 font-mono text-slate-300">{p.referenceNo}</td>
                  <td className="p-2.5 text-slate-400">{p.date}</td>
                  <td className="p-2.5 text-right">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-bold">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fellowship Compliance Milestones */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wider">
          Periodic Fellowship Compliance Milestones
        </h4>
        <div className="space-y-2 text-xs">
          {award.milestones.map((m, idx) => (
            <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {m.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <div>
                  <span className="font-semibold text-white">{m.title}</span>
                  <span className="text-[10px] text-slate-400 block">Due Date: {m.dueDate}</span>
                </div>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold border ${
                m.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border-emerald-700' : 'bg-amber-950 text-amber-400 border-amber-700'
              }`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
