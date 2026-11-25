import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  MapPin,
  Smartphone,
  Clock,
  Calendar,
  UserCheck,
  Bike,
  Phone,
  Navigation,
  ClipboardList,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useFixCycle } from '../context/FixCycleContext';
import { BookingStatusBadge, ShopCategoryBadge } from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import {
  formatPriceRange,
  formatINR,
  formatHours,
  getPickupMethodLabel,
} from '../utils/helpers';

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const { bookings } = useFixCycle();

  const booking = bookings.find((b) => b.id === id) || bookings[0];

  if (!booking || (id && !bookings.find((b) => b.id === id))) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          icon={AlertCircle}
          title="Booking not found"
          description={`We could not find a repair booking matching ID "${id}". It may have been cleared or reset.`}
          actionLabel="Go to My Bookings"
          actionTo="/my-bookings"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Success Header */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-card mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 border border-green-200 text-green-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-1">
          Doorstep Repair Scheduled
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Booking Confirmed!
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
          Your repair request has been confirmed with{' '}
          <strong>{booking.shopName}</strong>. Share your Booking ID with the pickup person at handover.
        </p>

        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-5 py-3">
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Booking ID
            </p>
            <p className="text-lg font-mono font-bold text-slate-900">{booking.id}</p>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <BookingStatusBadge status={booking.status} />
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link
            to={`/track/${booking.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Track My Pickup
          </Link>
          <Link
            to="/my-bookings"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            View My Bookings
          </Link>
        </div>
      </div>

      {/* Detailed Booking Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Device & Quotation Details */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Device &amp; Quotation Summary
          </h2>

          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Selected Smartphone</p>
              <p className="text-sm font-bold text-slate-900">
                {booking.brandName} {booking.model}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-1">Reported Problems</p>
            <div className="flex flex-wrap gap-1.5">
              {booking.problems.map((p) => (
                <span
                  key={p}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Quoted Estimate Range</span>
              <span className="font-bold text-slate-900">
                {formatPriceRange(
                  booking.estimatedPriceMin,
                  booking.estimatedPriceMax
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Confirmed Final Price</span>
              <span className="font-semibold text-blue-700">
                {booking.confirmedPrice
                  ? formatINR(booking.confirmedPrice)
                  : 'Confirmed after shop inspection'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Est. Repair Duration</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                ~{formatHours(booking.estimatedRepairHours)}
              </span>
            </div>
          </div>
        </div>

        {/* Shop & Pickup Person Details */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Repair Shop &amp; Pickup Schedule
          </h2>

          <div>
            <div className="mb-1.5">
              <ShopCategoryBadge isAuthorized={booking.shopIsAuthorized} compact />
            </div>
            <p className="text-sm font-bold text-slate-900">{booking.shopName}</p>
            <p className="text-xs text-slate-500 flex items-start gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              {booking.shopAddress}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Pickup Date
              </p>
              <p className="font-semibold text-slate-900 mt-1">{booking.pickupDate}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Time Window
              </p>
              <p className="font-semibold text-slate-900 mt-1">
                {booking.pickupTimeSlot}
              </p>
            </div>
          </div>

          {/* Assigned Pickup Person */}
          <div className="rounded-xl border border-slate-200 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1 mb-2">
              {booking.pickupMethod === 'shop_technician' ? (
                <UserCheck className="w-3.5 h-3.5" />
              ) : (
                <Bike className="w-3.5 h-3.5" />
              )}
              {getPickupMethodLabel(booking.pickupMethod)}
            </p>
            {booking.pickupPerson && (
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full ${booking.pickupPerson.avatarBg} text-white flex items-center justify-center text-xs font-bold shrink-0`}
                >
                  {booking.pickupPerson.avatarInitials}
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">
                    {booking.pickupPerson.name}
                  </p>
                  <p className="text-slate-500">{booking.pickupPerson.role}</p>
                  <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    {booking.pickupPerson.demoContact}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust Note */}
      <div className="mt-5 rounded-xl bg-blue-50/70 border border-blue-100 px-4 py-3 text-xs text-blue-900 flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          Always verify Booking ID <strong>{booking.id}</strong> and confirm the device handover condition before sealing the pouch.
        </span>
      </div>
    </div>
  );
}
