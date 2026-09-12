import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { SpecimenReceivePayload, SpecimenReceiveResponse } from '../../../types/types';
import type { LabRequestSearchResult } from '../types';
import { specimenReceivingApi } from '../api/specimenReceivingApi';
import { useLabRequestSearch } from '../hooks/useSpecimenReceiving';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Search,
  Clipboard,
  AlertTriangle,
  Loader2,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Beaker,
  FilePlus,
} from 'lucide-react';

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
  hasSearched,
}: SearchPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] text-white font-mono">
            1
          </span>
          Find Lab Request
        </h3>
        <Badge variant="warning">Awaiting Sample</Badge>
      </div>

      <div className="relative">
        {isSearching ? (
          <Loader2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 animate-spin" />
        ) : (
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}

        <input
          type="text"
          placeholder="Search by tracking number or physician name (e.g. REQ-2026...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={!!selectedRequest}
          className="w-full h-11 rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
        />
        {selectedRequest && (
          <button
            type="button"
            onClick={onClearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Change
          </button>
        )}
      </div>

      {searchResults.length > 0 && !selectedRequest && (
        <div className="border border-slate-200 bg-white rounded-xl shadow-lg divide-y divide-slate-100 overflow-hidden max-h-48 overflow-y-auto z-10 relative">
          {searchResults.map((req) => (
            <div
              key={req.lab_request_id}
              onClick={() => onSelectRequest(req)}
              className="p-3 text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-mono font-bold text-slate-900">{req.request_uid}</span>
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-slate-600">{req.test_type}</span>
              </div>
              <span className="text-xs font-medium text-slate-400">
                Dr. {req.physician_name || 'Unspecified'}
              </span>
            </div>
          ))}
        </div>
      )}

      {hasSearched &&
        searchQuery.trim().length > 0 &&
        searchResults.length === 0 &&
        !selectedRequest &&
        !isSearching && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3 text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">No matching lab request found</h4>
                <p className="text-xs text-amber-700/90 mt-0.5 leading-relaxed">
                  A specimen can only be received once its lab request has been submitted.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white border-transparent"
              onClick={() => navigate('/intake/request')}
            >
              <FilePlus className="h-3 w-3" /> Create Lab Request
            </Button>
          </div>
        )}
    </div>
  );
}

