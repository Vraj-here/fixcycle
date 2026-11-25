/**
 * Shared utility helpers for FixCycle:
 * - Booking statuses (10-stage lifecycle)
 * - Distance calculation (Haversine formula)
 * - Route waypoint interpolation for simulated map tracking
 * - Formatting helpers
 */

export const BOOKING_STATUSES = [
  {
    key: 'booking_confirmed',
    label: 'Booking confirmed',
    shortLabel: 'Confirmed',
    description: 'Your repair quotation is locked in and the shop has received your order.',
    phase: 'pickup',
    etaText: 'Assigning pickup partner...',
  },
  {
    key: 'pickup_assigned',
    label: 'Pickup person assigned',
    shortLabel: 'Pickup Assigned',
    description: 'A verified pickup person has been assigned for doorstep collection.',
    phase: 'pickup',
    etaText: 'Preparing to depart (~14 mins)',
  },
  {
    key: 'pickup_on_the_way',
    label: 'Pickup person is on the way',
    shortLabel: 'On the Way',
    description: 'Heading to your approximate pickup location with a tamper-evident pouch.',
    phase: 'pickup',
    etaText: 'Arriving in ~8 mins (Simulated)',
  },
  {
    key: 'pickup_arrived',
    label: 'Pickup person has arrived',
    shortLabel: 'Arrived',
    description: 'Pickup person is at your doorstep to verify the device and Booking ID.',
    phase: 'pickup',
    etaText: 'Arrived at pickup point',
  },
  {
    key: 'phone_collected',
    label: 'Phone collected',
    shortLabel: 'Collected',
    description: 'Smartphone collected safely and heading toward the repair shop.',
    phase: 'transit_to_shop',
    etaText: 'Reaching repair shop in ~10 mins (Simulated)',
  },
  {
    key: 'reached_shop',
    label: 'Phone reached repair shop',
    shortLabel: 'At Repair Shop',
    description: 'Device checked in at the technician workbench for pre-repair inspection.',
    phase: 'repair',
    etaText: 'Queued for technician bench',
  },
  {
    key: 'repair_in_progress',
    label: 'Repair in progress',
    shortLabel: 'Repairing',
    description: 'Technician is actively repairing and testing your smartphone.',
    phase: 'repair',
    etaText: 'Estimated completion in ~2 hrs',
  },
  {
    key: 'repair_completed',
    label: 'Repair completed',
    shortLabel: 'Repaired',
    description: 'Quality checks passed! Preparing your smartphone for return delivery.',
    phase: 'repair',
    etaText: 'Ready for return dispatch',
  },
  {
    key: 'out_for_delivery',
    label: 'Out for delivery',
    shortLabel: 'Out for Delivery',
    description: 'Your repaired smartphone is on its way back to your doorstep.',
    phase: 'return',
    etaText: 'Arriving in ~9 mins (Simulated)',
  },
  {
    key: 'phone_delivered',
    label: 'Phone delivered',
    shortLabel: 'Delivered',
    description: 'Smartphone safely delivered back to you. You can now rate the shop.',
    phase: 'done',
    etaText: 'Completed',
  },
];

export function getStatusIndex(statusKey) {
  const index = BOOKING_STATUSES.findIndex((s) => s.key === statusKey);
  return index === -1 ? 0 : index;
}

export function getStatusInfo(statusKey) {
  return BOOKING_STATUSES.find((s) => s.key === statusKey) || BOOKING_STATUSES[0];
}

/**
 * Calculates distance in kilometers between two [lat, lng] coordinates using Haversine formula.
 */
export function calculateDistanceKm(coordA, coordB) {
  if (!coordA || !coordB) return 1.5;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(coordB[0] - coordA[0]);
  const dLng = toRad(coordB[1] - coordA[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coordA[0])) *
      Math.cos(toRad(coordB[0])) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Generates a realistic street-like multi-point polyline between two coordinates
 * for smooth simulated GPS marker movement.
 */
export function buildSimulatedRoute(startCoord, endCoord, steps = 40) {
  if (!startCoord || !endCoord) return [];
  const [lat1, lng1] = startCoord;
  const [lat2, lng2] = endCoord;

  // Add subtle intermediate bends so the simulated path resembles city roads
  const mid1 = [
    lat1 + (lat2 - lat1) * 0.35 + (lng2 - lng1) * 0.14,
    lng1 + (lng2 - lng1) * 0.35 - (lat2 - lat1) * 0.1,
  ];
  const mid2 = [
    lat1 + (lat2 - lat1) * 0.72 - (lng2 - lng1) * 0.08,
    lng1 + (lng2 - lng1) * 0.72 + (lat2 - lat1) * 0.12,
  ];

  const anchors = [startCoord, mid1, mid2, endCoord];
  const points = [];
  const segments = anchors.length - 1;
  const perSeg = Math.max(4, Math.floor(steps / segments));

  for (let s = 0; s < segments; s++) {
    const a = anchors[s];
    const b = anchors[s + 1];
    for (let i = 0; i < perSeg; i++) {
      const t = i / perSeg;
      points.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  points.push(endCoord);
  return points;
}

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatPriceRange(min, max) {
  return `${formatINR(min)} – ${formatINR(max)}`;
}

export function formatHours(hours) {
  const h = Number(hours) || 2;
  if (h < 1) return `${Math.round(h * 60)} mins`;
  if (h === 1) return '1 hour';
  return `${h} hours`;
}

export function generateBookingId() {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `FC-2026-${randomDigits}`;
}

export function generateRequestId() {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${randomDigits}`;
}

export function getCurrentTimeLabel() {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTodayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPickupMethodLabel(method) {
  if (method === 'shop_technician') return 'Shop Owner / Technician Pickup';
  if (method === 'delivery_partner') return 'Delivery Partner Pickup';
  return 'Walk-In Only';
}
