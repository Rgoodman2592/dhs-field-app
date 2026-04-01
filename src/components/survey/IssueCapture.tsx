import { useState } from 'react';
import { X, Camera, ImagePlus, Trash2, AlertCircle } from 'lucide-react';
import type { Issue } from '../../types';
import { useCamera } from '../../hooks/useCamera';
import { classifyIssue } from '../../engine/issueClassifier';

interface Props {
  jobId: string;
  openingId: string;
  onClose: () => void;
  onSave: (issue: Issue) => void;
}

const QUICK_DESCRIPTIONS = [
  'Door closer not functioning — needs replacement',
  'Exit device damaged / not latching',
  'Door not closing / latching properly',
  'Hinge worn — door sagging',
  'Lock not functioning',
  'Frame damaged / rusted',
  'Door damaged / dented / rusted',
  'Weatherstrip missing / damaged',
  'Threshold damaged / trip hazard',
  'Glass broken / cracked',
  'ADA non-compliant hardware',
  'Access control reader not working',
];

export function IssueCapture({ jobId, openingId, onClose, onSave }: Props) {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Issue['severity']>('standard');
  const [action, setAction] = useState<Issue['action']>('replace');
  const { photos, capturePhoto, selectFromGallery, removePhoto, capturing } = useCamera();

  const classification = description.trim() ? classifyIssue(description) : null;
  const hasPhoto = photos.length > 0;

  const handleSave = () => {
    if (!description.trim() || !hasPhoto) return;

    const issue: Issue = {
      id: crypto.randomUUID(),
      openingId,
      jobId,
      description: description.trim(),
      category: classification?.category,
      action,
      severity,
      photos: photos.map(p => p.url),
      classifiedProductId: undefined,
      classificationConfidence: classification?.confidence,
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

        <div className="p-4 flex flex-col gap-4">
          {/* Photo capture — REQUIRED */}
          <div>
            <label className="flex items-center gap-1 text-[10px] text-gray-400 mb-1.5 font-medium uppercase">
              Photos <span className="text-red-400">*required</span>
            </label>
            <div className="flex gap-2 mb-2">
              <button onClick={capturePhoto} disabled={capturing}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg disabled:opacity-50">
                <Camera size={16} /> Take Photo
              </button>
              <button onClick={selectFromGallery} disabled={capturing}
                className="flex items-center justify-center gap-1.5 px-4 py-3 bg-[#0E1117] border border-gray-600 text-gray-300 text-xs rounded-lg disabled:opacity-50">
                <ImagePlus size={16} />
              </button>
            </div>
            {photos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {photos.map(p => (
                  <div key={p.id} className="relative w-16 h-16">
                    <img src={p.url} className="w-full h-full object-cover rounded-lg" />
                    <button onClick={() => removePhoto(p.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                      <Trash2 size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!hasPhoto && (
              <div className="flex items-center gap-1.5 text-[10px] text-red-400 mt-1">
                <AlertCircle size={12} /> At least one photo is required
              </div>
            )}
          </div>

          {/* Quick descriptions */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1.5 font-medium uppercase">Issue Description *</label>
            <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto">
              {QUICK_DESCRIPTIONS.map(d => (
                <button key={d} onClick={() => setDescription(d)}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                    description === d
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-[#0E1117] text-gray-400 border-gray-600'
                  }`}>
                  {d.length > 35 ? d.slice(0, 35) + '...' : d}
                </button>
              ))}
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={3} placeholder="Describe the issue in detail..."
              className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none resize-none" />
          </div>

          {/* Auto-classification badge */}
          {classification && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
              classification.confidence >= 0.8 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
              classification.confidence >= 0.6 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              <span className="font-medium">Category:</span> {classification.category}
              <span className="ml-auto text-[10px] opacity-60">{Math.round(classification.confidence * 100)}% match</span>
            </div>
          )}

          {/* Severity */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1.5 font-medium uppercase">Severity</label>
            <div className="flex gap-2">
              {([
                { val: 'critical' as const, label: 'Critical', color: 'bg-red-600' },
                { val: 'standard' as const, label: 'Standard', color: 'bg-amber-600' },
                { val: 'cosmetic' as const, label: 'Cosmetic', color: 'bg-gray-600' },
              ]).map(s => (
                <button key={s.val} onClick={() => setSeverity(s.val)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                    severity === s.val ? `${s.color} text-white` : 'bg-[#0E1117] text-gray-400 border border-gray-600'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1.5 font-medium uppercase">Recommended Action</label>
            <div className="flex gap-2 flex-wrap">
              {([
                { val: 'replace' as const, label: 'Replace' },
                { val: 'repair' as const, label: 'Repair' },
                { val: 'adjust' as const, label: 'Adjust' },
                { val: 'install_new' as const, label: 'Install New' },
              ]).map(a => (
                <button key={a.val} onClick={() => setAction(a.val)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    action === a.val ? 'bg-blue-600 text-white' : 'bg-[#0E1117] text-gray-400 border border-gray-600'
                  }`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={!description.trim() || !hasPhoto}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-lg">
            Save Issue
          </button>
        </div>
      </div>
    </div>
  );
}
