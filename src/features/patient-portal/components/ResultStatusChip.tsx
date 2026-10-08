import { Badge } from '../../../components/ui/Badge';
import { getResultStatusVariant } from '../../../lib/resultStatusBadge';

interface ResultStatusChipProps {
  status: string;
}

const STATUS_LABEL: Record<string, string> = {
  RELEASED: 'Released',
  APPROVED: 'Approved',
  PENDING_SUPERVISOR_APPROVAL: 'Under Review',
  CONFIRMED: 'Processing',
  PENDING: 'Pending',
};

export function ResultStatusChip({ status }: ResultStatusChipProps) {
  return <Badge variant={getResultStatusVariant(status)}>{STATUS_LABEL[status] ?? status}</Badge>;
}
