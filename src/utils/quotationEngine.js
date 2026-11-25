import { getProblemById } from '../data/problems.js';
import { calculateDistanceKm } from './helpers.js';

/**
 * Generates simulated repair quotations from nearby shops that support
 * the customer's selected brand and reported problems.
 *
 * Also computes a transparent comparison score combining:
 *  - Shop Rating (35%)
 *  - Estimated Price Competitiveness (30%)
 *  - Distance from Customer (20%)
 *  - Estimated Repair Speed (15%)
 *
 * The highest scoring available shop gets a "Recommended" badge,
 * while customers remain completely free to sort and choose any shop.
 */

const PREMIUM_BRANDS = ['apple', 'samsung', 'google'];

export function estimateProblemBaseCost(problemIds, brandId) {
  const ids = problemIds?.length ? problemIds : ['broken_screen'];
  const brandFactor = PREMIUM_BRANDS.includes(brandId) ? 1.18 : 1.0;

  let totalMin = 0;
  let totalMax = 0;
  let totalHours = 0;

  ids.forEach((id, index) => {
    const p = getProblemById(id);
    if (!p) return;
    // Slight bundle discount on additional issues
    const bundleFactor = index === 0 ? 1 : 0.78;
    totalMin += p.basePriceMin * bundleFactor * brandFactor;
    totalMax += p.basePriceMax * bundleFactor * brandFactor;
    totalHours += p.baseHours * (index === 0 ? 1 : 0.6);
  });

  return {
    baseMin: Math.round(totalMin / 50) * 50 || 800,
    baseMax: Math.round(totalMax / 50) * 50 || 1600,
    baseHours: Math.max(1.5, Math.round(totalHours * 2) / 2),
  };
}

export function generateSimulatedQuotations(request, shops) {
  if (!request || !shops?.length) return [];

  const { baseMin, baseMax, baseHours } = estimateProblemBaseCost(
    request.problemIds,
    request.brandId
  );

  // Filter shops that support the selected brand (and pickup or walk-in)
  const eligibleShops = shops.filter((shop) =>
    shop.supportedBrands.includes(request.brandId)
  );

  const rawQuotes = eligibleShops.map((shop) => {
    const distanceKm = calculateDistanceKm(request.pickupCoords, shop.coords);
    const estMin = Math.round((baseMin * shop.priceMultiplier) / 50) * 50;
    const estMax = Math.round((baseMax * shop.priceMultiplier) / 50) * 50;
    const avgPrice = Math.round((estMin + estMax) / 2);
    const estHours = Math.max(
      1.5,
      Math.round(((baseHours + shop.avgRepairHours) / 2) * 2) / 2
    );

    const isBrandAuthorized =
      shop.isAuthorized && shop.authorizedBrands.includes(request.brandId);

    return {
      id: `quote-${request.id}-${shop.id}`,
      requestId: request.id,
      shopId: shop.id,
      shopName: shop.name,
      shopArea: shop.area,
      shopAddress: shop.address,
      shopCoords: shop.coords,
      rating: shop.rating,
      reviewCount: shop.reviewCount,
      isAuthorized: isBrandAuthorized,
      distanceKm,
      estimatedPriceMin: estMin,
      estimatedPriceMax: estMax,
      averageEstimatedPrice: avgPrice,
      estimatedRepairHours: estHours,
      pickupAvailable: shop.pickupAvailable,
      pickupMethods: shop.pickupMethods,
      pickupStaff: shop.pickupStaff,
      warrantyNote: shop.warrantyNote,
      message: shop.defaultQuoteMessage,
      status: 'received', // 'received' | 'declined'
      isCustomShopQuote: false,
      recommended: false,
      score: 0,
    };
  });

  return rankQuotations(rawQuotes);
}

/**
 * Scores and flags the single best overall quotation as "Recommended"
 * (prefers shops with doorstep pickup available).
 */
export function rankQuotations(quotes) {
  const active = quotes.filter((q) => q.status !== 'declined');
  if (active.length === 0) return quotes;

  const minPrice = Math.min(...active.map((q) => q.averageEstimatedPrice));
  const maxPrice = Math.max(...active.map((q) => q.averageEstimatedPrice));
  const maxDist = Math.max(...active.map((q) => q.distanceKm), 1);
  const maxHours = Math.max(...active.map((q) => q.estimatedRepairHours), 1);

  const scored = quotes.map((q) => {
    if (q.status === 'declined') return { ...q, score: -1, recommended: false };

    const ratingScore = (q.rating / 5) * 100;
    const priceScore =
      maxPrice === minPrice
        ? 100
        : ((maxPrice - q.averageEstimatedPrice) / (maxPrice - minPrice)) * 100;
    const distScore = ((maxDist - q.distanceKm) / maxDist) * 100;
    const speedScore = ((maxHours - q.estimatedRepairHours) / maxHours) * 100;
    const pickupBonus = q.pickupAvailable ? 12 : -25;

    const totalScore = Math.round(
      ratingScore * 0.35 +
        priceScore * 0.3 +
        distScore * 0.2 +
        speedScore * 0.15 +
        pickupBonus
    );

    return {
      ...q,
      score: totalScore,
      recommended: false,
    };
  });

  // Mark the highest-scoring available quote as Recommended
  let bestIndex = -1;
  let bestScore = -Infinity;
  scored.forEach((q, idx) => {
    if (q.status !== 'declined' && q.score > bestScore) {
      bestScore = q.score;
      bestIndex = idx;
    }
  });

  if (bestIndex !== -1) {
    scored[bestIndex].recommended = true;
  }

  return scored;
}