interface ReceiveFormProps {
  selectedRequest: LabRequestSearchResult | null;
  visualCheckPassed: boolean;
  setVisualCheckPassed: (val: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (val: string) => void;
  freeTextNote: string;
  setFreeTextNote: (val: string) => void;
  formErrors: Record<string, string>;
  onSubmit: (e: FormEvent) => void;
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
  isPending,
}: ReceiveFormProps) {
  const [volCheck, setVolCheck] = useState(true);
  const [containerCheck, setContainerCheck] = useState(true);
  const [labelCheck, setLabelCheck] = useState(true);

  const handleCheckboxChange = (field: 'vol' | 'container' | 'label', value: boolean) => {
    const currentVol = field === 'vol' ? value : volCheck;
    const currentContainer = field === 'container' ? value : containerCheck;
    const currentLabel = field === 'label' ? value : labelCheck;

    if (field === 'vol') setVolCheck(value);
    if (field === 'container') setContainerCheck(value);
    if (field === 'label') setLabelCheck(value);

    setVisualCheckPassed(currentVol && currentContainer && currentLabel);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] text-white font-mono">
            2
          </span>
          Receive Sample
        </h3>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
            Specimen Checklist
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label
              className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer transition-all select-none ${volCheck ? 'border-emerald-200 bg-emerald-50/10 text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}
            >
              <input
                type="checkbox"
                checked={volCheck}
                onChange={(e) => handleCheckboxChange('vol', e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
              />
              <span className="text-xs font-semibold">Adequate Volume (≥30mL)</span>
            </label>

            <label
              className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer transition-all select-none ${containerCheck ? 'border-emerald-200 bg-emerald-50/10 text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}
            >
              <input
                type="checkbox"
                checked={containerCheck}
                onChange={(e) => handleCheckboxChange('container', e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
              />
              <span className="text-xs font-semibold">Container Properly Sealed</span>
            </label>

            <label
              className={`p-3 border rounded-xl flex items-center gap-2.5 cursor-pointer transition-all select-none ${labelCheck ? 'border-emerald-200 bg-emerald-50/10 text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}
            >
              <input
                type="checkbox"
                checked={labelCheck}
                onChange={(e) => handleCheckboxChange('label', e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
              />
              <span className="text-xs font-semibold">Label Matches Patient</span>
            </label>
          </div>
        </div>

        <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <label className="text-sm font-bold text-slate-900 block">
              Visual Inspection Passed
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              Turn this off if anything above doesn't check out.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !visualCheckPassed;
              setVisualCheckPassed(next);
              if (next) {
                setVolCheck(true);
                setContainerCheck(true);
                setLabelCheck(true);
              }
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${visualCheckPassed ? 'bg-emerald-600' : 'bg-red-500'}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${visualCheckPassed ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {!visualCheckPassed && (
          <div className="p-5 bg-red-50/40 border border-red-200 rounded-xl space-y-4">
            <div className="flex items-start gap-2.5 text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Rejecting This Specimen</h4>
                <p className="text-xs text-red-500 font-medium mt-0.5">
                  Please select a reason for the rejection below.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Reason for Rejection
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={`w-full h-11 rounded-xl border bg-white px-3 text-sm outline-none focus:border-red-500 transition-all ${formErrors.rejection ? 'border-red-300 bg-red-50/20' : 'border-slate-200'}`}
              >
                <option value="">Select a reason...</option>
                <option value="INSUFFICIENT_VOLUME">Insufficient volume (below 30mL)</option>
                <option value="WRONG_CONTAINER">Wrong container (non-sterile or unapproved)</option>
                <option value="UNLABELED">Unlabeled (missing patient ID)</option>
                <option value="OTHER">Other (contamination, leakage, or damage)</option>
              </select>
              {formErrors.rejection && (
                <p className="text-xs text-red-500 font-semibold mt-1">{formErrors.rejection}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                Additional Notes
              </label>
              <textarea
                placeholder="Any additional details for the supervisor..."
                value={freeTextNote}
                onChange={(e) => setFreeTextNote(e.target.value)}
                className="w-full min-h-20 py-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-red-500 transition-all font-sans resize-none"
              />
            </div>
          </div>
        )}

        {formErrors.request && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 font-semibold text-sm flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {formErrors.request}
          </div>
        )}

        {formErrors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 font-semibold text-sm">
            {formErrors.submit}
          </div>
        )}
      </div>

      <div className="bg-slate-50/60 border-t border-slate-100 p-4 flex items-center justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onReset}>
          Clear Form
        </Button>
        <Button
          type="button"
          variant={visualCheckPassed ? 'primary' : 'danger'}
          className={visualCheckPassed ? 'bg-[#005B4B] hover:bg-[#004D3F]' : ''}
          onClick={onSubmit}
          disabled={!selectedRequest}
          loading={isPending}
        >
          {isPending
            ? 'Submitting...'
            : visualCheckPassed
              ? 'Confirm Specimen Receipt'
              : 'Confirm Rejection'}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface ConfirmationCardProps {
  data: SpecimenReceiveResponse & { requestUid: string; test: string };
  onReset: () => void;
}

function SpecimenReceiptConfirmation({ data, onReset }: ConfirmationCardProps) {
  const navigate = useNavigate();
  const isRejected = data.status === 'REJECTED';

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans tracking-tight pt-6">
      <div
        className={`bg-white border-2 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden ${isRejected ? 'border-red-500' : 'border-emerald-500'}`}
      >
        <div
          className={`absolute top-0 right-0 h-32 w-32 rounded-bl-full pointer-events-none ${isRejected ? 'bg-red-50/5' : 'bg-emerald-50/5'}`}
        />

        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-full border flex items-center justify-center ${isRejected ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}
          >
            {isRejected ? <XCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isRejected ? 'Specimen Rejected' : 'Specimen Received'}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              This has been recorded and the lab request is now updated.
            </p>
          </div>
        </div>

        <div className="border-y border-dashed border-slate-200 py-5 space-y-3.5">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-slate-400 uppercase tracking-wide text-xs">
              Sample ID
            </span>
            <span
              className={`font-mono font-bold px-3 py-1 rounded-lg border tracking-widest ${isRejected ? 'bg-red-50 text-red-700 border-red-200/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200/50'}`}
            >
              {data.sample_uid || 'Rejected'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-slate-400 uppercase tracking-wide text-xs">
              Lab Request
            </span>
            <span className="font-bold text-slate-800 font-mono">{data.requestUid}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-slate-400 uppercase tracking-wide text-xs">Test</span>
            <span className="font-bold text-slate-700">{data.test}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-slate-400 uppercase tracking-wide text-xs">Status</span>
            <Badge variant={isRejected ? 'danger' : 'success'}>
              {isRejected ? 'Rejected' : 'Received'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="secondary" size="lg" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" /> Receive Another Specimen
          </Button>

          {!isRejected && (
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="bg-emerald-700 hover:bg-emerald-800"
              onClick={() => navigate('/intake/label')}
            >
              Continue to Labeling <Beaker className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SpecimenReceivingForm() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LabRequestSearchResult | null>(null);
  const [visualCheckPassed, setVisualCheckPassed] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [freeTextNote, setFreeTextNote] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [confirmationData, setConfirmationData] = useState<
    | (SpecimenReceiveResponse & {
        requestUid: string;
        test: string;
      })
    | null
  >(null);

  useEffect(() => {
    const delay = searchQuery.trim() ? 300 : 0;
    const t = setTimeout(() => setDebouncedQuery(searchQuery), delay);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: searchData, isFetching: isSearching } = useLabRequestSearch(debouncedQuery);
  const searchResults: LabRequestSearchResult[] = searchData ?? [];
  const hasSearched = debouncedQuery.trim().length > 0;

  const handleSelectRequest = (req: LabRequestSearchResult) => {
    setSelectedRequest(req);
    setSearchQuery('');
    setFormErrors((prev) => {
      const n = { ...prev };
      delete n.request;
      return n;
    });
  };

  const receiveMutation = useMutation({
    mutationFn: (payload: SpecimenReceivePayload) => specimenReceivingApi.receiveSpecimen(payload),
    onSuccess: (data) => {
      setConfirmationData({
        ...data,
        requestUid: selectedRequest ? selectedRequest.request_uid : 'N/A',
        test: selectedRequest ? selectedRequest.test_type : 'Unknown',
      });
    },
    onError: (error: Error) => {
      setFormErrors((prev) => ({ ...prev, submit: error.message }));
    },
  });

  const handleClearForm = () => {
    setSelectedRequest(null);
    setSearchQuery('');
    setDebouncedQuery('');
    setVisualCheckPassed(true);
    setRejectionReason('');
    setFreeTextNote('');
    setFormErrors({});
  };

  const handleSubmit = (e: FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!selectedRequest) errors.request = 'Please select a lab request.';
    if (!visualCheckPassed && !rejectionReason)
      errors.rejection = 'Please select a rejection reason.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload: SpecimenReceivePayload = {
      lab_request_id: selectedRequest!.lab_request_id,
      visual_check_passed: visualCheckPassed,
      rejection_reason: !visualCheckPassed ? rejectionReason : undefined,
      free_text_note: !visualCheckPassed && freeTextNote.trim() ? freeTextNote.trim() : undefined,
    };

    receiveMutation.mutate(payload);
  };

  if (confirmationData) {
    return <SpecimenReceiptConfirmation data={confirmationData} onReset={handleClearForm} />;
  }

  return (
    <div className="w-full bg-[#F4F7F5] font-sans text-slate-800 tracking-tight">
      <Helmet>
        <title>Specimen Intake — UroLens</title>
      </Helmet>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-350 mx-auto">
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
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Current Sample
              </h4>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <div className="h-9 w-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-emerald-600">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">
                    Lab Request
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-1 truncate">
                    {selectedRequest ? selectedRequest.request_uid : 'No request selected yet'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-b border-slate-100 pb-4 text-sm font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">
                    Test
                  </span>
                  <span className="text-slate-700 font-bold truncate max-w-40">
                    {selectedRequest ? selectedRequest.test_type : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">
                    Physician
                  </span>
                  <span className="text-slate-600 font-semibold truncate max-w-35">
                    {selectedRequest ? `Dr. ${selectedRequest.physician_name}` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex justify-center pt-1">
                <Badge variant={visualCheckPassed ? 'success' : 'danger'}>
                  <Clipboard className="h-3 w-3" />{' '}
                  {visualCheckPassed ? 'Passed Inspection' : 'Rejected'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
