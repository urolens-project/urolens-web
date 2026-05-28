import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, Brain, FlaskConical, Info, Loader2,
} from 'lucide-react';
import { useResultDetail } from '../hooks/usePhysician';
import type { SmartDiagnosisDetail } from '../types';

const SCORE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  LOW: { label: 'Low', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  MODERATE: { label: 'Moderate', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  HIGH: { label: 'High', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

const fallbackScore = { label: '—', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' };

function ScorePill({ score }: { score: string }) {
  const cfg = SCORE_CONFIG[score?.toUpperCase()] ?? fallbackScore;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function SmartDiagnosisSection({ sd }: { sd: SmartDiagnosisDetail }) {
  const conditions = [
    { key: 'gout_score', label: 'Gout', score: sd.gout_score },
    { key: 'gn_score', label: 'Glomerulonephritis', score: sd.gn_score },
    { key: 'nephro_score', label: 'Nephrolithiasis', score: sd.nephro_score },
    { key: 'uti_score', label: 'UTI', score: sd.uti_score },
    { key: 'tricho_score', label: 'Trichomoniasis', score: sd.tricho_score },
  ];

  return (
    <div className="rounded-2xl border border-violet-200 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-violet-100 bg-violet-50">
        <Brain className="h-5 w-5 text-violet-600" />
        <div>
          <h2 className="text-sm font-bold text-slate-900">Smart Diagnosis</h2>
          <p className="text-xs text-slate-500">AI-generated diagnostic probability scores · Engine v{sd.engine_version}</p>
        </div>
      </div>

      {sd.no_significant_indicators && (
        <div className="flex items-center gap-2 px-6 py-3 border-b border-violet-100 bg-violet-50/40 text-xs text-violet-700">
          <Info className="h-3.5 w-3.5 shrink-0" />
          No significant indicators detected across all conditions.
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {conditions.map(({ key, label, score }) => (
          <div key={key} className="flex items-center justify-between px-6 py-3.5">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <ScorePill score={score} />
          </div>
        ))}
      </div>

      {Object.keys(sd.evidence_map).length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Supporting Evidence</p>
          <div className="space-y-3">
            {Object.entries(sd.evidence_map).map(([condition, markers]) =>
              markers && markers.length > 0 ? (
                <div key={condition}>
                  <p className="text-xs font-semibold text-slate-600 capitalize mb-1">{condition}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(markers as string[]).map((m) => (
                      <span key={m} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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

function AIDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
      <p className="text-xs text-amber-800 leading-relaxed">
        <strong>AI-Assisted Analysis Disclaimer:</strong> The findings and diagnostic scores presented here are generated by
        the UroLens AI engine and are intended as clinical decision support tools only. They do not constitute a final
        diagnosis. All results must be reviewed and validated by a licensed medical professional before clinical action is taken.
      </p>
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
      {data.smart_diagnosis ? (
        <SmartDiagnosisSection sd={data.smart_diagnosis} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-500 flex items-center gap-3">
          <Brain className="h-5 w-5 text-slate-300" />
          Smart Diagnosis is not available for this result.
        </div>
      )}

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
