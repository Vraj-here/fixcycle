import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  MapPin,
  Award,
  UserCheck,
  Bike,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Scale,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { useFixCycle } from '../context/FixCycleContext';
import { ShopCategoryBadge } from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import {
  formatPriceRange,
  formatHours,
  getPickupMethodLabel,
} from '../utils/helpers';

export default function CompareQuotationsPage() {
  const {
    repairRequests,
    activeRequestId,
    setActiveRequestId,
    quotationsByRequest,
    submitRepairRequest,
    createBookingFromQuotation,
  } = useFixCycle();

  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'rating' | 'distance' | 'price' | 'time'
  const [selectedPickupByQuote, setSelectedPickupByQuote] = useState({});

  const activeRequest = useMemo(() => {
    if (activeRequestId) {
      const found = repairRequests.find((r) => r.id === activeRequestId);
      if (found) return found;
    }
    // Fallback to the first request that already has quotations
    const withQuotes = repairRequests.find(
      (r) => quotationsByRequest[r.id] && quotationsByRequest[r.id].length > 0
    );
    return withQuotes || null;
  }, [activeRequestId, repairRequests, quotationsByRequest]);

  const rawQuotes = activeRequest ? quotationsByRequest[activeRequest.id] || [] : [];

  const receivedQuotes = useMemo(() => {
    const active = rawQuotes.filter((q) => q.status !== 'declined');
    const copy = [...active];
    copy.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'price') return a.averageEstimatedPrice - b.averageEstimatedPrice;
      if (sortBy === 'time') return a.estimatedRepairHours - b.estimatedRepairHours;
      // Default: recommended first, then score
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return b.score - a.score;
    });
    return copy;
  }, [rawQuotes, sortBy]);

  const declinedCount = rawQuotes.filter((q) => q.status === 'declined').length;

  const handleLoadQuickDemoRequest = () => {
    const created = submitRepairRequest({
      brandId: 'apple',
      model: 'iPhone 15',
      problemIds: ['broken_screen'],
      description: 'Sample demo request for Pune quotation comparison.',
      photoDataUrl: null,
      pickupArea: 'FC Road / Shivajinagar, Pune, Maharashtra',
      pickupCoords: [18.5236, 73.8412],
      pickupDate: new Date().toISOString().slice(0, 10),
      pickupTimeSlot: '02:00 PM – 03:30 PM',
    });
    setActiveRequestId(created.id);
  };

  const getChosenMethod = (quote) => {
    if (!quote.pickupAvailable || !quote.pickupMethods?.length) return 'walk_in';
    return selectedPickupByQuote[quote.id] || quote.pickupMethods[0];
  };

  const handleConfirmBooking = (quote) => {
    const chosenMethod = getChosenMethod(quote);
    const newBooking = createBookingFromQuotation(
      activeRequest,
      quote,
      chosenMethod
    );
    navigate(`/booking-confirmation/${newBooking.id}`);
  };

  // Edge Case: No repair request submitted yet
  if (!activeRequest) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={Scale}
          title="No active repair request yet"
          description="Select your smartphone and describe the issue to receive and compare transparent quotations from nearby sample repair shops."
          actionLabel="Start Repair Request"
          actionTo="/select-phone"
        />
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={handleLoadQuickDemoRequest}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <Sparkles className="w-4 h-4" />
            Or generate a quick demo comparison (iPhone 14 · Screen Repair)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[11px]">
              4
            </span>
            <span>STEP 4 OF 4 · COMPARE QUOTATIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Compare Repair Quotations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review multiple shop estimates side by side, choose your preferred pickup option, and confirm your booking.
          </p>
        </div>

        <Link
          to="/shops"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start md:self-auto"
        >
          Back to Shop Map
        </Link>
      </div>

      {/* Request Summary Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 mb-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {activeRequest.photoDataUrl && (
            <img
              src={activeRequest.photoDataUrl}
              alt="Device reference"
              className="h-16 w-16 rounded-xl object-cover border border-slate-200 shrink-0"
            />
          )}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-700">
                {activeRequest.id}
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {activeRequest.brandName} {activeRequest.model}
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              <strong>Reported Issues:</strong> {activeRequest.problems.join(', ')}
            </p>
            <p className="text-xs text-slate-500">
              <strong>Pickup Window:</strong> {activeRequest.pickupDate} ·{' '}
              {activeRequest.pickupTimeSlot} · {activeRequest.pickupArea}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <p className="text-xs font-semibold text-blue-700">
            {receivedQuotes.length} Quotations Received
          </p>
          {declinedCount > 0 && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              {declinedCount} shop declined
            </p>
          )}
          <p className="text-[11px] text-slate-400 mt-0.5">
            Illustrative demo prices
          </p>
        </div>
      </div>

      {/* Smart Ranking Explanation + Independent Sort Controls */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 mb-6 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-2.5 text-xs text-slate-600">
          <Award className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            Our <strong>Recommended</strong> tag weighs shop rating, estimated price, distance, turnaround time, and pickup availability — but <strong>you are always free to sort and select any shop</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {[
            { key: 'recommended', label: 'Recommended' },
            { key: 'rating', label: 'Highest Rating' },
            { key: 'distance', label: 'Nearest' },
            { key: 'price', label: 'Lowest Price' },
            { key: 'time', label: 'Fastest Repair' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortBy(opt.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                sortBy === opt.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations List */}
      {receivedQuotes.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No quotations available right now"
          description="No matching repair shops currently have an active quotation for this request. You can create a new request or submit a quotation from the Shop Owner Dashboard."
          actionLabel="Try Another Device"
          actionTo="/select-phone"
        />
      ) : (
        <div className="space-y-4">
          {receivedQuotes.map((quote) => {
            const chosenMethod = getChosenMethod(quote);
            const activeStaff =
              quote.pickupStaff && chosenMethod !== 'walk_in'
                ? quote.pickupStaff[chosenMethod] ||
                  Object.values(quote.pickupStaff)[0]
                : null;

            return (
              <div
                key={quote.id}
                className={`rounded-2xl bg-white border p-5 sm:p-6 transition-all shadow-card ${
                  quote.recommended
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Row: Shop Identity & Price */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {quote.recommended && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          <Award className="w-3.5 h-3.5" />
                          Recommended
                        </span>
                      )}
                      {quote.isCustomShopQuote && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          Updated by Shop Dashboard
                        </span>
                      )}
                      <ShopCategoryBadge isAuthorized={quote.isAuthorized} compact />
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {quote.rating.toFixed(1)} ({quote.reviewCount})
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{quote.shopName}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {quote.shopArea} · <strong>{quote.distanceKm} km</strong>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Est. repair time:{' '}
                        <strong>{formatHours(quote.estimatedRepairHours)}</strong>
                      </span>
                      <span className="text-slate-400">{quote.warrantyNote}</span>
                    </div>
                  </div>

                  {/* Estimated Price Box */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-left md:text-right shrink-0">
                    <p className="text-[11px] font-medium text-slate-500">
                      Estimated Repair Quote
                    </p>
                    <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                      {formatPriceRange(
                        quote.estimatedPriceMin,
                        quote.estimatedPriceMax
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Final price confirmed after checkup
                    </p>
                  </div>
                </div>

                {/* Shop Message */}
                <div className="my-4 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5 text-xs text-slate-700 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Shop note:</strong> “{quote.message}”
                  </span>
                </div>

                {/* Pickup Options Selector + Assigned Person Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-8 space-y-3">
                    <p className="text-xs font-semibold text-slate-700">
                      Choose Pickup Option:
                    </p>

                    {quote.pickupAvailable && quote.pickupMethods?.length > 0 ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {quote.pickupMethods.map((method) => {
                            const active = chosenMethod === method;
                            const isTech = method === 'shop_technician';
                            return (
                              <button
                                key={method}
                                type="button"
                                onClick={() =>
                                  setSelectedPickupByQuote((prev) => ({
                                    ...prev,
                                    [quote.id]: method,
                                  }))
                                }
                                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                                  active
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {isTech ? (
                                  <UserCheck className="w-4 h-4" />
                                ) : (
                                  <Bike className="w-4 h-4" />
                                )}
                                {getPickupMethodLabel(method)}
                                {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Pickup Person Mini Profile Card */}
                        {activeStaff && (
                          <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3 max-w-md">
                            <div
                              className={`h-9 w-9 rounded-full ${activeStaff.avatarBg} text-white flex items-center justify-center text-xs font-bold shrink-0`}
                            >
                              {activeStaff.avatarInitials}
                            </div>
                            <div className="min-w-0 text-xs">
                              <p className="font-semibold text-slate-900 truncate">
                                {activeStaff.name}{' '}
                                <span className="font-normal text-slate-500">
                                  · {activeStaff.role}
                                </span>
                              </p>
                              <p className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Phone className="w-3 h-3" />
                                {activeStaff.demoContact}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="rounded-xl bg-slate-100 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-600">
                        Doorstep pickup unavailable at this shop (walk-in drop-off only).
                      </div>
                    )}
                  </div>

                  {/* Select CTA */}
                  <div className="lg:col-span-4 flex flex-col items-stretch lg:items-end justify-end">
                    <button
                      type="button"
                      onClick={() => handleConfirmBooking(quote)}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors shadow-sm ${
                        quote.recommended
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      Select Shop &amp; Book
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[11px] text-slate-400 mt-1.5 lg:text-right">
                      No upfront payment required in demo
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
