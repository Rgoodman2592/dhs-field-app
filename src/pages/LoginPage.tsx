import { useState } from 'react';
import type { UserRole } from '../types';

export function LoginPage({ onLogin }: { onLogin: (name: string, role: UserRole) => void }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('tech');

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#0E1117] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-white tracking-wider mb-1">DHS FIELD</div>
          <div className="text-xs text-gray-500">Doors & Hardware Specialist</div>
        </div>

        {/* Login form */}
        <div className="bg-[#1a1d24] rounded-xl p-6 border border-gray-700/50">
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-[#0E1117] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm mb-4 focus:border-blue-500 focus:outline-none"
          />

          <label className="block text-xs text-gray-400 mb-2 font-medium">Role</label>
          <div className="flex gap-2 mb-6">
            {(['tech', 'estimator'] as UserRole[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  role === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0E1117] text-gray-400 border border-gray-600'
                }`}
              >
                {r === 'tech' ? 'Field Tech' : 'Estimator'}
              </button>
            ))}
          </div>

          <button
            onClick={() => name.trim() && onLogin(name.trim(), role)}
            disabled={!name.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-600 mt-4">
          doorsandhardwarespecialist.com
        </p>
      </div>
    </div>
  );
}
