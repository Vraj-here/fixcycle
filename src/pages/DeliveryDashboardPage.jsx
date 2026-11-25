import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bike,
  MapPin,
  Store,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import { useFixCycle } from '../context/FixCycleContext';
import TrackingMap from '../components/TrackingMap';
import { BookingStatusBadge } from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { buildSimulatedRoute, getPickupMethodLabel } from '../utils/helpers';

const DELIVERY_STEPS = [
  { key: 'pickup_assigned', label: 'Accepted assignment' },
  { key: 'pickup_on_the_way', label: 'On the way' },
  { key: 'pickup_arrived', label: 'Arrived at pickup' },
  { key: 'phone_collected', label: 'Phone collected' },
  { key: 'reached_shop', label: 'Reached repair shop' },
  { key: 'out_for_delivery', label: 'Out for return delivery' },
  { key: 'phone_delivered', label: 'Delivered' },
];

export default function DeliveryDashboardPage() {
  const { bookings, updateBookingStatus, addToast } = useFixCycle();

  const [selectedId, setSelectedId] = useState(
    () =>
      bookings.find((b) => b.status !== 'phone_delivered')?.id ||
      bookings[0]?.id ||
      null
  );

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === selectedId) || bookings[0] || null,
    [bookings, selectedId]
  );

  const routePoints = useMemo(() => {
    if (!selectedBooking) return [];
    return buildSimulatedRoute(
      selectedBooking.shopCoords,
      selectedBooking.customerCoords,
      30
    );
  }, [selectedBooking]);

  const riderCoords = useMemo(() => {
    if (!selectedBooking || !routePoints.length) return null;
    const last = routePoints.length - 1;
    switch (selectedBooking.status) {
      case 'booking_confirmed':
      case 'pickup_assigned':
      case 'reached_shop':
      case 'repair_in_progress':
      case 'repair_completed':
        return routePoints[0];
      case 'pickup_on_the_way':
        return routePoints[Math.floor(last * 0.48)];
      case 'pickup_arrived':
      case 'phone_delivered':
        return routePoints[last];
      case 'phone_collected':
      case 'out_for_delivery':
        return routePoints[Math.floor(last * 0.55)];
      default:
        return routePoints[0];
    }
  }, [selectedBooking, routePoints]);

  const handleUpdateDeliveryStatus = (bookingId, statusKey, label) => {
    updateBookingStatus(bookingId, statusKey);
    addToast(`Delivery update saved: ${label} (${bookingId})`, 'success');
  };

  if (!selectedBooking) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          icon={Bike}
          title="No assigned pickup tasks"
          description="When a customer confirms a doorstep repair booking, the pickup and return delivery assignment will appear here."
          actionLabel="Create Demo Booking as Customer"
          actionTo="/select-phone"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <Bike className="w-3.5 h-3.5" />
            Delivery Partner &amp; Field Technician Dashboard (Demo)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Assigned Pickups &amp; Return Deliveries
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage doorstep collection, shop handover, and return delivery updates. Changes sync live with Customer Tracking.
          </p>
        </div>

        <Link
          to={`/track/${selectedBooking.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 self-start md:self-auto"
        >
          <Navigation className="w-3.5 h-3.5" />
          Open Customer Live Map
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Assigned Queue */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
            Assigned Tasks ({bookings.length})
          </p>
          {bookings.map((b) => {
            const active = b.id === selectedBooking.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedId(b.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-100 shadow-card'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-card'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {b.id}
                  </span>
                  <BookingStatusBadge status={b.status} />
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {b.brandName} {b.model}
                </p>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  From: {b.customerArea}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  Shop: {b.shopName}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right: Active Assignment Map & Status Controls */}
        <div className="lg:col-span-8 space-y-5">
          {/* Assignment Card */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {selectedBooking.id}
                  </span>
                  <BookingStatusBadge status={selectedBooking.status} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  {selectedBooking.brandName} {selectedBooking.model}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer: {selectedBooking.customerName} ·{' '}
                  {getPickupMethodLabel(selectedBooking.pickupMethod)}
                </p>
              </div>
              <div className="rounded-xl bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                Verify Booking ID at handover
              </div>
            </div>

            {/* Pickup & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                <p className="font-semibold text-green-700 flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Pickup Location (Approx. Demo)
                </p>
                <p className="font-semibold text-slate-900">
                  {selectedBooking.customerArea}
                </p>
                <p className="text-slate-500 mt-0.5">
                  Slot: {selectedBooking.pickupDate} ·{' '}
                  {selectedBooking.pickupTimeSlot}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                <p className="font-semibold text-slate-800 flex items-center gap-1 mb-1">
                  <Store className="w-3.5 h-3.5 text-blue-600" />
                  Repair Shop Destination
                </p>
                <p className="font-semibold text-slate-900">
                  {selectedBooking.shopName}
                </p>
                <p className="text-slate-500 mt-0.5">
                  {selectedBooking.shopAddress}
                </p>
              </div>
            </div>

            {/* Delivery Status Action Buttons */}
            <div>
              <p className="text-xs font-semibold text-slate-800 mb-2.5">
                Update Delivery Milestone (Simulated):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {DELIVERY_STEPS.map((step) => {
                  const isCurrent = selectedBooking.status === step.key;
                  const isDone = selectedBooking.statusHistory?.some(
                    (h) => h.status === step.key
                  );
                  return (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() =>
                        handleUpdateDeliveryStatus(
                          selectedBooking.id,
                          step.key,
                          step.label
                        )
                      }
                      className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all text-left ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : isDone
                          ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{step.label}</span>
                      {(isCurrent || isDone) && (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simulated Route Map */}
          <TrackingMap
            customerCoords={selectedBooking.customerCoords}
            shopCoords={selectedBooking.shopCoords}
            riderCoords={riderCoords}
            routePoints={routePoints}
            shopName={selectedBooking.shopName}
            riderLabel={selectedBooking.pickupPerson?.name || 'Partner'}
            heightClass="h-[320px] sm:h-[380px]"
          />
        </div>
      </div>
    </div>
  );
}
