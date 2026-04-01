import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Flame, Shield, ShieldAlert, ChevronDown, ChevronRight, DollarSign, ArrowRightLeft, Send, FileText } from 'lucide-react';
import * as store from '../store/offlineStore';
import type { Job, Opening, Issue, EstimateLineItem } from '../types';
import { classifyIssue } from '../engine/issueClassifier';
import { matchIssueToProduct, estimateLabor } from '../engine/partMatcher';
import { validateFireCode, type FireCodeConfig } from '../engine/fireCodeRules';
import { formatSalesDesc } from '../engine/salesDescGen';
import { applyMarkup, getMarkup } from '../config/markups';
import { CREW_RATE, TRIP_CHARGE } from '../config/laborRates';
import { useAuth } from '../hooks/useAuth';

function buildLineItems(issues: Issue[], openings: Opening[]): EstimateLineItem[] {
  const openingMap = new Map(openings.map(o => [o.id, o]));
  const items: EstimateLineItem[] = [];

  for (const issue of issues) {
    const opening = openingMap.get(issue.openingId);
    const classification = issue.category ? { category: issue.category, confidence: issue.classificationConfidence ?? 0.8 } : classifyIssue(issue.description);
    const match = matchIssueToProduct(classification.category, {
      fireRated: opening?.fireRated,
    });

    if (!match) continue;

    const laborHrs = estimateLabor(match.product, issue.action);
    const desc = formatSalesDesc(match.product.desc, { finish: '626' });
    const mk = getMarkup(match.product.cat);

    items.push({
      id: crypto.randomUUID(),
      issueId: issue.id,
      openingLabel: opening?.label ?? 'Unknown',
      description: desc,
      partNumber: match.product.id,
      category: match.product.cat,
      quantity: 1,
      unitCost: match.product.cost,
      markupPct: mk,
      sellPrice: match.sellPrice,
      laborHours: laborHrs,
      laborCost: laborHrs * CREW_RATE,
      lineTotal: match.sellPrice + laborHrs * CREW_RATE,
      veAlternatives: match.veAlternatives,
      fireCodeRequired: opening?.fireRated,
    });
  }

  return items;
}

