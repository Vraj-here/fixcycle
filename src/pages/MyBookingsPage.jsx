import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Navigation,
  Star,
  CheckCircle2,
  Smartphone,
  Store,
  Calendar,
  Plus,
  X,
  MessageSquare,
} from 'lucide-react';
import { useFixCycle } from '../context/FixCycleContext';
import { BookingStatusBadge, ShopCategoryBadge } from '../components/StatusBadge';
import BookingTimeline from '../components/BookingTimeline';
import EmptyState from '../components/EmptyState';
import {
  BOOKING_STATUSES,
  getStatusIndex,
  formatPriceRange,
  formatINR,
  getPickupMethodLabel,
} from '../utils/helpers';

export default function MyBookingsPage() {
  const { bookings, currentUser, addShopReview } = useFixCycle();

  const [detailBooking, setDetailBooking] = useState(null);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const activeBookings = bookings.filter((b) => b.status !== 'phone_delivered');
  const completedBookings = bookings.filter((b) => b.status === 'phone_delivered');

  const handleOpenReview = (booking) => {
    setReviewingBooking(booking);
    setRatingValue(5);
    setReviewComment('');
    setReviewError('');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewComment.trim() || reviewComment.trim().length < 6) {
      setReviewError('Please write a brief review (at least 6 characters).');
      return;
    }
    addShopReview(
      reviewingBooking.id,
      reviewingBooking.shopId,
      ratingValue,
      reviewComment
    );
    setReviewingBooking(null);
    setReviewComment('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            Customer Dashboard
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            My Repair Bookings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {currentUser ? (
              <>
                Welcome back, <strong>{currentUser.name}</strong>. Track ongoing smartphone repairs or review completed services.
              </>
            ) : (
              'Track your ongoing smartphone repairs across Pune or review completed services.'
            )}
          </p>
        </div>

        <Link
          to="/select-phone"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Repair Request
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-card">
          <p className="text-xs text-slate-500">Active Repairs</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {activeBookings.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-card">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {completedBookings.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-card">
          <p className="text-xs text-slate-500">Total Bookings</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {bookings.length}
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No repair bookings yet"
          description="You haven't booked a smartphone repair yet. Start by selecting your phone brand and model to compare quotations from nearby shops."
          actionLabel="Book Your First Repair"
          actionTo="/select-phone"
        />
      ) : (
        <div className="space-y-8">
          {/* ACTIVE BOOKINGS */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-3.5">
              Active Bookings ({activeBookings.length})
            </h2>
            {activeBookings.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-6 text-sm text-slate-500 text-center">
                No active repairs in progress right now.
              </div>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((booking) => {
                  const pct = Math.round(
                    ((getStatusIndex(booking.status) + 1) /
                      BOOKING_STATUSES.length) *
                      100
                  );
                  return (
                    <div
                      key={booking.id}
                      className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card hover:border-blue-300 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {booking.id}
                            </span>
                            <BookingStatusBadge status={booking.status} />
                            <ShopCategoryBadge
                              isAuthorized={booking.shopIsAuthorized}
                              compact
                            />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-blue-600" />
                            {booking.brandName} {booking.model}
                          </h3>
                          <p className="text-xs text-slate-600">
                            <strong>Issues:</strong> {booking.problems.join(', ')}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Store className="w-3.5 h-3.5" />
                              {booking.shopName}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {booking.pickupDate} · {booking.pickupTimeSlot}
                            </span>
                          </div>
                        </div>

                        <div className="text-left md:text-right shrink-0">
                          <p className="text-[11px] text-slate-500">
                            {booking.confirmedPrice
                              ? 'Confirmed Final Price'
                              : 'Estimated Quote'}
                          </p>
                          <p className="text-base font-extrabold text-slate-900">
                            {booking.confirmedPrice
                              ? formatINR(booking.confirmedPrice)
                              : formatPriceRange(
                                  booking.estimatedPriceMin,
                                  booking.estimatedPriceMax
                                )}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {getPickupMethodLabel(booking.pickupMethod)}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-medium text-slate-600">
                            Repair &amp; Delivery Progress
                          </span>
                          <span className="font-bold text-blue-600">{pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2.5">
                          <Link
                            to={`/track/${booking.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            Track Live Pickup &amp; Repair
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDetailBooking(booking)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View Full Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* PREVIOUS / COMPLETED BOOKINGS */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-3.5">
              Completed Bookings ({completedBookings.length})
            </h2>
            {completedBookings.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-6 text-sm text-slate-500 text-center">
                Completed repairs will appear here once delivered.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-2xl bg-white border border-slate-200 p-5 shadow-card flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {booking.id}
                        </span>
                        <BookingStatusBadge status={booking.status} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {booking.brandName} {booking.model}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {booking.problems.join(', ')} · <strong>{booking.shopName}</strong>
                      </p>
                      <p className="text-xs text-slate-500">
                        Completed on {booking.pickupDate} · Final:{' '}
                        <strong>
                          {booking.confirmedPrice
                            ? formatINR(booking.confirmedPrice)
                            : formatPriceRange(
                                booking.estimatedPriceMin,
                                booking.estimatedPriceMax
                              )}
                        </strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setDetailBooking(booking)}
                        className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Booking Details
                      </button>

                      {booking.reviewed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Reviewed ({booking.customerRating || 5}★)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenReview(booking)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          Rate &amp; Review Shop
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}
      {detailBooking && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4"
          onClick={() => setDetailBooking(null)}
        >
          <div
            className="w-full max-w-xl max-h-[88vh] overflow-y-auto thin-scrollbar rounded-t-3xl sm:rounded-2xl bg-white border border-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-slate-500">{detailBooking.id}</p>
                <h3 className="text-lg font-bold text-slate-900">
                  {detailBooking.brandName} {detailBooking.model}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailBooking(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs space-y-1.5">
                <p>
                  <strong>Repair Shop:</strong> {detailBooking.shopName}
                </p>
                <p>
                  <strong>Issues:</strong> {detailBooking.problems.join(', ')}
                </p>
                <p>
                  <strong>Pickup Method:</strong>{' '}
                  {getPickupMethodLabel(detailBooking.pickupMethod)} (
                  {detailBooking.pickupPerson?.name})
                </p>
                <p>
                  <strong>Estimated Quote:</strong>{' '}
                  {formatPriceRange(
                    detailBooking.estimatedPriceMin,
                    detailBooking.estimatedPriceMax
                  )}
                </p>
                <p>
                  <strong>Confirmed Price:</strong>{' '}
                  {detailBooking.confirmedPrice
                    ? formatINR(detailBooking.confirmedPrice)
                    : 'Pending final checkup'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">
                  Status Timeline
                </h4>
                <BookingTimeline
                  currentStatus={detailBooking.status}
                  statusHistory={detailBooking.statusHistory}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POST-COMPLETION REVIEW MODAL */}
      {reviewingBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setReviewingBooking(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Rate {reviewingBooking.shopName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Booking {reviewingBooking.id} · {reviewingBooking.brandName}{' '}
                  {reviewingBooking.model}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewingBooking(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Your Star Rating
                </p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingValue(star)}
                      className="p-1 focus:outline-none"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= ratingValue
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-slate-700 ml-1">
                    {ratingValue}.0 / 5
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="review-comment"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  Share your repair experience (Sample Review)
                </label>
                <textarea
                  id="review-comment"
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => {
                    setReviewComment(e.target.value);
                    setReviewError('');
                  }}
                  placeholder="How was the pickup timeliness, repair quality, and pricing transparency?"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                {reviewError && (
                  <p className="text-xs text-red-600 mt-1">{reviewError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingBooking(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Submit Sample Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
