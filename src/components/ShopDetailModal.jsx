import React from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  UserCheck,
  Bike,
  Phone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ShopCategoryBadge } from './StatusBadge';
import { BRANDS } from '../data/brands';
import { REPAIR_PROBLEMS } from '../data/problems';
import { formatPriceRange, formatHours } from '../utils/helpers';

export default function ShopDetailModal({
  shop,
  distanceKm,
  estimatedMin,
  estimatedMax,
  onClose,
  onRequestQuote,
}) {
  if (!shop) return null;

  const brandNames = shop.supportedBrands
    .map((id) => BRANDS.find((b) => b.id === id)?.name)
    .filter(Boolean);

  const problemNames = shop.supportedProblems
    .map((id) => REPAIR_PROBLEMS.find((p) => p.id === id)?.shortLabel)
    .filter(Boolean);

  const staffEntries = Object.entries(shop.pickupStaff || {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-modal-title"
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto thin-scrollbar rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-white/95 backdrop-blur border-b border-slate-100 px-5 sm:px-6 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <ShopCategoryBadge isAuthorized={shop.isAuthorized} />
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {shop.rating.toFixed(1)} ({shop.reviewCount} sample reviews)
              </span>
            </div>
            <h2 id="shop-modal-title" className="text-xl font-bold text-slate-900">
              {shop.name}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {shop.address}
              {distanceKm !== undefined && ` · ${distanceKm} km away`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close shop details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Illustrative Estimate</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {formatPriceRange(estimatedMin, estimatedMax)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Est. Turnaround</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                ~{formatHours(shop.avgRepairHours)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-500">Open Hours</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{shop.openHours}</p>
            </div>
          </div>

          {/* Authorization honesty note */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              {shop.isAuthorized ? (
                <p>
                  <strong>Verified Demo Entry — Brand-Authorized:</strong> Marked as an authorized service centre for{' '}
                  <strong>
                    {shop.authorizedBrands
                      .map((id) => BRANDS.find((b) => b.id === id)?.name)
                      .join(', ')}
                  </strong>
                  . {shop.warrantyNote}.
                </p>
              ) : (
                <p>
                  <strong>Independent Repair Shop:</strong> Not affiliated with smartphone manufacturers. Offers competitive pricing and {shop.warrantyNote.toLowerCase()}.
                </p>
              )}
            </div>
          </div>

          {/* Pickup Methods & Staff */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2.5">
              Doorstep Pickup Support
            </h3>
            {shop.pickupAvailable && staffEntries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {staffEntries.map(([method, person]) => (
                  <div
                    key={method}
                    className="rounded-xl border border-slate-200 p-3.5 flex items-start gap-3"
                  >
                    <div
                      className={`h-10 w-10 rounded-full ${person.avatarBg} text-white flex items-center justify-center text-xs font-bold shrink-0`}
                    >
                      {person.avatarInitials}
                    </div>
                    <div className="min-w-0 text-xs">
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-700 mb-0.5">
                        {method === 'shop_technician' ? (
                          <UserCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Bike className="w-3.5 h-3.5" />
                        )}
                        {method === 'shop_technician'
                          ? 'Shop Technician Pickup'
                          : 'Delivery Partner Pickup'}
                      </span>
                      <p className="font-semibold text-slate-900 text-sm">{person.name}</p>
                      <p className="text-slate-500">{person.role}</p>
                      <p className="text-slate-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {person.demoContact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                This shop currently supports walk-in repairs only and does not offer doorstep pickup.
              </div>
            )}
          </div>

          {/* Supported Brands */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Supported Brands</h3>
            <div className="flex flex-wrap gap-1.5">
              {brandNames.map((name) => (
                <span
                  key={name}
                  className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Repair Categories */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Repair Services</h3>
            <div className="flex flex-wrap gap-1.5">
              {problemNames.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Fictional Sample Reviews */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Customer Reviews ({shop.reviews.length})
              </h3>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Fictional Sample Reviews
              </span>
            </div>
            <div className="space-y-3">
              {shop.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{rev.author}</span>
                      <span className="text-xs text-slate-400">· {rev.date}</span>
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {rev.rating}.0
                    </span>
                  </div>
                  <p className="text-xs font-medium text-blue-700 mb-1">
                    {rev.device} — {rev.issue}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Estimates are indicative until technician inspection confirms the final price.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            {onRequestQuote && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestQuote(shop);
                }}
                className="flex-1 sm:flex-none rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Compare Quotations
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