export function EstimatePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isEstimator } = useAuth();
  const jobId = params.get('jobId');

  const [job, setJob] = useState<Job | null>(null);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([]);
  const [expandedOpening, setExpandedOpening] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      const j = await store.getJob(jobId);
      setJob(j ?? null);
      const ops = await store.getOpeningsForJob(jobId);
      setOpenings(ops);
      const iss = await store.getIssuesForJob(jobId);
      setIssues(iss);
    })();
  }, [jobId]);

  useEffect(() => {
    if (issues.length && openings.length) {
      setLineItems(buildLineItems(issues, openings));
    }
  }, [issues, openings]);

  // Fire code validation
  const fireCodeResults = useMemo(() => {
    const results: Record<string, ReturnType<typeof validateFireCode>> = {};
    for (const opening of openings) {
      if (opening.fireRated) {
        const openingItems = lineItems.filter(li => li.openingLabel === opening.label);
        const config: FireCodeConfig = {
          fireRated: true,
          fireRating: opening.fireRating,
          isPair: opening.doorType === 'pair',
          doors: opening.doorType === 'pair' ? 2 : 1,
        };
        results[opening.id] = validateFireCode(openingItems.map(li => ({ name: li.partNumber, cat: li.category, qty: li.quantity })), config);
      }
    }
    return results;
  }, [openings, lineItems]);

  // Totals
  const materialTotal = lineItems.reduce((s, li) => s + li.sellPrice * li.quantity, 0);
  const laborTotal = lineItems.reduce((s, li) => s + li.laborCost, 0);
  const taxRate = 6;
  const taxAmount = Math.round((materialTotal + laborTotal + TRIP_CHARGE) * taxRate) / 100;
  const grandTotal = materialTotal + laborTotal + TRIP_CHARGE + taxAmount;

  // Group by opening
  const groupedByOpening = useMemo(() => {
    const groups: Record<string, EstimateLineItem[]> = {};
    for (const li of lineItems) {
      (groups[li.openingLabel] ??= []).push(li);
    }
    return groups;
  }, [lineItems]);

  if (!jobId) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
        <Calculator size={40} className="text-gray-600 mb-3" />
        <p className="text-sm text-gray-400">Select a job to review estimate</p>
        <button onClick={() => navigate('/jobs')} className="mt-3 text-xs text-blue-400 underline">Go to Jobs</button>
      </div>
    );
  }

  const handleSubmitToSF = async () => {
    if (!isEstimator) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/ec2/submit-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: job?.customerId || job?.customerName,
          description: `Field Survey Estimate — ${job?.customerName}\n${job?.address}`,
          products: lineItems.map(li => ({
            product: 'Custom Part',
            name: li.partNumber,
            description: li.description,
            multiplier: li.quantity,
            rate: li.sellPrice,
            cost: li.unitCost,
          })),
          services: [
            { service: 'Furnish and Install', name: 'Furnish and Install', multiplier: 1, rate: 0 },
            { service: 'Furnish and Install', name: 'Service Labor - 2 Man Truck',
              description: `Installation Labor Included. 2-Man Service Truck at $125/Per-Man, Per Hour.`,
              multiplier: lineItems.reduce((s, li) => s + li.laborHours, 0),
              rate: CREW_RATE },
            { service: 'Align and Adjust', name: 'Align and Adjust', description: 'Align and Adjust Door, Closer and Hardware For Proper Operation.', multiplier: 1, rate: 0 },
            { service: 'Furnish and Install', name: 'Trip Charge', multiplier: 1, rate: TRIP_CHARGE },
          ],
          other_charges: [{ other_charge: 'DC Sales Tax', rate: taxRate, is_percentage: true }],
        }),
      });
      if (res.ok) {
        alert('Estimate submitted to Service Fusion!');
        if (job) {
          await store.saveJob({ ...job, status: 'estimate_submitted' });
        }
      } else {
        alert('Failed to submit. Check connection.');
      }
    } catch {
      alert('Network error. Estimate saved locally.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#1a1d24] px-4 py-3 border-b border-gray-700/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-gray-400"><ArrowLeft size={16} /></button>
          <h2 className="text-sm font-bold text-white">Estimate Review</h2>
        </div>
        <p className="text-[11px] text-gray-500 ml-6 mt-0.5">{job?.customerName} — {lineItems.length} line items</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Grand totals card */}
        <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1a3a6b] rounded-xl p-4 mb-4 border border-blue-800/30">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-[10px] text-blue-300/70">Materials</div>
              <div className="text-lg font-bold text-white">${materialTotal.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-blue-300/70">Labor</div>
              <div className="text-lg font-bold text-white">${laborTotal.toFixed(2)}</div>
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-blue-200/60 border-t border-blue-700/30 pt-2">
            <span>Trip Charge</span><span>${TRIP_CHARGE.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-blue-200/60">
            <span>Tax ({taxRate}%)</span><span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-white border-t border-blue-700/30 pt-2 mt-2">
            <span>Grand Total</span><span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Line items grouped by opening */}
        {Object.entries(groupedByOpening).map(([openingLabel, items]) => {
          const opening = openings.find(o => o.label === openingLabel);
          const fcResult = opening ? fireCodeResults[opening.id] : null;
          const isExpanded = expandedOpening === openingLabel;

          return (
            <div key={openingLabel} className="mb-3">
              <button onClick={() => setExpandedOpening(isExpanded ? null : openingLabel)}
                className="w-full bg-[#1a1d24] rounded-xl p-3 border border-gray-700/30 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{openingLabel}</span>
                    {opening?.fireRated && <Flame size={12} className="text-red-400" />}
                    {fcResult && !fcResult.compliant && <ShieldAlert size={12} className="text-red-400" />}
                    {fcResult?.compliant && <Shield size={12} className="text-green-400" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-400">
                      ${items.reduce((s, li) => s + li.lineTotal, 0).toFixed(2)}
                    </span>
                    {isExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="ml-3 mt-2 flex flex-col gap-2">
                  {/* Fire code violations */}
                  {fcResult?.violations.map((v, i) => (
                    <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-[10px] text-red-400">
                      <span className="font-bold">{v.code}:</span> {v.issue}
                    </div>
                  ))}
                  {fcResult?.warnings.map((w, i) => (
                    <div key={i} className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-[10px] text-amber-400">
                      <span className="font-bold">{w.code}:</span> {w.issue}
                    </div>
                  ))}

                  {/* Line items */}
                  {items.map(li => (
                    <div key={li.id} className="bg-[#22252d] rounded-lg p-3 border border-gray-700/20">
                      <div className="text-xs font-medium text-white mb-1">{li.description.slice(0, 80)}...</div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">{li.category}</span>
                        <div className="flex gap-3">
                          <span className="text-gray-400">Mat: ${li.sellPrice.toFixed(2)}</span>
                          <span className="text-gray-400">Lab: ${li.laborCost.toFixed(2)}</span>
                          <span className="text-green-400 font-bold">${li.lineTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      {li.veAlternatives && li.veAlternatives.length > 0 && (
                        <div className="mt-1.5 pt-1.5 border-t border-gray-700/20 flex items-center gap-1">
                          <ArrowRightLeft size={9} className="text-amber-400" />
                          <span className="text-[9px] text-amber-400">
                            VE: {li.veAlternatives[0].brand} (${li.veAlternatives[0].sellPrice.toFixed(2)})
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {lineItems.length === 0 && (
          <div className="text-center py-12">
            <Calculator size={32} className="text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No issues documented yet</p>
            <p className="text-xs text-gray-600 mt-1">Complete a survey to generate an estimate</p>
          </div>
        )}
      </div>

      {/* Action bar */}
      {lineItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-[#1a1d24] border-t border-gray-700/30 px-4 py-3 flex gap-2 z-40">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#0E1117] border border-gray-600 rounded-lg text-xs text-gray-300">
            <FileText size={14} /> Generate PDF
          </button>
          {isEstimator ? (
            <button onClick={handleSubmitToSF} disabled={submitting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs text-white font-semibold disabled:opacity-50">
              <Send size={14} /> {submitting ? 'Submitting...' : 'Submit to SF'}
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center py-2.5 bg-amber-600/20 rounded-lg text-xs text-amber-400">
              Pending Estimator Review
            </div>
          )}
        </div>
      )}
    </div>
  );
}
