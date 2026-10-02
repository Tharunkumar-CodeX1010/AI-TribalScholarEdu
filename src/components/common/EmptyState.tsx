import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  message?: string;
  action?: React.ReactNode;
  /** Tighten the vertical rhythm for use inside panels, cards and sidebars. */
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  message,
  action,
  compact = false
}) => (
  <div className={`text-center px-6 space-y-3 ${compact ? 'py-7' : 'py-12'}`}>
    <div
      className={`rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto ${
        compact ? 'w-10 h-10' : 'w-12 h-12'
      }`}
    >
      <Icon className={`text-slate-400 ${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />
    </div>
    <h3 className={`font-bold text-slate-800 ${compact ? 'text-xs' : 'text-sm'}`}>{title}</h3>
    {message && (
      <p className={`text-slate-500 max-w-md mx-auto leading-relaxed ${compact ? 'text-[11px]' : 'text-xs'}`}>
        {message}
      </p>
    )}
    {action && <div className="pt-2 flex justify-center">{action}</div>}
  </div>
);
