import React from 'react';
import { ShieldCheck, Store } from 'lucide-react';
import { getStatusInfo } from '../utils/helpers';

export function BookingStatusBadge({ status }) {
  const info = getStatusInfo(status);

  const colorMap = {
    booking_confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    pickup_assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    pickup_on_the_way: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    pickup_arrived: 'bg-amber-50 text-amber-700 border-amber-200',
    phone_collected: 'bg-sky-50 text-sky-700 border-sky-200',
    reached_shop: 'bg-violet-50 text-violet-700 border-violet-200',
    repair_in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    repair_completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    out_for_delivery: 'bg-blue-50 text-blue-700 border-blue-200',
    phone_delivered: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        colorMap[status] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {info.label}
    </span>
  );
}

export function ShopCategoryBadge({ isAuthorized, compact = false }) {
  if (isAuthorized) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        {compact ? 'Authorized' : 'Brand-Authorized Centre'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      <Store className="w-3.5 h-3.5 shrink-0" />
      {compact ? 'Independent' : 'Independent Repair Shop'}
    </span>
  );
}
