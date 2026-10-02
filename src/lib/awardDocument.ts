import { AwardDetails } from '../types';
import { formatINR, formatDate } from './format';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Builds a printable HTML document in the browser and hands it to the print
 * dialog, which in turn allows "Save as PDF". Avoids adding a PDF library for a
 * single prototype document.
 */
const printDocument = (title: string, html: string): void => {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) return;
  printWindow.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { margin: 18mm; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #0f172a; font-size: 12px; line-height: 1.6; }
  header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 14px; margin-bottom: 20px; }
  header h1 { font-size: 16px; margin: 0 0 4px; color: #1e3a8a; }
  header p { margin: 2px 0; font-size: 11px; color: #475569; }
  .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 24px; margin-bottom: 18px; }
  .meta div { border-bottom: 1px dotted #cbd5e1; padding-bottom: 4px; }
  .meta span { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: .04em; color: #64748b; }
  .meta strong { font-size: 12px; }
  h2 { font-size: 13px; color: #1e3a8a; margin: 18px 0 8px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; font-size: 11px; }
  th { background: #f1f5f9; font-weight: 600; }
  .note { margin-top: 20px; padding: 10px 12px; background: #f8fafc; border-left: 3px solid #1e3a8a; font-size: 10px; color: #475569; }
  .sign { margin-top: 46px; display: flex; justify-content: space-between; align-items: flex-end; }
  .sign div { border-top: 1px solid #0f172a; padding-top: 5px; font-size: 10px; min-width: 200px; }
  footer { margin-top: 26px; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 9px; color: #64748b; text-align: center; }
  @media print { .no-print { display: none; } }
</style></head><body>${html}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

/** Sanction order issued to a selected fellow. */
export const buildSanctionOrder = (award: AwardDetails, schemeTitle: string, applicantName: string): string => `
  <header>
    <h1>Government of India &mdash; Ministry of Tribal Affairs</h1>
    <p>Education Division, Shastri Bhawan, New Delhi &ndash; 110001</p>
    <p style="font-weight:700; margin-top:6px;">Sanction Order for Tribal Fellowship Award</p>
  </header>

  <div class="meta">
    <div><span>Sanction Letter No</span><strong>${escapeHtml(award.awardLetterNo)}</strong></div>
    <div><span>Date of Issue</span><strong>${escapeHtml(formatDate(award.awardDate))}</strong></div>
    <div><span>Fellow</span><strong>${escapeHtml(applicantName)}</strong></div>
    <div><span>Scheme</span><strong>${escapeHtml(schemeTitle)}</strong></div>
    <div><span>Tenure</span><strong>${award.tenureYears} years</strong></div>
    <div><span>Disbursement Mode</span><strong>DBT / PFMS</strong></div>
  </div>

  <p>
    With reference to your application and the recommendation of the Screening Committee, the Ministry
    is pleased to sanction the fellowship award under the scheme named above for the academic session
    indicated in your application.
  </p>

  <h2>Financial Sanction</h2>
  <table>
    <tr><th>Head</th><th>Amount</th><th>Basis</th></tr>
    <tr><td>Annual sanctioned grant</td><td>${escapeHtml(formatINR(award.sanctionedAmount))}</td><td>Per annum, released in instalments</td></tr>
    <tr><td>Monthly stipend</td><td>${escapeHtml(formatINR(award.stipendMonthly))}</td><td>Credited to Aadhaar-seeded bank account</td></tr>
    <tr><td>Annual contingency</td><td>${escapeHtml(formatINR(award.contingencyYearly))}</td><td>On production of audited utilisation certificate</td></tr>
  </table>

  <h2>Conditions</h2>
  <table>
    <tr><th>#</th><th>Condition</th></tr>
    <tr><td>1</td><td>Regular academic progress reports must be submitted as per the fellowship schedule.</td></tr>
    <tr><td>2</td><td>Attendance below the prescribed threshold, or a change of course, requires prior approval.</td></tr>
    <tr><td>3</td><td>Any change of bank account or address must be intimated to the Ministry within 30 days.</td></tr>
    <tr><td>4</td><td>Founding of any material misrepresentation shall render the award liable to cancellation and recovery.</td></tr>
  </table>

  ${
    award.milestones.length
      ? `<h2>Compliance Milestones</h2>
  <table>
    <tr><th>Milestone</th><th>Due Date</th><th>Status</th></tr>
    ${award.milestones
      .map(
        (m) =>
          `<tr><td>${escapeHtml(m.title)}</td><td>${escapeHtml(formatDate(m.dueDate))}</td><td>${escapeHtml(
            m.status
          )}</td></tr>`
      )
      .join('')}
  </table>`
      : ''
  }

  <div class="note">
    This is a generated prototype document for demonstration purposes. It confers no legal entitlement and
    does not represent an issued Government of India order.
  </div>

  <div class="sign">
    <div>Authorised Signatory<br />Under Secretary, Ministry of Tribal Affairs</div>
    <div>Received by the Fellow<br />${escapeHtml(applicantName)}</div>
  </div>

  <footer>
    Prototype document &middot; Ministry of Tribal Affairs, Government of India &middot; Ref ${escapeHtml(
      award.awardLetterNo
    )}
  </footer>
`;

export const downloadSanctionOrder = (award: AwardDetails, schemeTitle: string, applicantName: string): boolean => {
  printDocument(`Sanction Order ${award.awardLetterNo}`, buildSanctionOrder(award, schemeTitle, applicantName));
  return true;
};
