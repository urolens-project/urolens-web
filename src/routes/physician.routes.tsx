import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../lib/auth/useAuthContext';
import { authApi } from '../features/auth/api/authApi';

export default function PhysicianDashboard() {
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
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Physician Dashboard</h1>
      <p className="text-slate-500 mb-6">Welcome to the requesting physician workspace.</p>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
}
