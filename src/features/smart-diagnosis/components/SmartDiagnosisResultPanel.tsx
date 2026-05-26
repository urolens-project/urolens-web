import { Brain, AlertTriangle, Loader2 } from 'lucide-react';
import { useSmartDiagnosis } from '../hooks/useSmartDiagnosis';
import { isDiagnosisUnavailable } from '../types';
import type { ConditionResult, SmartDiagnosisOutput } from '../types';
import { ConditionCard } from './ConditionCard';
import { AIDisclaimer } from './AIDisclaimer';

function buildConditions(output: SmartDiagnosisOutput): ConditionResult[] {
  return [
    { label: 'Gout',             score: output.gout_score,  evidence: output.evidence_map.gout  ?? [] },
    { label: 'Urinary Tract Infection', score: output.uti_score,   evidence: output.evidence_map.uti   ?? [] },
    { label: 'Trichomoniasis',   score: output.tricho_score, evidence: output.evidence_map.tricho ?? [] },
  ];
}

interface Props {
  resultId: string;
}

export function SmartDiagnosisResultPanel({ resultId }: Props) {
  const { data, isLoading, isError } = useSmartDiagnosis(resultId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-8 text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs font-medium">Loading Smart Diagnosis...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <UnavailableNotice />
    );
  }

  if (isDiagnosisUnavailable(data)) {
    return <UnavailableNotice />;
  }

  if (data.no_significant_indicators) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <PanelHeader />
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
          <p className="text-sm font-semibold text-slate-500">No significant diagnostic indicators detected for this sample.</p>
        </div>
        <AIDisclaimer />
      </div>
    );
  }

  const conditions = buildConditions(data);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <PanelHeader engineVersion={data.engine_version} generatedAt={data.generated_at} />
      <div className="space-y-3">
        {conditions.map((c) => (
          <ConditionCard key={c.label} condition={c} />
        ))}
      </div>
      <AIDisclaimer />
    </div>
  );
}

function PanelHeader({ engineVersion, generatedAt }: { engineVersion?: string; generatedAt?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <Brain className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-black text-slate-900">Smart Diagnosis Result</h3>
      </div>
      {engineVersion && (
        <span className="text-[10px] font-mono text-slate-400">
          v{engineVersion}
          {generatedAt ? ` · ${new Date(generatedAt).toLocaleDateString()}` : ''}
        </span>
      )}
    </div>
  );
}

function UnavailableNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2">
      <div className="flex items-center gap-2 text-amber-700">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <p className="text-sm font-bold">Smart Diagnosis is unavailable for this sample.</p>
      </div>
      <p className="text-xs text-amber-600 leading-relaxed">
        The AI engine could not generate a diagnosis output for this result. You may still review
        the raw findings and approve or return the result manually.
      </p>
    </div>
  );
}
