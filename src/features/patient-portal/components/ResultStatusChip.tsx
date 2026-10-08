import { Badge } from '../../../components/ui/Badge';
import { getResultStatusVariant } from '../../../lib/resultStatusBadge';

interface ResultStatusChipProps {
  status: string;
}

// The patient portal only ever receives RELEASED or PENDING — the backend
// collapses every internal workflow stage into PENDING before this ever
// reaches the frontend (see PatientResultService.getPatientResults). Don't
// add more internal-status entries here; that would defeat the masking.
const STATUS_LABEL: Record<string, string> = {
  RELEASED: 'Released',
  PENDING: 'Not yet released',
};

export function ResultStatusChip({ status }: ResultStatusChipProps) {
  return <Badge variant={getResultStatusVariant(status)}>{STATUS_LABEL[status] ?? status}</Badge>;
}
