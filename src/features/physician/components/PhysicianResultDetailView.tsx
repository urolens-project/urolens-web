import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Loader2, Flag } from 'lucide-react';
import { SmartDiagnosisPanel } from '../../smart-diagnosis';
import { PARTICLE_LABELS, PARTICLE_LABEL_DISPLAY } from '../../result-review/constants';
import { useResultDetail } from '../hooks/usePhysician';
import type { ParticleAggregate } from '../../field-verification/types';

// A physician only ever sees an already-finalized RELEASED result — so,
// unlike AIFindingsSection (the Supervisor/MedTech editable equivalent),
// this is read-only and has no per-parameter edit history: ai_findings,
// flagged_anomalies and particle_classes are the same three overlapping
// dicts that used to render as three separate near-duplicate cards here;
// merged into one row per particle type instead.
function ParticleCountsCard({
  aiFindings,
  flaggedAnomalies,
  particleClasses,
}: {
  aiFindings: Record<string, unknown>;
  flaggedAnomalies: Record<string, unknown>;
  particleClasses: Record<string, unknown>;
}) {
  const flaggedKeys = new Set(Object.keys(flaggedAnomalies));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900">Particle Counts</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {PARTICLE_LABELS.map((key) => {
          const effective = particleClasses[key] ?? aiFindings[key] ?? 0;
          return (
            <div key={key} className="flex items-center justify-between px-6 py-3">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                {flaggedKeys.has(key) && (
                  <Flag
                    className="h-3 w-3 text-red-500 shrink-0"
                    aria-label="Flagged: exceeds clinical threshold"
                  />
                )}
                {PARTICLE_LABEL_DISPLAY[key]}
              </span>
              <span className="text-sm font-semibold text-slate-800 font-mono">
                {String(effective)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Proposal §10.3: "counts labelled as average per field with fields
// examined." Only rendered once the backend actually sends
// field_summary — absent for every result today, so ParticleCountsCard
// below (today's merged ai_findings/particle_classes view) stays the
// only thing a physician sees until a lane wires this on.
function FinalAveragesCard({
  fieldSummary,
  fieldCount,
}: {
  fieldSummary: Record<string, ParticleAggregate>;
  fieldCount: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900">Particle Counts</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Average per field · {fieldCount} field{fieldCount !== 1 ? 's' : ''} examined
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {Object.entries(fieldSummary).map(([key, agg]) => (
          <div key={key} className="flex items-center justify-between px-6 py-3">
            <span className="text-sm text-slate-500">{PARTICLE_LABEL_DISPLAY[key] ?? key}</span>
            <span className="text-sm font-semibold text-slate-800 font-mono">
              {agg.display_value}
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

  // getResultDetail 403s (RESULT_NOT_RELEASED) before returning anything
  // unless the result is already RELEASED, so that's the only status this
  // view ever actually renders — but fall back gracefully rather than
  // assume, in case that gate ever changes.
  const statusLabel = data.status === 'RELEASED' ? 'Released' : data.status.replace(/_/g, ' ');

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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
            <FlaskConical className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{data.patient_uid}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {data.patient_age !== null ? `${data.patient_age}y` : ''}
              {data.patient_sex ? ` · ${data.patient_sex}` : ''}
            </p>
          </div>
        </div>
        <span
          className={`mt-1 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
            data.status === 'APPROVED'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${data.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'}`}
          />
          {statusLabel}
        </span>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Sample ID', value: data.specimen_id.slice(0, 8).toUpperCase() },
          { label: 'Processed by', value: data.medtech_name ?? '—' },
          {
            label: 'Confirmed At',
            value: data.confirmed_at
              ? new Date(data.confirmed_at).toLocaleString('en-PH', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—',
          },
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

      {/* Particle Counts — final averages once field_summary exists,
          otherwise today's merged ai_findings/flagged_anomalies/particle_classes view */}
      {data.field_summary ? (
        <FinalAveragesCard fieldSummary={data.field_summary} fieldCount={data.field_count ?? 0} />
      ) : (
        <ParticleCountsCard
          aiFindings={data.ai_findings}
          flaggedAnomalies={data.flagged_anomalies}
          particleClasses={data.particle_classes}
        />
      )}

      {/* Smart Diagnosis */}
      <SmartDiagnosisPanel data={data.smart_diagnosis} unavailable={!data.smart_diagnosis} />

      {/* Supervisor annotation */}
      {data.annotation_notes && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Supervisor Notes</h2>
          </div>
          <p className="px-6 py-4 text-sm text-slate-700 whitespace-pre-wrap">
            {data.annotation_notes}
          </p>
        </div>
      )}
      {/* No standalone AIDisclaimer here — SmartDiagnosisPanel above already
          renders one on every branch; a second copy was showing it twice. */}
    </div>
  );
}
