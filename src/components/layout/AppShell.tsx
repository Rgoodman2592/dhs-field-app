import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { User } from '../../types';

export function AppShell({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      {/* Header */}
      <header className="bg-[#0F2B5B] text-white px-4 py-2.5 flex items-center justify-between flex-shrink-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-wide">DHS FIELD</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 font-medium uppercase">
            {user.role}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {online ? (
            <Wifi size={14} className="text-green-400" />
          ) : (
            <WifiOff size={14} className="text-red-400" />
          )}
          <button
            onClick={onLogout}
            className="text-[11px] text-gray-300 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Offline banner */}
      {!online && (
        <div className="bg-amber-600 text-white text-xs text-center py-1 px-2 font-medium">
          Offline — changes will sync when reconnected
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <Outlet />
      </main>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}
