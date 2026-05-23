import React, { useEffect, useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { LabRequestPayload, LabRequestResponse } from '../../types/types';

import {
  Search, User, Loader2, ArrowRight, CheckCircle2, RotateCcw,
  Clipboard, AlertTriangle, ShieldCheck, X, FlaskConical, Stethoscope
} from 'lucide-react';

import { Helmet } from 'react-helmet-async';

<Helmet>
  <title>Lab Request — UroLens</title>
</Helmet>

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const getTimestamp = () => new Date().toTimeString().split(' ')[0];

interface PatientSearchResult {
  patient_id: string;
  patient_uid: string;
  first_name: string;
  last_name: string;
}

export default function LabRequestForm() {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------------------
  // CORE STATE ENGINE LAYERS
  // ----------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [dbPhysicians, setDbPhysicians] = useState<Array<{ user_id: string; name: string }>>([]);
  const [isManualPhysician, setIsManualPhysician] = useState(false);
  const [physicianId, setPhysicianId] = useState('');
  const [physicianName, setPhysicianName] = useState('');

  const [testType, setTestType] = useState('Urinalysis - Routine');
  const [otherTestDescription, setOtherTestDescription] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [sessionLogs, setSessionLogs] = useState<Array<{ time: string; text: string }>>([
    { time: getTimestamp(), text: 'Lab request system interface online.' },
  ]);

  const [confirmationData, setConfirmationData] = useState<(LabRequestResponse & {
    patientName: string;
    physician: string;
    test: string;
  }) | null>(null);

  // ----------------------------------------------------------------
  // DEBOUNCED PATIENT SEARCH CONTROLLER
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/intake/patients/search?q=${searchQuery}`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Patient query operational exception:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Dismiss dropdown menu cleanly if user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ----------------------------------------------------------------
  // SEED INITIAL DATA: FETCH PHYSICIANS
  // ----------------------------------------------------------------
  useEffect(() => {
    const fetchPhysicians = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/lab-requests/physicians`);
        if (response.ok) {
          const data = await response.json();
          setDbPhysicians(data);
        }
      } catch (err) {
        console.error("Physician catalog catalog trace failed:", err);
      }
    };
    fetchPhysicians();
  }, []);

  const addLog = (text: string) => {
    setSessionLogs((prev) => [{ time: getTimestamp(), text }, ...prev]);
  };

  // ----------------------------------------------------------------
  // SUBMISSION MUTATION LAYER
  // ----------------------------------------------------------------
  const requestMutation = useMutation({
    mutationFn: async (payload: LabRequestPayload): Promise<LabRequestResponse> => {
      const response = await fetch(`${API_BASE_URL}/lab-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.detail || 'Unable to finalize ledger line write parameters.');
      }
      return response.json();
    },
    onSuccess: (data) => {
      const matchedPhysician = dbPhysicians.find((p) => p.user_id === physicianId);
      const displayPhysician = isManualPhysician ? physicianName : matchedPhysician?.name || 'Not specified';

      setConfirmationData({
        ...data,
        patientName: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Unknown',
        physician: displayPhysician,
        test: testType === 'OTHER' ? otherTestDescription : testType,
      });
      addLog(`Success: Created Lab Request UID [${data.request_id || 'OK'}]`);
    },
    onError: (error: any) => {
      setFormErrors((prev) => ({ ...prev, submit: error.message }));
      addLog('Error: Submission aborted due to pipeline rejection.');
    },
  });

  // ----------------------------------------------------------------
  // WORKSPACE ACTION HANDLERS
  // ----------------------------------------------------------------
  const handleSelectPatient = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    setFormErrors((prev) => { const n = { ...prev }; delete n.patient; return n; });
    addLog(`Linked Patient Record Context: ${patient.first_name} ${patient.last_name}`);
  };

  const handleClearForm = () => {
    setSelectedPatient(null);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setShowDropdown(false);
    setPhysicianId('');
    setPhysicianName('');
    setIsManualPhysician(false);
    setTestType('Urinalysis - Routine');
    setOtherTestDescription('');
    setClinicalNotes('');
    setSpecialInstructions('');
    setFormErrors({});
    addLog('Workspace inputs reset completely.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    const errors: Record<string, string> = {};

    if (!selectedPatient) errors.patient = 'Please select an active patient registry envelope.';
    if (testType === 'OTHER' && !otherTestDescription.trim()) errors.testType = 'Custom test parameters require description text.';
    if (isManualPhysician && !physicianName.trim()) errors.physician = 'Manual entries require practitioner validation name.';
    if (!isManualPhysician && !physicianId) errors.physician = 'Please assign an authenticated staff physician entry.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addLog('Validation Warning: Submission checked out with incomplete parameters.');
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
  const currentPreviewPhysician = isManualPhysician ? physicianName : selectedPhysicianObject?.name || '';

  // ----------------------------------------------------------------
  // SCREEN CANVAS 1: SUCCESS OVERLAY VIEWPORT
  // ----------------------------------------------------------------
  if (confirmationData) {
    return (
      <div className="max-w-xl mx-auto py-12 animate-fadeIn font-sans">
        <div className="relative overflow-hidden rounded-[32px] bg-white p-8 lg:p-10 shadow-md border border-slate-200">
          <div className="relative space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Lab Request Encoded Successfully</h2>
                <p className="mt-1 text-xs text-slate-400">Transaction written to database subledgers cleanly.</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Request Unique UID</span>
                <span className="font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded border border-emerald-200/40">{confirmationData.request_id || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Patient Profile</span>
                <span className="font-black text-slate-800">{confirmationData.patientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Assigned Physician</span>
                <span className="font-semibold text-slate-700">{confirmationData.physician}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Diagnostic Panel Order</span>
                <span className="font-semibold text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">{confirmationData.test}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Workflow Token Flag</span>
                <span className="bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded uppercase tracking-wider text-[9px]">PENDING SAMPLE</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setConfirmationData(null); handleClearForm(); }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-bold text-white transition-all hover:bg-slate-800 cursor-pointer shadow-sm"
            >
              <RotateCcw className="h-4 w-4" /> Open Fresh Request Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // SCREEN CANVAS 2: CORE WORKSPACE DESK
  // ----------------------------------------------------------------
  return (
    <div className="w-full bg-[#F4F7F5] font-sans text-slate-800 tracking-tight">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-[1400px] mx-auto">
        
        {/* LEFT COLUMN MAIN FORMS WORKSPACE */}
        <div className="space-y-6 lg:col-span-2">

          {/* DYNAMIC SEARCH OVERLAY INPUT BLOCK */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs relative" ref={dropdownRef}>
            <div className="mb-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] text-white font-mono">1</span>
                Patient Selection Core
              </h3>
              <p className="mt-1 text-xs text-slate-400">Query patient records by lookup identity indices.</p>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                disabled={!!selectedPatient}
                placeholder="Search active patient identity directory by name indexes..."
                className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-xs outline-none transition-all focus:border-emerald-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
              />

              {selectedPatient && (
                <button
                  type="button"
                  onClick={() => { setSelectedPatient(null); addLog('Patient link un-mapped.'); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Unlink
                </button>
              )}
            </div>

            {/* FLOATING OVERLAY MATRIX PREVENTS SHIFTING BODY ELEMENTS */}
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
                        <p className="text-xs font-bold text-slate-900">{patient.first_name} {patient.last_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{patient.patient_uid}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* NEGATIVE SEARCH LOOKUP RESPONSE BOUNDARY NOTICE */}
            {hasSearched && searchResults.length === 0 && !isSearching && searchQuery.trim().length > 0 && (
              <div className="mt-3 bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-amber-800 animate-fadeIn">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">No Demographic Indexes Found</h4>
                  <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">Ensure spelling parameters are accurate or open Patient Registration to create an account.</p>
                </div>
              </div>
            )}

            {formErrors.patient && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-600 border border-red-200 text-xs font-semibold">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>{formErrors.patient}</p>
              </div>
            )}
          </div>

          {/* MAIN ORDER ENCODING ENGINE PANEL */}
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] text-white font-mono">2</span>
                Lab Request Specification Form
              </h3>
            </div>

            <div className="space-y-6 p-6">
              
              {/* PHYSICIAN CATALOG INPUT TOGGLE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-slate-400" /> Authorized Physician
                  </label>

                  <button
                    type="button"
                    onClick={() => { setIsManualPhysician(!isManualPhysician); setPhysicianId(''); setPhysicianName(''); }}
                    className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase select-none cursor-pointer tracking-wider"
                  >
                    Manual Field Write
                    <div className={`relative h-4 w-8 rounded-full transition-colors ${isManualPhysician ? 'bg-emerald-600' : 'bg-slate-200'}`}>
                      <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${isManualPhysician ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                </div>

                {isManualPhysician ? (
                  <input
                    type="text"
                    value={physicianName}
                    onChange={(e) => setPhysicianName(e.target.value)}
                    placeholder="Enter full practitioner title (e.g. Dr. John Earl)..."
                    className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs outline-none transition-all focus:border-emerald-500 bg-white"
                  />
                ) : (
                  <select
                    value={physicianId}
                    onChange={(e) => setPhysicianId(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs outline-none transition-all focus:border-emerald-500 bg-white"
                  >
                    <option value="">Select an active medical staff practitioner...</option>
                    {dbPhysicians.map((doc) => (
                      <option key={doc.user_id} value={doc.user_id}>{doc.name}</option>
                    ))}
                  </select>
                )}

                {formErrors.physician && <p className="text-[11px] font-semibold text-red-500 mt-1">{formErrors.physician}</p>}
              </div>

              {/* DIAGNOSTIC TEST PANEL SELECT DECK */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <FlaskConical className="h-3.5 w-3.5 text-slate-400" /> Laboratory Order Panel
                </label>
                <select
                  value={testType}
                  onChange={(e) => { setTestType(e.target.value); setOtherTestDescription(''); }}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs outline-none transition-all focus:border-emerald-500 bg-white"
                >
                  <option value="Urinalysis - Routine">Urinalysis - Routine</option>
                  <option value="Urinalysis - Complete Suite">Urinalysis - Complete Suite</option>
                  <option value="OTHER">Other Custom Panel Spec</option>
                </select>

                {testType === 'OTHER' && (
                  <input
                    type="text"
                    value={otherTestDescription}
                    onChange={(e) => setOtherTestDescription(e.target.value)}
                    placeholder="Provide explicit test protocol description label..."
                    className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs outline-none transition-all focus:border-emerald-500 bg-white animate-slideDown"
                  />
                )}
                {formErrors.testType && <p className="text-[11px] font-semibold text-red-500 mt-1">{formErrors.testType}</p>}
              </div>

              {/* CLINICAL NOTE TEXTAREAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Clinical Notes / Diagnosis</label>
                  <textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Input descriptive case findings or patient history strings..."
                    className="w-full min-h-[100px] max-h-[140px] rounded-xl border border-slate-200 p-3 text-xs outline-none transition-all focus:border-emerald-500 bg-white resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Special Handling Instructions</label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Specify storage conditions or urgent STAT flags if needed..."
                    className="w-full min-h-[100px] max-h-[140px] rounded-xl border border-slate-200 p-3 text-xs outline-none transition-all focus:border-emerald-500 bg-white resize-none"
                  />
                </div>
              </div>

              {formErrors.submit && <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-200">{formErrors.submit}</div>}
            </div>

            {/* ACTION FOOTER BAR DECK */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                onClick={handleClearForm}
                className="h-10 rounded-xl bg-white px-4 text-xs font-bold text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={requestMutation.isPending}
                className="h-10 rounded-xl bg-[#005B4B] hover:bg-[#004D3F] px-5 text-xs font-bold text-white transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {requestMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Finalizing Trace...
                  </>
                ) : (
                  <>
                    Submit Request <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN SIDEBAR SUMMARY LOG PANELS */}
        <div className="space-y-6">
          
          {/* COMPACT ROUTE SUMMARY VIEWPORT PANEL */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-xs">
            <div className="mb-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Live Request Summary</h4>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200 text-slate-600 shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none">Linked Account</p>
                  <p className="text-xs font-black text-slate-800 mt-1 truncate">
                    {selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : '[Awaiting Patient Link]'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl bg-slate-50 border border-slate-100/70 p-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">Physician:</span>
                  <span className="text-slate-700 font-bold truncate max-w-[150px]">{currentPreviewPhysician || 'Not selected'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wide">Test Panel:</span>
                  <span className="text-slate-600 font-semibold truncate max-w-[140px]">
                    {testType === 'OTHER' ? otherTestDescription || 'Custom Protocol' : testType}
                  </span>
                </div>
              </div>

              <div className="flex justify-center pt-1">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-500 font-bold text-[9px] uppercase tracking-wider rounded-full shadow-2xs">
                  <Clipboard className="h-2.5 w-2.5" /> Awaiting Submission
                </span>
              </div>
            </div>
          </div>

          {/* AUDIT SYSTEMACTIVITY LEDGER FEED CONSOLE */}
          <div className="overflow-hidden rounded-2xl bg-slate-950 border border-slate-900 shadow-sm">
            <div className="border-b border-slate-800/80 px-4 py-3 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
              <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-wider font-mono">Session Activity</h4>
            </div>
            <div className="max-h-56 overflow-y-auto p-4 divide-y divide-slate-900 font-mono text-[10px] leading-relaxed">
              {sessionLogs.map((log, index) => (
                <div key={index} className="py-1 flex items-start gap-3">
                  <span className="text-slate-600 shrink-0 select-none">{log.time}</span>
                  <span className="text-slate-400 flex-1 truncate">{log.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}