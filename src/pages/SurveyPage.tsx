import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, DoorOpen, AlertTriangle, Camera, ChevronRight, Flame } from 'lucide-react';
import * as store from '../store/offlineStore';
import type { Job, Opening, Issue } from '../types';
import { OpeningForm } from '../components/survey/OpeningForm';
import { IssueCapture } from '../components/survey/IssueCapture';

export function SurveyPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const jobId = params.get('jobId');

  const [job, setJob] = useState<Job | null>(null);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [issuesByOpening, setIssuesByOpening] = useState<Record<string, Issue[]>>({});
  const [showNewOpening, setShowNewOpening] = useState(false);
  const [activeOpeningId, setActiveOpeningId] = useState<string | null>(null);
  const [showNewIssue, setShowNewIssue] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    store.getJob(jobId).then(j => setJob(j ?? null));
    loadOpenings();
  }, [jobId]);

  async function loadOpenings() {
    if (!jobId) return;
    const ops = await store.getOpeningsForJob(jobId);
    setOpenings(ops);
    const issueMap: Record<string, Issue[]> = {};
    for (const o of ops) {
      issueMap[o.id] = await store.getIssuesForOpening(o.id);
    }
    setIssuesByOpening(issueMap);
  }

  if (!jobId) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
        <DoorOpen size={40} className="text-gray-600 mb-3" />
        <p className="text-sm text-gray-400">No job selected</p>
        <button onClick={() => navigate('/jobs')} className="mt-3 text-xs text-blue-400 underline">Go to Jobs</button>
      </div>
    );
  }

  const handleSaveOpening = async (opening: Opening) => {
    await store.saveOpening(opening);
    setShowNewOpening(false);
    await loadOpenings();
    setActiveOpeningId(opening.id);
  };

  const handleSaveIssue = async (issue: Issue) => {
    await store.saveIssue(issue);
    setShowNewIssue(false);
    await loadOpenings();
  };

  const totalIssues = Object.values(issuesByOpening).flat().length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-[#1a1d24] px-4 py-3 border-b border-gray-700/30 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => navigate('/jobs')} className="text-gray-400"><ArrowLeft size={16} /></button>
          <h2 className="text-sm font-bold text-white truncate">{job?.customerName || 'Loading...'}</h2>
        </div>
        {job?.address && <p className="text-[11px] text-gray-500 ml-6">{job.address}</p>}
        <div className="flex gap-3 mt-2 ml-6">
          <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">{openings.length} openings</span>
          <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">{totalIssues} issues</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {/* Openings list */}
        {openings.map(opening => {
          const issues = issuesByOpening[opening.id] || [];
          const isActive = activeOpeningId === opening.id;

          return (
            <div key={opening.id} className="mb-3">
              <button
                onClick={() => setActiveOpeningId(isActive ? null : opening.id)}
                className="w-full bg-[#1a1d24] rounded-xl p-3 border border-gray-700/30 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DoorOpen size={16} className="text-blue-400" />
                    <span className="text-sm font-semibold text-white">{opening.label}</span>
                    {opening.fireRated && <Flame size={12} className="text-red-400" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">{issues.length} issues</span>
                    <ChevronRight size={14} className={`text-gray-600 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                <div className="flex gap-2 mt-1.5 ml-6">
                  <span className="text-[10px] text-gray-500">{opening.doorType}</span>
                  {opening.fireRating && <span className="text-[10px] text-red-400">{opening.fireRating}</span>}
                  {opening.wallType && <span className="text-[10px] text-gray-500">{opening.wallType}</span>}
                </div>
              </button>

              {/* Issues under this opening */}
              {isActive && (
                <div className="ml-4 mt-2 flex flex-col gap-2">
                  {issues.map(issue => (
                    <div key={issue.id} className="bg-[#22252d] rounded-lg p-3 border border-gray-700/20">
                      <div className="flex items-start gap-2">
                        {issue.photos.length > 0 ? (
                          <img src={issue.photos[0]} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <Camera size={14} className="text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white">{issue.description}</div>
                          <div className="flex gap-2 mt-1">
                            {issue.category && (
                              <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded">{issue.category}</span>
                            )}
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                              issue.severity === 'critical' ? 'bg-red-500/15 text-red-400' :
                              issue.severity === 'cosmetic' ? 'bg-gray-500/15 text-gray-400' :
                              'bg-amber-500/15 text-amber-400'
                            }`}>{issue.severity}</span>
                            <span className="text-[9px] text-gray-500">{issue.action}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => { setActiveOpeningId(opening.id); setShowNewIssue(true); }}
                    className="flex items-center justify-center gap-1.5 text-xs text-blue-400 py-2 border border-dashed border-gray-600 rounded-lg"
                  >
                    <Plus size={14} /> Add Issue
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add opening button */}
        <button
          onClick={() => setShowNewOpening(true)}
          className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-[#1a1d24] border border-dashed border-gray-600 rounded-xl text-sm text-blue-400"
        >
          <Plus size={16} /> Add Opening
        </button>

        {/* Review estimate button */}
        {totalIssues > 0 && (
          <button
            onClick={() => navigate(`/estimate?jobId=${jobId}`)}
            className="w-full flex items-center justify-center gap-2 py-3 mt-3 bg-blue-600 rounded-xl text-sm text-white font-semibold"
          >
            Review Estimate ({totalIssues} issues)
          </button>
        )}

        {openings.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle size={24} className="text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Start by adding an opening to survey</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewOpening && jobId && (
        <OpeningForm jobId={jobId} onClose={() => setShowNewOpening(false)} onSave={handleSaveOpening} />
      )}
      {showNewIssue && activeOpeningId && jobId && (
        <IssueCapture
          jobId={jobId}
          openingId={activeOpeningId}
          onClose={() => setShowNewIssue(false)}
          onSave={handleSaveIssue}
        />
      )}
    </div>
  );
}
