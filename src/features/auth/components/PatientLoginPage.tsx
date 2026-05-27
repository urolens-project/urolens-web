import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { useAuthContext } from '../../../lib/auth/useAuthContext';
import { usePatientLogin } from '../hooks/usePatientLogin';
import { UserRole } from '../../../types/enums';
import type { ApiError } from '../types';

const errorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Invalid Patient ID or password. Please check and try again.',
  PATIENT_ACCOUNT_LOCKED:
    'Your access has been temporarily locked. Please contact the laboratory.',
};

function getErrorMessage(err: AxiosError<ApiError>): string {
  const code = err.response?.data?.error?.code;
  if (code && code in errorMessages) {
    return errorMessages[code];
  }
  return 'Something went wrong. Please try again.';
}

export default function PatientLoginPage() {
  const { isAuthenticated, role } = useAuthContext();
  const [patientUid, setPatientUid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const loginMutation = usePatientLogin();

  // Already authenticated patients go straight to results
  if (isAuthenticated && role === UserRole.PATIENT) {
    return <Navigate to="/dashboard/patient/results" replace />;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    loginMutation.mutate(
      { patientUid: patientUid.trim(), password },
      {
        onError: (err: AxiosError<ApiError>) => {
          setServerError(getErrorMessage(err));
        },
      },
    );
  }

  const isSubmitting = loginMutation.isPending;
  const canSubmit = patientUid.trim().length > 0 && password.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Patient Portal</h1>
            <p className="text-sm text-slate-500 mt-1">
              Enter your Patient ID and password to view your results
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Patient ID field */}
            <div>
              <label
                htmlFor="patientUid"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5"
              >
                Patient ID
              </label>
              <input
                id="patientUid"
                type="text"
                value={patientUid}
                onChange={(e) => setPatientUid(e.target.value)}
                className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="e.g. PAT-000001"
                disabled={isSubmitting}
                autoComplete="username"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Your Patient ID can be found on your laboratory receipt.
              </p>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="patientPassword"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="patientPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  placeholder="Surname + Date of Birth"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Your password is your surname in capital letters followed by your date of
                birth (DDMMYYYY). Example: SANTOS04072001
              </p>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 font-medium">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
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
