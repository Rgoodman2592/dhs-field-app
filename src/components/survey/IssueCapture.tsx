import { useState, useMemo } from 'react';
import { X, Camera, ImagePlus, Trash2, AlertCircle, DollarSign, ArrowRightLeft, ChevronDown, Loader2, ShoppingCart, ExternalLink } from 'lucide-react';
import type { Issue } from '../../types';
import { useCamera } from '../../hooks/useCamera';
import { matchIssueToProduct, estimateLabor } from '../../engine/partMatcher';
import { CREW_RATE } from '../../config/laborRates';
import { HARDWARE_TYPES, getManufacturersForType, hardwareTypeToCategory } from '../../hooks/useBrandCatalog';
import { useVendorSearch, type VendorMatch } from '../../hooks/useVendorSearch';

interface Props {
  jobId: string;
  openingId: string;
  onClose: () => void;
  onSave: (issue: Issue) => void;
}

const QUICK_DESCRIPTIONS = [
  'Not functioning — needs replacement',
  'Damaged / broken — needs replacement',
  'Leaking oil / not closing properly',
  'Worn / sagging',
  'Not latching',
  'Rusted / corroded',
  'ADA non-compliant',
  'Missing',
  'Adjustment needed',
];

export function IssueCapture({ jobId, openingId, onClose, onSave }: Props) {
  // Hardware identification
  const [hardwareType, setHardwareType] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [partNumber, setPartNumber] = useState('');

  // Issue details
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Issue['severity']>('standard');
  const [action, setAction] = useState<Issue['action']>('replace');

  // Photos
  const { photos, capturePhoto, selectFromGallery, removePhoto, capturing } = useCamera();
  const hasPhoto = photos.length > 0;

  // Selected vendor match
  const [selectedVendorMatch, setSelectedVendorMatch] = useState<VendorMatch | null>(null);

  // Get manufacturers for selected hardware type
  const manufacturers = useMemo(() => {
    if (!hardwareType) return [];
    return getManufacturersForType(hardwareType);
  }, [hardwareType]);

  // Live vendor search — uses IMLSS prefix conventions and hardware type filtering
  const vendorSearchInput = useMemo(() => ({
    manufacturer: manufacturer || undefined,
    partNumber: partNumber || undefined,
    hardwareType: hardwareType || undefined,
  }), [manufacturer, partNumber, hardwareType]);

  const { results: vendorResults, loading: vendorLoading, error: vendorError } = useVendorSearch(vendorSearchInput);
  const hasVendorSearch = !!(manufacturer || partNumber);

  // Auto-match replacement product (only for replace/install_new actions)
  const category = hardwareType ? hardwareTypeToCategory(hardwareType) : null;
  const needsMaterial = action === 'replace' || action === 'install_new';
  const matchResult = useMemo(() => {
    if (!category || !needsMaterial) return null;
    return matchIssueToProduct(category, { fireRated: false });
  }, [category, needsMaterial]);

  const laborHrs = matchResult ? estimateLabor(matchResult.product, action) : (category ? (action === 'repair' ? 1 : 0.5) : 0);
  const laborCost = laborHrs * CREW_RATE;
  const vendorCost = selectedVendorMatch?.cost ?? selectedVendorMatch?.listPrice ?? null;
  const materialCost = needsMaterial ? (vendorCost ?? matchResult?.sellPrice ?? 0) : 0;
  const lineTotal = laborCost + materialCost;

  // Build full description from selections
  const fullDescription = useMemo(() => {
    const parts: string[] = [];
    const hwLabel = HARDWARE_TYPES.find(t => t.id === hardwareType)?.label;
    if (hwLabel) parts.push(hwLabel);
    if (manufacturer) {
      const mfr = manufacturers.find(m => m.id === manufacturer);
      if (mfr) parts.push(`(${mfr.name})`);
    }
    if (partNumber) parts.push(`P/N: ${partNumber}`);
    if (description) parts.push(`— ${description}`);
    return parts.join(' ') || '';
  }, [hardwareType, manufacturer, partNumber, description, manufacturers]);

  const canSave = hasPhoto && hardwareType && description.trim();

  const handleSave = () => {
    if (!canSave) return;
    const mfr = manufacturers.find(m => m.id === manufacturer);

    const issue: Issue = {
      id: crypto.randomUUID(),
      openingId,
      jobId,
      description: fullDescription,
      category: category || undefined,
      manufacturer: mfr?.name,
      brandId: manufacturer || undefined,
      action,
      severity,
      photos: photos.map(p => p.url),
      barcodeScan: partNumber || undefined,
      classifiedProductId: matchResult?.product.id,
      classificationConfidence: 1.0,
      partNumber: selectedVendorMatch?.sku || partNumber || undefined,
      unitCost: vendorCost ?? matchResult?.sellPrice ?? undefined,
      vendorSource: selectedVendorMatch?.source,
      vendorName: selectedVendorMatch?.name,
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
      syncStatus: 'local',
    };
    onSave(issue);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[#1a1d24] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-gray-700/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h3 className="text-sm font-bold text-white">Document Issue</h3>
          <button onClick={onClose} className="text-gray-500"><X size={18} /></button>
        </div>

        <div className="p-4 flex flex-col gap-3">

          {/* ── Step 1: Photos (REQUIRED) ── */}
          <div>
            <label className="flex items-center gap-1 text-[10px] text-gray-400 mb-1.5 font-medium uppercase">
              Photos <span className="text-red-400">*required</span>
            </label>
            <div className="flex gap-2 mb-2">
              <button onClick={capturePhoto} disabled={capturing}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg disabled:opacity-50">
                <Camera size={14} /> Take Photo
              </button>
              <button onClick={selectFromGallery} disabled={capturing}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#0E1117] border border-gray-600 text-gray-300 text-xs rounded-lg disabled:opacity-50">
                <ImagePlus size={14} />
              </button>
            </div>
            {photos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {photos.map(p => (
                  <div key={p.id} className="relative w-14 h-14">
                    <img src={p.url} className="w-full h-full object-cover rounded-lg" />
                    <button onClick={() => removePhoto(p.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                      <Trash2 size={8} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!hasPhoto && (
              <div className="flex items-center gap-1.5 text-[10px] text-red-400 mt-1">
                <AlertCircle size={10} /> At least one photo is required
              </div>
            )}
          </div>

          {/* ── Step 2: Hardware Type ── */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Hardware Type *</label>
            <div className="relative">
              <select value={hardwareType} onChange={e => { setHardwareType(e.target.value); setManufacturer(''); }}
                className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none appearance-none">
                <option value="">— Select hardware type —</option>
                <optgroup label="Door Hardware">
                  {HARDWARE_TYPES.filter(t => ['door_closer','exit_device','cylindrical_lock','mortise_lock','deadbolt','hinge','continuous_hinge','pivot'].includes(t.id)).map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Doors & Frames">
                  {HARDWARE_TYPES.filter(t => ['hollow_metal_door','hollow_metal_frame','glazing'].includes(t.id)).map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Access Control">
                  {HARDWARE_TYPES.filter(t => ['electric_strike','maglock','card_reader','access_control_panel','power_supply','rex_sensor','door_contact','electronic_lock','credential','mobile_access','intercom'].includes(t.id)).map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Door Accessories">
                  {HARDWARE_TYPES.filter(t => ['threshold','gasket','door_bottom','flush_bolt','coordinator','stop','kickplate','push_pull','cylinder','auto_operator'].includes(t.id)).map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* ── Step 3: Manufacturer ── */}
          {hardwareType && (
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">
                Existing Manufacturer ({manufacturers.length} brands)
              </label>
              <div className="relative">
                <select value={manufacturer} onChange={e => setManufacturer(e.target.value)}
                  className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none appearance-none">
                  <option value="">— Unknown / Not visible —</option>
                  {manufacturers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.parentGroup})</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
              </div>
            </div>
          )}

          {/* ── Step 4: Part Number (optional) ── */}
          {hardwareType && (
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">
                Existing Part / Model Number <span className="text-gray-600">(if visible)</span>
              </label>
              <input value={partNumber} onChange={e => setPartNumber(e.target.value)}
                placeholder="e.g. LCN 4041, 99EO-3-26D, ND80PD"
                className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          )}

          {/* ── Vendor Search Results (IMLSS + SecLock) ── */}
          {hardwareType && needsMaterial && hasVendorSearch && (
            <div>
              <label className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1.5 font-medium uppercase">
                <ShoppingCart size={10} />
                Available Parts — IMLSS & SecLock
                {vendorLoading && <Loader2 size={10} className="animate-spin text-blue-400" />}
              </label>

              {vendorError && (
                <div className="text-[10px] text-amber-400 mb-1">{vendorError} — using estimated pricing</div>
              )}

              {vendorResults.length > 0 ? (
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                  {vendorResults.map((v, i) => {
                    const isSelected = selectedVendorMatch?.sku === v.sku && selectedVendorMatch?.source === v.source;
                    const price = v.cost ?? v.listPrice;
                    return (
                      <button
                        key={`${v.source}-${v.sku}-${i}`}
                        onClick={() => setSelectedVendorMatch(isSelected ? null : v)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500/50'
                            : 'bg-[#0E1117] border-gray-700/30 active:bg-[#1a1d24]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-white font-medium truncate">{v.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {v.sku && <span className="text-[9px] text-gray-500 font-mono">{v.sku}</span>}
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                v.source === 'IML' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-purple-500/15 text-purple-400'
                              }`}>{v.source === 'IML' ? 'IMLSS' : 'SecLock'}</span>
                              {v.qtyAvail != null && v.qtyAvail > 0 && (
                                <span className="text-[9px] text-green-400">{v.qtyAvail} in stock</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {price != null ? (
                              <div className="text-[11px] font-bold text-green-400">${price.toFixed(2)}</div>
                            ) : (
                              <div className="text-[10px] text-gray-500">Call</div>
                            )}
                            {isSelected && <div className="text-[9px] text-blue-400 mt-0.5">Selected</div>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                !vendorLoading && hasVendorSearch && (
                  <div className="text-[10px] text-gray-500 py-2">No matches found — using estimated pricing</div>
                )
              )}

              {selectedVendorMatch && (
                <div className="flex items-center gap-1.5 mt-1.5 p-2 bg-blue-600/10 rounded-lg border border-blue-500/20">
                  <ExternalLink size={10} className="text-blue-400 flex-shrink-0" />
                  <span className="text-[10px] text-blue-300">
                    Using <strong>{selectedVendorMatch.name}</strong> from {selectedVendorMatch.source === 'IML' ? 'IMLSS' : 'SecLock'}
                    {(selectedVendorMatch.cost ?? selectedVendorMatch.listPrice) != null && (
                      <> — ${(selectedVendorMatch.cost ?? selectedVendorMatch.listPrice)!.toFixed(2)}</>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Step 5: Issue Description ── */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1.5 font-medium uppercase">Issue Description *</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK_DESCRIPTIONS.map(d => (
                <button key={d} onClick={() => setDescription(d)}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                    description === d
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-[#0E1117] text-gray-400 border-gray-600'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={2} placeholder="Describe the issue..."
              className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none resize-none" />
          </div>

          {/* ── Severity + Action (side by side) ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Severity</label>
              <select value={severity} onChange={e => setSeverity(e.target.value as Issue['severity'])}
                className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
                <option value="critical">Critical</option>
                <option value="standard">Standard</option>
                <option value="cosmetic">Cosmetic</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Action</label>
              <select value={action} onChange={e => setAction(e.target.value as Issue['action'])}
                className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
                <option value="replace">Replace</option>
                <option value="repair">Repair</option>
                <option value="adjust">Adjust</option>
                <option value="install_new">Install New</option>
              </select>
            </div>
          </div>

          {/* ── Estimate Preview ── */}
          {category && (laborHrs > 0 || matchResult) && (
            <div className="bg-[#0E1117] rounded-xl border border-gray-700/30 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <DollarSign size={12} className="text-green-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {needsMaterial ? 'Suggested Replacement' : 'Labor Estimate'}
                </span>
              </div>

              {/* Show product info only for replace/install_new */}
              {matchResult && needsMaterial && (
                <>
                  <div className="text-xs text-white font-medium mb-0.5">{matchResult.product.name}</div>
                  <div className="text-[10px] text-gray-500 mb-2 line-clamp-2">{matchResult.product.desc}</div>
                </>
              )}

              {/* Labor-only message for repair/adjust */}
              {!needsMaterial && (
                <div className="text-[10px] text-gray-400 mb-2">
                  {action === 'repair' ? 'Repair — labor only, no replacement parts' : 'Adjustment — labor only'}
                </div>
              )}

              <div className={`grid ${needsMaterial ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-center`}>
                {needsMaterial && (
                  <div>
                    <div className="text-[9px] text-gray-500">Material</div>
                    <div className="text-[11px] font-bold text-white">${materialCost.toFixed(2)}</div>
                  </div>
                )}
                <div>
                  <div className="text-[9px] text-gray-500">Labor ({laborHrs}h)</div>
                  <div className="text-[11px] font-bold text-white">${laborCost.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500">Total</div>
                  <div className="text-[11px] font-bold text-green-400">${lineTotal.toFixed(2)}</div>
                </div>
              </div>

              {/* VE alternatives only for replacement */}
              {needsMaterial && matchResult && matchResult.veAlternatives.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-700/30">
                  <div className="flex items-center gap-1 mb-1">
                    <ArrowRightLeft size={9} className="text-amber-400" />
                    <span className="text-[9px] text-amber-400 font-medium">VE Options</span>
                  </div>
                  {matchResult.veAlternatives.slice(0, 2).map(ve => (
                    <div key={ve.partNumber} className="flex items-center justify-between text-[10px] py-0.5">
                      <span className="text-gray-400">{ve.brand}</span>
                      <span className="text-gray-300">${ve.sellPrice.toFixed(2)}
                        {ve.savingsPct > 0 && <span className="text-green-400 ml-1">(-{ve.savingsPct}%)</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Save ── */}
          <button onClick={handleSave} disabled={!canSave}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-lg">
            Save Issue
          </button>
        </div>
      </div>
    </div>
  );
}
