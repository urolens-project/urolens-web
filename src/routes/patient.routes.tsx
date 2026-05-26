import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../lib/auth/useAuthContext';
import { authApi } from '../features/auth/api/authApi';
import { FileText } from 'lucide-react';

export default function PatientDashboard() {
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
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Patient Dashboard</h1>
      <p className="text-slate-500 mb-6">Welcome to the patient portal.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Link
          to="/dashboard/patient/results"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">My Results</p>
            <p className="text-xs text-slate-500">View lab test results</p>
          </div>
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
}
