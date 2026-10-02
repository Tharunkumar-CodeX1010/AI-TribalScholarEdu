import { UserRole } from '../types';

export type TabId =
  | 'landing' | 'schemes' | 'scheme-detail' | 'eligibility'
  | 'auth-login' | 'auth-register'
  | 'applicant-dashboard' | 'application-wizard'
  | 'officer-dashboard' | 'screening-dashboard' | 'admin-dashboard'
  | 'scheme-config' | 'audit-logs' | 'help';

export interface NavigateOptions {
  schemeId?: string;
  applicationId?: string;
}

/** Every page receives this so cross-page CTAs can carry scheme/application context. */
export type NavigateFn = (tab: TabId, opts?: NavigateOptions) => void;

export const APPLICANT: UserRole[] = ['APPLICANT'];
export const OFFICER: UserRole[] = ['SCRUTINY_OFFICER'];
export const COMMITTEE: UserRole[] = ['SCREENING_COMMITTEE'];
export const ADMIN: UserRole[] = ['ADMINISTRATOR', 'SUPER_ADMIN'];

/**
 * Tabs restricted to specific officer roles. Public tabs stay open to everyone.
 * Administrators may open the scrutiny workspace read-only, because the master
 * applications directory deep-links into it with `applicationId`.
 */
export const ROLE_GATED: Partial<Record<TabId, UserRole[]>> = {
  'applicant-dashboard': APPLICANT,
  'application-wizard': APPLICANT,
  'officer-dashboard': [...OFFICER, ...ADMIN],
  'screening-dashboard': COMMITTEE,
  'admin-dashboard': ADMIN,
  'scheme-config': ADMIN,
  'audit-logs': ADMIN
};

export const ROLE_LANDING: Record<UserRole, TabId> = {
  APPLICANT: 'applicant-dashboard',
  SCRUTINY_OFFICER: 'officer-dashboard',
  SCREENING_COMMITTEE: 'screening-dashboard',
  ADMINISTRATOR: 'admin-dashboard',
  SUPER_ADMIN: 'admin-dashboard'
};

/** Which dashboard a freshly authenticated user of a given role should land on. */
export const landingTabForRole = (role: UserRole): TabId => ROLE_LANDING[role];
