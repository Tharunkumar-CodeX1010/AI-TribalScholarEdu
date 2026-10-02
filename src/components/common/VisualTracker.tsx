import React from 'react';
import { ApplicationStage } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Award, Sparkles } from 'lucide-react';

interface VisualTrackerProps {
  currentStage: ApplicationStage;
  hasDeficiency?: boolean;
}

export const VisualTracker: React.FC<VisualTrackerProps> = ({ currentStage, hasDeficiency }) => {
  const mainStages = [
    { key: 'SUBMITTED', title: 'Application Submitted', desc: 'Received at MoTA Portal' },
    { key: 'AI_PROCESSING', title: 'AI OCR Pre-Check', desc: 'Doc parsing & verification' },
    { key: 'UNDER_VERIFICATION', title: 'Officer Scrutiny', desc: 'Human verification & audit' },
    { key: 'ELIGIBLE', title: 'Eligibility Passed', desc: 'Cleared preliminary rules' },
    { key: 'UNDER_SCREENING', title: 'Academic Screening', desc: 'Selection Board evaluation' },
    { key: 'SELECTED', title: 'Award Sanctioned', desc: 'Fellowship grant released' }
  ];

  const getStageIndex = (stage: ApplicationStage) => {
    switch (stage) {
      case 'DRAFT': return 0;
      case 'SUBMITTED': return 1;
      case 'AI_PROCESSING': return 2;
      case 'UNDER_VERIFICATION':
      case 'DEFICIENCY_RAISED':
      case 'RESUBMITTED': return 3;
      case 'ELIGIBLE': return 4;
      case 'UNDER_SCREENING': return 5;
      case 'SELECTED':
      case 'COMPLETED': return 6;
      case 'REJECTED':
      case 'INELIGIBLE': return -1;
      default: return 1;
    }
  };

  const activeIndex = getStageIndex(currentStage);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Application Lifecycle Progress</h3>
          <p className="text-xs text-slate-500">Real-time status tracking across government verification stages</p>
        </div>
        {hasDeficiency && (
          <span className="bg-orange-100 text-orange-900 border border-orange-300 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-orange-600" /> Deficiency Response Required
          </span>
        )}
      </div>

      {/* Horizontal Timeline Bar */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        {/* Connector Line behind steps */}
        <div className="hidden md:block absolute left-6 right-6 top-5 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, ((activeIndex - 1) / (mainStages.length - 1)) * 100))}%` }}
          />
        </div>

        {mainStages.map((stg, idx) => {
          const stepNumber = idx + 1;
          const isDone = activeIndex > stepNumber;
          const isCurrent = activeIndex === stepNumber;
          const isPending = activeIndex < stepNumber;

          return (
            <div key={stg.key} className="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center flex-1">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : isCurrent
                    ? currentStage === 'DEFICIENCY_RAISED'
                      ? 'bg-orange-500 text-white ring-4 ring-orange-100 animate-bounce'
                      : 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  stg.key === 'SELECTED' ? (
                    <Award className="w-5 h-5 text-amber-300" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )
                ) : (
                  stepNumber
                )}
              </div>

              {/* Text info */}
              <div>
                <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-blue-900' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                  {stg.title}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">{stg.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
