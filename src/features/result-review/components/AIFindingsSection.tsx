import { Bot } from 'lucide-react';
import type { FullResultDetail } from '../types';

interface Props {
  result: FullResultDetail;
}

function JsonViewer({ label, data }: { label: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1.5">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-start justify-between gap-4">
            <span className="text-xs text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="text-xs font-semibold text-slate-800 text-right">
              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AIFindingsSection({ result }: Props) {
  const hasFindings =
    Object.keys(result.ai_findings).length > 0 ||
    Object.keys(result.flagged_anomalies).length > 0 ||
    Object.keys(result.particle_classes).length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">AI Findings</h3>
        </div>
        <span className="text-xs text-slate-400">Model: {result.model_version}</span>
      </div>

      {!hasFindings ? (
        <p className="text-sm text-slate-400">No AI findings available.</p>
      ) : (
        <div className="space-y-4">
          <JsonViewer label="Findings" data={result.ai_findings} />
          <JsonViewer label="Flagged Anomalies" data={result.flagged_anomalies} />
          <JsonViewer label="Particle Classes" data={result.particle_classes} />
        </div>
      )}
    </div>
  );
}
