import { Scheme, User, Application, AuditRecord, AppNotification } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'usr-applicant-1',
    name: 'Chandra Hass Topno',
    email: 'applicant@mota.gov.in',
    role: 'APPLICANT',
    mobile: '+91 98765 43210',
    state: 'Jharkhand',
    district: 'Ranchi',
    stCertNo: 'ST/JH/RNC/2023/88921',
    profileCompleted: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'usr-applicant-2',
    name: 'Ananya Kumari Oraon',
    email: 'ananya.oraon@example.com',
    role: 'APPLICANT',
    mobile: '+91 98765 12345',
    state: 'Chhattisgarh',
    district: 'Bastar',
    stCertNo: 'ST/CG/BST/2024/11029',
    profileCompleted: true,
  },
  {
    id: 'usr-applicant-3',
    name: 'Rahul Murmu',
    email: 'rahul.murmu@example.com',
    role: 'APPLICANT',
    mobile: '+91 98123 45678',
    state: 'Odisha',
    district: 'Mayurbhanj',
    stCertNo: 'ST/OD/MYB/2023/90123',
    profileCompleted: true,
  },
  {
    id: 'usr-officer-1',
    name: 'Dr. Rajesh Kumar Meena',
    email: 'officer@mota.gov.in',
    role: 'SCRUTINY_OFFICER',
    mobile: '+91 91234 56789',
    state: 'Delhi',
    district: 'New Delhi',
    department: 'Verification & Scrutiny Wing',
    designation: 'Senior Scrutiny Officer',
    profileCompleted: true,
  },
  {
    id: 'usr-committee-1',
    name: 'Prof. Smt. Kamala Tirkey',
    email: 'committee@mota.gov.in',
    role: 'SCREENING_COMMITTEE',
    mobile: '+91 94321 87654',
    state: 'Assam',
    district: 'Guwahati',
    department: 'National Academic Screening Board',
    designation: 'Committee Chair / Reviewer',
    profileCompleted: true,
  },
  {
    id: 'usr-admin-1',
    name: 'Suresh Chandra Munda',
    email: 'admin@mota.gov.in',
    role: 'ADMINISTRATOR',
    mobile: '+91 99887 76655',
    state: 'Delhi',
    district: 'New Delhi',
    department: 'Scholarship Division, MoTA',
    designation: 'Joint Director (Education)',
    profileCompleted: true,
  },
  {
    id: 'usr-superadmin-1',
    name: 'Priya Minz (IAS)',
    email: 'superadmin@mota.gov.in',
    role: 'SUPER_ADMIN',
    mobile: '+91 90000 11111',
    state: 'Delhi',
    district: 'New Delhi',
    department: 'Ministry of Tribal Affairs',
    designation: 'Additional Secretary & Director General',
    profileCompleted: true,
  }
];

