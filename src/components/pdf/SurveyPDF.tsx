/**
 * Survey PDF Report — DHS branded, grouped by opening.
 * Uses browser print for PDF generation (lighter than @react-pdf for survey reports).
 */
import type { Job, Opening, Issue, EstimateLineItem } from '../../types';
import { TRIP_CHARGE } from '../../config/laborRates';

export function generateSurveyHTML(
  job: Job,
  openings: Opening[],
  issues: Issue[],
  lineItems: EstimateLineItem[]
): string {
  const issuesByOpening: Record<string, Issue[]> = {};
  for (const issue of issues) {
    (issuesByOpening[issue.openingId] ??= []).push(issue);
  }

  const materialTotal = lineItems.reduce((s, li) => s + li.sellPrice * li.quantity, 0);
  const laborTotal = lineItems.reduce((s, li) => s + li.laborCost, 0);
  const taxRate = 6;
  const taxAmount = Math.round((materialTotal + laborTotal + TRIP_CHARGE) * taxRate) / 100;
  const grandTotal = materialTotal + laborTotal + TRIP_CHARGE + taxAmount;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html><head><title>DHS Field Survey — ${job.customerName}</title>
<style>
  @page { size: letter; margin: 0.5in; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1f2937; line-height: 1.4; }
  .header { background: #0F2B5B; color: white; padding: 16px 20px; margin: -0.5in -0.5in 20px; }
  .header h1 { font-size: 18px; margin-bottom: 2px; }
  .header p { font-size: 10px; opacity: 0.8; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .info-box { background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; }
  .info-box h3 { font-size: 9px; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; letter-spacing: 0.5px; }
  .info-box p { font-size: 11px; }
  .opening { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
  .opening-header { background: #f3f4f6; padding: 8px 12px; font-weight: bold; font-size: 12px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
  .fire-badge { background: #dc2626; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; }
  .issue { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
  .issue:last-child { border-bottom: none; }
  .issue-desc { font-weight: 500; margin-bottom: 4px; }
  .issue-meta { font-size: 9px; color: #6b7280; }
  .issue-photos { display: flex; gap: 4px; margin-top: 6px; }
  .issue-photos img { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb; }
  .totals { background: #0F2B5B; color: white; border-radius: 8px; padding: 16px; margin-top: 16px; }
  .totals-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; }
  .totals-row.grand { font-size: 14px; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px; margin-top: 6px; }
  .footer { margin-top: 20px; font-size: 9px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  @media print { .header { margin: -0.5in -0.5in 20px; } }
</style>
</head><body>
<div class="header">
  <h1>DHS Field Survey Report</h1>
  <p>Doors & Hardware Specialist, Inc. — doorsandhardwarespecialist.com</p>
</div>

<div class="info-grid">
  <div class="info-box"><h3>Customer</h3><p>${job.customerName}</p></div>
  <div class="info-box"><h3>Date</h3><p>${date}</p></div>
  <div class="info-box"><h3>Address</h3><p>${job.address || '—'}</p></div>
  <div class="info-box"><h3>Contact</h3><p>${job.contact || '—'} ${job.phone ? '· ' + job.phone : ''}</p></div>
</div>

<h2 style="font-size:13px;margin-bottom:8px;">Survey Findings (${openings.length} Openings, ${issues.length} Issues)</h2>

${openings.map(opening => {
  const ois = issuesByOpening[opening.id] || [];
  return `<div class="opening">
    <div class="opening-header">
      <span>${opening.label} — ${opening.doorType}${opening.floor ? ', ' + opening.floor : ''}</span>
      ${opening.fireRated ? `<span class="fire-badge">🔥 ${opening.fireRating || 'Fire Rated'}</span>` : ''}
    </div>
    ${ois.length === 0 ? '<div class="issue"><em style="color:#9ca3af">No issues documented</em></div>' : ''}
    ${ois.map(issue => `<div class="issue">
      <div class="issue-desc">${issue.description}</div>
      <div class="issue-meta">
        ${issue.category ? `<strong>${issue.category}</strong> · ` : ''}
        Severity: ${issue.severity} · Action: ${issue.action}
      </div>
      ${issue.photos.length > 0 ? `<div class="issue-photos">${issue.photos.slice(0, 3).map(p => `<img src="${p}" />`).join('')}</div>` : ''}
    </div>`).join('')}
  </div>`;
}).join('')}

<div class="totals">
  <div class="totals-row"><span>Materials</span><span>$${materialTotal.toFixed(2)}</span></div>
  <div class="totals-row"><span>Labor</span><span>$${laborTotal.toFixed(2)}</span></div>
  <div class="totals-row"><span>Trip Charge</span><span>$${TRIP_CHARGE.toFixed(2)}</span></div>
  <div class="totals-row"><span>Tax (${taxRate}%)</span><span>$${taxAmount.toFixed(2)}</span></div>
  <div class="totals-row grand"><span>Grand Total</span><span>$${grandTotal.toFixed(2)}</span></div>
</div>

<div class="footer">
  Generated by DHS Field App · ${date} · Doors & Hardware Specialist, Inc.
</div>
</body></html>`;
}

export function printSurveyPDF(
  job: Job,
  openings: Opening[],
  issues: Issue[],
  lineItems: EstimateLineItem[]
) {
  const html = generateSurveyHTML(job, openings, issues, lineItems);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => win.print();
}
