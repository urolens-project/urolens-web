import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { PrintLabelResponse, ConfirmAffixedResponse, LabelPreviewData } from '../../types/types';
import { 
  Search, Printer, CheckCircle, Loader2, FlaskConical, AlertCircle,
  ShieldCheck, ArrowRight, Barcode, CheckSquare, Layers,
  RefreshCw, WifiOff
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const getTimestamp = () => new Date().toTimeString().split(' ')[0];

interface ReceivedSpecimenResult {
  specimen_id: string;
  sample_uid: string;
  patient_name: string;
  patient_uid: string;
  test_type: string;
  status: string;
}

export default function SampleLabelingScreen() {
  const navigate = useNavigate();

  // ----------------------------------------------------------------
  // CORE COMPONENT STATE HOOKS (CLEAN & EXACT EXECUTIONS)
  // ----------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecimen, setSelectedSpecimen] = useState<ReceivedSpecimenResult | null>(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ReceivedSpecimenResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [hasPrinted, setHasPrinted] = useState(false);
  const [previewData, setPreviewData] = useState<LabelPreviewData | null>(null);
  const [reprintCount, setReprintCount] = useState(0);
  const [printerOfflineOverride, setPrinterOfflineOverride] = useState(false);
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [sessionLogs, setSessionLogs] = useState<Array<{ time: string; text: string }>>([
    { time: getTimestamp(), text: 'Barcode hardware labeling dashboard online.' }
  ]);
  const [workflowCompleted, setWorkflowCompleted] = useState(false);

  // ----------------------------------------------------------------
  // LIVE QUEUE SEARCH LOOKUP DEBOUNCER
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);
      try {
        const response = await fetch(`${API_BASE_URL}/specimens/search-received?q=${searchQuery}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Failed querying active specimen subledgers:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const addLog = (text: string) => {
    setSessionLogs(prev => [{ time: getTimestamp(), text }, ...prev]);
  };

  const handleSelectSpecimen = (spec: ReceivedSpecimenResult) => {
    setSelectedSpecimen(spec);
    setSearchQuery('');
    setSearchResults([]);
    setFormErrors({});
    setHasPrinted(false);
    setPreviewData(null);
    setReprintCount(0);
    setPrinterOfflineOverride(false);
    addLog(`Linked Specimen Container Target: ${spec.sample_uid}`);
  };

  const handleClearWorkspace = () => {
    setSelectedSpecimen(null);
    setSearchQuery('');
    setHasPrinted(false);
    setPreviewData(null);
    setReprintCount(0);
    setPrinterOfflineOverride(false);
    setFormErrors({});
    setHasSearched(false);
    setWorkflowCompleted(false);
    addLog('Workspace cache lines systematically wiped clear.');
  };

  // ----------------------------------------------------------------
  // MUTATION 1: PRINT & REPRINT ACTION (SampleLabelPanel)
  // ----------------------------------------------------------------
  const printMutation = useMutation({
    mutationFn: async (specimenId: string): Promise<PrintLabelResponse> => {
      const response = await fetch(`${API_BASE_URL}/specimens/${specimenId}/label`, {
        method: 'POST'
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.detail || 'Printer engine communication failure loop.');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewData(data.preview);
      setHasPrinted(true);
      if (reprintCount > 0) {
        addLog(`Reprint Dispatched: Job [${data.print_job_id}] pushed state=SENT (Cycle count: ${reprintCount})`);
      } else {
        addLog(`Hardware Dispatch: PrintJob [${data.print_job_id}] pushed state=SENT`);
      }
      setFormErrors(prev => { const n = { ...prev }; delete n.print; return n; });
    },
    onError: (error: any) => {
      setFormErrors(prev => ({ ...prev, print: error.message }));
      addLog('Hardware Exception: Print spooling interrupted.');
    }
  });

  const handleReprintTrigger = () => {
    if (!selectedSpecimen) return;
    setReprintCount(prev => prev + 1);
    printMutation.mutate(selectedSpecimen.specimen_id);
  };

  // ----------------------------------------------------------------
  // MUTATION 2: CONFIRM AFFIXED RUNS (LabelConfirmationAction)
  // ----------------------------------------------------------------
  const confirmMutation = useMutation({
    mutationFn: async (specimenId: string): Promise<ConfirmAffixedResponse> => {
      const response = await fetch(`${API_BASE_URL}/specimens/${specimenId}/label/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          offline_override: printerOfflineOverride  
        })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.detail || 'Affixed state verification exception.');
      }
      return response.json();
    },
    onSuccess: () => {
      setWorkflowCompleted(true);
      addLog(`Workflow Complete: Specimen updated to [LABELED / Ready for Queue]`);
    },
    onError: (error: any) => {
      setFormErrors(prev => ({ ...prev, confirm: error.message }));
      addLog('Error: Status modification validation check faulted.');
    }
  });
  const isConfirmationUnlocked =
  !!selectedSpecimen &&
  ((hasPrinted && !!previewData) || printerOfflineOverride) &&
  !workflowCompleted;

  return (
    <div className="w-full bg-[#F4F7F5] font-sans text-slate-800 tracking-tight">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
        
        {/* LEFT COLUMN: ACTIVE INTERFACE STACKS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SEARCH SELECTION OVERLAY VIEWPORT */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] text-white font-mono">1</span>
                Received Specimen Verification Panel
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200/60 font-mono">
                Filter: RECEIVED
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
                placeholder="Lookup active containers by patient demographic name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!!selectedSpecimen || workflowCompleted}
                className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-xs outline-none transition-all focus:border-emerald-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
              />
              {selectedSpecimen && (
                <button 
                  type="button"
                  onClick={handleClearWorkspace}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Unlink Container
                </button>
              )}
            </div>

            {searchResults.length > 0 && !selectedSpecimen && (
              <div className="border border-slate-200 bg-white rounded-xl shadow-lg divide-y divide-slate-100 overflow-hidden max-h-48 overflow-y-auto relative z-10 animate-fadeIn">
                {searchResults.map((spec) => (
                  <div
                    key={spec.specimen_id}
                    onClick={() => handleSelectSpecimen(spec)}
                    className="p-3 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="font-mono font-bold text-slate-900">{spec.sample_uid}</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-semibold text-slate-600">{spec.patient_name}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200/40">RECEIVED</span>
                  </div>
                ))}
              </div>
            )}

            {hasSearched && searchQuery.trim().length > 0 && searchResults.length === 0 && !selectedSpecimen && !isSearching && (
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-800 animate-fadeIn">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black">No Elements Found Awaiting Label Assignment</h4>
                  <p className="text-[11px] text-amber-700/90 mt-0.5 leading-relaxed">
                    Verify if the collection vial parameters have already progressed through checkout or ensure the physical verification entry step was fully saved in Step 6.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* FRONTEND COMPONENT INTERFACE: SampleLabelPanel */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] text-white font-mono">2</span>
                SampleLabelPanel
              </h3>
              {selectedSpecimen && (
                <div className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200/70">
                  ID: {selectedSpecimen.sample_uid}
                </div>
              )}
            </div>

            {workflowCompleted ? (
              <div className="p-8 text-center space-y-4 animate-fadeIn">
                <div className="h-12 w-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Specimen Labeling Steps Confirmed</h4>
                  <p className="text-xs text-slate-400 mt-1">Status code moved to Labeled / Ready for Queue. Audit trace string LABEL_AFFIXED logged.</p>
                </div>
                <div className="flex gap-3 justify-center max-w-sm mx-auto pt-2">
                  <button
                    type="button"
                    onClick={handleClearWorkspace}
                    className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs bg-white text-slate-700 transition-colors cursor-pointer"
                  >
                    Next Container
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/intake/register')}
                    className="flex-1 h-10 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    Open New Intake Stream <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                
                {/* PRINTER OFFLINE FALLBACK LOOP OVERRIDE CONTROL */}
                {!hasPrinted && selectedSpecimen && (
                  <div className={`p-4 border rounded-xl flex items-start gap-3 transition-colors ${printerOfflineOverride ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                    <WifiOff className={`h-4 w-4 shrink-0 mt-0.5 ${printerOfflineOverride ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-900 block select-none cursor-pointer" htmlFor="offlineOverride">
                        Printer Hardware Offline Fallback Loop
                      </label>
                      <p className="text-[10px] text-slate-400 mt-0.5">Check this box to authorize immediate manual labeling verification if hardware link falls offline.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      id="offlineOverride"
                      checked={printerOfflineOverride} 
                      onChange={(e) => setPrinterOfflineOverride(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4 mt-1 cursor-pointer"
                    />
                  </div>
                )}

                {/* LABEL CONTENT PREVIEW CANVAS */}
                {previewData && (
                  <div className="max-w-sm mx-auto bg-white border-2 border-dashed border-slate-300 rounded-2xl p-5 font-mono shadow-xs animate-slideDown relative overflow-hidden bg-radial from-white to-slate-50/40">
                    <div className="absolute right-3 top-3 opacity-15"><Barcode className="h-10 w-10 text-slate-900" /></div>
                    <div className="border-b border-slate-200 pb-2 text-[9px] text-slate-400 flex justify-between items-center">
                      <span className="font-sans font-bold tracking-wider">THERMAL LABEL PREVIEW</span>
                      <span>{previewData.date.split(' ')[0]}</span>
                    </div>
                    
                    <div className="py-4 space-y-2.5 text-xs">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-sans text-slate-400 font-bold tracking-wide">Patient Name</span>
                        <span className="font-sans font-black text-slate-900 text-sm mt-0.5">{previewData.patient_name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-sans text-slate-400 font-bold tracking-wide">Sample ID</span>
                        <span className="font-bold text-slate-700 tracking-wider mt-0.5">{previewData.sample_uid}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-sans text-slate-400 font-bold tracking-wide">Test Type</span>
                        <span className="font-sans font-semibold text-slate-600 mt-0.5">{previewData.test_type.replace(/_/g,' ')}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-sans text-slate-400 font-bold tracking-wide">Dispatched At</span>
                        <span className="text-slate-500 mt-0.5">{previewData.date.split(' ')[1]}</span>
                      </div>
                    </div>

                    {/* SRS REPRINT INDICATOR ELEMENT */}
                    {reprintCount > 0 && (
                      <div className="absolute bottom-2 right-3 text-[8px] text-red-500 font-bold uppercase font-sans border border-red-200 bg-red-50 px-1.5 py-0.5 rounded">
                        Reprint Count: {reprintCount}
                      </div>
                    )}
                  </div>
                )}

                {formErrors.print && <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-xs font-semibold">{formErrors.print}</div>}
                {formErrors.confirm && <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-xs font-semibold">{formErrors.confirm}</div>}

                {/* BOTTOM ACTION BUTTON EXECUTION DECK */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                  
                  {/* PRINT & SRS ALTERNATIVE REPRINT ACTION BAR CONTROLS */}
                  {hasPrinted ? (
                    <button
                      type="button"
                      disabled={printMutation.isPending}
                      onClick={handleReprintTrigger}
                      className="h-11 px-4 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl flex items-center gap-2 transition-all bg-white cursor-pointer shadow-2xs"
                    >
                      {printMutation.isPending ? 'Spooling...' : 'Reprint Damaged Label'}
                      <RefreshCw className={`h-3.5 w-3.5 ${printMutation.isPending ? 'animate-spin' : ''}`} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!selectedSpecimen || printMutation.isPending}
                      onClick={() => printMutation.mutate(selectedSpecimen!.specimen_id)}
                      className="h-11 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors disabled:opacity-40 cursor-pointer shadow-sm"
                    >
                      {printMutation.isPending ? 'Spooling Machine...' : 'Print Label'}
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* FRONTEND COMPONENT INTERFACE: LabelConfirmationAction */}
                  <button
                    type="button"
                    disabled={!isConfirmationUnlocked || confirmMutation.isPending}
                    onClick={() => selectedSpecimen && confirmMutation.mutate(selectedSpecimen.specimen_id)}
                    className="h-11 px-5 bg-[#005B4B] hover:bg-[#004D3F] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer shadow-md"
                  >
                    {confirmMutation.isPending ? 'Committing State...' : 'Confirm Label Affixed'}
                    <CheckSquare className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: REPLICATED VERIFICATION SNAPSHOTS */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Verification Snapshot</h4>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <div className="h-9 w-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-emerald-600">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">Sample Tracking UID</p>
                  <p className="text-xs font-black text-slate-800 mt-1 truncate">
                    {selectedSpecimen ? selectedSpecimen.sample_uid : '[Awaiting Search Hook]'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-b border-slate-100 pb-4 text-xs font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Patient Profile:</span>
                  <span className="text-slate-700 font-bold truncate max-w-[160px]">
                    {selectedSpecimen ? selectedSpecimen.patient_name : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">Diagnostic Panel:</span>
                  <span className="text-slate-600 font-semibold truncate max-w-[140px]">
                    {selectedSpecimen ? selectedSpecimen.test_type.replace(/_/g,' ') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex justify-center pt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full font-bold text-[10px] uppercase tracking-wider shadow-2xs ${hasPrinted ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-slate-50 text-slate-400 border-slate-200/60'}`}>
                  <Printer className="h-3 w-3" /> {hasPrinted ? 'Label Spooled' : 'Awaiting Hardware Print'}
                </span>
              </div>
            </div>
          </div>

          {/* SESSION AUDIT LEDGER CONSOLE FEED */}
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