import { Scheme, PersonalDetails, AcademicDetails, EligibilityCriterion } from '../types';

export interface RuleEvaluationResult {
  ruleId: string;
  ruleDescription: string;
  passed: boolean;
  actualValue: string;
  expectedValue: string;
  source: 'STANDARD' | 'SCHEME_CONFIG';
}

export interface EvaluationOutcome {
  overallEligible: boolean;
  ruleResults: RuleEvaluationResult[];
  scorePercent: number;
  summary: string;
}

type ApplicantData = {
  personalDetails: Partial<PersonalDetails>;
  academicDetails: Partial<AcademicDetails>;
};

/** Reads a dotted path such as "personalDetails.annualFamilyIncome" off the applicant payload. */
const readField = (data: ApplicantData, path: string): unknown =>
  path.split('.').reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, data);

/** Rule values are stored as strings ("78.5%") but compared against numbers (55). */
const toComparableNumber = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toComparableString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim().toLowerCase();
  return String(value).trim().toLowerCase();
};

const compare = (actual: unknown, rule: EligibilityCriterion): boolean => {
  switch (rule.operator) {
    case 'EQUALS':
      return toComparableString(actual) === toComparableString(rule.value);
    case 'CONTAINS':
      return toComparableString(actual).includes(toComparableString(rule.value));
    case 'IN':
      return (
        Array.isArray(rule.value) &&
        rule.value.map(toComparableString).includes(toComparableString(actual))
      );
    case 'GREATER_THAN_OR_EQUAL': {
      const a = toComparableNumber(actual);
      const b = toComparableNumber(rule.value);
      return a !== null && b !== null && a >= b;
    }
    case 'LESS_THAN_OR_EQUAL': {
      const a = toComparableNumber(actual);
      const b = toComparableNumber(rule.value);
      return a !== null && b !== null && a <= b;
    }
    default:
      return false;
  }
};

const formatExpected = (rule: EligibilityCriterion): string => {
  const { operator, value } = rule;
  if (operator === 'IN' && Array.isArray(value)) return value.join(' or ');
  if (operator === 'GREATER_THAN_OR_EQUAL') return `≥ ${value}`;
  if (operator === 'LESS_THAN_OR_EQUAL') return `≤ ${value}`;
  if (operator === 'CONTAINS') return `contains "${value}"`;
  return String(value);
};

/**
 * Standard MoTA conditions that apply to every fellowship scheme, independent of
 * how an administrator has configured the scheme's own rule set.
 */
const standardChecks = (
  scheme: Scheme,
  personal: Partial<PersonalDetails>,
  academic: Partial<AcademicDetails>
): RuleEvaluationResult[] => {
  const stCertNo = (personal.stCertNumber ?? '').trim();
  const stCertValid = stCertNo.length > 5;

  const marksRaw = (academic.percentageOrCGPA ?? '').toString();
  const marks = toComparableNumber(marksRaw) ?? 0;

  const results: RuleEvaluationResult[] = [
    {
      ruleId: 'std-st-category',
      ruleDescription: 'Recognized Scheduled Tribe (ST) certificate on record',
      passed: stCertValid,
      actualValue: stCertValid ? stCertNo : 'Not provided',
      expectedValue: 'Valid ST certificate number',
      source: 'STANDARD'
    },
    {
      ruleId: 'std-academic-marks',
      ruleDescription: 'Minimum 55% aggregate in qualifying degree',
      passed: marks >= 55,
      actualValue: marksRaw ? `${marks}%` : 'Not provided',
      expectedValue: '≥ 55%',
      source: 'STANDARD'
    }
  ];

  if (scheme.location === 'ABROAD' || scheme.category === 'OVERSEAS') {
    const admitted = academic.admissionStatus === 'CONFIRMED' || academic.admissionStatus === 'PROVISIONAL';
    results.push({
      ruleId: 'std-overseas-admission',
      ruleDescription: 'Admission secured at a foreign university',
      passed: admitted,
      actualValue: academic.admissionStatus ?? 'Not provided',
      expectedValue: 'CONFIRMED or PROVISIONAL',
      source: 'STANDARD'
    });
  }

  return results;
};

export class EligibilityEngine {
  /**
   * Evaluates a candidate against the standard MoTA checks plus every rule
   * configured on the scheme, so administrator edits to Scheme Configurator
   * actually change the outcome.
   */
  static evaluate(
    scheme: Scheme,
    personal: Partial<PersonalDetails>,
    academic: Partial<AcademicDetails>
  ): EvaluationOutcome {
    const applicant: ApplicantData = { personalDetails: personal, academicDetails: academic };

    const configuredResults: RuleEvaluationResult[] = (scheme.eligibilityRules ?? []).map((rule) => {
      const actual = readField(applicant, rule.field);
      const hasValue = actual !== undefined && actual !== null && actual !== '';
      return {
        ruleId: rule.id,
        ruleDescription: rule.description,
        passed: hasValue && compare(actual, rule),
        actualValue: hasValue ? String(actual) : 'Not provided',
        expectedValue: formatExpected(rule),
        source: 'SCHEME_CONFIG' as const
      };
    });

    const ruleResults = [...standardChecks(scheme, personal, academic), ...configuredResults];

    if (ruleResults.length === 0) {
      return {
        overallEligible: false,
        ruleResults,
        scorePercent: 0,
        summary: 'No eligibility criteria are configured for this scheme. Please contact the Ministry.'
      };
    }

    const passedCount = ruleResults.filter((r) => r.passed).length;
    const overallEligible = passedCount === ruleResults.length;
    const scorePercent = Math.round((passedCount / ruleResults.length) * 100);
    const failed = ruleResults.length - passedCount;

    return {
      overallEligible,
      ruleResults,
      scorePercent,
      summary: overallEligible
        ? `All ${ruleResults.length} criteria satisfied. Final eligibility is confirmed only after officer document scrutiny.`
        : `${failed} of ${ruleResults.length} criteria are not satisfied. You may still apply, but the application will be routed to manual review.`
    };
  }

  /** Field names referenced by a scheme's rules — used to decide which inputs the checker should ask for. */
  static ruleFields(scheme: Scheme): string[] {
    return (scheme.eligibilityRules ?? []).map((r) => r.field);
  }

  static referencesField(scheme: Scheme, field: string): boolean {
    return this.ruleFields(scheme).includes(field);
  }
}
