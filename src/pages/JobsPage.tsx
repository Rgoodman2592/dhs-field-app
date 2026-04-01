import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, ChevronRight, MapPin, X } from 'lucide-react';
import * as store from '../store/offlineStore';
import type { Job } from '../types';

function NewJobModal({ onClose, onSave }: { onClose: () => void; onSave: (job: Job) => void }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    const job: Job = {
      id: crypto.randomUUID(),
      customerName: name.trim(),
      address: address.trim(),
      contact: contact.trim(),
      phone: phone.trim(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    onSave(job);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#1a1d24] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-gray-700/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h3 className="text-sm font-bold text-white">New Job</h3>
          <button onClick={onClose} className="text-gray-500"><X size={18} /></button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Customer / Job Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mayfair Mansions"
              className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Service Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, Washington, DC 20001"
              className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Contact</label>
              <input value={contact} onChange={e => setContact(e.target.value)} placeholder="John Smith"
                className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1 font-medium uppercase">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(202) 555-1234" type="tel"
                className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <button onClick={handleSave} disabled={!name.trim()}
            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-lg">
            Create Job
          </button>
        </div>
      </div>
    </div>
  );
}

export function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    store.getJobs().then(setJobs);
  }, []);

  const handleSave = async (job: Job) => {
    await store.saveJob(job);
    setJobs(prev => [job, ...prev]);
    setShowNew(false);
  };

  const activeJobs = jobs.filter(j => j.status === 'active');
  const pendingEst = jobs.filter(j => j.status === 'estimate_pending');

  return (
    <div className="p-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Active Jobs', value: String(activeJobs.length), color: 'text-blue-400' },
          { label: 'Open Issues', value: '—', color: 'text-amber-400' },
          { label: 'Pending Est.', value: String(pendingEst.length), color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#1a1d24] rounded-lg p-3 text-center border border-gray-700/30">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Job list header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-white">Jobs</h2>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">
          <Plus size={14} /> New Job
        </button>
      </div>

      {/* Job cards */}
      {jobs.length > 0 ? (
        <div className="flex flex-col gap-2">
          {jobs.map(job => (
            <button
              key={job.id}
              onClick={() => navigate(`/survey?jobId=${job.id}`)}
              className="w-full bg-[#1a1d24] rounded-xl p-3.5 border border-gray-700/30 text-left flex items-center gap-3 active:bg-[#22252d]"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600/15 flex items-center justify-center flex-shrink-0">
                <Briefcase size={16} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{job.customerName}</div>
                {job.address && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 truncate">
                    <MapPin size={10} /> {job.address}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  job.status === 'active' ? 'bg-blue-500/15 text-blue-400' :
                  job.status === 'estimate_submitted' ? 'bg-green-500/15 text-green-400' :
                  'bg-amber-500/15 text-amber-400'
                }`}>
                  {job.status === 'active' ? 'Active' :
                   job.status === 'estimate_submitted' ? 'Submitted' : 'Pending'}
                </span>
                <ChevronRight size={14} className="text-gray-600" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Briefcase size={40} className="text-gray-600 mb-3" />
          <p className="text-sm text-gray-400">No jobs yet</p>
          <p className="text-xs text-gray-600 mt-1">Tap "New Job" to start a survey</p>
        </div>
      )}

      {showNew && <NewJobModal onClose={() => setShowNew(false)} onSave={handleSave} />}
    </div>
  );
}
