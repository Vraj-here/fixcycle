import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Inbox,
  Wrench,
  CheckCircle2,
  IndianRupee,
  Clock,
  MapPin,
  Send,
  XCircle,
  Navigation,
  Image as ImageIcon,
} from 'lucide-react';
import { useFixCycle } from '../context/FixCycleContext';
import { BookingStatusBadge } from '../components/StatusBadge';
import {
  BOOKING_STATUSES,
  formatINR,
  formatPriceRange,
  getPickupMethodLabel,
} from '../utils/helpers';

const DEMO_SHOP_ID = 'shop-quickfix';

export default function ShopDashboardPage() {
  const {
    repairRequests,
    bookings,
    respondToRequestAsShop,
    updateBookingStatus,
    addToast,
  } = useFixCycle();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'bookings'
  const [quoteForms, setQuoteForms] = useState({});
  const [confirmedPrices, setConfirmedPrices] = useState({});

  const pendingRequests = repairRequests.filter(
    (r) => r.shopDecision === 'pending'
  );
  const quotedRequests = repairRequests.filter(
    (r) => r.shopDecision === 'quoted'
  );
  const activeRepairs = bookings.filter((b) => b.status !== 'phone_delivered');
  const completedRepairs = bookings.filter(
    (b) => b.status === 'phone_delivered'
  );

  // Sample earnings calculated from prototype bookings
  const sampleEarnings = bookings.reduce((sum, b) => {
    const val =
      b.confirmedPrice ||
      Math.round((b.estimatedPriceMin + b.estimatedPriceMax) / 2);
    return sum + val;
  }, 0);

  const getFormValues = (reqId) => {
    return (
      quoteForms[reqId] || {
        priceMin: '1500',
        priceMax: '2100',
        estimatedHours: '3',
        pickupMethod: 'shop_technician',
        message: 'Genuine-grade spare parts ready in stock. Same-day return available.',
      }
    );
  };

  const updateFormField = (reqId, field, value) => {
    setQuoteForms((prev) => ({
      ...prev,
      [reqId]: {
        ...getFormValues(reqId),
        [field]: value,
      },
    }));
  };

  const handleSendQuote = (reqId) => {
    const form = getFormValues(reqId);
    const min = Number(form.priceMin);
    const max = Number(form.priceMax);
    const hrs = Number(form.estimatedHours);

    if (!min || !max || min <= 0 || max < min) {
      addToast('Please enter a valid min and max estimated price range.', 'warning');
      return;
    }
    if (!hrs || hrs <= 0) {
      addToast('Please enter a valid estimated repair duration in hours.', 'warning');
      return;
    }

    respondToRequestAsShop(reqId, DEMO_SHOP_ID, {
      action: 'quote',
      priceMin: min,
      priceMax: max,
      estimatedHours: hrs,
      pickupMethod: form.pickupMethod,
      message: form.message,
    });
  };

  const handleDeclineRequest = (reqId) => {
    respondToRequestAsShop(reqId, DEMO_SHOP_ID, { action: 'decline' });
  };

  const handleStatusChange = (bookingId, newStatus) => {
    const priceInput = confirmedPrices[bookingId];
    const extra =
      priceInput && Number(priceInput) > 0
        ? { confirmedPrice: Number(priceInput) }
        : {};
    updateBookingStatus(bookingId, newStatus, extra);
    const label =
      BOOKING_STATUSES.find((s) => s.key === newStatus)?.label || newStatus;
    addToast(`Booking ${bookingId} updated to "${label}"`, 'success');
  };

  const handleSaveConfirmedPrice = (bookingId, currentStatus) => {
    const val = Number(confirmedPrices[bookingId]);
    if (!val || val <= 0) {
      addToast('Enter a valid confirmed repair price in ₹.', 'warning');
      return;
    }
    updateBookingStatus(bookingId, currentStatus, { confirmedPrice: val });
    addToast(`Confirmed final price (${formatINR(val)}) saved for ${bookingId}.`, 'success');
  };

  const shopStatusQuickOptions = [
    { key: 'booking_confirmed', label: 'Accepted' },
    { key: 'pickup_assigned', label: 'Pickup Assigned' },
    { key: 'phone_collected', label: 'Phone Collected' },
    { key: 'repair_in_progress', label: 'Repair in Progress' },
    { key: 'repair_completed', label: 'Repair Completed' },
    { key: 'out_for_delivery', label: 'Ready / Out for Delivery' },
    { key: 'phone_delivered', label: 'Delivered' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <Store className="w-3.5 h-3.5" />
            Shop Owner Dashboard (Demo)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            QuickFix Mobile Lab — Deccan, Pune
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Respond to incoming repair requests with quotations and manage active doorstep repair statuses.
          </p>
        </div>

        <Link
          to="/quotations"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start md:self-auto"
        >
          Preview Customer Quotations View
        </Link>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>New Requests</span>
            <Inbox className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {pendingRequests.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Quoted / Accepted</span>
            <Send className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {quotedRequests.length + bookings.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Repairs</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {activeRepairs.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-card">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {completedRepairs.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-card col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Sample Earnings</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatINR(sampleEarnings)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Incoming Requests ({repairRequests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'bookings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Booking Management ({bookings.length})
        </button>
      </div>

      {/* TAB 1: INCOMING REPAIR REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {repairRequests.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">
              No incoming repair requests right now.
            </div>
          ) : (
            repairRequests.map((req) => {
              const form = getFormValues(req.id);
              return (
                <div
                  key={req.id}
                  className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    {/* Customer Request Details */}
                    <div className="flex-1 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {req.id}
                        </span>
                        {req.shopDecision === 'pending' && (
                          <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                            Awaiting Quotation
                          </span>
                        )}
                        {req.shopDecision === 'quoted' && (
                          <span className="rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                            Quotation Sent
                          </span>
                        )}
                        {req.shopDecision === 'declined' && (
                          <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            Declined
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">
                        {req.brandName} {req.model}
                      </h3>

                      <p className="text-xs text-slate-700">
                        <strong>Reported Issues:</strong> {req.problems.join(', ')}
                      </p>

                      {req.description && (
                        <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                          “{req.description}”
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>
                          <strong>Customer:</strong> {req.customerName}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {req.pickupArea}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {req.pickupDate} · {req.pickupTimeSlot}
                        </span>
                      </div>

                      {req.photoDataUrl ? (
                        <div className="pt-2">
                          <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Customer Reference Photo
                          </p>
                          <img
                            src={req.photoDataUrl}
                            alt="Customer uploaded damage"
                            className="h-24 w-24 rounded-xl object-cover border border-slate-200"
                          />
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          No damage photograph attached.
                        </p>
                      )}
                    </div>

                    {/* Quotation Response Panel */}
                    <div className="lg:w-[400px] rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3 shrink-0">
                      <p className="text-xs font-bold text-slate-800">
                        Send Quotation / Respond
                      </p>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Min Price (₹)
                          </label>
                          <input
                            type="number"
                            min="100"
                            step="50"
                            value={form.priceMin}
                            onChange={(e) =>
                              updateFormField(req.id, 'priceMin', e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Max Price (₹)
                          </label>
                          <input
                            type="number"
                            min="100"
                            step="50"
                            value={form.priceMax}
                            onChange={(e) =>
                              updateFormField(req.id, 'priceMax', e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Est. Time (hrs)
                          </label>
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={form.estimatedHours}
                            onChange={(e) =>
                              updateFormField(
                                req.id,
                                'estimatedHours',
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Pickup Method
                          </label>
                          <select
                            value={form.pickupMethod}
                            onChange={(e) =>
                              updateFormField(
                                req.id,
                                'pickupMethod',
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900"
                          >
                            <option value="shop_technician">
                              Shop Technician
                            </option>
                            <option value="delivery_partner">
                              Delivery Partner
                            </option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Short Message to Customer
                        </label>
                        <input
                          type="text"
                          value={form.message}
                          onChange={(e) =>
                            updateFormField(req.id, 'message', e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSendQuote(req.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {req.shopDecision === 'quoted'
                            ? 'Update Quote'
                            : 'Accept & Send Quote'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(req.id)}
                          className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: BOOKING MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {booking.id}
                    </span>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {booking.brandName} {booking.model} —{' '}
                    <span className="font-medium text-slate-600">
                      {booking.problems.join(', ')}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Customer: <strong>{booking.customerName}</strong> ·{' '}
                    {getPickupMethodLabel(booking.pickupMethod)} ·{' '}
                    {booking.pickupDate} ({booking.pickupTimeSlot})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-left md:text-right mr-2">
                    <p className="text-[11px] text-slate-500">
                      Est: {formatPriceRange(booking.estimatedPriceMin, booking.estimatedPriceMax)}
                    </p>
                    <p className="text-xs font-bold text-blue-700">
                      Confirmed:{' '}
                      {booking.confirmedPrice
                        ? formatINR(booking.confirmedPrice)
                        : 'Not set yet'}
                    </p>
                  </div>
                  <Link
                    to={`/track/${booking.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    View Tracker
                  </Link>
                </div>
              </div>

              {/* Confirm Final Price after inspection */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700">
                  Confirm Inspection Price (₹):
                </label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  placeholder={String(booking.confirmedPrice || booking.estimatedPriceMin)}
                  value={confirmedPrices[booking.id] || ''}
                  onChange={(e) =>
                    setConfirmedPrices((prev) => ({
                      ...prev,
                      [booking.id]: e.target.value,
                    }))
                  }
                  className="w-32 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleSaveConfirmedPrice(booking.id, booking.status)
                  }
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Save Final Price
                </button>
              </div>

              {/* Status Update Pills */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Update Repair &amp; Handover Status:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {shopStatusQuickOptions.map((st) => {
                    const isCurrent = booking.status === st.key;
                    return (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => handleStatusChange(booking.id, st.key)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
