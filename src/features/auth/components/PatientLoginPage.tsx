import { useState, type FormEvent } from 'react';
import type { AxiosError } from 'axios';
import { usePatientLogin } from '../hooks/usePatientLogin';
import type { ApiError } from '../types';

const errorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Patient ID or password is incorrect. Please try again.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact the laboratory.',
  ACCOUNT_INACTIVE: 'Your account is inactive. Please contact the laboratory.',
};

function getErrorMessage(code: string | undefined): string {
  if (code && errorMessages[code]) {
    return errorMessages[code];
  }
  return 'Something went wrong. Please try again.';
}

export default function PatientLoginPage() {
  const [patientUid, setPatientUid] = useState('');
  const [password, setPassword] = useState('');
  const [patientUidError, setPatientUidError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const loginMutation = usePatientLogin();

  function validate(): boolean {
    let valid = true;
    setPatientUidError('');
    setPasswordError('');

    if (!patientUid.trim()) {
      setPatientUidError('Patient ID is required.');
      valid = false;
    }
    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    }
    return valid;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    loginMutation.mutate(
      { patient_uid: patientUid.trim(), password },
      {
        onError: (error: AxiosError<ApiError>) => {
          const code = error.response?.data?.error?.code;
          setServerError(getErrorMessage(code));
        },
      },
    );
  }

  const isSubmitting = loginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">UroLens Patient Portal</h1>
            <p className="text-sm text-slate-500 mt-1">Access your laboratory results</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="patient-uid" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Patient ID
              </label>
              <input
                id="patient-uid"
                type="text"
                value={patientUid}
                onChange={(e) => {
                  setPatientUid(e.target.value);
                  if (patientUidError) setPatientUidError('');
                }}
                className={`w-full h-11 px-3.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                  patientUidError ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
                placeholder="Enter your Patient ID from the lab receipt"
                autoComplete="username"
                disabled={isSubmitting}
              />
              {patientUidError && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">{patientUidError}</p>
              )}
            </div>

            <div>
              <label htmlFor="patient-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                id="patient-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                className={`w-full h-11 px-3.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                  passwordError ? 'border-red-400 bg-red-50/30' : 'border-slate-200'
                }`}
                placeholder="SURNAME + date of birth (e.g. DELACRUZ01011990)"
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              {passwordError && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">{passwordError}</p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                Password format: last name (uppercase, no spaces) followed by date of birth as DDMMYYYY.
                Example: <span className="font-mono">SANTOS05031990</span>
              </p>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 font-medium">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting && (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isSubmitting ? 'Verifying...' : 'View My Results'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
