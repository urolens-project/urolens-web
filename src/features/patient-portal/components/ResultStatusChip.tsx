interface ResultStatusChipProps {
  status: string;
}

const statusConfig: Record<string, { label: string; colorClasses: string }> = {
  RELEASED: { label: 'Released', colorClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  APPROVED: { label: 'Approved', colorClasses: 'bg-blue-50 text-blue-700 border-blue-200' },
  PENDING_SUPERVISOR_APPROVAL: { label: 'Under Review', colorClasses: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Processing', colorClasses: 'bg-amber-50 text-amber-700 border-amber-200' },
  PENDING: { label: 'Pending', colorClasses: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export function ResultStatusChip({ status }: ResultStatusChipProps) {
  const config = statusConfig[status] ?? { label: status, colorClasses: 'bg-slate-100 text-slate-600 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.colorClasses}`}>
      {config.label}
    </span>
  );
}
