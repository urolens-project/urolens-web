import { useState } from 'react';
import { ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MedTechWorkloadPanel } from './MedTechWorkloadPanel';
import { PendingSpecimenList } from './PendingSpecimenList';
import { useQueueWorkloads, useLabeledSpecimens } from '../hooks/useQueueWorkloads';
import { useAssignSpecimen } from '../hooks/useAssignSpecimen';
import type { ApiError } from '../../../types/domain';

const ERROR_MESSAGES: Record<string, string> = {
  SPECIMEN_NOT_FOUND: 'Specimen not found.',
  MEDTECH_NOT_FOUND: 'Medical Technologist not found or inactive.',
  INVALID_SPECIMEN_STATUS: 'This specimen is not ready for assignment.',
  SPECIMEN_ALREADY_ASSIGNED: 'This specimen has already been assigned.',
};

function getErrorMessage(err: ApiError): string {
  const code = err.response?.data?.error?.code;
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  return 'Something went wrong. Please try again.';
}

export function QueueAssignmentDashboard() {
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string | null>(null);
  const [selectedMedTechId, setSelectedMedTechId] = useState<string | null>(null);

  const {
    data: workloads,
    isLoading: workloadsLoading,
    isError: workloadsError,
  } = useQueueWorkloads();

  const {
    data: specimens,
    isLoading: specimensLoading,
    isError: specimensError,
  } = useLabeledSpecimens();

  const assignMutation = useAssignSpecimen();

  const handleAssign = () => {
    if (!selectedSpecimenId || !selectedMedTechId) return;

    assignMutation.mutate(
      {
        specimen_id: selectedSpecimenId,
        medtech_id: selectedMedTechId,
      },
      {
        onSuccess: () => {
          setSelectedSpecimenId(null);
          setSelectedMedTechId(null);
        },
      },
    );
  };

  const handleDismiss = () => {
    assignMutation.reset();
  };

  if (workloadsError || specimensError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-red-700">Failed to load data</p>
        <p className="text-xs text-red-500 mt-1">Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {assignMutation.isSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">Specimen assigned successfully.</p>
            {assignMutation.data && (
              <p className="text-xs text-emerald-600 mt-0.5">
                Assignment ID: {assignMutation.data.assignment_id}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 px-3 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {assignMutation.isError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">{getErrorMessage(assignMutation.error as ApiError)}</p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs font-medium text-red-700 hover:text-red-900 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAssign}
          disabled={!selectedSpecimenId || !selectedMedTechId || assignMutation.isPending}
          className="h-12 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          {assignMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            <>
              Assign Specimen
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
