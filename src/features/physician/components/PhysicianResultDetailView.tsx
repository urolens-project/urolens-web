import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Loader2 } from 'lucide-react';
import { AIDisclaimer } from '../../../components/feedback/AIDisclaimer';
import { SmartDiagnosisPanel } from '../../smart-diagnosis';
import { useResultDetail } from '../hooks/usePhysician';

function FindingsGrid({ title, data }: { title: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between px-6 py-3">
            <span className="text-sm text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="text-sm font-semibold text-slate-800 font-mono">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PhysicianResultDetailView() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useResultDetail(resultId ?? '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4 max-w-2xl">
        <button
          onClick={() => navigate('/physician/results')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Results
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load result. You may not have access to this record.
        </div>
      </div>
    );
  }

  const statusLabel =
    data.status === 'APPROVED'
      ? 'Approved'
      : data.status === 'PENDING_SUPERVISOR_APPROVAL'
      ? 'Under Supervisor Review'
      : data.status.replace(/_/g, ' ');

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => navigate('/physician/results')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Results
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100">
            <FlaskConical className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{data.patient_uid}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {data.patient_age !== null ? `${data.patient_age}y` : ''}
              {data.patient_sex ? ` · ${data.patient_sex}` : ''}
            </p>
          </div>
        </div>
        <span className={`mt-1 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
          data.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${data.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {statusLabel}
        </span>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Sample ID', value: data.specimen_id.slice(0, 8).toUpperCase() },
          { label: 'Processed by', value: data.medtech_name ?? '—' },
          { label: 'Confirmed At', value: data.confirmed_at ? new Date(data.confirmed_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' },
          { label: 'AI Model', value: data.model_version || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-100 bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Image */}
      {data.image_url && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Microscopy Image</h2>
          </div>
          <div className="p-4">
            <img
              src={data.image_url}
              alt="Microscopy specimen"
              className="w-full rounded-xl object-contain max-h-96 bg-slate-50"
            />
          </div>
        </div>
      )}

      {/* AI Findings */}
      <FindingsGrid title="AI Findings" data={data.ai_findings} />
      <FindingsGrid title="Flagged Anomalies" data={data.flagged_anomalies} />
      <FindingsGrid title="Particle Classification" data={data.particle_classes} />

      {/* Smart Diagnosis */}
      <SmartDiagnosisPanel data={data.smart_diagnosis} unavailable={!data.smart_diagnosis} />

      {/* Supervisor annotation */}
      {data.annotation_notes && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Supervisor Notes</h2>
          </div>
          <p className="px-6 py-4 text-sm text-slate-700 whitespace-pre-wrap">{data.annotation_notes}</p>
        </div>
      )}

      <AIDisclaimer />
    </div>
  );
}
