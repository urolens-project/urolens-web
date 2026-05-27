import { ApprovedResultsQueue } from './components/ApprovedResultsQueue';

export default function ResultReleasePage() {
  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Release Queue</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
        Release approved results to patients and physicians via physical printout or digital
        delivery.
      </p>
      <div className="mt-8">
        <ApprovedResultsQueue />
      </div>
    </div>
  );
}
