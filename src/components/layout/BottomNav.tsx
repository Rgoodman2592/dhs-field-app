import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, ClipboardList, Calculator, Search } from 'lucide-react';

const tabs = [
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/survey', label: 'Survey', icon: ClipboardList },
  { path: '/estimate', label: 'Estimate', icon: Calculator },
  { path: '/search', label: 'Search', icon: Search },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1d24] border-t border-gray-700/50 flex z-50 safe-area-bottom">
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = location.pathname.startsWith(path);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 pt-2.5 transition-colors ${
              active ? 'text-blue-400' : 'text-gray-500'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
