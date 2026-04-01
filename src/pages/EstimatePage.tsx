import { Calculator } from 'lucide-react';

export function EstimatePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
      <Calculator size={40} className="text-gray-600 mb-3" />
      <p className="text-sm text-gray-400">No estimate in progress</p>
      <p className="text-xs text-gray-600 mt-1">Complete a survey to generate an estimate</p>
    </div>
  );
}
