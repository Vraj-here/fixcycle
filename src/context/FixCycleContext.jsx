import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_SHOPS } from '../data/shops';
import { INITIAL_BOOKINGS, INITIAL_INCOMING_REQUESTS } from '../data/sampleBookings';
import { DEMO_LOCATIONS, getProblemById } from '../data/problems';
import { getBrandById } from '../data/brands';
import {
  generateBookingId,
  generateRequestId,
  getCurrentTimeLabel,
  getTodayISO,
} from '../utils/helpers';
import { generateSimulatedQuotations, rankQuotations } from '../utils/quotationEngine';
import {
  isValidEmail,
  validatePasswordStrength,
  generateSalt,
  hashPassword,
  sanitizeText,
} from '../utils/auth';

const FixCycleContext = createContext(null);

const DEFAULT_DRAFT = {
  brandId: '',
  model: '',
  problemIds: [],
  description: '',
  photoDataUrl: null,
  photoName: '',
  pickupDate: getTodayISO(),
  pickupTimeSlot: '02:00 PM – 03:30 PM',
  pickupArea: DEMO_LOCATIONS[0].label,
  pickupCoords: DEMO_LOCATIONS[0].coords,
  selectedLocationId: DEMO_LOCATIONS[0].id,
};

export function FixCycleProvider({ children }) {
  // Registered local user accounts (salted SHA-256 hashes only — never plaintext passwords)
  const [accounts, setAccounts] = useLocalStorage('fixcycle_accounts_v2', []);

  // Authenticated session (null when logged out — no public exposed credentials)
  const [currentUser, setCurrentUser] = useLocalStorage('fixcycle_session_v2', null);

  // Repair shops across Pune, Maharashtra (v2 key ensures fresh Pune catalog)
  const [shops, setShops] = useLocalStorage('fixcycle_shops_v2', INITIAL_SHOPS);

  // Active customer repair request draft
  const [draftRequest, setDraftRequest] = useLocalStorage(
    'fixcycle_draft_v2',
    DEFAULT_DRAFT
  );

  // Submitted repair requests
  const [repairRequests, setRepairRequests] = useLocalStorage(
    'fixcycle_requests_v2',
    INITIAL_INCOMING_REQUESTS
  );

  // Active request ID for Compare Quotations
  const [activeRequestId, setActiveRequestId] = useLocalStorage(
    'fixcycle_active_request_id_v2',
    null
  );

  // Quotations grouped by requestId
  const [quotationsByRequest, setQuotationsByRequest] = useLocalStorage(
    'fixcycle_quotations_v2',
    {}
  );

  // Confirmed bookings synced across tracking & dashboards
  const [bookings, setBookings] = useLocalStorage(
    'fixcycle_bookings_v2',
    INITIAL_BOOKINGS
  );

  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Registers a new account with salted SHA-256 password hashing.
   * Never stores plaintext passwords or exposes account data publicly.
   */
  const registerAccount = useCallback(
    async ({ name, email, password, role = 'customer' }) => {
      const cleanName = sanitizeText(name, 60);
      const normalizedEmail = String(email || '').trim().toLowerCase();

      if (cleanName.length < 2) {
        return { ok: false, error: 'Please enter your full name (at least 2 characters).' };
      }
      if (!isValidEmail(normalizedEmail)) {
        return { ok: false, error: 'Please enter a valid email address.' };
      }
      const pwdErr = validatePasswordStrength(password);
      if (pwdErr) {
        return { ok: false, error: pwdErr };
      }

      const validRoles = ['customer', 'shop_owner', 'delivery_partner'];
      const safeRole = validRoles.includes(role) ? role : 'customer';

      const exists = accounts.some((acc) => acc.email === normalizedEmail);
      if (exists) {
        return {
          ok: false,
          error: 'An account with this email is already registered. Please sign in.',
        };
      }

      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);

      const newRecord = {
        id: `usr-${Date.now()}`,
        name: cleanName,
        email: normalizedEmail,
        role: safeRole,
        salt,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      const sessionUser = {
        id: newRecord.id,
        name: newRecord.name,
        role: newRecord.role,
        initials: cleanName
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      };

      setAccounts((prev) => [...prev, newRecord]);
      setCurrentUser(sessionUser);
      addToast(`Account created securely. Welcome, ${cleanName}!`, 'success');
      return { ok: true, user: sessionUser };
    },
    [accounts, setAccounts, setCurrentUser, addToast]
  );

  /**
   * Authenticates a registered user using constant-shape generic error messaging
   * (never reveals whether a specific email exists in storage).
   */
  const loginAccount = useCallback(
    async ({ email, password }) => {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      if (!isValidEmail(normalizedEmail) || !password) {
        return { ok: false, error: 'Invalid email or password.' };
      }

      const record = accounts.find((acc) => acc.email === normalizedEmail);
      if (!record) {
        return { ok: false, error: 'Invalid email or password.' };
      }

      const computedHash = await hashPassword(password, record.salt);
      if (computedHash !== record.passwordHash) {
        return { ok: false, error: 'Invalid email or password.' };
      }

      const sessionUser = {
        id: record.id,
        name: record.name,
        role: record.role,
        initials: record.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      };

      setCurrentUser(sessionUser);
      addToast(`Signed in successfully as ${sessionUser.name}.`, 'success');
      return { ok: true, user: sessionUser };
    },
    [accounts, setCurrentUser, addToast]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    addToast('You have been signed out securely.', 'info');
  }, [setCurrentUser, addToast]);

  const updateDraft = useCallback(
    (patch) => {
      setDraftRequest((prev) => ({ ...prev, ...patch }));
    },
    [setDraftRequest]
  );

  const resetDraft = useCallback(() => {
    setDraftRequest({ ...DEFAULT_DRAFT, pickupDate: getTodayISO() });
  }, [setDraftRequest]);

  const submitRepairRequest = useCallback(
    (overrideDraft = null) => {
      const source = overrideDraft || draftRequest;
      const brand = getBrandById(source.brandId);
      const problemLabels = (source.problemIds || [])
        .map((id) => getProblemById(id)?.label)
        .filter(Boolean);

      const newRequest = {
        id: generateRequestId(),
        createdAt: new Date().toISOString(),
        customerName: currentUser?.name || 'Guest Customer',
        brandId: source.brandId || 'apple',
        brandName: brand ? brand.name : 'Apple',
        model: sanitizeText(source.model, 60) || 'iPhone 15',
        problemIds: source.problemIds?.length ? source.problemIds : ['broken_screen'],
        problems: problemLabels.length ? problemLabels : ['Broken or damaged screen'],
        description: sanitizeText(source.description, 400),
        photoDataUrl: source.photoDataUrl || null,
        pickupArea: sanitizeText(source.pickupArea, 140) || DEMO_LOCATIONS[0].label,
        pickupCoords: source.pickupCoords || DEMO_LOCATIONS[0].coords,
        pickupDate: source.pickupDate || getTodayISO(),
        pickupTimeSlot: source.pickupTimeSlot || '02:00 PM – 03:30 PM',
        shopDecision: 'pending',
      };

      const generatedQuotes = generateSimulatedQuotations(newRequest, shops);

      setRepairRequests((prev) => [newRequest, ...prev]);
      setActiveRequestId(newRequest.id);
      setQuotationsByRequest((prev) => ({
        ...prev,
        [newRequest.id]: generatedQuotes,
      }));

      addToast(
        `Repair request ${newRequest.id} sent! Received ${generatedQuotes.length} Pune shop quotations.`,
        'success'
      );

      return newRequest;
    },
    [
      draftRequest,
      currentUser,
      shops,
      setRepairRequests,
      setActiveRequestId,
      setQuotationsByRequest,
      addToast,
    ]
  );

  const respondToRequestAsShop = useCallback(
    (requestId, shopId, response) => {
      const shop = shops.find((s) => s.id === shopId);
      if (!shop) return;

      setRepairRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                shopDecision: response.action === 'decline' ? 'declined' : 'quoted',
                shopQuoteSummary:
                  response.action === 'quote'
                    ? {
                        priceMin: Number(response.priceMin),
                        priceMax: Number(response.priceMax),
                        estimatedHours: Number(response.estimatedHours),
                        pickupMethod: response.pickupMethod,
                      }
                    : null,
              }
            : req
        )
      );

      setQuotationsByRequest((prev) => {
        const existing = prev[requestId] || [];
        const hasShopQuote = existing.some((q) => q.shopId === shopId);

        let updatedList;
        if (response.action === 'decline') {
          updatedList = existing.map((q) =>
            q.shopId === shopId ? { ...q, status: 'declined', recommended: false } : q
          );
        } else if (hasShopQuote) {
          updatedList = existing.map((q) =>
            q.shopId === shopId
              ? {
                  ...q,
                  estimatedPriceMin: Number(response.priceMin),
                  estimatedPriceMax: Number(response.priceMax),
                  averageEstimatedPrice: Math.round(
                    (Number(response.priceMin) + Number(response.priceMax)) / 2
                  ),
                  estimatedRepairHours: Number(response.estimatedHours),
                  pickupMethods: response.pickupMethod
                    ? [response.pickupMethod]
                    : q.pickupMethods,
                  message: sanitizeText(response.message, 200) || q.message,
                  status: 'received',
                  isCustomShopQuote: true,
                }
              : q
          );
        } else {
          const req = repairRequests.find((r) => r.id === requestId);
          const newQuote = {
            id: `quote-${requestId}-${shop.id}`,
            requestId,
            shopId: shop.id,
            shopName: shop.name,
            shopArea: shop.area,
            shopAddress: shop.address,
            shopCoords: shop.coords,
            rating: shop.rating,
            reviewCount: shop.reviewCount,
            isAuthorized:
              shop.isAuthorized &&
              req &&
              shop.authorizedBrands.includes(req.brandId),
            distanceKm: 1.4,
            estimatedPriceMin: Number(response.priceMin),
            estimatedPriceMax: Number(response.priceMax),
            averageEstimatedPrice: Math.round(
              (Number(response.priceMin) + Number(response.priceMax)) / 2
            ),
            estimatedRepairHours: Number(response.estimatedHours),
            pickupAvailable: true,
            pickupMethods: [response.pickupMethod || 'shop_technician'],
            pickupStaff: shop.pickupStaff,
            warrantyNote: shop.warrantyNote,
            message:
              sanitizeText(response.message, 200) ||
              'Custom quotation submitted from Shop Dashboard.',
            status: 'received',
            isCustomShopQuote: true,
            recommended: false,
            score: 0,
          };
          updatedList = [newQuote, ...existing];
        }

        return {
          ...prev,
          [requestId]: rankQuotations(updatedList),
        };
      });

      addToast(
        response.action === 'decline'
          ? `Declined request ${requestId}.`
          : `Quotation submitted for ${requestId}!`,
        response.action === 'decline' ? 'info' : 'success'
      );
    },
    [shops, repairRequests, setRepairRequests, setQuotationsByRequest, addToast]
  );

  const createBookingFromQuotation = useCallback(
    (request, quotation, chosenPickupMethod) => {
      const shop = shops.find((s) => s.id === quotation.shopId);
      const effectiveMethod =
        chosenPickupMethod ||
        (quotation.pickupMethods && quotation.pickupMethods[0]) ||
        'shop_technician';

      const staffMember =
        (shop?.pickupStaff && shop.pickupStaff[effectiveMethod]) ||
        (shop?.pickupStaff && Object.values(shop.pickupStaff)[0]) || {
          name: 'Rohan Joshi',
          role: 'Shop Delivery Partner',
          avatarInitials: 'RJ',
          avatarBg: 'bg-blue-600',
          shopAffiliation: quotation.shopName,
          demoContact: '+91 00000 20202 (Demo)',
          vehicle: 'Two-Wheeler · MH-12-FC-202',
        };

      const nowTime = getCurrentTimeLabel();
      const newBooking = {
        id: generateBookingId(),
        createdAt: new Date().toISOString(),
        customerName: request.customerName || currentUser?.name || 'Guest Customer',
        brandId: request.brandId,
        brandName: request.brandName,
        model: request.model,
        problems: request.problems,
        problemIds: request.problemIds,
        description: request.description,
        photoDataUrl: request.photoDataUrl,
        shopId: quotation.shopId,
        shopName: quotation.shopName,
        shopIsAuthorized: quotation.isAuthorized,
        shopAddress: quotation.shopAddress,
        shopCoords: quotation.shopCoords,
        customerArea: request.pickupArea,
        customerCoords: request.pickupCoords,
        estimatedPriceMin: quotation.estimatedPriceMin,
        estimatedPriceMax: quotation.estimatedPriceMax,
        confirmedPrice: null,
        estimatedRepairHours: quotation.estimatedRepairHours,
        pickupMethod: effectiveMethod,
        pickupPerson: staffMember,
        pickupDate: request.pickupDate,
        pickupTimeSlot: request.pickupTimeSlot,
        status: 'booking_confirmed',
        shopNote: quotation.message,
        reviewed: false,
        statusHistory: [{ status: 'booking_confirmed', time: nowTime }],
      };

      setBookings((prev) => [newBooking, ...prev]);
      addToast(`Booking ${newBooking.id} confirmed!`, 'success');
      return newBooking;
    },
    [shops, currentUser, setBookings, addToast]
  );

  const updateBookingStatus = useCallback(
    (bookingId, newStatus, extraFields = {}) => {
      const nowTime = getCurrentTimeLabel();
      setBookings((prev) =>
        prev.map((booking) => {
          if (booking.id !== bookingId) return booking;
          const alreadyLogged = booking.statusHistory?.some(
            (h) => h.status === newStatus
          );
          const nextHistory = alreadyLogged
            ? booking.statusHistory
            : [...(booking.statusHistory || []), { status: newStatus, time: nowTime }];

          return {
            ...booking,
            ...extraFields,
            status: newStatus,
            statusHistory: nextHistory,
          };
        })
      );
    },
    [setBookings]
  );

  const addShopReview = useCallback(
    (bookingId, shopId, rating, comment) => {
      const targetBooking = bookings.find((b) => b.id === bookingId);
      const newReview = {
        id: `rev-${Date.now()}`,
        author: currentUser?.name || 'Verified Customer',
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        date: getTodayISO(),
        device: targetBooking
          ? `${targetBooking.brandName} ${targetBooking.model}`
          : 'Smartphone',
        issue: targetBooking?.problems?.[0] || 'Repair Service',
        comment: sanitizeText(comment, 400),
      };

      setShops((prev) =>
        prev.map((shop) => {
          if (shop.id !== shopId) return shop;
          const updatedReviews = [newReview, ...shop.reviews];
          const avg =
            updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
            updatedReviews.length;
          return {
            ...shop,
            reviews: updatedReviews,
            reviewCount: updatedReviews.length,
            rating: Math.round(avg * 10) / 10,
          };
        })
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, reviewed: true, customerRating: Number(rating) }
            : b
        )
      );

      addToast('Thank you! Your review has been added to the shop profile.', 'success');
    },
    [bookings, currentUser, setShops, setBookings, addToast]
  );

  const resetDemoData = useCallback(() => {
    setShops(INITIAL_SHOPS);
    setDraftRequest({ ...DEFAULT_DRAFT, pickupDate: getTodayISO() });
    setRepairRequests(INITIAL_INCOMING_REQUESTS);
    setActiveRequestId(null);
    setQuotationsByRequest({});
    setBookings(INITIAL_BOOKINGS);
    addToast('Sample Pune shop and booking data refreshed.', 'info');
  }, [
    setShops,
    setDraftRequest,
    setRepairRequests,
    setActiveRequestId,
    setQuotationsByRequest,
    setBookings,
    addToast,
  ]);

  const value = {
    currentUser,
    registerAccount,
    loginAccount,
    logout,
    shops,
    draftRequest,
    updateDraft,
    resetDraft,
    repairRequests,
    activeRequestId,
    setActiveRequestId,
    quotationsByRequest,
    submitRepairRequest,
    respondToRequestAsShop,
    bookings,
    createBookingFromQuotation,
    updateBookingStatus,
    addShopReview,
    toasts,
    addToast,
    dismissToast,
    resetDemoData,
  };

  return (
    <FixCycleContext.Provider value={value}>{children}</FixCycleContext.Provider>
  );
}

export function useFixCycle() {
  const ctx = useContext(FixCycleContext);
  if (!ctx) {
    throw new Error('useFixCycle must be used within a FixCycleProvider');
  }
  return ctx;
}
