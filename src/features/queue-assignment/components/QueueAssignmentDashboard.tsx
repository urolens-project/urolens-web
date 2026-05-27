import { useState } from 'react';
import { AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { MedTechWorkloadPanel } from './MedTechWorkloadPanel';
import { PendingSpecimenList } from './PendingSpecimenList';
import { AssignmentConfirmationModal } from './AssignmentConfirmationModal';
import { usePendingSpecimens, useMedTechWorkloads } from '../hooks/useQueueWorkloads';
import { useAssignSpecimen } from '../hooks/useAssignSpecimen';

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
        <button
          onClick={handleReload}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 h-9 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
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
              <>{specimens.length} specimen{specimens.length !== 1 ? 's' : ''} pending</>
            )}
          </p>
          <button
            onClick={handleReload}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 h-9 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
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
          <button
            type="button"
            onClick={handleOpenModal}
            disabled={!canAssign}
            className="h-12 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            Assign Specimen
            <ArrowRight className="h-4 w-4" />
          </button>
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