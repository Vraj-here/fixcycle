import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { useFixCycle } from '../context/FixCycleContext';
import { USER_ROLES } from '../data/demoUsers';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 1000;

export default function LoginPage() {
  const { currentUser, loginAccount, registerAccount, logout } = useFixCycle();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const redirectByRole = (userRole) => {
    const dest = USER_ROLES[userRole]?.defaultRoute || '/my-bookings';
    navigate(dest);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'signin' && Date.now() < lockedUntil) {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
      setErrorMsg(`Too many failed attempts. Please wait ${secs}s before trying again.`);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const res = await loginAccount({ email, password });
        if (!res.ok) {
          const nextFails = failedAttempts + 1;
          setFailedAttempts(nextFails);
          if (nextFails >= MAX_FAILED_ATTEMPTS) {
            setLockedUntil(Date.now() + LOCKOUT_MS);
            setFailedAttempts(0);
            setErrorMsg(
              'Too many failed sign-in attempts. Login temporarily locked for 30 seconds.'
            );
          } else {
            setErrorMsg(res.error);
          }
          return;
        }
        setFailedAttempts(0);
        redirectByRole(res.user.role);
      } else {
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          return;
        }
        const res = await registerAccount({ name, email, password, role });
        if (!res.ok) {
          setErrorMsg(res.error);
          return;
        }
        redirectByRole(res.user.role);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-card">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {mode === 'signin' ? 'Sign In to FixCycle' : 'Create Your Account'}
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            {mode === 'signin'
              ? 'Access your bookings, shop quotations, or delivery assignments securely.'
              : 'Register as a Customer, Repair Shop Owner, or Delivery Partner.'}
          </p>
        </div>

        {/* Already Signed-In Session Card */}
        {currentUser && (
          <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              Signed in as {currentUser.name} (
              {USER_ROLES[currentUser.role]?.label || 'Member'})
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => redirectByRole(currentUser.role)}
                className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Open Dashboard
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Inline Error */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          {mode === 'register' && (
            <>
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="auth-role"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Account Type
                </label>
                <select
                  id="auth-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {Object.values(USER_ROLES).map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {USER_ROLES[role]?.description}
                </p>
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === 'register'
                    ? 'Min. 8 characters (letters + numbers)'
                    : 'Enter your password'
                }
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label
                htmlFor="auth-confirm"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="auth-confirm"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {submitting
              ? 'Verifying...'
              : mode === 'signin'
              ? 'Sign In Securely'
              : 'Create Secure Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Notice (never displays credentials) */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            Passwords are protected using per-user salted SHA-256 hashing and are never stored in plaintext or exposed publicly.
          </p>
        </div>
      </div>
    </div>
  );
}
