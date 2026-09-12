import { Badge } from '../../../components/ui/Badge';

interface ResultStatusChipProps {
  status: string;
}

const statusConfig: Record<
  string,
  { label: string; variant: 'success' | 'info' | 'warning' | 'default' }
> = {
  RELEASED: { label: 'Released', variant: 'success' },
  APPROVED: { label: 'Approved', variant: 'info' },
  PENDING_SUPERVISOR_APPROVAL: { label: 'Under Review', variant: 'warning' },
  CONFIRMED: { label: 'Processing', variant: 'warning' },
  PENDING: { label: 'Pending', variant: 'default' },
};

export function ResultStatusChip({ status }: ResultStatusChipProps) {
  const config = statusConfig[status] ?? { label: status, variant: 'default' as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
