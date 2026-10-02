import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Application, AppDocument } from '../types';
import { documentAIService } from '../services/DocumentAIService';
import { EligibilityEngine } from '../services/EligibilityEngine';
import { CheckCircle2, FileText, Upload, Sparkles, AlertTriangle, Download, ArrowRight, ArrowLeft, ShieldCheck, Printer, XCircle } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { NavigateFn } from '../lib/navigation';
import { formatDate } from '../lib/format';

const DRAFT_KEY = 'mota_wizard_draft';
const LAST_STEP = 9;

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <p className="text-[11px] text-rose-700 font-medium mt-1 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3" /> {message}
    </p>
  ) : null;

interface ApplicationWizardProps {
  initialSchemeId: string;
  navigate: NavigateFn;
}

type Errors = Record<string, string>;

export const ApplicationWizardPage: React.FC<ApplicationWizardProps> = ({ initialSchemeId, navigate }) => {
  const { currentUser } = useAuth();
  const { schemes, addApplication } = useData();
  const { notify } = useToast();

  const activeSchemes = useMemo(() => schemes.filter((s) => s.isActive), [schemes]);

  const [step, setStep] = useState<number>(1);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(initialSchemeId);
  const [errors, setErrors] = useState<Errors>({});
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);


  // Application State
  const [personalDetails, setPersonalDetails] = useState({
    fullName: currentUser.name || 'Chandra Hass Topno',
    dob: '1998-06-14',
    gender: 'Male',
    fatherName: 'Birsa Topno',
    motherName: 'Shanti Topno',
    aadhaarNumber: '7890 1234 5678',
    stCertNumber: currentUser.stCertNo || 'ST/JH/RNC/2023/88921',
    stCertIssuingAuthority: 'Sub-Divisional Officer, Ranchi',
    stCertIssueDate: '2023-04-12',
    tribeName: 'Munda',
    annualFamilyIncome: 240000,
    differentlyAbled: false,
    addressLine1: 'H.No 45, Main Road, Kanke',
    pincode: '834006',
    state: currentUser.state || 'Jharkhand',
    district: currentUser.district || 'Ranchi'
  });

  const [academicDetails, setAcademicDetails] = useState({
    highestQualification: 'M.Sc in Biotechnology',
    institutionName: 'Ranchi University',
    universityName: 'Ranchi University',
    passingYear: 2024,
    percentageOrCGPA: '78.5%',
    targetCourse: 'Ph.D in Applied Biotechnology',
    targetInstitution: 'IIT Kharagpur',
    targetCountry: 'India',
    admissionStatus: 'CONFIRMED' as const,
    researchTopic: 'Ethnobotanical Conservation of Medicinal Flora'
  });

  const [bankDetails, setBankDetails] = useState({
    accountHolderName: currentUser.name || 'Chandra Hass Topno',
    accountNumber: '389012445566',
    ifscCode: 'SBIN0001234',
    bankName: 'State Bank of India',
    branchName: 'Main Branch, Ranchi',
    aadhaarSeeded: true
  });

  // Uploaded Docs state
  const [uploadedDocs, setUploadedDocs] = useState<AppDocument[]>([]);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  // Submitted application receipt state
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);

  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId) ?? activeSchemes[0] ?? schemes[0];

  /* Live consistency + eligibility output, recomputed from the actual answers and
     the files actually uploaded. Nothing here is a fixed demo value. */
  const aiSummary = useMemo(
    () => documentAIService.detectConsistency({ personalDetails, academicDetails }, uploadedDocs),
    [personalDetails, academicDetails, uploadedDocs]
  );

  const eligibilityOutcome = useMemo(
    () =>
      selectedScheme
        ? EligibilityEngine.evaluate(selectedScheme, personalDetails, academicDetails)
        : null,
    [selectedScheme, personalDetails, academicDetails]
  );

  const missingMandatoryDocs = useMemo(() => {
    if (!selectedScheme) return [];
    return selectedScheme.requiredDocuments.filter(
      (cfg) => cfg.mandatory && !uploadedDocs.some((d) => d.documentConfigId === cfg.id)
    );
  }, [selectedScheme, uploadedDocs]);

  /* Restore an abandoned draft so a long form is never lost on refresh. */
  useEffect(() => {
    if (submittedApp) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        step?: number;
        selectedSchemeId?: string;
        personalDetails?: typeof personalDetails;
        academicDetails?: typeof academicDetails;
        bankDetails?: typeof bankDetails;
      };
      if (draft.step && draft.step > 1 && draft.step < LAST_STEP) {
        if (draft.selectedSchemeId) setSelectedSchemeId(draft.selectedSchemeId);
        if (draft.personalDetails) setPersonalDetails(draft.personalDetails);
        if (draft.academicDetails) setAcademicDetails(draft.academicDetails);
        if (draft.bankDetails) setBankDetails(draft.bankDetails);
        setStep(draft.step);
        setRestoredDraft(true);
      }
    } catch {
      /* ignore a malformed draft */
    }
    // Restore runs once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Autosave the draft as the applicant types. */
  useEffect(() => {
    if (submittedApp) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ step, selectedSchemeId, personalDetails, academicDetails, bankDetails })
      );
    } catch {
      /* storage unavailable */
    }
  }, [step, selectedSchemeId, personalDetails, academicDetails, bankDetails, submittedApp]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  };

  /** Validates the fields that belong to a step before the applicant advances. */
  const validateStep = (target: number): boolean => {
    const e: Errors = {};

    if (target > 1) {
      if (!personalDetails.fullName.trim()) e.fullName = 'Full name is required.';
      if (!personalDetails.dob) e.dob = 'Date of birth is required.';
      else if (new Date(personalDetails.dob) > new Date()) e.dob = 'Date of birth cannot be in the future.';
      if (!personalDetails.fatherName.trim()) e.fatherName = "Father's name is required.";
      if (!personalDetails.motherName.trim()) e.motherName = "Mother's name is required.";
      if (!/^\d{12}$/.test(personalDetails.aadhaarNumber.replace(/\s/g, ''))) {
        e.aadhaarNumber = 'Aadhaar number must be exactly 12 digits.';
      }
    }

    if (target > 2) {
      if (personalDetails.stCertNumber.trim().length < 6) {
        e.stCertNumber = 'Enter a valid ST certificate number.';
      }
      if (!personalDetails.tribeName.trim()) e.tribeName = 'Tribal community name is required.';
      if (personalDetails.stCertIssuingAuthority.trim().length < 3) {
        e.stCertIssuingAuthority = 'Issuing authority is required.';
      }
      if (!personalDetails.state.trim() || !personalDetails.district.trim()) {
        e.address = 'State and district are required.';
      }
      if (!/^\d{6}$/.test(personalDetails.pincode)) e.pincode = 'PIN code must be 6 digits.';
    }

    if (target > 3) {
      if (!academicDetails.highestQualification.trim()) e.highestQualification = 'Qualifying degree is required.';
      if (!academicDetails.institutionName.trim()) e.institutionName = 'Institution name is required.';
      if (!academicDetails.passingYear || academicDetails.passingYear < 1950 || academicDetails.passingYear > new Date().getFullYear()) {
        e.passingYear = 'Enter a valid passing year.';
      }
      const marks = parseFloat(academicDetails.percentageOrCGPA);
      if (!academicDetails.percentageOrCGPA.trim() || !Number.isFinite(marks)) {
        e.percentageOrCGPA = 'Enter the qualifying percentage or CGPA.';
      } else if (marks < 0 || marks > 100) {
        e.percentageOrCGPA = 'Value must be between 0 and 100.';
      }
      if (!academicDetails.targetCourse.trim()) e.targetCourse = 'Target course is required.';
      if (!academicDetails.targetInstitution.trim()) e.targetInstitution = 'Target institution is required.';
    }

    if (target > 4) {
      const acct = bankDetails.accountNumber.replace(/\s/g, '');
      if (!/^\d{9,18}$/.test(acct)) e.accountNumber = 'Enter a valid 9 to 18 digit account number.';
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode.toUpperCase())) {
        e.ifscCode = 'Enter a valid 11 character IFSC code.';
      }
      if (!bankDetails.bankName.trim()) e.bankName = 'Bank name is required.';
      if (!bankDetails.aadhaarSeeded) e.aadhaarSeeded = 'DBT mandate requires an Aadhaar-seeded bank account.';
    }

    if (target > 5 && missingMandatoryDocs.length > 0) {
      e.mandatoryDocs = `Upload all mandatory documents: ${missingMandatoryDocs.map((d) => d.name).join(', ')}.`;
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      notify('Please correct the highlighted fields before continuing.', 'error');
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (validateStep(step + 1)) setStep((s) => Math.min(s + 1, LAST_STEP));
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSimulatedFileUpload = async (docConfigId: string, docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocId(docConfigId);

    // Call DocumentAIService
    const processed = await documentAIService.processDocument(file, docConfigId, { personalDetails, academicDetails });

    const newDoc: AppDocument = {
      id: `doc-up-${Date.now()}`,
      applicationId: 'temp-app-id',
      documentConfigId: docConfigId,
      documentName: docName,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      mimeType: file.type || 'application/pdf',
      verificationStatus: processed.verificationStatus,
      ocrData: processed.ocrData,
      aiChecks: processed.aiChecks,
      overallAiConfidence: processed.overallConfidence
    };

    setUploadedDocs((prev) => [...prev.filter((d) => d.documentConfigId !== docConfigId), newDoc]);
    setUploadingDocId(null);
  };

  const handleSubmitFinal = () => {
    if (!selectedScheme) return;

    /* Re-run the full gate at submit time so a crafted navigation cannot bypass it. */
    for (const target of [2, 3, 4, 5, 7]) {
      if (!validateStep(target)) {
        notify('Your application is incomplete. Please review each section.', 'error');
        return;
      }
    }
    if (!declarationAccepted) {
      notify('You must accept the statutory declaration to submit.', 'error');
      setStep(7);
      return;
    }

    const appId = `app-${Date.now()}`;
    const appNo = `${selectedScheme.code}-${selectedScheme.academicYear.slice(0, 4)}-${String(
      Math.floor(1000 + Math.random() * 9000)
    )}`;

    const aiSummaryAtSubmit = documentAIService.detectConsistency(
      { personalDetails, academicDetails },
      uploadedDocs
    );
    const evaluation = EligibilityEngine.evaluate(selectedScheme, personalDetails, academicDetails);

    const newApp: Application = {
      id: appId,
      applicationNo: appNo,
      applicantId: currentUser.id,
      applicantName: personalDetails.fullName,
      applicantEmail: currentUser.email,
      applicantMobile: currentUser.mobile,
      schemeId: selectedScheme.id,
      schemeCode: selectedScheme.code,
      schemeTitle: selectedScheme.title,
      academicYear: selectedScheme.academicYear,
      submissionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      stage: 'SUBMITTED',
      priority: 'NORMAL',
      personalDetails,
      academicDetails,
      bankDetails,
      documents: uploadedDocs,
      deficiencies: [],
      aiVerificationSummary: {
        overallStatus: aiSummaryAtSubmit.overallStatus,
        overallScore: aiSummaryAtSubmit.overallScore,
        passedChecksCount: aiSummaryAtSubmit.passedCount,
        flaggedChecksCount: aiSummaryAtSubmit.flaggedCount,
        summaryText: aiSummaryAtSubmit.summary,
        recommendation: aiSummaryAtSubmit.recommendation
      },
      eligibilityEvaluation: {
        overallEligible: evaluation.overallEligible,
        ruleResults: evaluation.ruleResults
      }
    };

    addApplication(newApp);
    clearDraft();
    setSubmittedApp(newApp);
    setStep(LAST_STEP);
    notify(`Application ${appNo} submitted successfully.`, 'success');
  };

  if (activeSchemes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          icon={FileText}
          title="No schemes are accepting applications"
          message="The Ministry has not published any open scheme for the current cycle. Please check the schemes page for the next application window."
          action={
            <button
              onClick={() => navigate('schemes')}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg"
            >
              View all schemes
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Step Header Indicator */}
      {step < LAST_STEP && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Multi-Step Wizard &bull; Step {step} of {LAST_STEP - 1}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {step === 1 && 'Scheme Selection & Personal Details'}
                {step === 2 && 'ST Category & Identity Verification'}
                {step === 3 && 'Academic Qualifications & Target Course'}
                {step === 4 && 'Bank Details & Aadhaar Seeding'}
                {step === 5 && 'Document Upload & AI Pre-Verification'}
                {step === 6 && 'AI OCR Pre-Verification Audit Summary'}
                {step === 7 && 'Statutory Declaration & Consent'}
                {step === 8 && 'Review & Final Submit'}
              </h2>
            </div>
            <div className="text-right">
              <span className="inline-block text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Draft saved in this browser
              </span>
              {restoredDraft && (
                <p className="text-[10px] text-slate-500 mt-1">Restored from your last session</p>
              )}
            </div>
          </div>

          {/* Progress Line */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-700 h-full transition-all duration-300"
              style={{ width: `${(step / (LAST_STEP - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 1: Scheme & Personal Details */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">Select Target Scheme</label>
            <select
              value={selectedSchemeId}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-bold text-slate-900"
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>{s.title} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Applicant Name</label>
              <input
                type="text"
                value={personalDetails.fullName}
                onChange={(e) => setPersonalDetails({ ...personalDetails, fullName: e.target.value })}
                aria-invalid={Boolean(errors.fullName)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
              <FieldError message={errors.fullName} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={personalDetails.dob}
                onChange={(e) => setPersonalDetails({ ...personalDetails, dob: e.target.value })}
                aria-invalid={Boolean(errors.dob)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
              <FieldError message={errors.dob} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Father's Name</label>
              <input
                type="text"
                value={personalDetails.fatherName}
                onChange={(e) => setPersonalDetails({ ...personalDetails, fatherName: e.target.value })}
                aria-invalid={Boolean(errors.fatherName)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
              <FieldError message={errors.fatherName} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mother's Name</label>
              <input
                type="text"
                value={personalDetails.motherName}
                onChange={(e) => setPersonalDetails({ ...personalDetails, motherName: e.target.value })}
                aria-invalid={Boolean(errors.motherName)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
              <FieldError message={errors.motherName} />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={goNext}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg transition flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: ST Category Details */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ST Certificate Number</label>
              <input
                type="text"
                value={personalDetails.stCertNumber}
                onChange={(e) => setPersonalDetails({ ...personalDetails, stCertNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
              <FieldError message={errors.stCertNumber} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tribe / Sub-Tribe Name</label>
              <input
                type="text"
                value={personalDetails.tribeName}
                onChange={(e) => setPersonalDetails({ ...personalDetails, tribeName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
              <FieldError message={errors.tribeName} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Issuing Authority</label>
              <input
                type="text"
                value={personalDetails.stCertIssuingAuthority}
                onChange={(e) => setPersonalDetails({ ...personalDetails, stCertIssuingAuthority: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
              <FieldError message={errors.stCertIssuingAuthority} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Annual Family Income (INR ₹)</label>
              <input
                type="number"
                value={personalDetails.annualFamilyIncome}
                onChange={(e) => setPersonalDetails({ ...personalDetails, annualFamilyIncome: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={goBack}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Previous
            </button>
            <button
              onClick={goNext}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg transition flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Academic Details */}
      {step === 3 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Highest Qualification Degree</label>
              <input
                type="text"
                value={academicDetails.highestQualification}
                onChange={(e) => setAcademicDetails({ ...academicDetails, highestQualification: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Aggregate Percentage / CGPA (%)</label>
              <input
                type="text"
                value={academicDetails.percentageOrCGPA}
                onChange={(e) => setAcademicDetails({ ...academicDetails, percentageOrCGPA: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
              <FieldError message={errors.percentageOrCGPA} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Institution</label>
              <input
                type="text"
                value={academicDetails.targetInstitution}
                onChange={(e) => setAcademicDetails({ ...academicDetails, targetInstitution: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Research Topic / Course Specialization</label>
              <input
                type="text"
                value={academicDetails.researchTopic}
                onChange={(e) => setAcademicDetails({ ...academicDetails, researchTopic: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={goBack}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Previous
            </button>
            <button
              onClick={goNext}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg transition flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Bank Details */}
      {step === 4 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={bankDetails.accountHolderName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Bank Account Number</label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
              <FieldError message={errors.accountNumber} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
              <FieldError message={errors.ifscCode} />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Bank & Branch Name</label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
              />
              <FieldError message={errors.bankName} />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={goBack}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Previous
            </button>
            <button
              onClick={goNext}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg transition flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Document Upload */}
      {step === 5 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Upload Mandatory Scheme Documents</h3>
            <p className="text-slate-500 mt-0.5">
              Each uploaded file triggers simulated Document AI OCR parsing to verify field accuracy.
            </p>
          </div>

          <div className="space-y-4">
            {selectedScheme.requiredDocuments.map((docConfig) => {
              const uploaded = uploadedDocs.find((d) => d.documentConfigId === docConfig.id);
              const isUploading = uploadingDocId === docConfig.id;

              return (
                <div key={docConfig.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      {docConfig.name} {docConfig.mandatory && <span className="text-rose-600 font-bold">*</span>}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{docConfig.description}</p>
                    {uploaded && (
                      <div className="mt-2 flex items-center gap-2 text-[10px]">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded: {uploaded.fileName} ({uploaded.fileSize})
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          AI Confidence: {uploaded.overallAiConfidence}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    {isUploading ? (
                      <span className="text-xs text-blue-700 font-bold animate-pulse">Running AI OCR Check...</span>
                    ) : (
                      <label className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> {uploaded ? 'Replace File' : 'Upload Document'}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleSimulatedFileUpload(docConfig.id, docConfig.name, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={goBack}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (missingMandatoryDocs.length > 0) {
                  notify('Upload the remaining mandatory documents before continuing.', 'error');
                  return;
                }
                goNext();
              }}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg transition flex items-center gap-1.5"
            >
              Review AI OCR Audit <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 6: AI Verification Audit Summary */}
      {step === 6 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-sm">Automated AI Pre-Verification Summary</h3>
                <p className="text-[11px] text-slate-400">
                  Cross-field consistency evaluation across {uploadedDocs.length} uploaded document
                  {uploadedDocs.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full font-bold text-xs ${
                aiSummary.overallScore >= 80
                  ? 'bg-emerald-500 text-slate-950'
                  : aiSummary.overallScore >= 60
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-rose-500 text-white'
              }`}
            >
              Score: {aiSummary.overallScore} / 100
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-[11px]">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
              {aiSummary.passedCount} check{aiSummary.passedCount === 1 ? '' : 's'} passed
            </span>
            {aiSummary.flaggedCount > 0 && (
              <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full font-bold">
                {aiSummary.flaggedCount} check{aiSummary.flaggedCount === 1 ? '' : 's'} flagged for officer review
              </span>
            )}
            {missingMandatoryDocs.length > 0 && (
              <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold">
                {missingMandatoryDocs.length} mandatory document{missingMandatoryDocs.length === 1 ? '' : 's'} still missing
              </span>
            )}
          </div>

          {missingMandatoryDocs.length > 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <strong>Incomplete document set.</strong> Return to the upload step and add:{' '}
                {missingMandatoryDocs.map((d) => d.name).join(', ')}.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedDocs.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>No documents have been processed, so no automated checks could run.</div>
                </div>
              ) : (
                uploadedDocs.flatMap((doc) =>
                  doc.aiChecks.map((c) => (
                    <div
                      key={`${doc.id}-${c.checkId}`}
                      className={`p-3 border rounded-lg flex items-start gap-2 ${
                        c.status === 'PASS'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : c.status === 'FAIL'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      {c.status === 'PASS' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      ) : c.status === 'FAIL' ? (
                        <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <strong>
                          {doc.documentName} — {c.title}
                        </strong>
                        <p className="mt-0.5 leading-relaxed">{c.description}</p>
                        <p className="text-[10px] opacity-75 mt-0.5">Confidence {c.confidence}%</p>
                      </div>
                    </div>
                  ))
                )
              )}

              <div className="p-4 bg-slate-900 text-slate-200 rounded-lg text-[11px] leading-relaxed">
                <strong className="text-amber-400">Recommendation:</strong> {aiSummary.recommendation}
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                These automated findings are advisory. A scrutiny officer verifies every field against the
                original document before any decision is recorded.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={goBack}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (missingMandatoryDocs.length > 0) {
                  notify('Upload the remaining mandatory documents before continuing.', 'error');
                  setStep(5);
                  return;
                }
                if (validateStep(7)) setStep(7);
              }}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg transition flex items-center gap-1.5"
            >
              Statutory Declaration <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 7: Statutory Declaration */}
      {step === 7 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <h3 className="font-bold text-sm text-slate-900">Statutory Consent & Legal Declaration</h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 leading-relaxed space-y-2">
            <p>1. I solemnly affirm that all statements and documents submitted are true to the best of my knowledge.</p>
            <p>2. I understand that any false declaration will result in immediate cancellation of fellowship and legal recovery proceedings under GoI rules.</p>
            <p>
              3. I authorise the Ministry to verify these particulars with the issuing authorities and to
              recover any amount paid in excess of entitlement.
            </p>
          </div>

          <label className="flex items-start gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={declarationAccepted}
              onChange={(e) => setDeclarationAccepted(e.target.checked)}
              className="text-blue-600 w-4 h-4 mt-0.5 shrink-0"
            />
            <span className="font-bold text-slate-900 text-xs">
              I accept the terms of statutory declaration and submit for officer scrutiny.
            </span>
          </label>
          {!declarationAccepted && errors.declaration && (
            <p className="text-[11px] text-rose-700 font-medium">{errors.declaration}</p>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={goBack}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (!declarationAccepted) {
                  setErrors((p) => ({ ...p, declaration: 'You must accept the declaration to continue.' }));
                  notify('Please accept the statutory declaration.', 'error');
                  return;
                }
                setErrors({});
                setStep(8);
              }}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg transition flex items-center gap-1.5"
            >
              Review Application <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 8: Final Review & Submit */}
      {step === 8 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <h3 className="font-bold text-base text-slate-900">Final Review Before Submission</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-bold block text-[10px]">Scheme</span>
              <span className="font-bold text-slate-900">{selectedScheme.title} ({selectedScheme.code})</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px]">Applicant Name</span>
              <span className="font-bold text-slate-900">{personalDetails.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px]">ST Certificate No</span>
              <span className="font-bold text-slate-900">{personalDetails.stCertNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px]">Target Varsity</span>
              <span className="font-bold text-slate-900">{academicDetails.targetInstitution}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px]">Documents Attached</span>
              <span className="font-bold text-slate-900">
                {uploadedDocs.length} of {selectedScheme.requiredDocuments.length}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px]">AI Consistency Score</span>
              <span className="font-bold text-slate-900">{aiSummary.overallScore} / 100</span>
            </div>
          </div>

          {eligibilityOutcome && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                eligibilityOutcome.overallEligible
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              {eligibilityOutcome.overallEligible ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-xs">
                  Eligibility rules check: {eligibilityOutcome.scorePercent}% of{' '}
                  {eligibilityOutcome.ruleResults.length} criteria satisfied
                </h4>
                <p className="mt-1 leading-relaxed">{eligibilityOutcome.summary}</p>
                {!eligibilityOutcome.overallEligible && (
                  <ul className="mt-2 space-y-1">
                    {eligibilityOutcome.ruleResults
                      .filter((r) => !r.passed)
                      .map((r) => (
                        <li key={r.ruleId} className="text-[11px] font-medium">
                          • {r.ruleDescription} — provided {r.actualValue}, required {r.expectedValue}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <p className="text-[10px] text-slate-500 leading-relaxed">
            By submitting you confirm that the declaration accepted in the previous step still applies to the
            particulars shown above.
          </p>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={goBack}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Previous
            </button>
            <button
              onClick={handleSubmitFinal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> Submit Application to MoTA Portal
            </button>
          </div>
        </div>
      )}

      {/* Final Step: Submission Acknowledgement Receipt */}
      {step === LAST_STEP && submittedApp && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6 text-xs animate-fadeIn">
          <div className="bg-emerald-50 border border-emerald-300 p-6 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-2xl font-extrabold text-slate-900">Application Submitted Successfully!</h2>
            <p className="text-slate-600 text-xs">
              Your application has been logged into the Ministry of Tribal Affairs Tribal Govt-Edu system.
            </p>
            <div className="mt-3 inline-block bg-slate-900 text-amber-400 px-4 py-1.5 rounded-full font-mono text-sm font-bold shadow">
              Application No: {submittedApp.applicationNo}
            </div>
          </div>

          {/* Acknowledgement Box */}
          <div className="border border-slate-300 rounded-xl p-6 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-bold text-slate-800 text-sm">Official Acknowledgement Receipt</span>
              <span className="text-[10px] text-slate-500">Date: {new Date(submittedApp.submissionDate).toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 font-bold text-[10px]">Scheme:</p>
                <p className="font-bold text-slate-900">{submittedApp.schemeTitle}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold text-[10px]">Applicant Name:</p>
                <p className="font-bold text-slate-900">{submittedApp.applicantName}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <button
              onClick={() => window.print()}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Download / Print Receipt PDF
            </button>
            <button
              onClick={() => navigate('applicant-dashboard')}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl transition shadow flex items-center gap-2"
            >
              Go to Applicant Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
