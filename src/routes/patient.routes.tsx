import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function PatientDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Patient Dashboard</h1>
      <p className="text-slate-500 mb-6">Welcome to the patient portal.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Link
          to="/dashboard/patient/results"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">My Results</p>
            <p className="text-xs text-slate-500">View lab test results</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
