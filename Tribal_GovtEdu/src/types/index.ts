export type UserRole = 
  | 'APPLICANT' 
  | 'SCRUTINY_OFFICER' 
  | 'SCREENING_COMMITTEE' 
  | 'ADMINISTRATOR' 
  | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mobile: string;
  state: string;
  district: string;
  stCertNo?: string;
  avatar?: string;
  profileCompleted: boolean;
  department?: string;
  designation?: string;
}

export type ApplicationStage = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'AI_PROCESSING'
  | 'UNDER_VERIFICATION'
  | 'DEFICIENCY_RAISED'
  | 'RESUBMITTED'
  | 'ELIGIBLE'
  | 'INELIGIBLE'
  | 'UNDER_SCREENING'
  | 'SELECTED'
  | 'NOT_SELECTED'
  | 'REJECTED'
  | 'COMPLETED';

export type PriorityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface RequiredDocumentConfig {
  id: string;
  name: string;
  code: string;
  mandatory: boolean;
  allowedFormats: string[];
  maxSizeMB: number;
  description: string;
}

export interface EligibilityCriterion {
  id: string;
  field: string;
  operator: 'EQUALS' | 'CONTAINS' | 'LESS_THAN_OR_EQUAL' | 'GREATER_THAN_OR_EQUAL' | 'IN';
  value: string | number | boolean | string[];
  description: string;
  mandatory: boolean;
}

export interface WorkflowStageConfig {
  id: string;
  stepNumber: number;
  name: string;
  responsibleRole: UserRole;
  description: string;
  autoTriggerAI?: boolean;
}

export interface Scheme {
  id: string;
  code: string;
  title: string;
  category: 'FELLOWSHIP' | 'SCHOLARSHIP' | 'OVERSEAS';
  description: string;
  studyLevel: string; // Ph.D / M.Phil / Post-Doc / Masters / Bachelor
  location: 'INDIA' | 'ABROAD' | 'BOTH';
  financialBenefit: string;
  deadline: string;
  academicYear: string;
  totalSlots: number;
  activeApplicationsCount: number;
  eligibilitySummary: string[];
  requiredDocuments: RequiredDocumentConfig[];
  eligibilityRules: EligibilityCriterion[];
  workflowStages: WorkflowStageConfig[];
  isActive: boolean;
}

export interface PersonalDetails {
  fullName: string;
  dob: string;
  gender: string;
  fatherName: string;
  motherName: string;
  guardianName?: string;
  aadhaarNumber: string;
  stCertNumber: string;
  stCertIssuingAuthority: string;
  stCertIssueDate: string;
  tribeName: string;
  annualFamilyIncome: number;
  differentlyAbled: boolean;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  state: string;
  district: string;
}

export interface AcademicDetails {
  highestQualification: string;
  institutionName: string;
  universityName: string;
  passingYear: number;
  percentageOrCGPA: string;
  targetCourse: string;
  targetInstitution: string;
  targetCountry?: string;
  admissionStatus: 'CONFIRMED' | 'PROVISIONAL' | 'APPLIED';
  researchTopic?: string;
  supervisorName?: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  aadhaarSeeded: boolean;
}

export interface OCRFieldExtraction {
  fieldKey: string;
  label: string;
  extractedValue: string;
  confidence: number; // 0 - 100
  matchedWithApp: boolean;
  appValue?: string;
  officerStatus?: 'ACCEPTED' | 'EDITED' | 'REJECTED';
  officerCorrectedValue?: string;
}

export interface AICheckResult {
  checkId: string;
  title: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  description: string;
  confidence: number;
}

export interface AppDocument {
  id: string;
  applicationId: string;
  documentConfigId: string;
  documentName: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  fileUrl: string;
  mimeType: string;
  verificationStatus: 'PENDING' | 'AI_PASSED' | 'AI_FLAGGED' | 'VERIFIED' | 'DEFICIENT' | 'REJECTED';
  ocrData: OCRFieldExtraction[];
  aiChecks: AICheckResult[];
  overallAiConfidence: number;
  officerRemarks?: string;
}

export interface Deficiency {
  id: string;
  applicationId: string;
  documentId?: string;
  category: 'DOCUMENT_MISSING' | 'DOCUMENT_BLURRY' | 'NAME_MISMATCH' | 'INCOME_EXCEEDED' | 'CERTIFICATE_EXPIRED' | 'OTHER';
  title: string;
  description: string;
  raisedBy: string;
  raisedByName: string;
  raisedDate: string;
  deadlineDate: string;
  status: 'OPEN' | 'RESUBMITTED' | 'RESOLVED' | 'REJECTED';
  applicantResponseNotes?: string;
  resubmittedDocId?: string;
  resubmittedDate?: string;
  resolvedDate?: string;
  resolvedBy?: string;
}

export interface ScreeningReview {
  id: string;
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  academicMeritScore: number; // 1-10
  researchProposalScore: number; // 1-10
  socioEconomicScore: number; // 1-10
  totalScore: number; // 30 max
  decision: 'RECOMMENDED' | 'REJECTED' | 'WAITLISTED' | 'UNDER_REVIEW';
  remarks: string;
  reviewedDate: string;
}

export interface AwardDetails {
  awardLetterNo: string;
  awardDate: string;
  sanctionedAmount: number;
  stipendMonthly: number;
  contingencyYearly: number;
  tenureYears: number;
  disbursementStatus: 'SCHEDULED' | 'DISBURSED' | 'PENDING' | 'HELD';
  milestones: {
    title: string;
    dueDate: string;
    status: 'COMPLETED' | 'PENDING' | 'OVERDUE';
    submittedDocUrl?: string;
  }[];
  payments: {
    installmentNo: number;
    amount: number;
    referenceNo: string;
    date: string;
    status: 'PAID' | 'PROCESSING' | 'PENDING';
  }[];
}

export interface Application {
  id: string;
  applicationNo: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantMobile: string;
  schemeId: string;
  schemeCode: string;
  schemeTitle: string;
  academicYear: string;
  submissionDate: string;
  lastUpdated: string;
  stage: ApplicationStage;
  priority: PriorityLevel;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  personalDetails: PersonalDetails;
  academicDetails: AcademicDetails;
  bankDetails: BankDetails;
  documents: AppDocument[];
  deficiencies: Deficiency[];
  screeningReview?: ScreeningReview;
  awardDetails?: AwardDetails;
  aiVerificationSummary: {
    overallStatus: 'PASS' | 'WARNING' | 'FAIL';
    overallScore: number;
    passedChecksCount: number;
    flaggedChecksCount: number;
    summaryText: string;
    recommendation: string;
  };
  eligibilityEvaluation: {
    overallEligible: boolean;
    ruleResults: {
      ruleId: string;
      ruleDescription: string;
      passed: boolean;
      actualValue: string;
      expectedValue: string;
    }[];
  };
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  applicationId?: string;
  applicationNo?: string;
  previousStatus?: string;
  newStatus?: string;
  remarks: string;
  ipAddress: string;
}

export interface AppNotification {
  id: string;
  userId: string; // 'ALL' or specific user ID
  userRole?: UserRole;
  title: string;
  message: string;
  category: 'APPLICATION' | 'DEFICIENCY' | 'DOCUMENT' | 'SELECTION' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  link?: string;
  applicationId?: string;
}
