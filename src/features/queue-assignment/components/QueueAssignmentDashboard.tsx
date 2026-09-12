import { useState } from 'react';
import { AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { MedTechWorkloadPanel } from './MedTechWorkloadPanel';
import { PendingSpecimenList } from './PendingSpecimenList';
import { AssignmentConfirmationModal } from './AssignmentConfirmationModal';
import { usePendingSpecimens, useMedTechWorkloads } from '../hooks/useQueueWorkloads';
import { useAssignSpecimen } from '../hooks/useAssignSpecimen';
import { Button } from '../../../components/ui/Button';

export function QueueAssignmentDashboard() {
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string | null>(null);
  const [selectedMedTechId, setSelectedMedTechId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    data: specimens,
    isLoading: specimensLoading,
    isError: specimensError,
    refetch: refetchSpecimens,
    isFetching: specimensFetching,
  } = usePendingSpecimens();

  const {
    data: workloads,
    isLoading: workloadsLoading,
    isError: workloadsError,
    refetch: refetchWorkloads,
    isFetching: workloadsFetching,
  } = useMedTechWorkloads();

  const assignMutation = useAssignSpecimen();

  const selectedSpecimen = specimens?.find((s) => s.specimen_id === selectedSpecimenId) ?? null;
  const selectedMedTech = workloads?.find((m) => m.user_id === selectedMedTechId) ?? null;

  const canAssign = selectedSpecimenId !== null && selectedMedTechId !== null;
  const isRefreshing = specimensFetching || workloadsFetching;

  function handleReload() {
    refetchSpecimens();
    refetchWorkloads();
  }

  const handleOpenModal = () => {
    if (!canAssign) return;
    setModalOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedSpecimenId || !selectedMedTechId) return;
    assignMutation.mutate(
      { specimen_id: selectedSpecimenId, medtech_id: selectedMedTechId },
      {
        onSuccess: () => {
          setModalOpen(false);
          setSelectedSpecimenId(null);
          setSelectedMedTechId(null);
        },
        onError: () => {
          setModalOpen(false);
        },
      },
    );
  };

  if (workloadsError || specimensError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-red-700">Failed to load queue data</p>
        <p className="text-xs text-red-500 mt-1">Please check your connection and try again.</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4 border-red-200 text-red-600 hover:bg-red-50"
          onClick={handleReload}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {specimens !== undefined && (
              <>
                {specimens.length} specimen{specimens.length !== 1 ? 's' : ''} pending
              </>
            )}
          </p>
          <Button variant="secondary" size="sm" disabled={isRefreshing} onClick={handleReload}>
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PendingSpecimenList
            specimens={specimens ?? []}
            selectedSpecimenId={selectedSpecimenId}
            onSelect={setSelectedSpecimenId}
            isLoading={specimensLoading}
          />
          <MedTechWorkloadPanel
            workloads={workloads ?? []}
            selectedMedTechId={selectedMedTechId}
            onSelect={setSelectedMedTechId}
            isLoading={workloadsLoading}
          />
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="lg" disabled={!canAssign} onClick={handleOpenModal}>
            Assign Specimen
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AssignmentConfirmationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        isPending={assignMutation.isPending}
        specimen={selectedSpecimen}
        medtech={selectedMedTech}
      />
    </>
  );
}
