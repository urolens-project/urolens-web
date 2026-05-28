import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../lib/auth/useAuthContext';
import { authApi } from '../../features/auth/api/authApi';
import { patientAuthApi } from '../../features/auth/api/patientAuthApi';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';

export default function AppShell() {
  const { role, logout } = useAuthContext();
  const navigate = useNavigate();

  useSessionTimeout();

  async function handleLogout() {
    const isPatient = role === 'patient';
    try {
      if (isPatient) {
        await patientAuthApi.logout();
      } else {
        await authApi.logout();
      }
    } catch {
      /* ignore network errors on logout */
    }
    logout();
    navigate(isPatient ? '/patient/login' : '/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-800">UroLens LIS</h1>
              {role && (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full capitalize">
                  {role}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