export const MOCK_SCHEMES: Scheme[] = [
  {
    id: 'sch-nfst',
    code: 'NFST',
    title: 'National Fellowship for Scheduled Tribes (NFST)',
    category: 'FELLOWSHIP',
    description: 'Financial assistance to Scheduled Tribe (ST) students for pursuing higher education leading to M.Phil and Ph.D degrees in Sciences, Humanities, and Engineering in Indian Universities.',
    studyLevel: 'Ph.D / M.Phil',
    location: 'INDIA',
    financialBenefit: '₹31,000 to ₹35,000/month stipend + Contingency up to ₹25,000/year + HRA',
    deadline: '2026-11-30',
    academicYear: '2026-27',
    totalSlots: 750,
    activeApplicationsCount: 342,
    eligibilitySummary: [
      'Must belong to a Scheduled Tribe (ST) recognized by GoI',
      'Must have secured admission in regular M.Phil / Ph.D in UGC recognized university',
      'Maximum age limit: 36 years for male, 41 years for female applicants',
      'Minimum 55% marks in Post-Graduation degree'
    ],
    requiredDocuments: [
      {
        id: 'doc-st-cert',
        name: 'ST Category Certificate',
        code: 'ST_CERTIFICATE',
        mandatory: true,
        allowedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMB: 5,
        description: 'Issued by competent authority (Sub-Divisional Officer / Tehsildar)'
      },
      {
        id: 'doc-id-proof',
        name: 'Aadhaar / Identity Proof',
        code: 'AADHAAR_CARD',
        mandatory: true,
        allowedFormats: ['PDF', 'JPG', 'PNG'],
        maxSizeMB: 5,
        description: 'Aadhaar card with clear name and date of birth'
      },
      {
        id: 'doc-pg-mark',
        name: 'Post-Graduate Degree & Marksheet',
        code: 'PG_MARKSHEET',
        mandatory: true,
        allowedFormats: ['PDF'],
        maxSizeMB: 10,
        description: 'Self-attested degree certificate or final semester marksheet'
      },
      {
        id: 'doc-adm-proof',
        name: 'Ph.D/M.Phil Admission Offer Letter',
        code: 'ADMISSION_PROOF',
        mandatory: true,
        allowedFormats: ['PDF'],
        maxSizeMB: 5,
        description: 'Official admission letter showing supervisor details and registration date'
      },
      {
        id: 'doc-inc-cert',
        name: 'Annual Family Income Certificate',
        code: 'INCOME_CERTIFICATE',
        mandatory: false,
        allowedFormats: ['PDF', 'JPG'],
        maxSizeMB: 5,
        description: 'Issued by Revenue Authority for current financial year'
      },
      {
        id: 'doc-bank-pass',
        name: 'Bank Passbook / Cancelled Cheque',
        code: 'BANK_DOCUMENT',
        mandatory: true,
        allowedFormats: ['PDF', 'JPG'],
        maxSizeMB: 5,
        description: 'Aadhaar-seeded bank account details showing IFSC code'
      }
    ],
    eligibilityRules: [
      {
        id: 'rule-st-cat',
        field: 'personalDetails.stCertNumber',
        operator: 'CONTAINS',
        value: 'ST/',
        description: 'Valid ST Certificate number present and verified',
        mandatory: true
      },
      {
        id: 'rule-pg-marks',
        field: 'academicDetails.percentageOrCGPA',
        operator: 'GREATER_THAN_OR_EQUAL',
        value: 55,
        description: 'Minimum 55% aggregate in Post-Graduation',
        mandatory: true
      },
      {
        id: 'rule-admission',
        field: 'academicDetails.admissionStatus',
        operator: 'EQUALS',
        value: 'CONFIRMED',
        description: 'Confirmed Ph.D or M.Phil admission',
        mandatory: true
      }
    ],
    workflowStages: [
      { id: 'stg-1', stepNumber: 1, name: 'Application Submission', responsibleRole: 'APPLICANT', description: 'Form submission and document upload' },
      { id: 'stg-2', stepNumber: 2, name: 'AI & OCR Pre-Verification', responsibleRole: 'ADMINISTRATOR', description: 'Automated document processing and cross-field check', autoTriggerAI: true },
      { id: 'stg-3', stepNumber: 3, name: 'Scrutiny Officer Verification', responsibleRole: 'SCRUTINY_OFFICER', description: 'Human officer document audit and deficiency check' },
      { id: 'stg-4', stepNumber: 4, name: 'Academic Screening Board Review', responsibleRole: 'SCREENING_COMMITTEE', description: 'Academic merit scoring and recommendations' },
      { id: 'stg-5', stepNumber: 5, name: 'Final Approval & Award Sanction', responsibleRole: 'ADMINISTRATOR', description: 'Sanction order generation and DBT release setup' }
    ],
    isActive: true
  },
  {
    id: 'sch-nos',
    code: 'NOS',
    title: 'National Overseas Scholarship for ST Students (NOS)',
    category: 'OVERSEAS',
    description: 'Financial assistance to meritorious ST students for pursuing Master’s level courses, Ph.D and Post-Doctoral research in premier foreign Universities abroad.',
    studyLevel: 'Masters / Ph.D / Post-Doc',
    location: 'ABROAD',
    financialBenefit: 'Full Tuition Fee + Annual Maintenance Allowance ($15,400 USD / £9,900 GBP) + Airfare',
    deadline: '2026-12-15',
    academicYear: '2026-27',
    totalSlots: 20,
    activeApplicationsCount: 88,
    eligibilitySummary: [
      'Must belong to a Scheduled Tribe (ST)',
      'Total annual family income should not exceed ₹6.00 Lakh per annum',
      'Minimum 55% marks or equivalent grade in qualifying degree',
      'Below 35 years of age as of 1st July of election year',
      'Unconditional admission letter from a university ranked in top 500 QS World University Rankings'
    ],
    requiredDocuments: [
      {
        id: 'doc-nos-st',
        name: 'ST Category Certificate',
        code: 'ST_CERTIFICATE',
        mandatory: true,
        allowedFormats: ['PDF'],
        maxSizeMB: 5,
        description: 'Govt issued ST certificate with digital seal'
      },
      {
        id: 'doc-nos-income',
        name: 'Income Certificate (Revenue Authority)',
        code: 'INCOME_CERTIFICATE',
        mandatory: true,
        allowedFormats: ['PDF'],
        maxSizeMB: 5,
        description: 'Income proof showing annual family income under ₹6,00,000'
      },
      {
        id: 'doc-nos-passport',
        name: 'Valid Indian Passport',
        code: 'PASSPORT',
        mandatory: true,
        allowedFormats: ['PDF', 'JPG'],
        maxSizeMB: 5,
        description: 'First & last page of passport valid for at least 2 years'
      },
      {
        id: 'doc-nos-offer',
        name: 'Unconditional Foreign University Offer Letter',
        code: 'FOREIGN_OFFER_LETTER',
        mandatory: true,
        allowedFormats: ['PDF'],
        maxSizeMB: 10,
        description: 'Official offer letter specifying course start date and QS ranking'
      }
    ],
    eligibilityRules: [
      {
        id: 'rule-income-cap',
        field: 'personalDetails.annualFamilyIncome',
        operator: 'LESS_THAN_OR_EQUAL',
        value: 600000,
        description: 'Family income <= ₹6,00,000 per annum',
        mandatory: true
      },
      {
        id: 'rule-foreign-country',
        field: 'academicDetails.admissionStatus',
        operator: 'IN',
        value: ['CONFIRMED', 'PROVISIONAL'],
        description: 'Unconditional or provisional admission secured at foreign university',
        mandatory: true
      }
    ],
    workflowStages: [
      { id: 'stg-1', stepNumber: 1, name: 'Application Submission', responsibleRole: 'APPLICANT', description: 'Form submission & passport upload' },
      { id: 'stg-2', stepNumber: 2, name: 'AI OCR & Passport Cross-Check', responsibleRole: 'ADMINISTRATOR', description: 'Passport and offer letter auto verification', autoTriggerAI: true },
      { id: 'stg-3', stepNumber: 3, name: 'Embassies & Scrutiny Verification', responsibleRole: 'SCRUTINY_OFFICER', description: 'Document verification and income scrutiny' },
      { id: 'stg-4', stepNumber: 4, name: 'National Overseas Selection Board', responsibleRole: 'SCREENING_COMMITTEE', description: 'Interview and global merit ranking' },
      { id: 'stg-5', stepNumber: 5, name: 'Assurance Letter & Fund Allocation', responsibleRole: 'SUPER_ADMIN', description: 'Financial guarantee release to embassy/university' }
    ],
    isActive: true
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    applicationNo: 'NFST-2026-0891',
    applicantId: 'usr-applicant-1',
    applicantName: 'Chandra Hass Topno',
    applicantEmail: 'applicant@mota.gov.in',
    applicantMobile: '+91 98765 43210',
    schemeId: 'sch-nfst',
    schemeCode: 'NFST',
    schemeTitle: 'National Fellowship for Scheduled Tribes (NFST)',
    academicYear: '2026-27',
    submissionDate: '2026-09-15T10:30:00Z',
    lastUpdated: '2026-09-28T14:20:00Z',
    stage: 'DEFICIENCY_RAISED',
    priority: 'HIGH',
    assignedOfficerId: 'usr-officer-1',
    assignedOfficerName: 'Dr. Rajesh Kumar Meena',
    personalDetails: {
      fullName: 'Chandra Hass Topno',
      dob: '1998-06-14',
      gender: 'Male',
      fatherName: 'Birsa Topno',
      motherName: 'Shanti Topno',
      aadhaarNumber: '7890 1234 5678',
      stCertNumber: 'ST/JH/RNC/2023/88921',
      stCertIssuingAuthority: 'Sub-Divisional Officer, Ranchi',
      stCertIssueDate: '2023-04-12',
      tribeName: 'Munda',
      annualFamilyIncome: 240000,
      differentlyAbled: false,
      addressLine1: 'H.No 45, Main Road, Kanke',
      pincode: '834006',
      state: 'Jharkhand',
      district: 'Ranchi'
    },
    academicDetails: {
      highestQualification: 'Master of Science (M.Sc. Biotechnology)',
      institutionName: 'Ranchi University, Ranchi',
      universityName: 'Ranchi University',
      passingYear: 2024,
      percentageOrCGPA: '78.5%',
      targetCourse: 'Ph.D in Applied Biotechnology',
      targetInstitution: 'Indian Institute of Technology (IIT) Kharagpur',
      admissionStatus: 'CONFIRMED',
      researchTopic: 'Ethnobotanical Conservation of Medicinal Flora in Chota Nagpur Plateau',
      supervisorName: 'Dr. A. K. Banerjee'
    },
    bankDetails: {
      accountHolderName: 'Chandra Hass Topno',
      accountNumber: '389012445566',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
      branchName: 'Main Branch, Ranchi',
      aadhaarSeeded: true
    },
    documents: [
      {
        id: 'doc-001-st',
        applicationId: 'app-001',
        documentConfigId: 'doc-st-cert',
        documentName: 'ST Category Certificate',
        fileName: 'ST_Certificate_ChandraHass.pdf',
        fileSize: '1.8 MB',
        uploadDate: '2026-09-15',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mimeType: 'application/pdf',
        verificationStatus: 'VERIFIED',
        overallAiConfidence: 96,
        officerRemarks: 'ST Certificate verified against digital signature.',
        ocrData: [
          { fieldKey: 'fullName', label: 'Name on Certificate', extractedValue: 'Chandra Hass Topno', confidence: 98, matchedWithApp: true, appValue: 'Chandra Hass Topno' },
          { fieldKey: 'stCertNo', label: 'Certificate Number', extractedValue: 'ST/JH/RNC/2023/88921', confidence: 97, matchedWithApp: true, appValue: 'ST/JH/RNC/2023/88921' },
          { fieldKey: 'tribe', label: 'Tribe Name', extractedValue: 'Munda', confidence: 95, matchedWithApp: true, appValue: 'Munda' },
          { fieldKey: 'issueDate', label: 'Date of Issue', extractedValue: '12/04/2023', confidence: 94, matchedWithApp: true, appValue: '2023-04-12' }
        ],
        aiChecks: [
          { checkId: 'c1', title: 'Name Match with Application', status: 'PASS', description: 'Exact string match detected (100% similarity)', confidence: 99 },
          { checkId: 'c2', title: 'Issuer Authority Seal', status: 'PASS', description: 'Government seal pattern recognized (Sub-Divisional Officer, Ranchi)', confidence: 94 },
          { checkId: 'c3', title: 'Expiry Status', status: 'PASS', description: 'Permanent ST Certificate format validated', confidence: 96 }
        ]
      },
      {
        id: 'doc-001-inc',
        applicationId: 'app-001',
        documentConfigId: 'doc-inc-cert',
        documentName: 'Annual Family Income Certificate',
        fileName: 'Income_Certificate_2024.pdf',
        fileSize: '2.1 MB',
        uploadDate: '2026-09-15',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mimeType: 'application/pdf',
        verificationStatus: 'DEFICIENT',
        overallAiConfidence: 68,
        officerRemarks: 'Income certificate issued for FY 2023-24; updated FY 2025-26 certificate required.',
        ocrData: [
          { fieldKey: 'fullName', label: 'Name on Income Proof', extractedValue: 'Chandra Has Topno', confidence: 88, matchedWithApp: false, appValue: 'Chandra Hass Topno' },
          { fieldKey: 'income', label: 'Annual Income (INR)', extractedValue: '₹2,40,000', confidence: 92, matchedWithApp: true, appValue: '240000' },
          { fieldKey: 'validityYear', label: 'Validity Financial Year', extractedValue: '2023-2024', confidence: 91, matchedWithApp: false, appValue: '2025-2026' }
        ],
        aiChecks: [
          { checkId: 'c4', title: 'Financial Year Validity', status: 'WARNING', description: 'Certificate validity year (2023-24) precedes current academic year requirement (2025-26)', confidence: 95 },
          { checkId: 'c5', title: 'Name Phonetic Match', status: 'WARNING', description: 'Minor spelling variation detected: "Chandra Has" vs "Chandra Hass"', confidence: 84 }
        ]
      },
      {
        id: 'doc-001-adm',
        applicationId: 'app-001',
        documentConfigId: 'doc-adm-proof',
        documentName: 'Ph.D Admission Offer Letter',
        fileName: 'IITKGP_PhD_Admission_Letter.pdf',
        fileSize: '1.2 MB',
        uploadDate: '2026-09-15',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mimeType: 'application/pdf',
        verificationStatus: 'VERIFIED',
        overallAiConfidence: 95,
        ocrData: [
          { fieldKey: 'institution', label: 'University', extractedValue: 'Indian Institute of Technology Kharagpur', confidence: 99, matchedWithApp: true, appValue: 'Indian Institute of Technology (IIT) Kharagpur' },
          { fieldKey: 'degree', label: 'Program', extractedValue: 'Ph.D in Applied Biotechnology', confidence: 96, matchedWithApp: true, appValue: 'Ph.D in Applied Biotechnology' }
        ],
        aiChecks: [
          { checkId: 'c6', title: 'Institution Recognition', status: 'PASS', description: 'Verified UGC/IIT National Importance Institute', confidence: 99 }
        ]
      }
    ],
    deficiencies: [
      {
        id: 'def-001',
        applicationId: 'app-001',
        documentId: 'doc-001-inc',
        category: 'CERTIFICATE_EXPIRED',
        title: 'Outdated Financial Year Income Certificate',
        description: 'The uploaded Income Certificate is for FY 2023-24. Please upload a fresh Income Certificate issued by Tehsildar/Revenue Officer valid for FY 2025-26.',
        raisedBy: 'usr-officer-1',
        raisedByName: 'Dr. Rajesh Kumar Meena',
        raisedDate: '2026-09-20T11:00:00Z',
        deadlineDate: '2026-10-10T23:59:59Z',
        status: 'OPEN'
      }
    ],
    aiVerificationSummary: {
      overallStatus: 'WARNING',
      overallScore: 86,
      passedChecksCount: 5,
      flaggedChecksCount: 2,
      summaryText: 'ST Category and Ph.D admission details fully verified with high confidence (96%). Income Certificate flagged due to outdated Financial Year (2023-24).',
      recommendation: 'Request applicant to resubmit updated Income Certificate for FY 2025-26 via Deficiency Workflow.'
    },
    eligibilityEvaluation: {
      overallEligible: false,
      ruleResults: [
        { ruleId: 'rule-st-cat', ruleDescription: 'Valid ST Certificate present and verified', passed: true, actualValue: 'ST/JH/RNC/2023/88921', expectedValue: 'Valid ST Cert' },
        { ruleId: 'rule-pg-marks', ruleDescription: 'Minimum 55% aggregate in Post-Graduation', passed: true, actualValue: '78.5%', expectedValue: '>= 55%' },
        { ruleId: 'rule-admission', ruleDescription: 'Confirmed Ph.D or M.Phil admission', passed: true, actualValue: 'CONFIRMED', expectedValue: 'CONFIRMED' }
      ]
    }
  },
  {
    id: 'app-002',
    applicationNo: 'NOS-2026-0042',
    applicantId: 'usr-applicant-2',
    applicantName: 'Ananya Kumari Oraon',
    applicantEmail: 'ananya.oraon@example.com',
    applicantMobile: '+91 98765 12345',
    schemeId: 'sch-nos',
    schemeCode: 'NOS',
    schemeTitle: 'National Overseas Scholarship for ST Students (NOS)',
    academicYear: '2026-27',
    submissionDate: '2026-09-10T14:15:00Z',
    lastUpdated: '2026-09-25T09:10:00Z',
    stage: 'UNDER_SCREENING',
    priority: 'HIGH',
    assignedOfficerId: 'usr-officer-1',
    assignedOfficerName: 'Dr. Rajesh Kumar Meena',
    personalDetails: {
      fullName: 'Ananya Kumari Oraon',
      dob: '2000-03-22',
      gender: 'Female',
      fatherName: 'Somra Oraon',
      motherName: 'Phoolo Oraon',
      aadhaarNumber: '4567 8901 2345',
      stCertNumber: 'ST/CG/BST/2024/11029',
      stCertIssuingAuthority: 'Tehsildar, Bastar',
      stCertIssueDate: '2024-01-15',
      tribeName: 'Oraon',
      annualFamilyIncome: 420000,
      differentlyAbled: false,
      addressLine1: 'Plot 12, Tribal Colony, Jagdalpur',
      pincode: '494001',
      state: 'Chhattisgarh',
      district: 'Bastar'
    },
    academicDetails: {
      highestQualification: 'B.Tech in Computer Science & Engineering',
      institutionName: 'National Institute of Technology (NIT) Raipur',
      universityName: 'NIT Raipur',
      passingYear: 2024,
      percentageOrCGPA: '84.2%',
      targetCourse: 'M.Sc in Artificial Intelligence',
      targetInstitution: 'University of Edinburgh, UK',
      targetCountry: 'UK',
      admissionStatus: 'CONFIRMED',
      researchTopic: 'NLP Applications for Low-Resource Tribal Languages'
    },
    bankDetails: {
      accountHolderName: 'Ananya Kumari Oraon',
      accountNumber: '998811223344',
      ifscCode: 'PUNB0123400',
      bankName: 'Punjab National Bank',
      branchName: 'Jagdalpur Branch',
      aadhaarSeeded: true
    },
    documents: [
      {
        id: 'doc-002-st',
        applicationId: 'app-002',
        documentConfigId: 'doc-nos-st',
        documentName: 'ST Category Certificate',
        fileName: 'Ananya_ST_Cert.pdf',
        fileSize: '1.4 MB',
        uploadDate: '2026-09-10',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mimeType: 'application/pdf',
        verificationStatus: 'VERIFIED',
        overallAiConfidence: 98,
        ocrData: [
          { fieldKey: 'fullName', label: 'Name on Certificate', extractedValue: 'Ananya Kumari Oraon', confidence: 99, matchedWithApp: true, appValue: 'Ananya Kumari Oraon' }
        ],
        aiChecks: [
          { checkId: 'c10', title: 'Name Consistency', status: 'PASS', description: 'Exact string match with Aadhaar and Portal profile', confidence: 99 }
        ]
      },
      {
        id: 'doc-002-pass',
        applicationId: 'app-002',
        documentConfigId: 'doc-nos-passport',
        documentName: 'Valid Indian Passport',
        fileName: 'Passport_Ananya.pdf',
        fileSize: '2.5 MB',
        uploadDate: '2026-09-10',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mimeType: 'application/pdf',
        verificationStatus: 'VERIFIED',
        overallAiConfidence: 97,
        ocrData: [
          { fieldKey: 'passportNo', label: 'Passport No', extractedValue: 'Z8901234', confidence: 98, matchedWithApp: true, appValue: 'Z8901234' },
          { fieldKey: 'expiryDate', label: 'Expiry Date', extractedValue: '14/11/2032', confidence: 99, matchedWithApp: true, appValue: '2032-11-14' }
        ],
        aiChecks: [
          { checkId: 'c11', title: 'Passport Expiry Check', status: 'PASS', description: 'Passport valid until Nov 2032 (>2 years buffer)', confidence: 99 }
        ]
      }
    ],
    deficiencies: [],
    screeningReview: {
      id: 'scr-002',
      applicationId: 'app-002',
      reviewerId: 'usr-committee-1',
      reviewerName: 'Prof. Smt. Kamala Tirkey',
      academicMeritScore: 10,
      researchProposalScore: 9,
      socioEconomicScore: 9,
      totalScore: 28,
      decision: 'RECOMMENDED',
      remarks: 'Outstanding candidate. 84.2% B.Tech score from NIT Raipur. Offer letter from University of Edinburgh (QS Rank 27). Strongly recommended for NOS 2026 fellowship grant.',
      reviewedDate: '2026-09-25T16:00:00Z'
    },
    aiVerificationSummary: {
      overallStatus: 'PASS',
      overallScore: 98,
      passedChecksCount: 8,
      flaggedChecksCount: 0,
      summaryText: 'All documents verified with 98% average confidence. Family income ₹4.20 L falls well under the ₹6.00 L statutory ceiling.',
      recommendation: 'Proceed directly to Screening Committee for Overseas Fellowship allocation.'
    },
    eligibilityEvaluation: {
      overallEligible: true,
      ruleResults: [
        { ruleId: 'rule-income-cap', ruleDescription: 'Family income <= ₹6,00,000 per annum', passed: true, actualValue: '₹4,20,000', expectedValue: '<= ₹6,00,000' },
        { ruleId: 'rule-foreign-country', ruleDescription: 'Overseas institution confirmed', passed: true, actualValue: 'UK', expectedValue: 'UK' }
      ]
    }
  },
  {
    id: 'app-003',
    applicationNo: 'NFST-2026-0120',
    applicantId: 'usr-applicant-3',
    applicantName: 'Rahul Murmu',
    applicantEmail: 'rahul.murmu@example.com',
    applicantMobile: '+91 98123 45678',
    schemeId: 'sch-nfst',
    schemeCode: 'NFST',
    schemeTitle: 'National Fellowship for Scheduled Tribes (NFST)',
    academicYear: '2026-27',
    submissionDate: '2026-08-01T09:00:00Z',
    lastUpdated: '2026-09-29T11:45:00Z',
    stage: 'SELECTED',
    priority: 'NORMAL',
    assignedOfficerId: 'usr-officer-1',
    assignedOfficerName: 'Dr. Rajesh Kumar Meena',
    personalDetails: {
      fullName: 'Rahul Murmu',
      dob: '1997-11-05',
      gender: 'Male',
      fatherName: 'Late Hopna Murmu',
      motherName: 'Sumitra Murmu',
      aadhaarNumber: '1122 3344 5566',
      stCertNumber: 'ST/OD/MYB/2023/90123',
      stCertIssuingAuthority: 'Sub-Collector, Baripada',
      stCertIssueDate: '2023-08-10',
      tribeName: 'Santhal',
      annualFamilyIncome: 180000,
      differentlyAbled: false,
      addressLine1: 'Vill - Rairangpur, PO - Baripada',
      pincode: '757001',
      state: 'Odisha',
      district: 'Mayurbhanj'
    },
    academicDetails: {
      highestQualification: 'M.A. in Linguistics & Santhali Literature',
      institutionName: 'Utkal University, Bhubaneswar',
      universityName: 'Utkal University',
      passingYear: 2023,
      percentageOrCGPA: '81.0%',
      targetCourse: 'Ph.D in Ol Chiki Script & Tribal Digital Humanities',
      targetInstitution: 'Central University of Odisha',
      admissionStatus: 'CONFIRMED',
      researchTopic: 'Digital Standardization & Machine Translation for Santhali Language'
    },
    bankDetails: {
      accountHolderName: 'Rahul Murmu',
      accountNumber: '501002345678',
      ifscCode: 'HDFC0000123',
      bankName: 'HDFC Bank',
      branchName: 'Baripada Branch',
      aadhaarSeeded: true
    },
    documents: [],
    deficiencies: [],
    screeningReview: {
      id: 'scr-003',
      applicationId: 'app-003',
      reviewerId: 'usr-committee-1',
      reviewerName: 'Prof. Smt. Kamala Tirkey',
      academicMeritScore: 10,
      researchProposalScore: 10,
      socioEconomicScore: 9,
      totalScore: 29,
      decision: 'RECOMMENDED',
      remarks: 'Pioneering work in tribal language preservation. Selected under NFST Fellowship 2026 Batch.',
      reviewedDate: '2026-08-28T14:30:00Z'
    },
    awardDetails: {
      awardLetterNo: 'MoTA/NFST/2026/AW-0941',
      awardDate: '2026-09-01',
      sanctionedAmount: 372000,
      stipendMonthly: 31000,
      contingencyYearly: 20000,
      tenureYears: 5,
      disbursementStatus: 'DISBURSED',
      milestones: [
        { title: 'Joining Report & Supervisor Undertaking', dueDate: '2026-09-15', status: 'COMPLETED', submittedDocUrl: 'https://example.com/joining.pdf' },
        { title: '1st Quarter Progress Report & Attendance', dueDate: '2026-12-31', status: 'PENDING' },
        { title: 'Annual Evaluation Seminar', dueDate: '2027-08-31', status: 'PENDING' }
      ],
      payments: [
        { installmentNo: 1, amount: 93000, referenceNo: 'DBT/MOTA/2026/998120', date: '2026-09-05', status: 'PAID' }
      ]
    },
    aiVerificationSummary: {
      overallStatus: 'PASS',
      overallScore: 99,
      passedChecksCount: 9,
      flaggedChecksCount: 0,
      summaryText: 'Flawless verification. All certificates authenticated with Govt digital repositories.',
      recommendation: 'Approved for direct fellowship award release.'
    },
    eligibilityEvaluation: {
      overallEligible: true,
      ruleResults: [
        { ruleId: 'rule-st-cat', ruleDescription: 'Valid ST Certificate present and verified', passed: true, actualValue: 'ST/OD/MYB/2023/90123', expectedValue: 'Valid ST Cert' },
        { ruleId: 'rule-pg-marks', ruleDescription: 'Minimum 55% aggregate in Post-Graduation', passed: true, actualValue: '81.0%', expectedValue: '>= 55%' }
      ]
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'aud-101',
    timestamp: '2026-09-28T14:20:00Z',
    userId: 'usr-officer-1',
    userName: 'Dr. Rajesh Kumar Meena',
    userRole: 'SCRUTINY_OFFICER',
    action: 'DEFICIENCY_RAISED',
    applicationId: 'app-001',
    applicationNo: 'NFST-2026-0891',
    previousStatus: 'UNDER_VERIFICATION',
    newStatus: 'DEFICIENCY_RAISED',
    remarks: 'Raised deficiency for outdated financial year income certificate on Application NFST-2026-0891.',
    ipAddress: '10.240.12.45'
  },
  {
    id: 'aud-102',
    timestamp: '2026-09-25T16:00:00Z',
    userId: 'usr-committee-1',
    userName: 'Prof. Smt. Kamala Tirkey',
    userRole: 'SCREENING_COMMITTEE',
    action: 'SCREENING_RECOMMENDED',
    applicationId: 'app-002',
    applicationNo: 'NOS-2026-0042',
    previousStatus: 'ELIGIBLE',
    newStatus: 'UNDER_SCREENING',
    remarks: 'Screening Committee awarded score 28/30. Candidate recommended for NOS Overseas fellowship.',
    ipAddress: '10.240.18.99'
  },
  {
    id: 'aud-103',
    timestamp: '2026-09-01T10:00:00Z',
    userId: 'usr-admin-1',
    userName: 'Suresh Chandra Munda',
    userRole: 'ADMINISTRATOR',
    action: 'AWARD_SANCTIONED',
    applicationId: 'app-003',
    applicationNo: 'NFST-2026-0120',
    previousStatus: 'UNDER_SCREENING',
    newStatus: 'SELECTED',
    remarks: 'Sanctioned NFST Award Letter No MoTA/NFST/2026/AW-0941. Grant amount ₹3,72,000/year.',
    ipAddress: '10.240.10.12'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-applicant-1',
    title: 'Deficiency Action Required',
    message: 'Scrutiny Officer has requested updated Income Certificate for Application NFST-2026-0891. Deadline: 10th Oct 2026.',
    category: 'DEFICIENCY',
    timestamp: '2026-09-28T14:20:00Z',
    read: false,
    applicationId: 'app-001'
  },
  {
    id: 'notif-2',
    userId: 'usr-officer-1',
    title: 'New Applications Assigned',
    message: '3 new NFST applications have been assigned to your scrutiny queue.',
    category: 'APPLICATION',
    timestamp: '2026-09-27T09:15:00Z',
    read: true
  },
  {
    id: 'notif-3',
    userId: 'usr-applicant-3',
    title: 'Congratulations! Fellowship Awarded',
    message: 'Your application NFST-2026-0120 has been selected for National Fellowship for Scheduled Tribes.',
    category: 'SELECTION',
    timestamp: '2026-09-01T10:05:00Z',
    read: true,
    applicationId: 'app-003'
  }
];
