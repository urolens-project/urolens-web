import { useState, type FormEvent } from 'react';
import { Activity, AlertCircle, ClipboardList, Eye, EyeOff, Lock, ShieldCheck, User, Zap } from 'lucide-react';
import { useLogin } from '../hooks/useAuth';
import type { AxiosError } from 'axios';
import type { ApiError } from '../types';

const errorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Invalid username or password. Please try again.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact the administrator.',
  ACCOUNT_INACTIVE: 'Your account is inactive. Please contact the administrator.',
};

function getErrorMessage(code: string | undefined): string {
  if (code && errorMessages[code]) return errorMessages[code];
  return 'Something went wrong. Please try again.';
}

const features = [
  { icon: Zap,           text: 'AI-assisted urinalysis and particle classification' },
  { icon: ShieldCheck,   text: 'Role-gated access across all clinical roles'        },
  { icon: ClipboardList, text: 'Supervisor approval workflows with full audit trail' },
];

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const loginMutation = useLogin();
  const isSubmitting = loginMutation.isPending;

  function validate(): boolean {
    let valid = true;
    setUsernameError('');
    setPasswordError('');
    if (!username.trim()) { setUsernameError('Username is required.'); valid = false; }
    if (!password)         { setPasswordError('Password is required.'); valid = false; }
    return valid;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    loginMutation.mutate(
      { username: username.trim(), password },
      { onError: (error: AxiosError<ApiError>) => {
          const code = error.response?.data?.error?.code;
          setServerError(getErrorMessage(code));
        },
      },
    );
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-12 bg-slate-900 overflow-hidden">

        {/* Background glow blobs */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900" />
        <div className="pointer-events-none absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-emerald-400/8 blur-[100px]" />

        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px)' }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-900/40">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base tracking-tight leading-none">UroLens LIS</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-400/80">
              Laboratory Information System
            </p>
          </div>
        </div>

        {/* Headline + features */}
        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-[2.6rem] font-bold leading-[1.15] text-white tracking-tight">
              Precision in<br />every diagnosis.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-xs">
              A clinical-grade platform built for urology laboratory workflows — from specimen intake through result sign-off.
            </p>
          </div>

          <div className="space-y-3.5">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                  <Icon className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-slate-600">
          &copy; {new Date().getFullYear()} UroLens LIS &middot; All rights reserved
        </p>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">

        {/* Mobile logo (hidden on lg+) */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
            <Activity className="h-4.5 w-4.5 text-white" />
          </div>
          <p className="font-bold text-slate-900 tracking-tight">UroLens LIS</p>
        </div>

        <div className="w-full max-w-sm">

          {/* Form header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">Sign in to your workspace to continue.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  autoComplete="username"
                  disabled={isSubmitting}
                  onChange={(e) => { setUsername(e.target.value); if (usernameError) setUsernameError(''); }}
                  placeholder="Your registered username"
                  className={`w-full h-11 rounded-xl border pl-10 pr-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    usernameError
                      ? 'border-red-400 bg-red-50/40'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 focus:bg-white'
                  }`}
                />
              </div>
              {usernameError && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                  <AlertCircle className="h-3 w-3 shrink-0" /> {usernameError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                  placeholder="Your security password"
                  className={`w-full h-11 rounded-xl border pl-10 pr-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    passwordError
                      ? 'border-red-400 bg-red-50/40'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                  <AlertCircle className="h-3 w-3 shrink-0" /> {passwordError}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-xs font-medium text-red-600">{serverError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full h-11 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying…
                </>
              ) : (
                'Sign in to Workspace'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-10 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} UroLens LIS &middot; Secure Access
          </p>
        </div>
      </div>
    </div>
  );
}
