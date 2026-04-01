import { Briefcase, Plus } from 'lucide-react';

export function JobsPage() {
  return (
    <div className="p-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Active Jobs', value: '0', color: 'text-blue-400' },
          { label: 'Open Issues', value: '0', color: 'text-amber-400' },
          { label: 'Pending Est.', value: '0', color: 'text-green-400' },
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
        <button className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">
          <Plus size={14} /> New Job
        </button>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Briefcase size={40} className="text-gray-600 mb-3" />
        <p className="text-sm text-gray-400">No jobs yet</p>
        <p className="text-xs text-gray-600 mt-1">Create a job to start surveying</p>
      </div>
    </div>
  );
}
