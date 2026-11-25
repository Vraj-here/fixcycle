import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Map as MapIcon,
  List,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Info,
  MapPin,
  Store,
  Smartphone,
} from 'lucide-react';
import { useFixCycle } from '../context/FixCycleContext';
import { DEMO_LOCATIONS, getProblemById } from '../data/problems';
import { getBrandById } from '../data/brands';
import { calculateDistanceKm } from '../utils/helpers';
import { estimateProblemBaseCost } from '../utils/quotationEngine';
import MapView from '../components/MapView';
import ShopCard from '../components/ShopCard';
import ShopDetailModal from '../components/ShopDetailModal';
import EmptyState from '../components/EmptyState';

export default function NearbyShopsPage() {
  const { shops, draftRequest, updateDraft, submitRepairRequest } = useFixCycle();
  const navigate = useNavigate();

  const [mobileView, setMobileView] = useState('split'); // 'map' | 'list' | 'split'
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'distance' | 'price' | 'speed'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'authorized' | 'independent' | 'pickup'
  const [onlyCompatible, setOnlyCompatible] = useState(Boolean(draftRequest.brandId));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [profileShop, setProfileShop] = useState(null);

  const selectedBrand = getBrandById(draftRequest.brandId);
  const baseEstimate = estimateProblemBaseCost(
    draftRequest.problemIds,
    draftRequest.brandId || 'apple'
  );

  const customerCoords = draftRequest.pickupCoords || DEMO_LOCATIONS[0].coords;

  // Enrich shops with distance and indicative price estimate
  const enrichedShops = useMemo(() => {
    return shops.map((shop) => {
      const distanceKm = calculateDistanceKm(customerCoords, shop.coords);
      const estimatedMin =
        Math.round((baseEstimate.baseMin * shop.priceMultiplier) / 50) * 50;
      const estimatedMax =
        Math.round((baseEstimate.baseMax * shop.priceMultiplier) / 50) * 50;
      return {
        ...shop,
        distanceKm,
        estimatedMin,
        estimatedMax,
      };
    });
  }, [shops, customerCoords, baseEstimate.baseMin, baseEstimate.baseMax]);

  // Apply filters & sorting
  const visibleShops = useMemo(() => {
    let list = [...enrichedShops];

    if (onlyCompatible && draftRequest.brandId) {
      list = list.filter((s) => s.supportedBrands.includes(draftRequest.brandId));
    }

    if (categoryFilter === 'authorized') {
      list = list.filter((s) => s.isAuthorized);
    } else if (categoryFilter === 'independent') {
      list = list.filter((s) => !s.isAuthorized);
    } else if (categoryFilter === 'pickup') {
      list = list.filter((s) => s.pickupAvailable);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'price') return a.estimatedMin - b.estimatedMin;
      if (sortBy === 'speed') return a.avgRepairHours - b.avgRepairHours;
      return b.rating - a.rating;
    });

    return list;
  }, [enrichedShops, onlyCompatible, draftRequest.brandId, categoryFilter, searchQuery, sortBy]);

  const handleRequestQuotations = () => {
    // If customer hasn't selected a device yet, fill a clean demo default or prompt them
    if (!draftRequest.brandId || !draftRequest.model) {
      navigate('/select-phone');
      return;
    }
    submitRepairRequest();
    navigate('/quotations');
  };

  const handleDemoLocationChange = (locId) => {
    const loc = DEMO_LOCATIONS.find((l) => l.id === locId);
    if (!loc) return;
    updateDraft({
      selectedLocationId: loc.id,
      pickupArea: loc.label,
      pickupCoords: loc.coords,
    });
  };

  const resetFilters = () => {
    setCategoryFilter('all');
    setOnlyCompatible(false);
    setSearchQuery('');
  };

  const selectedShopObj = visibleShops.find((s) => s.id === selectedShopId) || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header + Request Quotations CTA */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[11px]">
              3
            </span>
            <span>STEP 3 OF 4 · EXPLORE NEARBY REPAIR SHOPS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Nearby Repair Shops in Pune, Maharashtra
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Inspect ratings, reviews, authorization badges, and doorstep pickup options across Pune neighborhoods.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {selectedBrand && draftRequest.model ? (
            <button
              type="button"
              onClick={handleRequestQuotations}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Request Quotations ({visibleShops.length} Shops)
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to="/select-phone"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              Select Phone to Request Quotes
            </Link>
          )}
        </div>
      </div>

      {/* Active Repair Summary Strip */}
      {selectedBrand && draftRequest.model && (
        <div className="mb-5 rounded-2xl bg-blue-50/70 border border-blue-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-blue-950">
            <span>
              <strong>Device:</strong> {selectedBrand.name} {draftRequest.model}
            </span>
            <span>
              <strong>Issues:</strong>{' '}
              {draftRequest.problemIds?.length
                ? draftRequest.problemIds
                    .map((id) => getProblemById(id)?.shortLabel)
                    .filter(Boolean)
                    .join(', ')
                : 'General repair'}
            </span>
            <span>
              <strong>Area:</strong> {draftRequest.pickupArea}
            </span>
          </div>
          <Link
            to="/describe-problem"
            className="font-semibold text-blue-700 hover:text-blue-800 underline"
          >
            Edit Request
          </Link>
        </div>
      )}

      {/* Demonstration Disclaimer */}
      <div className="mb-5 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          <strong>Prototype Map Data:</strong> Displays fictional sample repair shops around a demonstration area. Only verified demo entries are labeled as Brand-Authorized.
        </span>
      </div>

      {/* Controls & Filters Bar */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 mb-5 shadow-card space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shop or area..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Demo Area Selector (Browse without requiring GPS!) */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={draftRequest.selectedLocationId || DEMO_LOCATIONS[0].id}
              onChange={(e) => handleDemoLocationChange(e.target.value)}
              aria-label="Demonstration area"
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              {DEMO_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  Demo Area: {loc.shortArea}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <SlidersHorizontal className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort repair shops"
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="distance">Sort: Nearest First</option>
              <option value="price">Sort: Lowest Estimated Price</option>
              <option value="speed">Sort: Fastest Estimated Repair</option>
            </select>
          </div>

          {/* Mobile Map / List Switcher */}
          <div className="flex lg:hidden rounded-xl border border-slate-200 p-1 bg-slate-50">
            <button
              type="button"
              onClick={() => setMobileView('map')}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold ${
                mobileView === 'map'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map
            </button>
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold ${
                mobileView === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List ({visibleShops.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileView('split')}
              className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold ${
                mobileView === 'split'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              Both
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { id: 'all', label: 'All Shops' },
            { id: 'pickup', label: 'Doorstep Pickup Available' },
            { id: 'authorized', label: 'Brand-Authorized Only' },
            { id: 'independent', label: 'Independent Shops' },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setCategoryFilter(chip.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                categoryFilter === chip.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}

          {selectedBrand && (
            <label className="ml-auto inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyCompatible}
                onChange={(e) => setOnlyCompatible(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Supports {selectedBrand.name} only
            </label>
          )}
        </div>
      </div>

      {/* Main Split Map + List View */}
      {visibleShops.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No repair shops match your filters"
          description="Try clearing your search or switching off the strict brand/category filters to view all sample repair shops in this demonstration area."
          actionLabel="Reset All Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Map Column */}
          <div
            className={`lg:col-span-7 ${
              mobileView === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <MapView
              customerCoords={customerCoords}
              shops={visibleShops}
              selectedShopId={selectedShopId}
              onSelectShop={(shop) => setSelectedShopId(shop.id)}
            />

            {/* Selected Marker Quick Preview Bar */}
            {selectedShopObj && (
              <div className="mt-3 rounded-2xl bg-white border border-blue-200 p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-blue-600">Selected on Map</p>
                  <p className="text-sm font-bold text-slate-900">{selectedShopObj.name}</p>
                  <p className="text-xs text-slate-500">
                    {selectedShopObj.area} · {selectedShopObj.distanceKm} km · ★{' '}
                    {selectedShopObj.rating.toFixed(1)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileShop(selectedShopObj)}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Profile &amp; Reviews
                  </button>
                  {selectedBrand && draftRequest.model && (
                    <button
                      type="button"
                      onClick={handleRequestQuotations}
                      className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Get Quotes
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Shop List Column */}
          <div
            className={`lg:col-span-5 space-y-3 lg:max-h-[660px] lg:overflow-y-auto thin-scrollbar lg:pr-1 ${
              mobileView === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Showing {visibleShops.length} Sample{' '}
                {visibleShops.length === 1 ? 'Shop' : 'Shops'}
              </p>
              <span className="text-xs text-slate-400">Tap a card to highlight</span>
            </div>

            {visibleShops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                distanceKm={shop.distanceKm}
                estimatedMin={shop.estimatedMin}
                estimatedMax={shop.estimatedMax}
                isSelected={shop.id === selectedShopId}
                onSelect={(s) => setSelectedShopId(s.id)}
                onViewProfile={(s) => setProfileShop(s)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Shop Detail & Reviews Modal */}
      {profileShop && (
        <ShopDetailModal
          shop={profileShop}
          distanceKm={profileShop.distanceKm}
          estimatedMin={profileShop.estimatedMin}
          estimatedMax={profileShop.estimatedMax}
          onClose={() => setProfileShop(null)}
          onRequestQuote={handleRequestQuotations}
        />
      )}
    </div>
  );
}
