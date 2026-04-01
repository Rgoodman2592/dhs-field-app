import { ClipboardList } from 'lucide-react';

export function SurveyPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
      <ClipboardList size={40} className="text-gray-600 mb-3" />
      <p className="text-sm text-gray-400">No active survey</p>
      <p className="text-xs text-gray-600 mt-1">Select a job first to start a survey</p>
    </div>
  );
}
