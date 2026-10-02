export const formatINR = (amount: number): string =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

export const formatCompactINR = (amount: number): string => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)} K`;
  return `₹${Math.round(amount)}`;
};

export const formatDate = (value: string | Date): string => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (value: string | Date): string => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
};

export const formatTime = (value: string | Date): string => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

/** Human label for an ISO date or a plain "YYYY-MM-DD" string. */
export const humanizeStage = (stage: string): string =>
  stage.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

/**
 * The happy-path order of a scholarship application. Terminal and adverse
 * outcomes (rejected, not selected) sit outside this spine and are rendered
 * as an outcome rather than as a step.
 */
export const STAGE_ORDER = [
  'SUBMITTED',
  'AI_PROCESSING',
  'UNDER_VERIFICATION',
  'DEFICIENCY_RAISED',
  'RESUBMITTED',
  'ELIGIBLE',
  'UNDER_SCREENING',
  'SELECTED'
] as const;

export type ProgressStage = (typeof STAGE_ORDER)[number];

/** 1-based position on the happy-path spine, or 0 if the stage is off-spine. */
export const stageProgress = (stage: string): number => {
  const idx = (STAGE_ORDER as readonly string[]).indexOf(stage);
  return idx === -1 ? 0 : idx + 1;
};

/** Days remaining until a deadline. Negative means overdue. */
export const daysUntil = (value: string | Date): number => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 0;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
};

export const deadlineLabel = (value: string | Date): string => {
  const days = daysUntil(value);
  if (days === 0) return 'Due today';
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
  return `${days} day${days === 1 ? '' : 's'} remaining`;
};
