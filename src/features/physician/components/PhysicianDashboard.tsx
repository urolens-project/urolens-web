import { useNavigate } from 'react-router-dom';
import { ClipboardList, ClipboardCheck, Activity } from 'lucide-react';
import { useAuthContext } from '../../../lib/auth/useAuthContext';
import { authApi } from '../../auth/api/authApi';

const navCards = [
  {
    href: '/physician/lab-request/new',
    icon: ClipboardList,
    color: 'indigo',
    title: 'Submit Lab Request',
    description: 'Search for a patient and request a urology laboratory test.',
    action: 'New Request →',
  },
  {
    href: '/physician/results',
    icon: ClipboardCheck,
    color: 'violet',
    title: "My Patients' Results",
    description: 'View and retrieve results for patients you have requested tests for.',
    action: 'View Results →',
  },
];

const colorMap: Record<string, { card: string; icon: string; iconBg: string; action: string }> = {
  indigo: {
    card: 'border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50/30',
    icon: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-100',
    action: 'text-indigo-600',
  },
  violet: {
    card: 'border-violet-100 hover:border-violet-200 hover:bg-violet-50/30',
    icon: 'text-violet-600',
    iconBg: 'bg-violet-50 border-violet-100',
    action: 'text-violet-600',
  },
};

export function PhysicianDashboard() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Physician Portal</h1>
            <p className="text-sm text-slate-500 mt-0.5">UroLens Laboratory Information System</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      {/* Nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {navCards.map((card) => {
          const Icon = card.icon;
          const colors = colorMap[card.color];
          return (
            <button
              key={card.href}
              onClick={() => navigate(card.href)}
              className={`group text-left w-full rounded-2xl border bg-white p-6 shadow-xs transition-all cursor-pointer ${colors.card}`}
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${colors.iconBg} mb-4`}>
                <Icon className={`h-6 w-6 ${colors.icon}`} />
              </div>
              <h2 className="text-base font-bold text-slate-900">{card.title}</h2>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{card.description}</p>
              <p className={`mt-4 text-xs font-semibold ${colors.action} group-hover:underline`}>
                {card.action}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
