import React from 'react';
import { ApplicationStage } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, FileText, XCircle, Award, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStage | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeConfig = (st: string) => {
    switch (st) {
      case 'DRAFT':
        return { label: 'Draft Saved', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: FileText };
      case 'SUBMITTED':
        return { label: 'Submitted', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock };
      case 'AI_PROCESSING':
        return { label: 'AI Pre-Checking', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Sparkles };
      case 'UNDER_VERIFICATION':
        return { label: 'Under Verification', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock };
      case 'DEFICIENCY_RAISED':
      case 'DEFICIENT':
        return { label: 'Deficiency Raised', color: 'bg-orange-100 text-orange-900 border-orange-400 font-bold', icon: AlertTriangle };
      case 'RESUBMITTED':
        return { label: 'Resubmitted', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', icon: Clock };
      case 'ELIGIBLE':
      case 'VERIFIED':
      case 'AI_PASSED':
        return { label: 'Verified & Eligible', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold', icon: CheckCircle2 };
      case 'INELIGIBLE':
      case 'REJECTED':
        return { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: XCircle };
      case 'UNDER_SCREENING':
        return { label: 'Under Screening', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: Clock };
      case 'SELECTED':
        return { label: 'Selected / Awarded', color: 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm', icon: Award };
      case 'COMPLETED':
        return { label: 'Completed', color: 'bg-slate-800 text-white border-slate-900', icon: CheckCircle2 };
      default:
        return { label: st.replace(/_/g, ' '), color: 'bg-slate-100 text-slate-800 border-slate-300', icon: Clock };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${config.color} ${sizeClasses} transition-all`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
