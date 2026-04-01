import { useState } from 'react';
import { X, Flame } from 'lucide-react';
import type { Opening } from '../../types';

interface Props {
  jobId: string;
  onClose: () => void;
  onSave: (opening: Opening) => void;
}

export function OpeningForm({ jobId, onClose, onSave }: Props) {
  const [label, setLabel] = useState('');
  const [doorType, setDoorType] = useState<'single' | 'pair'>('single');
  const [fireRated, setFireRated] = useState(false);
  const [fireRating, setFireRating] = useState<string>('');
  const [wallType, setWallType] = useState('');
  const [throatDepth, setThroatDepth] = useState('');
  const [floor, setFloor] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!label.trim()) return;
    const opening: Opening = {
      id: crypto.randomUUID(),
      jobId,
      label: label.trim(),
      floor: floor || undefined,
      doorType,
      fireRated,
      fireRating: fireRated ? (fireRating as Opening['fireRating']) || '20min' : undefined,
      wallType: wallType ? (wallType as Opening['wallType']) : undefined,
      throatDepth: throatDepth || undefined,
      notes: notes || undefined,
      photos: [],
    };
    onSave(opening);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[#1a1d24] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-gray-700/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h3 className="text-sm font-bold text-white">New Opening</h3>
          <button onClick={onClose} className="text-gray-500"><X size={18} /></button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {/* Label */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Opening Label *</label>
            <input value={label} onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Main Entry #1, Stairwell B 3rd Floor"
              className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>

          {/* Floor */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Floor / Location</label>
            <input value={floor} onChange={e => setFloor(e.target.value)} placeholder="e.g. 1st Floor, Basement"
              className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>

          {/* Door Type */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1.5 font-medium uppercase">Door Type</label>
            <div className="flex gap-2">
              {(['single', 'pair'] as const).map(t => (
                <button key={t} onClick={() => setDoorType(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    doorType === t ? 'bg-blue-600 text-white' : 'bg-[#0E1117] text-gray-400 border border-gray-600'
                  }`}>
                  {t === 'single' ? 'Single Door' : 'Pair of Doors'}
                </button>
              ))}
            </div>
          </div>

          {/* Fire Rated */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1.5 font-medium uppercase">Fire Rated</label>
            <div className="flex gap-2">
              <button onClick={() => setFireRated(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  !fireRated ? 'bg-blue-600 text-white' : 'bg-[#0E1117] text-gray-400 border border-gray-600'
                }`}>No</button>
              <button onClick={() => setFireRated(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                  fireRated ? 'bg-red-600 text-white' : 'bg-[#0E1117] text-gray-400 border border-gray-600'
                }`}><Flame size={14} /> Fire Rated</button>
            </div>
          </div>

          {/* Fire Rating dropdown */}
          {fireRated && (
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Rating</label>
              <select value={fireRating} onChange={e => setFireRating(e.target.value)}
                className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none">
                <option value="20min">20-Minute</option>
                <option value="45min">45-Minute</option>
                <option value="1hr">1-Hour</option>
                <option value="1.5hr">1-1/2 Hour (90 Min)</option>
                <option value="3hr">3-Hour</option>
              </select>
            </div>
          )}

          {/* Wall Type */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Wall Type</label>
            <select value={wallType} onChange={e => setWallType(e.target.value)}
              className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none">
              <option value="">— Select —</option>
              <option value="masonry">Masonry / CMU</option>
              <option value="drywall">Drywall / Metal Stud</option>
              <option value="steel_stud">Steel Stud</option>
              <option value="wood_stud">Wood Stud</option>
            </select>
          </div>

          {/* Throat Depth */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Jamb Throat Depth</label>
            <input value={throatDepth} onChange={e => setThroatDepth(e.target.value)} placeholder='e.g. 5-3/4"'
              className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Additional details..."
              className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none resize-none" />
          </div>

          <button onClick={handleSave} disabled={!label.trim()}
            className="w-full mt-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-lg">
            Add Opening
          </button>
        </div>
      </div>
    </div>
  );
}
