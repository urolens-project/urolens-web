import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const statCards = [
  {
    label: 'Pending Approval',
    value: '—',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    label: 'Approved Today',
    value: '—',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    label: 'Escalated',
    value: '—',
    icon: AlertTriangle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
];

export default function SupervisorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Good day, Supervisor</h2>
        <p className="mt-1 text-sm text-slate-500">Here's an overview of the laboratory review queue.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl border ${card.border} ${card.bg} p-5 flex items-center gap-4`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{card.value}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick action */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Actions</p>
        <button
          onClick={() => navigate('/supervisor/results')}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer w-full sm:w-auto"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <ClipboardList className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Open Result Approvals Queue</p>
            <p className="text-xs text-slate-400 mt-0.5">Review and act on pending MedTech results</p>
          </div>
        </button>
      </div>
    </div>
  );
}
