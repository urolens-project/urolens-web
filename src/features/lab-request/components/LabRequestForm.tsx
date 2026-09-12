import { useEffect, useState, useRef, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import type { LabRequestPayload, LabRequestResponse } from '../../../types/types';
import type { PatientSearchResult } from '../types';
import { labRequestApi } from '../api/labRequestApi';
import { usePhysicians, usePatientSearch } from '../hooks/useLabRequest';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

import {
  Search,
  User,
  Loader2,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Clipboard,
  AlertTriangle,
  Stethoscope,
  FlaskConical,
} from 'lucide-react';

export default function LabRequestForm() {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [dropdownDismissed, setDropdownDismissed] = useState(false);

  const [isManualPhysician, setIsManualPhysician] = useState(false);
  const [physicianId, setPhysicianId] = useState('');
  const [physicianName, setPhysicianName] = useState('');

  const [testType, setTestType] = useState('Urinalysis - Routine');
  const [otherTestDescription, setOtherTestDescription] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [confirmationData, setConfirmationData] = useState<
    | (LabRequestResponse & {
        patientUid: string;
        physician: string;
        test: string;
      })
    | null
  >(null);

  // Debounce search query — always update via setTimeout to avoid synchronous setState in effect
  useEffect(() => {
    const delay = searchQuery.trim() ? 300 : 0;
    const t = setTimeout(() => setDebouncedQuery(searchQuery), delay);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: patientSearchData, isFetching: isSearching } = usePatientSearch(debouncedQuery);
  const searchResults: PatientSearchResult[] = patientSearchData ?? [];
  const hasSearched = debouncedQuery.trim().length > 0;

  // Derive dropdown visibility — no effect needed
  const showDropdown =
    !dropdownDismissed &&
    !selectedPatient &&
    searchResults.length > 0 &&
    debouncedQuery.trim().length > 0;

  // Dismiss dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownDismissed(true);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: physiciansData } = usePhysicians();
  const dbPhysicians = physiciansData ?? [];

  const requestMutation = useMutation({
    mutationFn: (payload: LabRequestPayload) => labRequestApi.createLabRequest(payload),
    onSuccess: (data) => {
      const matchedPhysician = dbPhysicians.find((p) => p.user_id === physicianId);
      const displayPhysician = isManualPhysician
        ? physicianName
        : matchedPhysician?.username || 'Not specified';

      setConfirmationData({
        ...data,
        patientUid: selectedPatient?.patient_uid ?? 'Unknown',
        physician: displayPhysician,
        test: testType === 'OTHER' ? otherTestDescription : testType,
      });
    },
    onError: (error: Error) => {
      setFormErrors((prev) => ({ ...prev, submit: error.message }));
    },
  });

  const handleSelectPatient = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setSearchQuery('');
    setDropdownDismissed(true);
    setFormErrors((prev) => {
      const n = { ...prev };
      delete n.patient;
      return n;
    });
  };

  const handleClearForm = () => {
    setSelectedPatient(null);
    setSearchQuery('');
    setDebouncedQuery('');
    setDropdownDismissed(false);
    setPhysicianId('');
    setPhysicianName('');
    setIsManualPhysician(false);
    setTestType('Urinalysis - Routine');
    setOtherTestDescription('');
    setClinicalNotes('');
    setSpecialInstructions('');
    setFormErrors({});
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};

    if (!selectedPatient) errors.patient = 'Please select a patient.';
    if (testType === 'OTHER' && !otherTestDescription.trim())
      errors.testType = 'Please describe the test.';
    if (isManualPhysician && !physicianName.trim())
      errors.physician = "Please enter the physician's name.";
    if (!isManualPhysician && !physicianId) errors.physician = 'Please select a physician.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload: LabRequestPayload = {
      patient_id: selectedPatient!.patient_id,
      physician_id: isManualPhysician ? undefined : physicianId,
      physician_name: isManualPhysician ? physicianName.trim() : undefined,
      test_type: testType === 'OTHER' ? otherTestDescription.trim() : testType,
      clinical_notes: `${clinicalNotes}\n\nSpecial Instructions:\n${specialInstructions}`.trim(),
    };

    requestMutation.mutate(payload);
  };

  const selectedPhysicianObject = dbPhysicians.find((p) => p.user_id === physicianId);
  const currentPreviewPhysician = isManualPhysician
    ? physicianName
    : selectedPhysicianObject?.username || '';

  if (confirmationData) {
    return (
      <div className="max-w-xl mx-auto py-12 animate-fadeIn font-sans">
        <Helmet>
          <title>Lab Request — UroLens</title>
        </Helmet>
        <div className="relative overflow-hidden rounded-4xl bg-white p-8 lg:p-10 shadow-md border border-slate-200">
          <div className="relative space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Lab Request Submitted</h2>
                <p className="mt-1 text-sm text-slate-500">
                  This request is now queued for sample collection.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-xs">
                  Tracking Number
                </span>
                <span className="font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded border border-emerald-200/40">
                  {confirmationData.request_uid || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-xs">
                  Patient
                </span>
                <span className="font-bold text-slate-800">{confirmationData.patientUid}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-xs">
                  Physician
                </span>
                <span className="font-semibold text-slate-700">{confirmationData.physician}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-xs">
                  Test
                </span>
                <span className="font-semibold text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
                  {confirmationData.test}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-xs">
                  Status
                </span>
                <Badge variant="warning" dot>
                  Pending Sample Collection
                </Badge>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full bg-slate-900 hover:bg-slate-800"
              onClick={() => {
                setConfirmationData(null);
                handleClearForm();
              }}
            >
              <RotateCcw className="h-4 w-4" /> Submit Another Request
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F4F7F5] font-sans text-slate-800 tracking-tight">
      <Helmet>
        <title>Lab Request — UroLens</title>
      </Helmet>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-350 mx-auto">
        {/* Main form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Step 1 — find the patient */}
          <div
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs relative"
            ref={dropdownRef}
          >
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] text-white font-mono">
                  1
                </span>
                Find Patient
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Enter the Patient ID for this request (found on their registration receipt).
              </p>
            </div>

            <div className="relative">
              {isSearching ? (
                <Loader2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-600" />
              ) : (
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              )}

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDropdownDismissed(false);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setDropdownDismissed(false);
                }}
                disabled={!!selectedPatient}
                placeholder="Search by Patient ID (e.g. PAT-000123)..."
                className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
              />

              {selectedPatient && (
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>

            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-6 right-6 mt-1 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200 z-50 divide-y divide-slate-100 max-h-56 overflow-y-auto animate-fadeIn">
                {searchResults.map((patient) => (
                  <button
                    type="button"
                    key={patient.patient_id}
                    onClick={() => handleSelectPatient(patient)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50 border-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 border border-slate-200/60">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{patient.patient_uid}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {hasSearched &&
              searchResults.length === 0 &&
              !isSearching &&
              searchQuery.trim().length > 0 && (
                <div className="mt-3 bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-amber-800 animate-fadeIn">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">No patient found with that ID</h4>
                    <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                      Double-check the Patient ID, or register this patient first if they're new.
                    </p>
                  </div>
                </div>
              )}

            {formErrors.patient && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-600 border border-red-200 text-sm font-semibold">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>{formErrors.patient}</p>
              </div>
            )}
          </div>

          {/* Step 2 — request details */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden"
          >
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] text-white font-mono">
                  2
                </span>
                Request Details
              </h3>
            </div>

            <div className="space-y-6 p-6">
              {/* Physician */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-slate-400" /> Physician
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsManualPhysician(!isManualPhysician);
                      setPhysicianId('');
                      setPhysicianName('');
                    }}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 select-none cursor-pointer"
                  >
                    Enter manually
                    <div
                      className={`relative h-4 w-8 rounded-full transition-colors ${isManualPhysician ? 'bg-emerald-600' : 'bg-slate-200'}`}
                    >
                      <div
                        className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${isManualPhysician ? 'translate-x-4.5' : 'translate-x-0.5'}`}
                      />
                    </div>
                  </button>
                </div>

                {isManualPhysician ? (
                  <input
                    type="text"
                    value={physicianName}
                    onChange={(e) => setPhysicianName(e.target.value)}
                    placeholder="Physician's full name (e.g. Dr. John Earl)"
                    className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition-all focus:border-emerald-500 bg-white"
                  />
                ) : (
                  <select
                    value={physicianId}
                    onChange={(e) => setPhysicianId(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition-all focus:border-emerald-500 bg-white"
                  >
                    <option value="">Select a physician...</option>
                    {dbPhysicians.map((doc) => (
                      <option key={doc.user_id} value={doc.user_id}>
                        {doc.username}
                      </option>
                    ))}
                  </select>
                )}

                {formErrors.physician && (
                  <p className="text-xs font-semibold text-red-500 mt-1">{formErrors.physician}</p>
                )}
              </div>

              {/* Test type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <FlaskConical className="h-3.5 w-3.5 text-slate-400" /> Test Type
                </label>
                <select
                  value={testType}
                  onChange={(e) => {
                    setTestType(e.target.value);
                    setOtherTestDescription('');
                  }}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none transition-all focus:border-emerald-500 bg-white"
                >
                  <option value="Urinalysis - Routine">Urinalysis - Routine</option>
                  <option value="Urinalysis - Complete Suite">Urinalysis - Complete Suite</option>
                  <option value="OTHER">Other</option>
                </select>

                {testType === 'OTHER' && (
                  <input
                    type="text"
                    value={otherTestDescription}
                    onChange={(e) => setOtherTestDescription(e.target.value)}
                    placeholder="Describe the test..."
                    className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition-all focus:border-emerald-500 bg-white animate-slideDown"
                  />
                )}
                {formErrors.testType && (
                  <p className="text-xs font-semibold text-red-500 mt-1">{formErrors.testType}</p>
                )}
              </div>

              {/* Clinical notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Clinical Notes / Diagnosis
                  </label>
                  <textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Relevant symptoms, diagnosis, or patient history..."
                    className="w-full min-h-25 max-h-35 rounded-xl border border-slate-200 p-3 text-sm outline-none transition-all focus:border-emerald-500 bg-white resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Special Handling Instructions
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. keep refrigerated, mark as STAT..."
                    className="w-full min-h-25 max-h-35 rounded-xl border border-slate-200 p-3 text-sm outline-none transition-all focus:border-emerald-500 bg-white resize-none"
                  />
                </div>
              </div>

              {formErrors.submit && (
                <div className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600 border border-red-200">
                  {formErrors.submit}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
              <Button type="button" variant="secondary" onClick={handleClearForm}>
                Clear Form
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-[#005B4B] hover:bg-[#004D3F]"
                loading={requestMutation.isPending}
              >
                {requestMutation.isPending ? (
                  'Submitting...'
                ) : (
                  <>
                    Submit Request <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar — summary of what's about to be submitted */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-sm">
            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Request Summary
              </h4>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200 text-slate-600 shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">
                    Patient
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                    {selectedPatient ? selectedPatient.patient_uid : 'No patient selected yet'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl bg-slate-50 border border-slate-100/70 p-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">
                    Physician
                  </span>
                  <span className="text-slate-700 font-bold truncate max-w-37.5">
                    {currentPreviewPhysician || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">
                    Test
                  </span>
                  <span className="text-slate-600 font-semibold truncate max-w-35">
                    {testType === 'OTHER' ? otherTestDescription || 'Custom test' : testType}
                  </span>
                </div>
              </div>

              <div className="flex justify-center pt-1">
                <Badge variant="default">
                  <Clipboard className="h-2.5 w-2.5" /> Not submitted yet
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
