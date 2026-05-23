import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { SpecimenReceivePayload, SpecimenReceiveResponse } from '../../types/types';
import { 
  Search, Clipboard, AlertTriangle, User, Loader2, FlaskConical,
  ArrowRight, ShieldCheck, CheckCircle2, RotateCcw, 
  XCircle, Beaker, FilePlus
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const getTimestamp = () => new Date().toTimeString().split(' ')[0];

interface LabRequestSearchResult {
  lab_request_id: string;
  request_uid: string;
  test_type: string;
  physician_name: string;
  patient_id: string;
}

// ----------------------------------------------------------------
// 1. LAB REQUEST SEARCH PANEL (SUB-COMPONENT)
// ----------------------------------------------------------------
interface SearchPanelProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  isSearching: boolean;
  searchResults: LabRequestSearchResult[];
  selectedRequest: LabRequestSearchResult | null;
  onSelectRequest: (req: LabRequestSearchResult) => void;
  onClearSelection: () => void;
  hasSearched: boolean;
}

function LabRequestSearchPanel({
  searchQuery,
  setSearchQuery,
  isSearching,
  searchResults,
  selectedRequest,
  onSelectRequest,
  onClearSelection,
  hasSearched
}: SearchPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] text-white font-mono">1</span>
          Lab Request Search Panel
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200/60 font-mono">
          Filter: PENDING_SAMPLE
        </span>
      </div>
      
      <div className="relative">
        {isSearching ? (
          <Loader2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 animate-spin" />
        ) : (
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        
        <input
          type="text"
          placeholder="Query by Request UID sequence or Physician name (e.g. REQ-2026...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={!!selectedRequest}
          className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-xs outline-none transition-all focus:border-emerald-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
        />
        {selectedRequest && (
          <button 
            type="button"
            onClick={onClearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Unlink Request
          </button>
        )}
      </div>

      {searchResults.length > 0 && !selectedRequest && (
        <div className="border border-slate-200 bg-white rounded-xl shadow-lg divide-y divide-slate-100 overflow-hidden max-h-48 overflow-y-auto z-10 relative">
          {searchResults.map((req) => (
            <div
              key={req.lab_request_id}
              onClick={() => onSelectRequest(req)}
              className="p-3 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-mono font-bold text-slate-900">{req.request_uid}</span>
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-slate-600">{req.test_type}</span>
              </div>
              <span className="text-[10px] font-medium text-slate-400">Dr. {req.physician_name || 'Unspecified'}</span>
            </div>
          ))}
        </div>
      )}

      {hasSearched && searchQuery.trim().length > 0 && searchResults.length === 0 && !selectedRequest && !isSearching && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3 text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black">No Active Lab Request Sequence Found</h4>
              <p className="text-[11px] text-amber-700/90 mt-0.5 leading-relaxed">
                As dictated by laboratory workflow safeguards, a specimen cannot be logged unless its order has been pre-encoded.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/intake/request')}
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition-colors cursor-pointer"
          >
            <FilePlus className="h-3 w-3" /> Execute Lab Request Encoding First
          </button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------
// 2. RECEIVE SAMPLE FORM (SUB-COMPONENT)
// ----------------------------------------------------------------
interface ReceiveFormProps {
  selectedRequest: LabRequestSearchResult | null;
  visualCheckPassed: boolean;
  setVisualCheckPassed: (val: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (val: string) => void;
  freeTextNote: string;
  setFreeTextNote: (val: string) => void;
  formErrors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  isPending: boolean;
}

function ReceiveSampleForm({
  selectedRequest,
  visualCheckPassed,
  setVisualCheckPassed,
  rejectionReason,
  setRejectionReason,
  freeTextNote,
  setFreeTextNote,
  formErrors,
  onSubmit,
  onReset,
  isPending
}: ReceiveFormProps) {
  const [volCheck, setVolCheck] = useState(false);
  const [containerCheck, setContainerCheck] = useState(false);
  const [labelCheck, setLabelCheck] = useState(false);

  useEffect(() => {
    if (visualCheckPassed) {
      setVolCheck(true);
      setContainerCheck(true);
      setLabelCheck(true);
    } else {
      setVolCheck(false);
      setContainerCheck(false);
      setLabelCheck(false);
    }
  }, [visualCheckPassed]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] text-white font-mono">2</span>
          Receive Sample Form Canvas
        </h3>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">
            Mandatory Integrity Baseline Matrix
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer transition-all select-none ${volCheck ? 'border-emerald-200 bg-emerald-50/10 text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
              <input 
                type="checkbox" 
                checked={volCheck} 
                onChange={(e) => { setVolCheck(e.target.checked); if(!e.target.checked) setVisualCheckPassed(false); }}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5" 
              />
              <span className="text-[11px] font-semibold">Adequate Volume (≥30mL)</span>
            </label>

            <label className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer transition-all select-none ${containerCheck ? 'border-emerald-200 bg-emerald-50/10 text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
              <input 
                type="checkbox" 
                checked={containerCheck} 
                onChange={(e) => { setContainerCheck(e.target.checked); if(!e.target.checked) setVisualCheckPassed(false); }}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5" 
              />
              <span className="text-[11px] font-semibold">Sterile Container Lid Lock</span>
            </label>

            <label className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer transition-all select-none ${labelCheck ? 'border-emerald-200 bg-emerald-50/10 text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
              <input 
                type="checkbox" 
                checked={labelCheck} 
                onChange={(e) => { setLabelCheck(e.target.checked); if(!e.target.checked) setVisualCheckPassed(false); }}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5" 
              />
              <span className="text-[11px] font-semibold">Legible Match Profiling</span>
            </label>
          </div>
        </div>

        <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-slate-900 block">Overall Visual Check Passed Confirmation</label>
            <p className="text-[10px] text-slate-400 mt-0.5">Toggle to FAILED manually if any specimen parameter shows discrepancy.</p>
          </div>
          <button
            type="button"
            onClick={() => setVisualCheckPassed(!visualCheckPassed)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${visualCheckPassed ? 'bg-emerald-600' : 'bg-red-500'}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${visualCheckPassed ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {!visualCheckPassed && (
          <div className="p-5 bg-red-50/40 border border-red-200 rounded-xl space-y-4">
            <div className="flex items-start gap-2.5 text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold">Specimen Rejection Mapping Mode Active</h4>
                <p className="text-[10px] text-red-500 font-medium mt-0.5">Under code tracking rules, an explicitly chosen failure path is mandatory.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Structured Reason Code</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={`w-full h-11 rounded-xl border bg-white px-3 text-xs outline-none focus:border-red-500 transition-all ${formErrors.rejection ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}
              >
                <option value="">Select failure taxonomy group...</option>
                
                {}
                <option value="INSUFFICIENT_VOLUME">INSUFFICIENT_VOLUME (Specimen volume measures below 30mL)</option>
                <option value="WRONG_CONTAINER">WRONG_CONTAINER (Non-sterile or unapproved container type used)</option>
                <option value="UNLABELED">UNLABELED (Container missing complete patient identification elements)</option>
                <option value="OTHER">OTHER (Obvious contamination, leakage, or external damage anomalies)</option>
              </select>
              {formErrors.rejection && <p className="text-[10px] text-red-500 font-semibold mt-1">{formErrors.rejection}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Detailed Observations Notes</label>
              <textarea
                placeholder="Log granular visual check anomalies or notes for supervisor audit inspection pipelines..."
                value={freeTextNote}
                onChange={(e) => setFreeTextNote(e.target.value)}
                className="w-full min-h-[80px] py-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-red-500 transition-all font-sans resize-none"
              />
            </div>
          </div>
        )}

        {formErrors.request && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 font-semibold text-xs flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {formErrors.request}
          </div>
        )}

        {formErrors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 font-semibold text-xs">
            {formErrors.submit}
          </div>
        )}
      </div>

      <div className="bg-slate-50/60 border-t border-slate-100 p-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onReset}
          className="h-10 px-4 border border-purple-200 hover:bg-purple-50 text-purple-600 font-bold text-xs rounded-xl transition-all bg-white cursor-pointer"
        >
          Flush Fields
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending || !selectedRequest}
          className={`h-10 px-5 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${visualCheckPassed ? 'bg-[#005B4B] hover:bg-[#004D3F]' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {isPending ? 'Processing Matrix Commit...' : (visualCheckPassed ? 'Confirm Specimen Receipt' : 'Execute System Rejection Logs')}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// 3. SPECIMEN RECEIPT CONFIRMATION (SUB-COMPONENT CARD)
// ----------------------------------------------------------------
interface ConfirmationCardProps {
  data: SpecimenReceiveResponse & { requestUid: string; test: string };
  onReset: () => void;
}

function SpecimenReceiptConfirmation({ data, onReset }: ConfirmationCardProps) {
  const navigate = useNavigate();
  const isRejected = data.status === 'REJECTED';

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans tracking-tight pt-6">
      <div className={`bg-white border-2 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden ${isRejected ? 'border-red-500' : 'border-emerald-500'}`}>
        <div className={`absolute top-0 right-0 h-32 w-32 rounded-bl-full pointer-events-none ${isRejected ? 'bg-red-50/5' : 'bg-emerald-50/5'}`} />
        
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-full border flex items-center justify-center ${isRejected ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
            {isRejected ? <XCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              {isRejected ? 'Specimen Logged as Rejected' : 'Specimen Processing Step Complete'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">The pipeline ledger records have been safely updated inside the cloud.</p>
          </div>
        </div>

        <div className="border-y border-dashed border-slate-200 py-5 space-y-3.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">System Assigned UID</span>
            <span className={`font-mono font-black px-3 py-1 rounded-lg border tracking-widest text-sm ${isRejected ? 'bg-red-50 text-red-700 border-red-200/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200/50'}`}>
              {data.sample_uid || 'REJECTED_SAMPLE'}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Lab Request reference</span>
            <span className="font-bold text-slate-800 font-mono">{data.requestUid}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Diagnostic panel</span>
            <span className="font-bold text-slate-700">{data.test}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Workflow Record status</span>
            <span className={`font-extrabold text-[10px] uppercase tracking-wider text-white px-2.5 py-0.5 rounded-md shadow-xs ${isRejected ? 'bg-red-500' : 'bg-emerald-500'}`}>
              {isRejected ? 'SAMPLE_REJECTED' : 'SAMPLE_RECEIVED'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onReset}
            className="h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer bg-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Open New Intake Stream
          </button>
          
          {!isRejected && (
            <button
              type="button"
              onClick={() => navigate('/intake/queue')}
              className="h-11 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              Proceed to Barcode Labeling <Beaker className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// CORE MAIN PARENT WRAPPER ENGINE
// ----------------------------------------------------------------
export default function SpecimenReceivingForm() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LabRequestSearchResult | null>(null);
  const [visualCheckPassed, setVisualCheckPassed] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [freeTextNote, setFreeTextNote] = useState('');
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [sessionLogs, setSessionLogs] = useState<Array<{ time: string; text: string }>>([
    { time: getTimestamp(), text: 'Specimen intake dashboard online.' }
  ]);
  
  const [confirmationData, setConfirmationData] = useState<SpecimenReceiveResponse & {
    requestUid: string;
    test: string;
  } | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LabRequestSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/specimens/search-request?q=${searchQuery}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Failed to query live lab request queues:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // FIX: Added the missing handler required by sub-components
  const handleSelectRequest = (req: LabRequestSearchResult) => {
    setSelectedRequest(req);
    setSearchQuery('');
    setSearchResults([]);
    setFormErrors(prev => { const n = { ...prev }; delete n.request; return n; });
    addLog(`Target Link Locked: ${req.request_uid} (${req.test_type})`);
  };

  const receiveMutation = useMutation({
    mutationFn: async (payload: SpecimenReceivePayload): Promise<SpecimenReceiveResponse> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/specimens/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.detail || 'Inbound specimen checkout anomaly.');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setConfirmationData({
        ...data,
        requestUid: selectedRequest ? selectedRequest.request_uid : 'N/A',
        test: selectedRequest ? selectedRequest.test_type : 'Unknown'
      });
      addLog(`Success: Sample tracking row state logged as [${data.status}]`);
    },
    onError: (error: any) => {
      setFormErrors(prev => ({ ...prev, submit: error.message }));
      addLog('Error: System aborted transactional entry commit.');
    }
  });

  const addLog = (text: string) => {
    setSessionLogs(prev => [{ time: getTimestamp(), text }, ...prev]);
  };

  const handleClearForm = () => {
    setSelectedRequest(null);
    setSearchQuery('');
    setVisualCheckPassed(true);
    setRejectionReason('');
    setFreeTextNote('');
    setFormErrors({});
    setHasSearched(false);
    addLog('Workspace parameters systematically reset clear.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormErrors({});
    
    const errors: Record<string, string> = {};
    if (!selectedRequest) errors.request = 'A target lab request authorization record is mandatory before receiving can execute.';
    if (!visualCheckPassed && !rejectionReason) errors.rejection = 'Please map a standard structured reason taxonomy code mapping option.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addLog('Validation Failure: Evaluation checklist properties error.');
      return;
    }

    const payload: SpecimenReceivePayload = {
      lab_request_id: selectedRequest!.lab_request_id,
      visual_check_passed: visualCheckPassed,
      rejection_reason: !visualCheckPassed ? rejectionReason : undefined,
      free_text_note: !visualCheckPassed && freeTextNote.trim() ? freeTextNote.trim() : undefined
    };

    receiveMutation.mutate(payload);
  };

  if (confirmationData) {
    return <SpecimenReceiptConfirmation data={confirmationData} onReset={handleClearForm} />;
  }

  return (
    <div className="w-full bg-[#F4F7F5] font-sans text-slate-800 tracking-tight">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
        
        <div className="lg:col-span-2 space-y-6">
          <LabRequestSearchPanel 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearching={isSearching}
            searchResults={searchResults}
            selectedRequest={selectedRequest}
            onSelectRequest={handleSelectRequest}
            onClearSelection={handleClearForm}
            hasSearched={hasSearched}
          />

          <ReceiveSampleForm 
            selectedRequest={selectedRequest}
            visualCheckPassed={visualCheckPassed}
            setVisualCheckPassed={setVisualCheckPassed}
            rejectionReason={rejectionReason}
            setRejectionReason={setRejectionReason}
            freeTextNote={freeTextNote}
            setFreeTextNote={setFreeTextNote}
            formErrors={formErrors}
            onSubmit={handleSubmit}
            onReset={handleClearForm}
            isPending={receiveMutation.isPending}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Verification Snapshot</h4>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <div className="h-9 w-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-emerald-600">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">Selected Tracker</p>
                  <p className="text-xs font-black text-slate-800 mt-1 truncate">
                    {selectedRequest ? selectedRequest.request_uid : '[Awaiting Selection Link]'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-b border-slate-100 pb-4 text-xs font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Panel Type:</span>
                  <span className="text-slate-700 font-bold truncate max-w-[160px]">
                    {selectedRequest ? selectedRequest.test_type : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Attending Provider:</span>
                  <span className="text-slate-600 font-semibold truncate max-w-[140px]">
                    {selectedRequest ? `Dr. ${selectedRequest.physician_name}` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex justify-center pt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full font-bold text-[10px] uppercase tracking-wider shadow-2xs ${visualCheckPassed ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-red-50 text-red-700 border-red-200/50'}`}>
                  <Clipboard className="h-3 w-3" /> {visualCheckPassed ? 'Inspection Passed' : 'Flagged Rejection'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3 flex items-center gap-2 bg-slate-50/50">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Live System Feed</h4>
            </div>
            <div className="p-4 max-h-36 overflow-y-auto divide-y divide-slate-50 font-mono text-[10px] leading-relaxed">
              {sessionLogs.map((log, index) => (
                <div key={index} className="py-1.5 flex items-start justify-between gap-3">
                  <span className="text-slate-400 shrink-0 select-none">{log.time}</span>
                  <span className="text-slate-600 text-right flex-1 truncate">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}