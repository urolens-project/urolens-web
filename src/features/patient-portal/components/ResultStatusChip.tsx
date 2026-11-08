interface ResultStatusChipProps {
  status: string;
}

// The patient portal only ever receives RELEASED or PENDING — the backend
// collapses every internal workflow stage into PENDING before this ever
// reaches the frontend (see PatientResultService.getPatientResults). Don't
// add more internal-status entries here; that would defeat the masking.
const statusConfig: Record<string, { label: string; colorClasses: string }> = {
  RELEASED: {
    label: 'Released',
    colorClasses: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  PENDING: {
    label: 'Not yet released',
    colorClasses: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export function ResultStatusChip({ status }: ResultStatusChipProps) {
  const config = statusConfig[status] ?? {
    label: status,
    colorClasses: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.colorClasses}`}
    >
      {config.label}
    </span>
  );
}
