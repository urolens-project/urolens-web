import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { useAuthContext } from '../lib/auth/useAuthContext';
import { authApi } from '../features/auth/api/authApi';

export default function SupervisorDashboard() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Supervisor Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome to the laboratory supervisor workspace.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={() => navigate('/supervisor/results')}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <ClipboardList className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Result Approvals</p>
            <p className="text-xs text-slate-500 mt-0.5">Review and approve pending results</p>
          </div>
        </button>
      </div>

      <div className="pt-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
