import { useState } from 'react';
import { User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ConsentCapture } from './ConsentCapture';
import { useCreatePatient } from '../hooks/usePatientRegistration';
import type { PatientCreateRequest, ConsentData, PatientSex } from '../types';
import type { ApiError } from '../../../types/domain';

const INITIAL_CONSENT: ConsentData = {
  consent_given: false,
  consent_storage: false,
  consent_research: false,
};

interface FormFields {
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  sex: PatientSex | '';
  contact_no: string;
  address: string;
  is_walkin: boolean;
}

const INITIAL_FORM: FormFields = {
  first_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  sex: '',
  contact_no: '',
  address: '',
  is_walkin: false,
};

function isDateInPast(dateString: string): boolean {
  if (!dateString) return true;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
}

function areAllConsentsChecked(consent: ConsentData): boolean {
  return consent.consent_given && consent.consent_storage && consent.consent_research;
}

export function PatientRegistrationForm() {
  const [formData, setFormData] = useState<FormFields>({ ...INITIAL_FORM });
  const [consent, setConsent] = useState<ConsentData>({ ...INITIAL_CONSENT });
  const [showConsentErrors, setShowConsentErrors] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);
  const [successPatientUid, setSuccessPatientUid] = useState<string | null>(null);

  const createPatient = useCreatePatient();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setDuplicateError(null);
    setGenericError(null);
  };

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!formData.first_name.trim()) errors.first_name = 'First name is required.';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required.';
    if (!formData.date_of_birth) {
      errors.date_of_birth = 'Date of birth is required.';
    } else if (!isDateInPast(formData.date_of_birth)) {
      errors.date_of_birth = 'Date of birth must be a past date.';
    }
    if (!formData.sex) errors.sex = 'Sex is required.';
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGenericError(null);
    setDuplicateError(null);

    const validationErrors = validateForm();
    const consentValid = areAllConsentsChecked(consent);

    setShowConsentErrors(!consentValid);

    if (Object.keys(validationErrors).length > 0 || !consentValid) {
      setFieldErrors(validationErrors);
      return;
    }

    const payload: PatientCreateRequest = {
      first_name: formData.first_name.trim(),
      middle_name: formData.middle_name.trim() || null,
      last_name: formData.last_name.trim(),
      date_of_birth: formData.date_of_birth,
      sex: formData.sex as PatientSex,
      contact_no: formData.contact_no.trim() || null,
      address: formData.address.trim() || null,
      is_walkin: formData.is_walkin,
      consent,
    };

    createPatient.mutate(payload, {
      onSuccess: (data) => {
        setSuccessPatientUid(data.patient_uid);
        setFormData({ ...INITIAL_FORM });
        setConsent({ ...INITIAL_CONSENT });
        setFieldErrors({});
        setShowConsentErrors(false);
        setDuplicateError(null);
      },
      onError: (err: ApiError) => {
        const errorObj = err.response?.data?.error;
        const code =
          errorObj?.code ||
          (typeof errorObj?.message === 'object' ? errorObj.message?.error?.code : undefined);

        if (code === 'DUPLICATE_PATIENT') {
          setDuplicateError('A patient with this name and date of birth already exists.');
        } else {
          setGenericError('Something went wrong. Please try again.');
        }
      },
    });
  };

  const isSubmitDisabled =
    !formData.first_name.trim() ||
    !formData.last_name.trim() ||
    !formData.date_of_birth ||
    !formData.sex ||
    createPatient.isPending;

  if (successPatientUid) {
    return (
      <div className="bg-white border border-emerald-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-8 py-10 flex flex-col items-center text-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Patient Registered Successfully</h2>
            <p className="mt-3 text-2xl font-black text-emerald-700 tracking-tight">
              Patient UID: {successPatientUid}
            </p>
            <p className="mt-2 text-sm text-slate-500">Please note this UID for the patient record.</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessPatientUid(null)}
            className="mt-2 h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-sm"
          >
            Register Another Patient
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-linear-to-r from-emerald-50 to-white">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Enter the patient&apos;s demographic and contact information.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* NAME ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="first_name">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Juan"
                className={`w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 ${
                  fieldErrors.first_name ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {fieldErrors.first_name && (
                <p className="text-xs text-red-500 font-medium">{fieldErrors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="middle_name">
                Middle Name
              </label>
              <input
                id="middle_name"
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                placeholder="Santos (optional)"
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="last_name">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Dela Cruz"
                className={`w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 ${
                  fieldErrors.last_name ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {fieldErrors.last_name && (
                <p className="text-xs text-red-500 font-medium">{fieldErrors.last_name}</p>
              )}
            </div>
          </div>

          {/* DOB + SEX ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="date_of_birth">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                id="date_of_birth"
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className={`w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 ${
                  fieldErrors.date_of_birth ? 'border-red-300' : 'border-slate-200'
                }`}
              />
              {fieldErrors.date_of_birth && (
                <p className="text-xs text-red-500 font-medium">{fieldErrors.date_of_birth}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="sex">
                Sex <span className="text-red-500">*</span>
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                className={`w-full h-12 rounded-2xl border bg-slate-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 ${
                  fieldErrors.sex ? 'border-red-300' : 'border-slate-200'
                }`}
              >
                <option value="">Select sex...</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              {fieldErrors.sex && (
                <p className="text-xs text-red-500 font-medium">{fieldErrors.sex}</p>
              )}
            </div>
          </div>

          {/* CONTACT */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="contact_no">
              Contact Number
            </label>
            <input
              id="contact_no"
              type="text"
              name="contact_no"
              value={formData.contact_no}
              onChange={handleInputChange}
              placeholder="09XXXXXXXXX"
              className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* ADDRESS */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Street, Barangay, City, Province"
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none"
            />
          </div>

          {/* WALK-IN TOGGLE */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50">
            <div>
              <p className="text-sm font-semibold text-slate-700">Walk-in Patient</p>
              <p className="text-xs text-slate-400 mt-0.5">Enable if the patient arrived without a prior appointment.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.is_walkin}
              onClick={() => setFormData((prev) => ({ ...prev, is_walkin: !prev.is_walkin }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                formData.is_walkin ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  formData.is_walkin ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {duplicateError && (
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50">
              <p className="text-sm font-medium text-red-600">{duplicateError}</p>
            </div>
          )}

          {genericError && (
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50">
              <p className="text-sm font-medium text-red-600">{genericError}</p>
            </div>
          )}
        </div>
      </div>

      <ConsentCapture value={consent} onChange={setConsent} showErrors={showConsentErrors} />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="h-12 px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          {createPatient.isPending ? 'Registering Patient...' : 'Register Patient'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
