import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { QRCodeSVG } from 'qrcode.react';
import type {
  PrintLabelResponse,
  ConfirmAffixedResponse,
  LabelPreviewData,
} from '../../../types/types';
import type { ReceivedSpecimenResult } from '../types';
import { sampleLabelingApi } from '../api/sampleLabelingApi';
import { useSpecimenSearch } from '../hooks/useSampleLabeling';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Search,
  Printer,
  CheckCircle,
  Loader2,
  FlaskConical,
  AlertCircle,
  ArrowRight,
  CheckSquare,
  Layers,
  RefreshCw,
  WifiOff,
} from 'lucide-react';

export default function SampleLabelingScreen() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedSpecimen, setSelectedSpecimen] = useState<ReceivedSpecimenResult | null>(null);

  const [hasPrinted, setHasPrinted] = useState(false);
  const [previewData, setPreviewData] = useState<LabelPreviewData | null>(null);
  const [reprintCount, setReprintCount] = useState(0);
  const [printerOfflineOverride, setPrinterOfflineOverride] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [workflowCompleted, setWorkflowCompleted] = useState(false);

  useEffect(() => {
    const delay = searchQuery.trim() ? 300 : 0;
    const t = setTimeout(() => setDebouncedQuery(searchQuery), delay);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: searchData, isFetching: isSearching } = useSpecimenSearch(debouncedQuery);
  const searchResults: ReceivedSpecimenResult[] = searchData ?? [];
  const hasSearched = debouncedQuery.trim().length > 0;

  const handleSelectSpecimen = (spec: ReceivedSpecimenResult) => {
    setSelectedSpecimen(spec);
    setSearchQuery('');
    setFormErrors({});
    setHasPrinted(false);
    setPreviewData(null);
    setReprintCount(0);
    setPrinterOfflineOverride(false);
  };

  const handleClearWorkspace = () => {
    setSelectedSpecimen(null);
    setSearchQuery('');
    setDebouncedQuery('');
    setHasPrinted(false);
    setPreviewData(null);
    setReprintCount(0);
    setPrinterOfflineOverride(false);
    setFormErrors({});
    setWorkflowCompleted(false);
  };

  const printMutation = useMutation({
    mutationFn: (specimenId: string): Promise<PrintLabelResponse> =>
      sampleLabelingApi.printLabel(specimenId),
    onSuccess: (data) => {
      setPreviewData(data.preview);
      setHasPrinted(true);
      setFormErrors((prev) => {
        const n = { ...prev };
        delete n.print;
        return n;
      });
    },
    onError: (error: Error) => {
      setFormErrors((prev) => ({ ...prev, print: error.message }));
    },
  });

  const handleReprintTrigger = () => {
    if (!selectedSpecimen) return;
    setReprintCount((prev) => prev + 1);
    printMutation.mutate(selectedSpecimen.specimen_id);
  };

  const confirmMutation = useMutation({
    mutationFn: ({
      specimenId,
      offlineOverride,
    }: {
      specimenId: string;
      offlineOverride: boolean;
    }): Promise<ConfirmAffixedResponse> =>
      sampleLabelingApi.confirmAffixed(specimenId, offlineOverride),
    onSuccess: () => {
      setWorkflowCompleted(true);
    },
    onError: (error: Error) => {
      setFormErrors((prev) => ({ ...prev, confirm: error.message }));
    },
  });

  const isConfirmationUnlocked =
    !!selectedSpecimen &&
    ((hasPrinted && !!previewData) || printerOfflineOverride) &&
    !workflowCompleted;

  return (
    <div className="w-full bg-[#F4F7F5] font-sans text-slate-800 tracking-tight">
      <Helmet>
        <title>Sample Labeling — UroLens</title>
      </Helmet>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-350 mx-auto">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1 — find the specimen */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] text-white font-mono">
                  1
                </span>
                Find Specimen
              </h3>
              <Badge variant="success">Received</Badge>
            </div>

            <div className="relative">
              {isSearching ? (
                <Loader2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 animate-spin" />
              ) : (
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              )}

              <input
                type="text"
                placeholder="Search by Patient ID or Sample ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!!selectedSpecimen || workflowCompleted}
                className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
              />
              {selectedSpecimen && (
                <button
                  type="button"
                  onClick={handleClearWorkspace}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>

            {searchResults.length > 0 && !selectedSpecimen && (
              <div className="border border-slate-200 bg-white rounded-xl shadow-lg divide-y divide-slate-100 overflow-hidden max-h-48 overflow-y-auto relative z-10 animate-fadeIn">
                {searchResults.map((spec) => (
                  <div
                    key={spec.specimen_id}
                    onClick={() => handleSelectSpecimen(spec)}
                    className="p-3 text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="font-mono font-bold text-slate-900">{spec.sample_uid}</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-semibold text-slate-600">{spec.patient_uid}</span>
                    </div>
                    <Badge variant="success">Received</Badge>
                  </div>
                ))}
              </div>
            )}

            {hasSearched &&
              searchQuery.trim().length > 0 &&
              searchResults.length === 0 &&
              !selectedSpecimen &&
              !isSearching && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-800 animate-fadeIn">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">No specimens found</h4>
                    <p className="text-xs text-amber-700/90 mt-0.5 leading-relaxed">
                      Make sure the specimen has been received and its inspection was saved.
                    </p>
                  </div>
                </div>
              )}
          </div>

          {/* Step 2 — print and confirm the label */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] text-white font-mono">
                  2
                </span>
                Print Label
              </h3>
              {selectedSpecimen && (
                <div className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200/70">
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
                  <h4 className="text-sm font-bold text-slate-900">Label Confirmed</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    This specimen is now ready to be assigned to a Medical Technologist.
                  </p>
                </div>
                <div className="flex gap-3 justify-center max-w-sm mx-auto pt-2">
                  <Button variant="secondary" className="flex-1" onClick={handleClearWorkspace}>
                    Label Another Specimen
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800"
                    onClick={() => navigate('/intake/register')}
                  >
                    Register New Patient <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {!hasPrinted && selectedSpecimen && (
                  <div
                    className={`p-4 border rounded-xl flex items-start gap-3 transition-colors ${printerOfflineOverride ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <WifiOff
                      className={`h-4 w-4 shrink-0 mt-0.5 ${printerOfflineOverride ? 'text-amber-600' : 'text-slate-400'}`}
                    />
                    <div className="flex-1">
                      <label
                        className="text-sm font-bold text-slate-900 block select-none cursor-pointer"
                        htmlFor="offlineOverride"
                      >
                        Printer Offline
                      </label>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Check this if the printer isn't working, so you can still confirm the label
                        was applied by hand.
                      </p>
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

                {previewData && (
                  <div className="max-w-sm mx-auto animate-slideDown">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">
                      Label Preview
                    </p>

                    {/* Label card — mimics a physical thermal label, so its type
                        stays small on purpose regardless of the rest of the page */}
                    <div className="bg-white border border-slate-300 rounded-xl shadow-md overflow-hidden">
                      <div className="bg-[#005B4B] px-4 py-2 flex items-center justify-between">
                        <span className="text-white font-black text-xs tracking-wider uppercase">
                          UroLens LIS
                        </span>
                        <span className="text-emerald-200 text-[10px] font-mono">
                          {previewData.date.split(' ')[0]}
                        </span>
                      </div>

                      <div className="p-4 flex gap-4 items-start">
                        <div className="flex-1 space-y-3 min-w-0">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                              Patient
                            </p>
                            <p className="text-sm font-black text-slate-900 leading-tight truncate">
                              {previewData.patient_uid}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                              Sample ID
                            </p>
                            <p className="text-xs font-mono font-black text-[#005B4B] tracking-wider">
                              {previewData.sample_uid}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                              Test
                            </p>
                            <p className="text-xs font-semibold text-slate-700">
                              {previewData.test_type.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                              Time
                            </p>
                            <p className="text-[10px] font-mono text-slate-500">
                              {previewData.date.split(' ')[1]}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="p-1.5 border border-slate-200 rounded-lg bg-white">
                            <QRCodeSVG
                              value={previewData.sample_uid}
                              size={80}
                              fgColor="#1e293b"
                              bgColor="#ffffff"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono text-center">
                            Scan to verify
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 px-4 py-1.5 bg-slate-50 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          UroLens Specimen Management System
                        </span>
                        {reprintCount > 0 && (
                          <span className="text-[10px] text-red-500 font-bold uppercase border border-red-200 bg-red-50 px-1.5 py-0.5 rounded">
                            Reprint ×{reprintCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {formErrors.print && (
                  <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-sm font-semibold">
                    {formErrors.print}
                  </div>
                )}
                {formErrors.confirm && (
                  <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-sm font-semibold">
                    {formErrors.confirm}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                  {hasPrinted ? (
                    <Button
                      variant="secondary"
                      className="border-red-200 hover:bg-red-50 text-red-600"
                      disabled={printMutation.isPending}
                      onClick={handleReprintTrigger}
                    >
                      {printMutation.isPending ? 'Reprinting...' : 'Reprint Damaged Label'}
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${printMutation.isPending ? 'animate-spin' : ''}`}
                      />
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="bg-slate-900 hover:bg-slate-800"
                      disabled={!selectedSpecimen}
                      loading={printMutation.isPending}
                      onClick={() => printMutation.mutate(selectedSpecimen!.specimen_id)}
                    >
                      {printMutation.isPending ? 'Printing...' : 'Print Label'}
                      <Printer className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    className="bg-[#005B4B] hover:bg-[#004D3F]"
                    disabled={!isConfirmationUnlocked}
                    loading={confirmMutation.isPending}
                    onClick={() =>
                      selectedSpecimen &&
                      confirmMutation.mutate({
                        specimenId: selectedSpecimen.specimen_id,
                        offlineOverride: printerOfflineOverride,
                      })
                    }
                  >
                    {confirmMutation.isPending ? 'Confirming...' : 'Confirm Label Affixed'}
                    <CheckSquare className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Current Sample
              </h4>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <div className="h-9 w-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-emerald-600">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">
                    Specimen ID
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                    {selectedSpecimen ? selectedSpecimen.sample_uid : 'No specimen selected yet'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-b border-slate-100 pb-4 text-sm font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">
                    Patient
                  </span>
                  <span className="text-slate-700 font-bold truncate max-w-40">
                    {selectedSpecimen ? selectedSpecimen.patient_uid : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">
                    Test
                  </span>
                  <span className="text-slate-600 font-semibold truncate max-w-35">
                    {selectedSpecimen ? selectedSpecimen.test_type.replace(/_/g, ' ') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex justify-center pt-1">
                <Badge variant={hasPrinted ? 'success' : 'default'}>
                  <Printer className="h-3 w-3" /> {hasPrinted ? 'Printed' : 'Not Printed Yet'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
