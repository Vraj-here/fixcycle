import React from 'react';
import { Star, MapPin, Clock, Bike, UserCheck, ChevronRight } from 'lucide-react';
import { ShopCategoryBadge } from './StatusBadge';
import { formatPriceRange, formatHours } from '../utils/helpers';

export default function ShopCard({
  shop,
  distanceKm,
  estimatedMin,
  estimatedMax,
  isSelected,
  onSelect,
  onViewProfile,
}) {
  const supportsTechPickup = shop.pickupMethods.includes('shop_technician');
  const supportsPartnerPickup = shop.pickupMethods.includes('delivery_partner');

  return (
    <div
      onClick={() => onSelect && onSelect(shop)}
      className={`group rounded-2xl border bg-white p-4 sm:p-5 transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-100 shadow-card-hover'
          : 'border-slate-200 hover:border-slate-300 shadow-card hover:shadow-card-hover'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <ShopCategoryBadge isAuthorized={shop.isAuthorized} compact />
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {shop.rating.toFixed(1)}
              <span className="font-normal text-amber-700/80">({shop.reviewCount})</span>
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
            {shop.name}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{shop.area}</span>
            {distanceKm !== undefined && (
              <span className="shrink-0 font-medium text-slate-700">· {distanceKm} km away</span>
            )}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[11px] text-slate-500">Est. repair</p>
          <p className="text-sm font-bold text-slate-900">
            {formatPriceRange(estimatedMin, estimatedMax)}
          </p>
          <p className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            ~{formatHours(shop.avgRepairHours)}
          </p>
        </div>
      </div>

      {/* Pickup availability pills */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {shop.pickupAvailable ? (
            <>
              {supportsTechPickup && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                  <UserCheck className="w-3 h-3" />
                  Technician Pickup
                </span>
              )}
              {supportsPartnerPickup && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                  <Bike className="w-3 h-3" />
                  Delivery Partner
                </span>
              )}
            </>
          ) : (
            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              Walk-in only (No pickup)
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile && onViewProfile(shop);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          Reviews &amp; Profile
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
