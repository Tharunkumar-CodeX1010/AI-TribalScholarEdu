import { AppDocument, OCRFieldExtraction, AICheckResult, Application } from '../types';

export interface IDocumentAIService {
  processDocument(file: File | { name: string; size: number }, docConfigId: string, appData?: any): Promise<{
    ocrData: OCRFieldExtraction[];
    aiChecks: AICheckResult[];
    overallConfidence: number;
    verificationStatus: 'PENDING' | 'AI_PASSED' | 'AI_FLAGGED';
  }>;
  
  detectConsistency(appData: any, docs: AppDocument[]): {
    overallStatus: 'PASS' | 'WARNING' | 'FAIL';
    overallScore: number;
    passedCount: number;
    flaggedCount: number; 
    summary: string;
    recommendation: string;
  };
}

export class MockDocumentAIService implements IDocumentAIService {
  async processDocument(file: File | { name: string; size: number }, docConfigId: string, appData?: any) {
    // Simulate short processing delay
    await new Promise((res) => setTimeout(res, 1200));

    const fileName = file.name.toLowerCase();

    if (docConfigId === 'doc-st-cert' || fileName.includes('st') || fileName.includes('caste')) {
      const appName = appData?.personalDetails?.fullName || 'Chandra Hass Topno';
      const appCertNo = appData?.personalDetails?.stCertNumber || 'ST/JH/RNC/2023/88921';
      
      const ocrData: OCRFieldExtraction[] = [
        { fieldKey: 'fullName', label: 'Name on Certificate', extractedValue: appName, confidence: 97, matchedWithApp: true, appValue: appName },
        { fieldKey: 'stCertNo', label: 'Certificate Number', extractedValue: appCertNo, confidence: 96, matchedWithApp: true, appValue: appCertNo },
        { fieldKey: 'issuingAuthority', label: 'Issuing Officer', extractedValue: 'Sub-Divisional Magistrate / SDO', confidence: 94, matchedWithApp: true, appValue: 'SDO Ranchi' },
        { fieldKey: 'tribe', label: 'Community / Tribe', extractedValue: appData?.personalDetails?.tribeName || 'Munda', confidence: 95, matchedWithApp: true, appValue: appData?.personalDetails?.tribeName || 'Munda' }
      ];

      const aiChecks: AICheckResult[] = [
        { checkId: 'chk-st-1', title: 'State Tribal Registry Lookup', status: 'PASS', description: 'Matched with State Tribal Welfare Repository database', confidence: 98 },
        { checkId: 'chk-st-2', title: 'Digital Signature & Stamp', status: 'PASS', description: 'Valid Public Key Infrastructure (PKI) digital signature verified', confidence: 99 },
        { checkId: 'chk-st-3', title: 'Text Tampering Detection', status: 'PASS', description: 'No image alteration or font inconsistency detected', confidence: 95 }
      ];

      return {
        ocrData,
        aiChecks,
        overallConfidence: 96,
        verificationStatus: 'AI_PASSED' as const
      };
    }

    if (docConfigId === 'doc-inc-cert' || fileName.includes('income')) {
      const declaredIncome = appData?.personalDetails?.annualFamilyIncome || 240000;
      
      const ocrData: OCRFieldExtraction[] = [
        { fieldKey: 'fullName', label: 'Name on Income Certificate', extractedValue: appData?.personalDetails?.fullName || 'Chandra Hass Topno', confidence: 91, matchedWithApp: true, appValue: appData?.personalDetails?.fullName },
        { fieldKey: 'incomeAmount', label: 'Extracted Annual Income', extractedValue: `₹${declaredIncome.toLocaleString('en-IN')}`, confidence: 93, matchedWithApp: true, appValue: `₹${declaredIncome.toLocaleString('en-IN')}` },
        { fieldKey: 'finYear', label: 'Financial Year Validity', extractedValue: '2025-2026', confidence: 90, matchedWithApp: true, appValue: '2025-2026' }
      ];

      const aiChecks: AICheckResult[] = [
        { checkId: 'chk-inc-1', title: 'Income Cap Verification', status: 'PASS', description: 'Extracted income is within maximum eligibility ceiling', confidence: 94 },
        { checkId: 'chk-inc-2', title: 'Issuing Authority Verification', status: 'PASS', description: 'Issued by competent Revenue Authority (Tehsildar)', confidence: 92 }
      ];

      return {
        ocrData,
        aiChecks,
        overallConfidence: 92,
        verificationStatus: 'AI_PASSED' as const
      };
    }

    // Default document processing fallback
    const ocrData: OCRFieldExtraction[] = [
      { fieldKey: 'documentTitle', label: 'Document Title', extractedValue: file.name.replace(/\.[^/.]+$/, ""), confidence: 90, matchedWithApp: true },
      { fieldKey: 'issueDate', label: 'Detected Date', extractedValue: '15/06/2024', confidence: 88, matchedWithApp: true }
    ];

    const aiChecks: AICheckResult[] = [
      { checkId: 'chk-gen-1', title: 'Legibility & Resolution', status: 'PASS', description: 'Document text resolution exceeds 300 DPI threshold', confidence: 95 },
      { checkId: 'chk-gen-2', title: 'Format & Integrity', status: 'PASS', description: 'Standard unencrypted PDF structure verified', confidence: 98 }
    ];

    return {
      ocrData,
      aiChecks,
      overallConfidence: 91,
      verificationStatus: 'AI_PASSED' as const
    };
  }

  detectConsistency(appData: Partial<Application>, docs: AppDocument[]) {
    let passedCount = 0;
    let flaggedCount = 0;
    const notes: string[] = [];

    docs.forEach((doc) => {
      doc.aiChecks.forEach((chk) => {
        if (chk.status === 'PASS') passedCount++;
        if (chk.status === 'WARNING' || chk.status === 'FAIL') {
          flaggedCount++;
          notes.push(`${doc.documentName}: ${chk.title} - ${chk.description}`);
        }
      });
    });

    if (flaggedCount === 0) {
      return {
        overallStatus: 'PASS' as const,
        overallScore: 97,
        passedCount,
        flaggedCount: 0,
        summary: 'All uploaded credentials match application form data with high confidence (>90%). No discrepancies found.',
        recommendation: 'Application is verified and eligible for officer approval.'
      };
    }

    return {
      overallStatus: 'WARNING' as const,
      overallScore: Math.max(60, 95 - flaggedCount * 12),
      passedCount,
      flaggedCount,
      summary: `Automated AI audit detected ${flaggedCount} potential issue(s): ${notes.join('; ')}`,
      recommendation: 'Scrutiny Officer should review flagged document fields or issue a Deficiency Request.'
    };
  }
}

export const documentAIService = new MockDocumentAIService();
