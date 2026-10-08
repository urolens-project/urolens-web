import { useNavigate } from 'react-router-dom';
import { ClipboardList, ClipboardCheck } from 'lucide-react';

const navCards = [
  {
    href: '/physician/lab-request/new',
    icon: ClipboardList,
    title: 'Submit Lab Request',
    description: 'Search for a patient and request a urology laboratory test.',
    action: 'New Request →',
  },
  {
    href: '/physician/results',
    icon: ClipboardCheck,
    title: "My Patients' Results",
    description: 'View and retrieve results for patients you have requested tests for.',
    action: 'View Results →',
  },
];

export function PhysicianDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {navCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.href}
              onClick={() => navigate(card.href)}
              className="group text-left w-full rounded-2xl border border-emerald-100 bg-white p-6 shadow-xs transition-all cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-emerald-50 border-emerald-100 mb-4">
                <Icon className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900">{card.title}</h2>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{card.description}</p>
              <p className="mt-4 text-xs font-semibold text-emerald-600 group-hover:underline">
                {card.action}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
