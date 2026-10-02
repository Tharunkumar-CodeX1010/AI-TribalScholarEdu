import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Scheme, Application, AuditRecord, AppNotification, Deficiency, AppDocument, ScreeningReview, UserRole } from '../types';
import { MOCK_SCHEMES, INITIAL_APPLICATIONS, INITIAL_AUDIT_LOGS, INITIAL_NOTIFICATIONS } from '../mock/initialData';

type Actor = { id: string; name: string; role: UserRole };

interface DataContextType {
  schemes: Scheme[];
  applications: Application[];
  auditLogs: AuditRecord[];
  notifications: AppNotification[];
  addApplication: (app: Application) => void;
  updateApplicationStatus: (appId: string, newStage: Application['stage'], remarks: string, user: Actor) => void;
  assignApplication: (appId: string, officerId: string, officerName: string, user: Actor) => void;
  raiseDeficiency: (
    appId: string,
    documentId: string | undefined,
    title: string,
    description: string,
    category: Deficiency['category'],
    deadlineDate: string,
    user: { id: string; name: string }
  ) => void;
  resubmitDeficiency: (
    appId: string,
    deficiencyId: string,
    responseNotes: string,
    newDocFile?: { name: string; size: string }
  ) => void;
  resolveDeficiency: (appId: string, deficiencyId: string, user: { id: string; name: string }) => void;
  recordScreeningReview: (appId: string, review: ScreeningReview) => void;
  recordAwardSelection: (appId: string, sanctionedAmount: number, user: { id: string; name: string }) => void;
  updateDocumentOcrField: (
    appId: string,
    docId: string,
    fieldKey: string,
    newValue: string,
    action: 'ACCEPTED' | 'EDITED' | 'REJECTED',
    user?: Actor
  ) => void;
  addScheme: (scheme: Scheme) => void;
  updateScheme: (scheme: Scheme, user?: Actor) => void;
  markNotificationAsRead: (id: string) => void;
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  schemes: 'mota_schemes',
  applications: 'mota_applications',
  auditLogs: 'mota_audit_logs',
  notifications: 'mota_notifications'
} as const;

