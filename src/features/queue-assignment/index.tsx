import { useLocation } from 'react-router-dom';
import type { QueueHandoffState } from '../sample-labeling/types';
import { QueueAssignmentDashboard } from './components/QueueAssignmentDashboard';

export default function QueueAssignmentPage() {
  const location = useLocation();
  const handedOffSpecimen = (location.state as QueueHandoffState | null)?.specimen ?? null;

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Queue Assignment</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
        Assign labeled specimens to available Medical Technologists for processing.
      </p>
      <div className="mt-8">
        <QueueAssignmentDashboard preselectedSpecimenId={handedOffSpecimen?.specimen_id ?? null} />
      </div>
    </div>
  );
}
