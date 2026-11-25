import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { useFixCycle } from '../context/FixCycleContext';

/**
 * Role-based access guard for partner/shop dashboards.
 * Prevents unauthenticated visitors from viewing internal shop or delivery dashboards.
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { currentUser } = useFixCycle();

  const isAllowed =
    currentUser &&
    (allowedRoles.length === 0 || allowedRoles.includes(currentUser.role));

  if (!isAllowed) {
    const requiredText = allowedRoles.includes('shop_owner')
      ? 'Repair Shop Owner'
      : allowedRoles.includes('delivery_partner')
      ? 'Delivery Partner'
      : 'registered';

    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-card">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Restricted Portal Access
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            This dashboard is restricted to authenticated{' '}
            <strong>{requiredText}</strong> accounts. Please sign in or create an account with the appropriate role to continue.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Go to Secure Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