function loadPersisted<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — prototype keeps running in-memory */
  }
}

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${++idCounter}`;

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schemes, setSchemes] = useState<Scheme[]>(() => loadPersisted(STORAGE_KEYS.schemes, MOCK_SCHEMES));
  const [applications, setApplications] = useState<Application[]>(() =>
    loadPersisted(STORAGE_KEYS.applications, INITIAL_APPLICATIONS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() =>
    loadPersisted(STORAGE_KEYS.auditLogs, INITIAL_AUDIT_LOGS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadPersisted(STORAGE_KEYS.notifications, INITIAL_NOTIFICATIONS)
  );

  /* Application state doubles as the record for officers, notifications and
     audit entries, so every write is also mirrored into the audit trail. */
  const applicationsRef = useRef(applications);
  const next = useCallback(
    (updater: (prev: Application[]) => Application[]) => {
      const result = updater(applicationsRef.current);
      applicationsRef.current = result;
      setApplications(result);
    },
    []
  );

  const addAuditLog = useCallback(
    (
      user: Actor,
      action: string,
      appId?: string,
      appNo?: string,
      prevStatus?: string,
      newStatus?: string,
      remarks?: string
    ) => {
      setAuditLogs((prev) => [
        {
          id: nextId('aud'),
          timestamp: new Date().toISOString(),
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action,
          applicationId: appId,
          applicationNo: appNo,
          previousStatus: prevStatus,
          newStatus,
          remarks: remarks || `${action} performed on application ${appNo || appId || '—'}`,
          ipAddress: '10.240.14.88 (Government Secure Gateway)'
        },
        ...prev
      ]);
    },
    []
  );

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications((prev) => [
      { ...notif, id: nextId('notif'), timestamp: new Date().toISOString(), read: false },
      ...prev
    ]);
  }, []);

  const addApplication = useCallback(
    (app: Application) => {
      next((prev) => [app, ...prev]);
      addAuditLog(
        { id: app.applicantId, name: app.applicantName, role: 'APPLICANT' },
        'APPLICATION_SUBMITTED',
        app.id,
        app.applicationNo,
        'DRAFT',
        app.stage,
        `Application ${app.applicationNo} submitted for ${app.schemeCode}`
      );
      addNotification({
        userId: app.applicantId,
        title: 'Application submitted successfully',
        message: `Your application (${app.applicationNo}) for ${app.schemeTitle} has been received by the Ministry.`,
        category: 'APPLICATION',
        applicationId: app.id
      });
    },
    [next, addAuditLog, addNotification]
  );

  const updateApplicationStatus = useCallback(
    (appId: string, newStage: Application['stage'], remarks: string, user: Actor) => {
      const app = applicationsRef.current.find((a) => a.id === appId);
      if (!app) return;

      next((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, stage: newStage, lastUpdated: new Date().toISOString() } : a
        )
      );
      addAuditLog(user, `STATUS_CHANGED_TO_${newStage}`, appId, app.applicationNo, app.stage, newStage, remarks);
      addNotification({
        userId: app.applicantId,
        title: `Application status updated: ${newStage.replace(/_/g, ' ').toLowerCase()}`,
        message: `Status of ${app.applicationNo} has been updated. Officer remarks: ${remarks}`,
        category: 'APPLICATION',
        applicationId: appId
      });
    },
    [next, addAuditLog, addNotification]
  );

  const assignApplication = useCallback(
    (appId: string, officerId: string, officerName: string, user: Actor) => {
      const app = applicationsRef.current.find((a) => a.id === appId);
      if (!app) return;
      next((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                assignedOfficerId: officerId,
                assignedOfficerName: officerName,
                lastUpdated: new Date().toISOString()
              }
            : a
        )
      );
      addAuditLog(user, 'APPLICATION_ASSIGNED', appId, app.applicationNo, app.assignedOfficerName, officerName, `File assigned to ${officerName}.`);
    },
    [next, addAuditLog]
  );

  const raiseDeficiency = useCallback(
    (
      appId: string,
      documentId: string | undefined,
      title: string,
      description: string,
      category: Deficiency['category'],
      deadlineDate: string,
      user: { id: string; name: string }
    ) => {
      const app = applicationsRef.current.find((a) => a.id === appId);
      if (!app) return;

      const deficiency: Deficiency = {
        id: nextId('def'),
        applicationId: appId,
        documentId,
        category,
        title,
        description,
        raisedBy: user.id,
        raisedByName: user.name,
        raisedDate: new Date().toISOString(),
        deadlineDate,
        status: 'OPEN'
      };

      next((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                stage: 'DEFICIENCY_RAISED' as const,
                documents: a.documents.map((d) =>
                  d.id === documentId ? { ...d, verificationStatus: 'DEFICIENT' as const } : d
                ),
                deficiencies: [...a.deficiencies, deficiency],
                lastUpdated: new Date().toISOString()
              }
            : a
        )
      );

      addAuditLog(
        { ...user, role: 'SCRUTINY_OFFICER' },
        'DEFICIENCY_RAISED',
        appId,
        app.applicationNo,
        app.stage,
        'DEFICIENCY_RAISED',
        `Deficiency raised: ${title}`
      );
      addNotification({
        userId: app.applicantId,
        title: 'Deficiency notice raised',
        message: `A deficiency has been raised on ${app.applicationNo}: "${title}". Please respond by ${new Date(deadlineDate).toLocaleDateString('en-IN')}.`,
        category: 'DEFICIENCY',
        applicationId: appId
      });
    },
    [next, addAuditLog, addNotification]
  );

  const resubmitDeficiency = useCallback(
    (appId: string, deficiencyId: string, responseNotes: string, newDocFile?: { name: string; size: string }) => {
      const app = applicationsRef.current.find((a) => a.id === appId);
      if (!app) return;

      const newDocId = newDocFile ? nextId('doc-resub') : '';
      const deficiencyDocId = app.deficiencies.find((x) => x.id === deficiencyId)?.documentId;
      const documentConfigId = app.documents.find((d) => d.id === deficiencyDocId)?.documentConfigId;
      const newDoc: AppDocument | null = newDocFile
        ? {
            id: newDocId,
            applicationId: appId,
            documentConfigId: documentConfigId ?? 'doc-corrected',
            documentName: 'Resubmitted Corrected Document',
            fileName: newDocFile.name,
            fileSize: newDocFile.size,
            uploadDate: new Date().toISOString().split('T')[0],
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            mimeType: 'application/pdf',
            verificationStatus: 'PENDING',
            overallAiConfidence: 94,
            ocrData: [
              {
                fieldKey: 'resubmittedName',
                label: 'Extracted full name',
                extractedValue: app.personalDetails.fullName,
                confidence: 98,
                matchedWithApp: true,
                appValue: app.personalDetails.fullName
              }
            ],
            aiChecks: [
              {
                checkId: 'chk-resub-1',
                title: 'Correction verification',
                status: 'PASS',
                description: 'Updated document validity and signature confirmed',
                confidence: 96
              }
            ]
          }
        : null;

      next((prev) =>
        prev.map((a) => {
          if (a.id !== appId) return a;
          const updatedDefs = a.deficiencies.map((def) =>
            def.id === deficiencyId
              ? {
                  ...def,
                  status: 'RESUBMITTED' as const,
                  applicantResponseNotes: responseNotes,
                  resubmittedDocId: newDocId || undefined,
                  resubmittedDate: new Date().toISOString()
                }
              : def
          );
          return {
            ...a,
            stage: 'RESUBMITTED' as const,
            documents: newDoc ? [...a.documents, newDoc] : a.documents,
            deficiencies: updatedDefs,
            lastUpdated: new Date().toISOString()
          };
        })
      );

      addAuditLog(
        { id: app.applicantId, name: app.applicantName, role: 'APPLICANT' },
        'DEFICIENCY_RESUBMITTED',
        appId,
        app.applicationNo,
        'DEFICIENCY_RAISED',
        'RESUBMITTED',
        newDoc ? 'Applicant uploaded a corrected document with explanation.' : 'Applicant submitted clarification.'
      );
      addNotification({
        userId: 'ALL',
        userRole: 'SCRUTINY_OFFICER',
        title: 'Deficiency response received',
        message: `${app.applicantName} has responded to the deficiency on ${app.applicationNo}. Pending officer review.`,
        category: 'DEFICIENCY',
        applicationId: appId
      });
    },
    [next, addAuditLog, addNotification]
  );

  const resolveDeficiency = useCallback(
    (appId: string, deficiencyId: string, user: { id: string; name: string }) => {
      const app = applicationsRef.current.find((a) => a.id === appId);
      if (!app) return;

      const updatedDefs = app.deficiencies.map((def) =>
        def.id === deficiencyId
          ? { ...def, status: 'RESOLVED' as const, resolvedDate: new Date().toISOString(), resolvedBy: user.name }
          : def
      );
      const stillOpen = updatedDefs.some((d) => d.status === 'OPEN' || d.status === 'RESUBMITTED');
      const nextStage = stillOpen ? app.stage : ('ELIGIBLE' as const);

      next((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, stage: nextStage, deficiencies: updatedDefs, lastUpdated: new Date().toISOString() }
            : a
        )
      );

      addAuditLog(
        { ...user, role: 'SCRUTINY_OFFICER' },
        'DEFICIENCY_RESOLVED',
        appId,
        app.applicationNo,
        app.stage,
        nextStage,
        `Officer ${user.name} accepted the applicant's response and closed deficiency ${deficiencyId}.`
      );
      addNotification({
        userId: app.applicantId,
        title: 'Deficiency resolved',
        message: `Your response to "${app.deficiencies.find((d) => d.id === deficiencyId)?.title ?? 'deficiency'}" on ${app.applicationNo} has been accepted.`,
        category: 'DEFICIENCY',
        applicationId: appId
      });
    },
    [next, addAuditLog, addNotification]
  );

  const recordScreeningReview = useCallback(
    (appId: string, review: ScreeningReview) => {
      const app = applicationsRef.current.find((a) => a.id === appId);
      if (!app) return;

      /* A recommendation does not sanction an award. The file moves to the
         Administrator, who holds final sanction authority in the scheme workflow. */
      const nextStage =
        review.decision === 'RECOMMENDED'
          ? ('ELIGIBLE' as const)
          : review.decision === 'WAITLISTED'
          ? ('UNDER_SCREENING' as const)
          : ('REJECTED' as const);

      next((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, stage: nextStage, screeningReview: review, lastUpdated: new Date().toISOString() }
            : a
        )
      );

      addAuditLog(
        { id: review.reviewerId, name: review.reviewerName, role: 'SCREENING_COMMITTEE' },
        'SCREENING_DECISION_RECORDED',
        appId,
        app.applicationNo,
        app.stage,
        nextStage,
        `Committee score ${review.totalScore}/30. Decision: ${review.decision}.`
      );
      addNotification({
        userId: app.applicantId,
        title: 'Screening committee decision recorded',
        message:
          review.decision === 'RECOMMENDED'
            ? `Your application ${app.applicationNo} has been recommended by the Screening Committee and forwarded for award sanction.`
            : `Screening decision for ${app.applicationNo}: ${review.decision.replace(/_/g, ' ').toLowerCase()}.`,
        category: 'SELECTION',
        applicationId: appId
      });
    },
    [next, addAuditLog, addNotification]
  );

  const recordAwardSelection = useCallback(
    (appId: string, sanctionedAmount: number, user: { id: string; name: string }) => {
      const app = applicationsRef.current.find((a) => a.id === appId);
      if (!app) return;

      next((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                stage: 'SELECTED' as const,
                awardDetails: {
                  awardLetterNo: `MoTA/${a.schemeCode}/2026/AW-${String(Math.floor(1000 + Math.random() * 9000))}`,
                  awardDate: new Date().toISOString().split('T')[0],
                  sanctionedAmount,
                  stipendMonthly: Math.round(sanctionedAmount / 12),
                  contingencyYearly: 25000,
                  tenureYears: 3,
                  disbursementStatus: 'SCHEDULED' as const,
                  milestones: [
                    {
                      title: 'Joining report & university enrollment',
                      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
                      status: 'PENDING' as const
                    },
                    {
                      title: 'Semester 1 progress report & attendance',
                      dueDate: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
                      status: 'PENDING' as const
                    }
                  ],
                  payments: [
                    {
                      installmentNo: 1,
                      amount: Math.round(sanctionedAmount / 4),
                      referenceNo: `DBT/MOTA/2026/${Math.floor(100000 + Math.random() * 900000)}`,
                      date: new Date().toISOString().split('T')[0],
                      status: 'PROCESSING' as const
                    }
                  ]
                },
                lastUpdated: new Date().toISOString()
              }
            : a
        )
      );

      addAuditLog(
        { ...user, role: 'ADMINISTRATOR' },
        'SELECTION_APPROVED',
        appId,
        app.applicationNo,
        app.stage,
        'SELECTED',
        `Sanction order generated. Annual grant ₹${sanctionedAmount.toLocaleString('en-IN')}.`
      );
      addNotification({
        userId: app.applicantId,
        title: 'Selection & award letter released',
        message: `Congratulations! ${app.applicationNo} has been selected and a fellowship award of ₹${sanctionedAmount.toLocaleString('en-IN')} has been sanctioned.`,
        category: 'SELECTION',
        applicationId: appId
      });
    },
    [next, addAuditLog, addNotification]
  );

  const updateDocumentOcrField = useCallback(
    (
      appId: string,
      docId: string,
      fieldKey: string,
      newValue: string,
      action: 'ACCEPTED' | 'EDITED' | 'REJECTED',
      user?: Actor
    ) => {
      const app = applicationsRef.current.find((a) => a.id === appId);
      if (!app) return;

      next((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                documents: a.documents.map((doc) =>
                  doc.id === docId
                    ? {
                        ...doc,
                        ocrData: doc.ocrData.map((f) =>
                          f.fieldKey === fieldKey
                            ? {
                                ...f,
                                officerStatus: action,
                                officerCorrectedValue:
                                  action === 'EDITED' ? newValue : f.officerCorrectedValue ?? f.extractedValue,
                                matchedWithApp:
                                  action === 'ACCEPTED'
                                    ? true
                                    : action === 'REJECTED'
                                    ? false
                                    : newValue.trim().toLowerCase() ===
                                      (f.appValue ?? '').trim().toLowerCase()
                              }
                            : f
                        )
                      }
                    : doc
                ),
                lastUpdated: new Date().toISOString()
              }
            : a
        )
      );

      if (user) {
        addAuditLog(user, `OCR_FIELD_${action}`, appId, app.applicationNo, undefined, undefined, `Officer ${user.name} marked OCR field "${fieldKey}" as ${action.toLowerCase()}.`);
      }
    },
    [next, addAuditLog]
  );

  const addScheme = useCallback((scheme: Scheme) => setSchemes((prev) => [...prev, scheme]), []);

  const updateScheme = useCallback(
    (scheme: Scheme, user?: Actor) => {
      setSchemes((prev) => prev.map((s) => (s.id === scheme.id ? scheme : s)));
      if (user) {
        addAuditLog(user, 'SCHEME_CONFIG_UPDATED', undefined, scheme.code, undefined, undefined, `Scheme ${scheme.code} parameters updated.`);
      }
    },
    [addAuditLog]
  );

  const markNotificationAsRead = useCallback(
    (id: string) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    []
  );

  const resetDemoData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    });
    applicationsRef.current = INITIAL_APPLICATIONS;
    setSchemes(MOCK_SCHEMES);
    setApplications(INITIAL_APPLICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
  }, []);

  /* Persist to localStorage so the demo survives a page refresh. */
  useEffect(() => persist(STORAGE_KEYS.schemes, schemes), [schemes]);
  useEffect(() => persist(STORAGE_KEYS.applications, applications), [applications]);
  useEffect(() => persist(STORAGE_KEYS.auditLogs, auditLogs), [auditLogs]);
  useEffect(() => persist(STORAGE_KEYS.notifications, notifications), [notifications]);

  const value = useMemo<DataContextType>(
    () => ({
      schemes,
      applications,
      auditLogs,
      notifications,
      addApplication,
      updateApplicationStatus,
      assignApplication,
      raiseDeficiency,
      resubmitDeficiency,
      resolveDeficiency,
      recordScreeningReview,
      recordAwardSelection,
      updateDocumentOcrField,
      addScheme,
      updateScheme,
      markNotificationAsRead,
      resetDemoData
    }),
    [
      schemes,
      applications,
      auditLogs,
      notifications,
      addApplication,
      updateApplicationStatus,
      assignApplication,
      raiseDeficiency,
      resubmitDeficiency,
      resolveDeficiency,
      recordScreeningReview,
      recordAwardSelection,
      updateDocumentOcrField,
      addScheme,
      updateScheme,
      markNotificationAsRead,
      resetDemoData
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
