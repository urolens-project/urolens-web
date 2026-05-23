import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type {
  LabRequestPayload,
  LabRequestResponse,
} from '../../types/types';

import {
  Search,
  User,
  Loader2,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Clipboard,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const getTimestamp = () =>
  new Date().toTimeString().split(' ')[0];

interface PatientSearchResult {
  patient_id: string;
  patient_uid: string;
  first_name: string;
  last_name: string;
}

export default function LabRequestForm() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] =
    useState<PatientSearchResult | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    PatientSearchResult[]
  >([]);

  const [dbPhysicians, setDbPhysicians] = useState<
    Array<{ user_id: string; name: string }>
  >([]);

  const [isManualPhysician, setIsManualPhysician] =
    useState(false);

  const [physicianId, setPhysicianId] = useState('');
  const [physicianName, setPhysicianName] = useState('');

  const [testType, setTestType] = useState(
    'Urinalysis - Routine'
  );

  const [otherTestDescription, setOtherTestDescription] =
    useState('');

  const [clinicalNotes, setClinicalNotes] = useState('');
  const [specialInstructions, setSpecialInstructions] =
    useState('');

  const [formErrors, setFormErrors] = useState<
    Record<string, string>
  >({});

  const [sessionLogs, setSessionLogs] = useState<
    Array<{ time: string; text: string }>
  >([
    {
      time: getTimestamp(),
      text: 'Lab request interface initialized.',
    },
  ]);

  const [confirmationData, setConfirmationData] =
    useState<
      (LabRequestResponse & {
        patientName: string;
        physician: string;
        test: string;
      }) | null
    >(null);

  // ----------------------------------------------------------------
  // SEARCH PATIENTS
  // ----------------------------------------------------------------

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/intake/patients/search?q=${searchQuery}`
        );

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // ----------------------------------------------------------------
  // FETCH PHYSICIANS
  // ----------------------------------------------------------------

  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/lab-requests/physicians`
        );

        if (response.ok) {
          const data = await response.json();
          setDbPhysicians(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPhysicians();
  }, []);

  // ----------------------------------------------------------------
  // LOGS
  // ----------------------------------------------------------------

  const addLog = (text: string) => {
    setSessionLogs((prev) => [
      { time: getTimestamp(), text },
      ...prev,
    ]);
  };

  // ----------------------------------------------------------------
  // MUTATION
  // ----------------------------------------------------------------

  const requestMutation = useMutation({
    mutationFn: async (
      payload: LabRequestPayload
    ): Promise<LabRequestResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/lab-requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const err = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          err?.detail ||
            'Unable to submit request. Please try again.'
        );
      }

      return response.json();
    },

    onSuccess: (data) => {
      const matchedPhysician = dbPhysicians.find(
        (p) => p.user_id === physicianId
      );

      const displayPhysician = isManualPhysician
        ? physicianName
        : matchedPhysician?.name || 'Not specified';

      setConfirmationData({
        ...data,
        patientName: selectedPatient
          ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
          : 'Unknown',
        physician: displayPhysician,
        test:
          testType === 'OTHER'
            ? otherTestDescription
            : testType,
      });

      addLog(`Request submitted successfully.`);
    },

    onError: (error: any) => {
      setFormErrors((prev) => ({
        ...prev,
        submit: error.message,
      }));

      addLog('Request submission failed.');
    },
  });

  // ----------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------

  const handleSelectPatient = (
    patient: PatientSearchResult
  ) => {
    setSelectedPatient(patient);
    setSearchQuery('');
    setSearchResults([]);

    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.patient;
      return next;
    });

    addLog(
      `Patient linked: ${patient.first_name} ${patient.last_name}`
    );
  };

  const handleClearForm = () => {
    setSelectedPatient(null);
    setSearchQuery('');
    setPhysicianId('');
    setPhysicianName('');
    setIsManualPhysician(false);

    setTestType('Urinalysis - Routine');

    setOtherTestDescription('');
    setClinicalNotes('');
    setSpecialInstructions('');

    setFormErrors({});

    addLog('Form cleared.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setFormErrors({});

    const errors: Record<string, string> = {};

    if (!selectedPatient) {
      errors.patient = 'Please select a patient.';
    }

    if (
      testType === 'OTHER' &&
      !otherTestDescription.trim()
    ) {
      errors.testType =
        'Please provide a custom test description.';
    }

    if (
      isManualPhysician &&
      !physicianName.trim()
    ) {
      errors.physician =
        'Please enter the physician name.';
    }

    if (!isManualPhysician && !physicianId) {
      errors.physician =
        'Please select a physician.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      addLog('Validation failed.');

      return;
    }

    const payload: LabRequestPayload = {
      patient_id: selectedPatient!.patient_id,

      physician_id: isManualPhysician
        ? undefined
        : physicianId,

      physician_name: isManualPhysician
        ? physicianName.trim()
        : undefined,

      test_type:
        testType === 'OTHER'
          ? otherTestDescription.trim()
          : testType,

      clinical_notes: `
${clinicalNotes}

Special Instructions:
${specialInstructions}
      `.trim(),
    };

    requestMutation.mutate(payload);
  };

  // ----------------------------------------------------------------
  // DERIVED STATE
  // ----------------------------------------------------------------

  const selectedPhysicianObject = dbPhysicians.find(
    (p) => p.user_id === physicianId
  );

  const currentPreviewPhysician =
    isManualPhysician
      ? physicianName
      : selectedPhysicianObject?.name || '';

  // ----------------------------------------------------------------
  // SUCCESS SCREEN
  // ----------------------------------------------------------------

  if (confirmationData) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-fadeIn">
        <div
          className="
          relative overflow-hidden
          rounded-[32px]
          bg-white
          p-10
          shadow-[0_20px_80px_rgba(16,185,129,0.08)]
          ring-1 ring-emerald-100
        "
        >
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" />

          <div className="relative space-y-8">
            <div className="flex items-start gap-4">
              <div
                className="
                flex h-14 w-14 items-center justify-center
                rounded-2xl
                bg-emerald-50
                text-emerald-600
                ring-1 ring-emerald-100
              "
              >
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Request submitted
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  The laboratory request has been
                  successfully created.
                </p>
              </div>
            </div>

            <div
              className="
              rounded-3xl
              bg-slate-50
              p-6
              space-y-5
            "
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Request ID
                </span>

                <span
                  className="
                  rounded-xl
                  bg-emerald-100
                  px-3 py-1.5
                  text-sm font-semibold
                  text-emerald-700
                "
                >
                  {confirmationData.request_id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Patient
                </span>

                <span className="text-sm font-semibold text-slate-800">
                  {confirmationData.patientName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Physician
                </span>

                <span className="text-sm font-medium text-slate-700">
                  {confirmationData.physician}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Test
                </span>

                <span className="text-sm font-medium text-slate-700">
                  {confirmationData.test}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Status
                </span>

                <span
                  className="
                  rounded-full
                  bg-amber-100
                  px-3 py-1
                  text-xs font-semibold
                  text-amber-700
                "
                >
                  Pending Sample
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setConfirmationData(null);
                handleClearForm();
              }}
              className="
                flex h-12 w-full items-center justify-center gap-2
                rounded-2xl
                bg-slate-900
                text-sm font-medium text-white
                transition-all
                hover:bg-slate-800
              "
            >
              <RotateCcw className="h-4 w-4" />
              Create Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // MAIN UI
  // ----------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f6f8f7] px-6 py-8 text-slate-800">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* LEFT SIDE */}
        <div className="space-y-8 lg:col-span-2">

          {/* PATIENT SEARCH */}
          <div
            className="
            rounded-[28px]
            bg-white/90
            p-7
            shadow-[0_4px_24px_rgba(15,23,42,0.04)]
            ring-1 ring-slate-100
            backdrop-blur-xl
          "
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Patient Selection
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search and select a patient record.
              </p>
            </div>

            <div className="relative">
              {isSearching ? (
                <Loader2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-600" />
              ) : (
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              )}

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                disabled={!!selectedPatient}
                placeholder="Search patient by name or ID..."
                className="
                h-12 w-full rounded-2xl
                bg-slate-50
                pl-11 pr-4
                text-sm
                outline-none
                ring-1 ring-transparent
                transition-all
                focus:bg-white
                focus:ring-2 focus:ring-emerald-500
                disabled:opacity-60
              "
              />

              {selectedPatient && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(null);
                    addLog('Patient unlinked.');
                  }}
                  className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  rounded-xl
                  bg-red-50
                  px-3 py-1.5
                  text-xs font-medium text-red-600
                  transition-colors
                  hover:bg-red-100
                "
                >
                  Remove
                </button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div
                className="
                mt-3 overflow-hidden rounded-2xl
                bg-white
                shadow-xl
                ring-1 ring-slate-200
              "
              >
                {searchResults.map((patient) => (
                  <button
                    type="button"
                    key={patient.patient_id}
                    onClick={() =>
                      handleSelectPatient(patient)
                    }
                    className="
                    flex w-full items-center justify-between
                    px-4 py-3
                    text-left
                    transition-colors
                    hover:bg-slate-50
                  "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                        flex h-9 w-9 items-center justify-center
                        rounded-xl
                        bg-slate-100
                      "
                      >
                        <User className="h-4 w-4 text-slate-500" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {patient.first_name}{' '}
                          {patient.last_name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {patient.patient_uid}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {formErrors.patient && (
              <div
                className="
                mt-4 flex items-start gap-3
                rounded-2xl
                bg-red-50
                p-4
                text-red-600
              "
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

                <p className="text-sm font-medium">
                  {formErrors.patient}
                </p>
              </div>
            )}
          </div>

          {/* MAIN FORM */}
          <form
            onSubmit={handleSubmit}
            className="
            rounded-[28px]
            bg-white
            shadow-[0_4px_24px_rgba(15,23,42,0.04)]
            ring-1 ring-slate-100
            overflow-hidden
          "
          >
            <div className="border-b border-slate-100 px-7 py-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Lab Request
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create a laboratory request for the
                selected patient.
              </p>
            </div>

            <div className="space-y-8 p-7">

              {/* PHYSICIAN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600">
                    Physician
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setIsManualPhysician(
                        !isManualPhysician
                      );

                      setPhysicianId('');
                      setPhysicianName('');
                    }}
                    className="
                    flex items-center gap-2
                    text-xs font-medium
                    text-slate-500
                  "
                  >
                    Manual Entry

                    <div
                      className={`
                      relative h-5 w-9 rounded-full transition-colors
                      ${
                        isManualPhysician
                          ? 'bg-emerald-600'
                          : 'bg-slate-300'
                      }
                    `}
                    >
                      <div
                        className={`
                        absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform
                        ${
                          isManualPhysician
                            ? 'translate-x-4'
                            : 'translate-x-0.5'
                        }
                      `}
                      />
                    </div>
                  </button>
                </div>

                {isManualPhysician ? (
                  <input
                    type="text"
                    value={physicianName}
                    onChange={(e) =>
                      setPhysicianName(
                        e.target.value
                      )
                    }
                    placeholder="Enter physician name..."
                    className="
                    h-12 w-full rounded-2xl
                    bg-slate-50
                    px-4
                    text-sm
                    outline-none
                    ring-1 ring-transparent
                    transition-all
                    focus:bg-white
                    focus:ring-2 focus:ring-emerald-500
                  "
                  />
                ) : (
                  <select
                    value={physicianId}
                    onChange={(e) =>
                      setPhysicianId(e.target.value)
                    }
                    className="
                    h-12 w-full rounded-2xl
                    bg-slate-50
                    px-4
                    text-sm
                    outline-none
                    ring-1 ring-transparent
                    transition-all
                    focus:bg-white
                    focus:ring-2 focus:ring-emerald-500
                  "
                  >
                    <option value="">
                      Select physician
                    </option>

                    {dbPhysicians.map((doc) => (
                      <option
                        key={doc.user_id}
                        value={doc.user_id}
                      >
                        {doc.name}
                      </option>
                    ))}
                  </select>
                )}

                {formErrors.physician && (
                  <p className="text-sm text-red-500">
                    {formErrors.physician}
                  </p>
                )}
              </div>

              {/* TEST */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-600">
                  Laboratory Test
                </label>

                <select
                  value={testType}
                  onChange={(e) => {
                    setTestType(e.target.value);
                    setOtherTestDescription('');
                  }}
                  className="
                  h-12 w-full rounded-2xl
                  bg-slate-50
                  px-4
                  text-sm
                  outline-none
                  ring-1 ring-transparent
                  transition-all
                  focus:bg-white
                  focus:ring-2 focus:ring-emerald-500
                "
                >
                  <option value="Urinalysis - Routine">
                    Urinalysis - Routine
                  </option>

                  <option value="Urinalysis - Complete Suite">
                    Urinalysis - Complete Suite
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>

                {testType === 'OTHER' && (
                  <input
                    type="text"
                    value={otherTestDescription}
                    onChange={(e) =>
                      setOtherTestDescription(
                        e.target.value
                      )
                    }
                    placeholder="Enter custom test..."
                    className="
                    h-12 w-full rounded-2xl
                    bg-slate-50
                    px-4
                    text-sm
                    outline-none
                    ring-1 ring-transparent
                    transition-all
                    focus:bg-white
                    focus:ring-2 focus:ring-emerald-500
                  "
                  />
                )}

                {formErrors.testType && (
                  <p className="text-sm text-red-500">
                    {formErrors.testType}
                  </p>
                )}
              </div>

              {/* NOTES */}
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Clinical Notes
                  </label>

                  <textarea
                    value={clinicalNotes}
                    onChange={(e) =>
                      setClinicalNotes(
                        e.target.value
                      )
                    }
                    placeholder="Add clinical notes..."
                    className="
                    min-h-[120px] w-full rounded-2xl
                    bg-slate-50
                    px-4 py-3
                    text-sm
                    outline-none
                    resize-none
                    ring-1 ring-transparent
                    transition-all
                    focus:bg-white
                    focus:ring-2 focus:ring-emerald-500
                  "
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Special Instructions
                  </label>

                  <textarea
                    value={specialInstructions}
                    onChange={(e) =>
                      setSpecialInstructions(
                        e.target.value
                      )
                    }
                    placeholder="Add special instructions..."
                    className="
                    min-h-[120px] w-full rounded-2xl
                    bg-slate-50
                    px-4 py-3
                    text-sm
                    outline-none
                    resize-none
                    ring-1 ring-transparent
                    transition-all
                    focus:bg-white
                    focus:ring-2 focus:ring-emerald-500
                  "
                  />
                </div>
              </div>

              {formErrors.submit && (
                <div
                  className="
                  rounded-2xl
                  bg-red-50
                  p-4
                  text-sm font-medium text-red-600
                "
                >
                  {formErrors.submit}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div
              className="
              flex items-center justify-end gap-3
              border-t border-slate-100
              bg-slate-50/70
              px-7 py-5
            "
            >
              <button
                type="button"
                onClick={handleClearForm}
                className="
                h-11 rounded-2xl
                bg-white
                px-5
                text-sm font-medium text-slate-600
                ring-1 ring-slate-200
                transition-all
                hover:bg-slate-50
              "
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={requestMutation.isPending}
                className="
                flex h-11 items-center gap-2
                rounded-2xl
                bg-[#005B4B]
                px-5
                text-sm font-medium text-white
                transition-all
                hover:bg-[#004D3F]
                disabled:opacity-50
              "
              >
                {requestMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6 sticky top-6 self-start">

          {/* PREVIEW */}
          <div
            className="
            rounded-[28px]
            bg-white/80
            p-6
            shadow-[0_4px_24px_rgba(15,23,42,0.04)]
            ring-1 ring-slate-100
            backdrop-blur-xl
          "
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Request Preview
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Live request summary.
              </p>
            </div>

            <div className="space-y-5">
              <div
                className="
                flex items-center gap-4
                rounded-2xl
                bg-slate-50
                p-4
              "
              >
                <div
                  className="
                  flex h-11 w-11 items-center justify-center
                  rounded-2xl
                  bg-white
                  ring-1 ring-slate-200
                "
                >
                  <User className="h-5 w-5 text-slate-500" />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Patient
                  </p>

                  <p className="text-sm font-semibold text-slate-800">
                    {selectedPatient
                      ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
                      : 'No patient selected'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Physician
                  </span>

                  <span className="text-sm font-medium text-slate-700">
                    {currentPreviewPhysician ||
                      'Not selected'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Test
                  </span>

                  <span className="text-sm font-medium text-slate-700">
                    {testType === 'OTHER'
                      ? otherTestDescription ||
                        'Custom test'
                      : testType}
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <div
                  className="
                  inline-flex items-center gap-2
                  rounded-full
                  bg-slate-100
                  px-4 py-2
                  text-xs font-medium text-slate-600
                "
                >
                  <Clipboard className="h-3.5 w-3.5" />
                  Awaiting Submission
                </div>
              </div>
            </div>
          </div>

          {/* LOGS */}
          <div
            className="
            overflow-hidden rounded-[28px]
            bg-slate-950
            shadow-[0_4px_24px_rgba(15,23,42,0.08)]
          "
          >
            <div className="border-b border-slate-800 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-500" />

                <h4 className="text-sm font-medium text-slate-200">
                  Session Activity
                </h4>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-5">
              <div className="space-y-4">
                {sessionLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex gap-3"
                  >
                    <span className="font-mono text-xs text-slate-500">
                      {log.time}
                    </span>

                    <span className="text-xs text-slate-300">
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}