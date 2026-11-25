import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Phone,
  MapPin,
  Store,
  Smartphone,
  Info,
  LocateFixed,
  UserCheck,
  Bike,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useFixCycle } from '../context/FixCycleContext';
import TrackingMap from '../components/TrackingMap';
import BookingTimeline from '../components/BookingTimeline';
import { BookingStatusBadge } from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import {
  BOOKING_STATUSES,
  getStatusIndex,
  getStatusInfo,
  buildSimulatedRoute,
  getPickupMethodLabel,
} from '../utils/helpers';

export default function LiveTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, updateBookingStatus, addToast } = useFixCycle();

  // Select booking from URL param or default to first active booking
  const activeBooking = useMemo(() => {
    if (id) return bookings.find((b) => b.id === id) || null;
    return bookings.find((b) => b.status !== 'phone_delivered') || bookings[0] || null;
  }, [id, bookings]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [routeStepIndex, setRouteStepIndex] = useState(0);
  const stepIndexRef = React.useRef(0);
  const [customUserCoords, setCustomUserCoords] = useState(null);
  const [gpsStatusMsg, setGpsStatusMsg] = useState('');

  const updateStepIndex = (val) => {
    stepIndexRef.current = val;
    setRouteStepIndex(val);
  };

  const customerCoords =
    customUserCoords || activeBooking?.customerCoords || [18.5236, 73.8412];
  const shopCoords = activeBooking?.shopCoords || [18.5195, 73.8407];

  // Build smooth 36-point route from Shop -> Customer
  const shopToCustomerRoute = useMemo(
    () => buildSimulatedRoute(shopCoords, customerCoords, 36),
    [shopCoords, customerCoords]
  );

  // Sync rider marker position cleanly when booking status changes manually
  useEffect(() => {
    if (!activeBooking) return;
    const status = activeBooking.status;
    const lastIdx = Math.max(0, shopToCustomerRoute.length - 1);

    if (status === 'booking_confirmed' || status === 'pickup_assigned') {
      updateStepIndex(0);
    } else if (status === 'pickup_on_the_way') {
      updateStepIndex(Math.floor(lastIdx * 0.45));
    } else if (status === 'pickup_arrived') {
      updateStepIndex(lastIdx);
    } else if (status === 'phone_collected') {
      updateStepIndex(Math.floor(lastIdx * 0.55));
    } else if (
      status === 'reached_shop' ||
      status === 'repair_in_progress' ||
      status === 'repair_completed'
    ) {
      updateStepIndex(0);
    } else if (status === 'out_for_delivery') {
      updateStepIndex(Math.floor(lastIdx * 0.55));
    } else if (status === 'phone_delivered') {
      updateStepIndex(lastIdx);
      setIsPlaying(false);
    }
  }, [activeBooking?.id, activeBooking?.status, shopToCustomerRoute.length]);

  // Smooth simulated GPS movement + automatic milestone progression when playing
  useEffect(() => {
    if (!isPlaying || !activeBooking) return;

    const lastIdx = Math.max(0, shopToCustomerRoute.length - 1);
    const interval = setInterval(() => {
      const currentStatus = activeBooking.status;
      const currentPos = stepIndexRef.current;

      if (currentStatus === 'booking_confirmed') {
        updateBookingStatus(activeBooking.id, 'pickup_assigned');
        return;
      }
      if (currentStatus === 'pickup_assigned') {
        updateBookingStatus(activeBooking.id, 'pickup_on_the_way');
        updateStepIndex(2);
        return;
      }
      if (currentStatus === 'pickup_on_the_way') {
        const next = currentPos + 3;
        if (next >= lastIdx) {
          updateStepIndex(lastIdx);
          updateBookingStatus(activeBooking.id, 'pickup_arrived');
        } else {
          updateStepIndex(next);
        }
        return;
      }
      if (currentStatus === 'pickup_arrived') {
        updateBookingStatus(activeBooking.id, 'phone_collected');
        updateStepIndex(Math.max(0, lastIdx - 2));
        return;
      }
      if (currentStatus === 'phone_collected') {
        const next = currentPos - 3;
        if (next <= 0) {
          updateStepIndex(0);
          updateBookingStatus(activeBooking.id, 'reached_shop');
        } else {
          updateStepIndex(next);
        }
        return;
      }
      if (currentStatus === 'reached_shop') {
        updateBookingStatus(activeBooking.id, 'repair_in_progress');
        return;
      }
      if (currentStatus === 'repair_in_progress') {
        updateBookingStatus(activeBooking.id, 'repair_completed');
        return;
      }
      if (currentStatus === 'repair_completed') {
        updateBookingStatus(activeBooking.id, 'out_for_delivery');
        updateStepIndex(2);
        return;
      }
      if (currentStatus === 'out_for_delivery') {
        const next = currentPos + 3;
        if (next >= lastIdx) {
          updateStepIndex(lastIdx);
          updateBookingStatus(activeBooking.id, 'phone_delivered');
          setIsPlaying(false);
          addToast(`Booking ${activeBooking.id} delivered! (Simulated)`, 'success');
        } else {
          updateStepIndex(next);
        }
        return;
      }
      if (currentStatus === 'phone_delivered') {
        setIsPlaying(false);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isPlaying, activeBooking, shopToCustomerRoute.length, updateBookingStatus, addToast]);

  const handleAdvanceStep = () => {
    if (!activeBooking) return;
    const idx = getStatusIndex(activeBooking.status);
    if (idx < BOOKING_STATUSES.length - 1) {
      const nextStatus = BOOKING_STATUSES[idx + 1].key;
      updateBookingStatus(activeBooking.id, nextStatus);
      addToast(`Status updated to: ${BOOKING_STATUSES[idx + 1].label}`, 'info');
    }
  };

  const handleResetJourney = () => {
    if (!activeBooking) return;
    setIsPlaying(false);
    updateBookingStatus(activeBooking.id, 'booking_confirmed');
    updateStepIndex(0);
    addToast('Simulated tracking journey reset to Booking Confirmed.', 'info');
  };

  const handleOptionalGps = () => {
    setGpsStatusMsg('');
    if (!navigator.geolocation) {
      setGpsStatusMsg('Browser geolocation is unavailable on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomUserCoords([
          Number(pos.coords.latitude.toFixed(4)),
          Number(pos.coords.longitude.toFixed(4)),
        ]);
        setGpsStatusMsg('Your browser location has been plotted as the customer pin.');
      },
      () => {
        setGpsStatusMsg(
          'Location permission not granted. Continuing smoothly with simulated demo coordinates.'
        );
      },
      { timeout: 5000 }
    );
  };

  if (!activeBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          icon={AlertCircle}
          title={id ? `Booking "${id}" not found` : 'No bookings to track yet'}
          description="Confirm a smartphone repair booking first to watch the simulated pickup, repair, and doorstep return journey on the live map."
          actionLabel="Start a Repair Booking"
          actionTo="/select-phone"
        />
      </div>
    );
  }

  const currentIdx = getStatusIndex(activeBooking.status);
  const statusInfo = getStatusInfo(activeBooking.status);
  const progressPercent = Math.round(
    ((currentIdx + 1) / BOOKING_STATUSES.length) * 100
  );
  const riderCoords =
    shopToCustomerRoute[
      Math.min(Math.max(routeStepIndex, 0), shopToCustomerRoute.length - 1)
    ] || shopCoords;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            Simulated Live Tracking
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Track Your Repair Journey
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Watch the simulated pickup movement, repair milestones, and doorstep delivery status in real time.
          </p>
        </div>

        {/* Booking Switcher if user has multiple bookings */}
        {bookings.length > 1 && (
          <div className="w-full md:w-72">
            <label
              htmlFor="track-booking-select"
              className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1"
            >
              Tracking Booking
            </label>
            <select
              id="track-booking-select"
              value={activeBooking.id}
              onChange={(e) => {
                setIsPlaying(false);
                navigate(`/track/${e.target.value}`);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} · {b.brandName} {b.model}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Clear Simulated Tracking Notice */}
      <div className="mb-5 rounded-xl bg-blue-50/80 border border-blue-200 px-4 py-2.5 text-xs text-blue-900 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Simulated Tracking Prototype:</strong> Rider movement along the map is simulated using predefined coordinates for college demonstration. No real GPS driver is connected.
          </span>
        </div>
        <button
          type="button"
          onClick={handleOptionalGps}
          className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 underline shrink-0"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          Use My Location (Optional)
        </button>
      </div>

      {gpsStatusMsg && (
        <div className="mb-4 rounded-xl bg-slate-100 border border-slate-200 px-3.5 py-2 text-xs text-slate-700">
          {gpsStatusMsg}
        </div>
      )}

      {/* Main Split: Left Map + Controls + Rider Card | Right 10-Step Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-5">
          {/* Status Summary Card + Simulation Controls */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {activeBooking.id}
                  </span>
                  <BookingStatusBadge status={activeBooking.status} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1.5">
                  {statusInfo.label}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{statusInfo.etaText}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Overall Progress</p>
                <p className="text-lg font-extrabold text-blue-600">
                  {progressPercent}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Interactive Simulation Controls */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                disabled={activeBooking.status === 'phone_delivered'}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                  isPlaying
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    Pause Simulation
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Start Live Simulation
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAdvanceStep}
                disabled={activeBooking.status === 'phone_delivered'}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Next Stage
              </button>

              <button
                type="button"
                onClick={handleResetJourney}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restart Demo
              </button>
            </div>
          </div>

          {/* Interactive Leaflet Tracking Map */}
          <TrackingMap
            customerCoords={customerCoords}
            shopCoords={shopCoords}
            riderCoords={riderCoords}
            routePoints={shopToCustomerRoute}
            shopName={activeBooking.shopName}
            riderLabel={activeBooking.pickupPerson?.name || 'Pickup Partner'}
          />

          {/* Pickup Person + Device Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pickup Person Card */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1 mb-2.5">
                {activeBooking.pickupMethod === 'shop_technician' ? (
                  <UserCheck className="w-3.5 h-3.5" />
                ) : (
                  <Bike className="w-3.5 h-3.5" />
                )}
                {getPickupMethodLabel(activeBooking.pickupMethod)}
              </p>
              {activeBooking.pickupPerson && (
                <div className="flex items-start gap-3">
                  <div
                    className={`h-11 w-11 rounded-full ${activeBooking.pickupPerson.avatarBg} text-white flex items-center justify-center text-xs font-bold shrink-0`}
                  >
                    {activeBooking.pickupPerson.avatarInitials}
                  </div>
                  <div className="min-w-0 text-xs space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">
                      {activeBooking.pickupPerson.name}
                    </p>
                    <p className="text-slate-600">{activeBooking.pickupPerson.role}</p>
                    <p className="text-slate-500">
                      {activeBooking.pickupPerson.shopAffiliation}
                    </p>
                    <p className="text-slate-500">{activeBooking.pickupPerson.vehicle}</p>
                    <p className="text-blue-700 font-medium flex items-center gap-1 pt-1">
                      <Phone className="w-3 h-3" />
                      {activeBooking.pickupPerson.demoContact}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order & Route Locations Card */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-card space-y-2.5 text-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Repair &amp; Route Details
              </p>
              <div className="flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">
                    {activeBooking.brandName} {activeBooking.model}
                  </p>
                  <p className="text-slate-500">{activeBooking.problems.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700">Customer Pickup</p>
                  <p className="text-slate-500">{activeBooking.customerArea}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Store className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700">{activeBooking.shopName}</p>
                  <p className="text-slate-500">{activeBooking.shopAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full 10-Stage Timeline + Cross-Dashboard Shortcuts */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Repair &amp; Delivery Timeline
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Synced live across Customer, Shop Owner, and Delivery Partner dashboards.
            </p>
            <BookingTimeline
              currentStatus={activeBooking.status}
              statusHistory={activeBooking.statusHistory}
            />
          </div>

          {/* Evaluator Cross-Role Demo Helper */}
          <div className="rounded-2xl bg-slate-900 text-white p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              End-to-End Demo Tip
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              You can also advance this booking from the Shop Owner or Delivery Partner dashboards and return here to see the timeline updated.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/shop-dashboard"
                className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Shop Dashboard
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                to="/delivery-dashboard"
                className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Delivery Dashboard
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                to="/my-bookings"
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white"
              >
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
