import React from 'react';
import { Check, Clock } from 'lucide-react';
import { BOOKING_STATUSES, getStatusIndex } from '../utils/helpers';

export default function BookingTimeline({ currentStatus, statusHistory = [] }) {
  const activeIndex = getStatusIndex(currentStatus);

  const timeByStatus = statusHistory.reduce((acc, item) => {
    acc[item.status] = item.time;
    return acc;
  }, {});

  return (
    <ol className="relative space-y-4">
      {BOOKING_STATUSES.map((step, index) => {
        const isCompleted = index < activeIndex || (index === activeIndex && currentStatus === 'phone_delivered');
        const isCurrent = index === activeIndex && currentStatus !== 'phone_delivered';

        return (
          <li key={step.key} className="relative flex gap-3.5">
            {/* Vertical connecting line */}
            {index !== BOOKING_STATUSES.length - 1 && (
              <span
                className={`absolute left-[13px] top-7 bottom-[-18px] w-0.5 ${
                  index < activeIndex ? 'bg-blue-600' : 'bg-slate-200'
                }`}
                aria-hidden="true"
              />
            )}

            {/* Node circle */}
            <div
              className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                isCompleted
                  ? 'bg-green-600 border-green-600 text-white'
                  : isCurrent
                  ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5" />
              ) : isCurrent ? (
                <Clock className="w-3.5 h-3.5" />
              ) : (
                index + 1
              )}
            </div>

            {/* Step text */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className={`text-sm font-medium ${
                    isCurrent
                      ? 'text-blue-700'
                      : isCompleted
                      ? 'text-slate-900'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                {timeByStatus[step.key] && (
                  <span className="text-xs text-slate-500 font-medium">
                    {timeByStatus[step.key]}
                  </span>
                )}
              </div>
              {(isCurrent || isCompleted) && (
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
