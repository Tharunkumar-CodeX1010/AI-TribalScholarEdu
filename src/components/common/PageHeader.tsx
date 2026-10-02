import React from 'react';

interface PageHeaderProps {
  kicker: string;
  kickerClassName?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  kicker,
  kickerClassName = 'text-amber-400 bg-amber-950/80 border-amber-500/40',
  title,
  subtitle,
  children
}) => (
  <div className="bg-slate-900 text-white rounded-lg border border-slate-800 shadow-md px-5 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:bg-white print:text-slate-900 print:border-slate-300">
    <div className="min-w-0">
      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${kickerClassName}`}>
        {kicker}
      </span>
      <h1 className="text-xl sm:text-2xl font-bold text-white mt-2 leading-tight print:text-slate-900">{title}</h1>
      {subtitle && <p className="text-xs text-slate-400 mt-1 print:text-slate-600">{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-2 shrink-0 print:hidden">{children}</div>}
  </div>
);
