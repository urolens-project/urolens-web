import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, CheckCircle2, ChevronRight, ClipboardList,
  Loader2, Search, User, X,
} from 'lucide-react';
import { useCreateLabRequest, usePatientSearch } from '../hooks/usePhysician';
import type { LabRequestCreateResponse, PhysicianPatient } from '../types';
import type { AxiosError } from 'axios';

const TEST_TYPES = [
  'Urinalysis - Routine',
  'Urinalysis - Complete',
  'Urine Culture',
  'Urine Microscopy',
  'Creatinine Clearance',
  'Urine Protein',
  'Other',
];

function formatPatientLabel(p: PhysicianPatient): string {
  const name = [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ');
  return `${name} · ${p.patient_uid} · DOB ${p.date_of_birth}`;
}

function ConfirmationCard({
  result,
  patientName,
  onNew,
}: {
  result: LabRequestCreateResponse;
  patientName: string;
  onNew: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Lab Request Submitted</h2>
          <p className="mt-1 text-sm text-slate-500">Your request has been queued for specimen collection.</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white px-6 py-4 text-left space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Request ID</span>
            <span className="font-mono font-semibold text-slate-900">{result.request_uid}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Patient</span>
            <span className="font-medium text-slate-900">{patientName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Test</span>
            <span className="font-medium text-slate-900">{result.test_type.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Pending Sample Collection
            </span>
          </div>
        </div>
        <button
          onClick={onNew}
          className="w-full h-10 rounded-xl border border-emerald-300 bg-white text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          Submit Another Request
        </button>
      </div>
    </div>
  );
}

export function NewLabRequestForm() {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PhysicianPatient | null>(null);
  const [dropdownDismissed, setDropdownDismissed] = useState(false);

  const [testType, setTestType] = useState('Urinalysis - Routine');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [confirmation, setConfirmation] = useState<LabRequestCreateResponse | null>(null);
  const [submittedPatientName, setSubmittedPatientName] = useState('');

  const mutation = useCreateLabRequest();

  useEffect(() => {
    const delay = query.trim() ? 300 : 0;
    const t = setTimeout(() => setDebouncedQuery(query), delay);
    return () => clearTimeout(t);
  }, [query]);

  const { data: searchResults = [], isFetching: isSearching } = usePatientSearch(debouncedQuery);

  const showDropdown =
    !dropdownDismissed &&
    !selectedPatient &&
    debouncedQuery.trim().length >= 2 &&
    searchResults.length > 0;

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownDismissed(true);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function selectPatient(p: PhysicianPatient) {
    setSelectedPatient(p);
    setQuery(formatPatientLabel(p));
    setDropdownDismissed(true);
    setErrors((prev) => ({ ...prev, patient: '' }));
  }

  function clearPatient() {
    setSelectedPatient(null);
    setQuery('');
    setDebouncedQuery('');
    setDropdownDismissed(false);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!selectedPatient) e.patient = 'Please select a patient from the search results.';
    if (!testType) e.testType = 'Please select a test type.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    const patientName = [
      selectedPatient!.first_name,
      selectedPatient!.middle_name,
      selectedPatient!.last_name,
    ]
      .filter(Boolean)
      .join(' ');

    mutation.mutate(
      {
        patient_id: selectedPatient!.patient_id,
        test_type: testType,
        clinical_notes: clinicalNotes.trim() || null,
      },
      {
        onSuccess: (data) => {
          setSubmittedPatientName(patientName);
          setConfirmation(data);
        },
        onError: (err: AxiosError<{ error?: { message?: string } }>) => {
          setServerError(
            err.response?.data?.error?.message ?? 'Something went wrong. Please try again.',
          );
        },
      },
    );
  }

  function resetForm() {
    setConfirmation(null);
    setSelectedPatient(null);
    setQuery('');
    setDebouncedQuery('');
    setDropdownDismissed(false);
    setTestType('Urinalysis - Routine');
    setClinicalNotes('');
    setErrors({});
    setServerError('');
  }

  if (confirmation) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/dashboard/physician')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </button>
        <ConfirmationCard
          result={confirmation}
          patientName={submittedPatientName}
          onNew={resetForm}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <button
        onClick={() => navigate('/dashboard/physician')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </button>

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-xs">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100">
          <ClipboardList className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">New Lab Request</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Search for a patient and specify the test you are requesting.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-slate-200 bg-white shadow-xs p-6 space-y-6">

        {/* Patient search */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
            Patient <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            {selectedPatient ? (
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
            ) : (
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            )}
            <input
              type="text"
              value={query}
              readOnly={!!selectedPatient}
              onChange={(e) => {
                setQuery(e.target.value);
                setDropdownDismissed(false);
                setErrors((p) => ({ ...p, patient: '' }));
              }}
              placeholder="Search by patient name…"
              className={`w-full h-11 rounded-xl border pl-10 pr-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.patient
                  ? 'border-red-400 bg-red-50/40'
                  : selectedPatient
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 focus:bg-white'
              }`}
            />
            {(query || selectedPatient) && (
              <button
                type="button"
                onClick={clearPatient}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isSearching && !selectedPatient && (
              <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
            )}
          </div>

          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
              {searchResults.map((p) => (
                <button
                  key={p.patient_id}
                  type="button"
                  onClick={() => selectPatient(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {[p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ')}
                    </p>
                    <p className="text-xs text-slate-400">
                      {p.patient_uid} · DOB {p.date_of_birth} · {p.sex}
                    </p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                </button>
              ))}
            </div>
          )}

          {debouncedQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && !selectedPatient && (
            <p className="mt-1.5 text-xs text-slate-500">No patients found matching "{debouncedQuery}".</p>
          )}

          {errors.patient && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
              <AlertCircle className="h-3 w-3 shrink-0" /> {errors.patient}
            </p>
          )}
        </div>

        {/* Test type */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
            Test Type <span className="text-red-500">*</span>
          </label>
          <select
            value={testType}
            onChange={(e) => { setTestType(e.target.value); setErrors((p) => ({ ...p, testType: '' })); }}
            className={`w-full h-11 rounded-xl border px-3 text-sm bg-slate-50/60 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
              errors.testType ? 'border-red-400 bg-red-50/40' : 'border-slate-200'
            }`}
          >
            {TEST_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.testType && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
              <AlertCircle className="h-3 w-3 shrink-0" /> {errors.testType}
            </p>
          )}
        </div>

        {/* Clinical notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
            Clinical Notes <span className="text-slate-300 font-normal normal-case">(optional)</span>
          </label>
          <textarea
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            rows={4}
            placeholder="Relevant clinical history, symptoms, or instructions for the medical technologist…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-3 text-sm resize-none transition"
          />
        </div>

        {serverError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-xs font-medium text-red-600">{serverError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full h-11 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            'Submit Lab Request'
          )}
        </button>
      </form>
    </div>
  );
}
