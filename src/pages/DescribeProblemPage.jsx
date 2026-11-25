import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  Upload,
  Camera,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Smartphone,
  LocateFixed,
  Info,
} from 'lucide-react';
import {
  REPAIR_PROBLEMS,
  PICKUP_TIME_SLOTS,
  DEMO_LOCATIONS,
} from '../data/problems';
import { getBrandById } from '../data/brands';
import { useFixCycle } from '../context/FixCycleContext';
import { estimateProblemBaseCost } from '../utils/quotationEngine';
import { formatPriceRange, getTodayISO } from '../utils/helpers';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function DescribeProblemPage() {
  const { draftRequest, updateDraft, addToast } = useFixCycle();
  const navigate = useNavigate();

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [selectedProblems, setSelectedProblems] = useState(
    draftRequest.problemIds || []
  );
  const [description, setDescription] = useState(draftRequest.description || '');
  const [photoDataUrl, setPhotoDataUrl] = useState(draftRequest.photoDataUrl || null);
  const [photoName, setPhotoName] = useState(draftRequest.photoName || '');
  const [photoError, setPhotoError] = useState('');

  const [pickupDate, setPickupDate] = useState(draftRequest.pickupDate || getTodayISO());
  const [pickupTimeSlot, setPickupTimeSlot] = useState(
    draftRequest.pickupTimeSlot || PICKUP_TIME_SLOTS[2]
  );
  const [selectedLocationId, setSelectedLocationId] = useState(
    draftRequest.selectedLocationId || DEMO_LOCATIONS[0].id
  );
  const [pickupArea, setPickupArea] = useState(
    draftRequest.pickupArea || DEMO_LOCATIONS[0].label
  );
  const [pickupCoords, setPickupCoords] = useState(
    draftRequest.pickupCoords || DEMO_LOCATIONS[0].coords
  );

  const [locating, setLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');
  const [formError, setFormError] = useState('');

  const brand = getBrandById(draftRequest.brandId);
  const estimatedBase = estimateProblemBaseCost(selectedProblems, draftRequest.brandId || 'apple');

  const toggleProblem = (id) => {
    setFormError('');
    setSelectedProblems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleImageFile = (event) => {
    setPhotoError('');
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError(
        'Unsupported image format. Please upload a JPG, PNG, or WebP photograph.'
      );
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setPhotoError('File is too large. Please select a photo smaller than 5 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(reader.result);
      setPhotoName(file.name);
      addToast('Photo attached for shop visual reference.', 'success');
    };
    reader.onerror = () => {
      setPhotoError('Could not read the selected image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoDataUrl(null);
    setPhotoName('');
    setPhotoError('');
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSelectDemoLocation = (loc) => {
    setSelectedLocationId(loc.id);
    setPickupArea(loc.label);
    setPickupCoords(loc.coords);
    setLocationNotice('');
    setFormError('');
  };

  const handleUseBrowserLocation = () => {
    setLocationNotice('');
    if (!navigator.geolocation) {
      setLocationNotice(
        'Geolocation is not supported by this browser. Please select a demo area or enter your approximate location manually.'
      );
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        setPickupCoords([lat, lng]);
        setPickupArea(`Current Browser Location (${lat}, ${lng})`);
        setSelectedLocationId('custom_gps');
        setLocationNotice(
          'Browser location granted! Note: Sample repair shops are centered across Pune, Maharashtra; you can switch back to any Pune area preset anytime.'
        );
        setLocating(false);
      },
      () => {
        setLocationNotice(
          'Location permission was declined or unavailable. No problem — use a demo location preset or type your approximate area below.'
        );
        setLocating(false);
      },
      { timeout: 6000 }
    );
  };

  const handleFindShops = (e) => {
    e.preventDefault();
    setFormError('');

    if (!draftRequest.brandId || !draftRequest.model) {
      setFormError('Please select your smartphone brand and model first.');
      return;
    }
    if (selectedProblems.length === 0) {
      setFormError('Please select at least one repair problem.');
      return;
    }
    if (!pickupDate) {
      setFormError('Please choose a preferred pickup date.');
      return;
    }
    if (!pickupArea.trim()) {
      setFormError('Please enter an approximate pickup location or select a demo area.');
      return;
    }

    updateDraft({
      problemIds: selectedProblems,
      description: description.trim(),
      photoDataUrl,
      photoName,
      pickupDate,
      pickupTimeSlot,
      pickupArea: pickupArea.trim(),
      pickupCoords,
      selectedLocationId,
    });

    navigate('/shops');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[11px]">
            2
          </span>
          <span>STEP 2 OF 4 · DESCRIBE THE PROBLEM</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          What is wrong with your smartphone?
        </h1>
        <p className="text-sm text-slate-600 mt-1.5">
          Select one or more issues, optionally share a reference photo, and pick your preferred doorstep pickup window.
        </p>
      </div>

      {/* Selected Device Banner */}
      <div className="mb-6 rounded-2xl bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Selected Device</p>
            {brand && draftRequest.model ? (
              <p className="text-sm font-bold text-slate-900">
                {brand.name} — {draftRequest.model}
              </p>
            ) : (
              <p className="text-sm font-medium text-amber-700">
                No device selected yet
              </p>
            )}
          </div>
        </div>
        <Link
          to="/select-phone"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {brand && draftRequest.model ? 'Change Phone' : 'Select Phone'}
        </Link>
      </div>

      {formError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleFindShops} className="space-y-6">
        {/* 1. PREDEFINED PROBLEMS */}
        <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                1. Select Repair Issues <span className="text-red-500">*</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                You can select multiple issues if needed.
              </p>
            </div>
            {selectedProblems.length > 0 && (
              <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
                {selectedProblems.length} selected · Est.{' '}
                {formatPriceRange(estimatedBase.baseMin, estimatedBase.baseMax)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REPAIR_PROBLEMS.map((problem) => {
              const isSelected = selectedProblems.includes(problem.id);
              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => toggleProblem(problem.id)}
                  className={`rounded-xl border p-3.5 text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {problem.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. OPTIONAL PHOTO UPLOAD */}
        <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                2. Upload Damaged Phone Photo{' '}
                <span className="text-xs font-normal text-slate-400">(Optional)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Shared with repair shops for visual reference only (no automated AI diagnosis).
              </p>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageFile}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageFile}
            className="hidden"
          />

          {photoError && (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              {photoError}
            </div>
          )}

          {photoDataUrl ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src={photoDataUrl}
                alt="Uploaded damaged phone preview"
                className="h-32 w-32 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {photoName || 'Attached reference photo'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  This photograph will be included with your repair request so technicians can estimate parts accurately.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Replace Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
              <p className="text-sm font-medium text-slate-700 mb-1">
                Add a photo of the cracked screen, port, or damage
              </p>
              <p className="text-xs text-slate-500 mb-4">
                JPG, PNG, or WebP · Max 5 MB · Completely optional
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  Upload from Gallery
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  <Camera className="w-4 h-4 text-blue-600" />
                  Take Photo with Camera
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 3. ADDITIONAL DETAILS & PICKUP SCHEDULE */}
        <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card space-y-5">
          <h2 className="text-base font-semibold text-slate-900">
            3. Additional Notes &amp; Doorstep Pickup Details
          </h2>

          <div>
            <label
              htmlFor="problem-notes"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Short Description (Optional)
            </label>
            <textarea
              id="problem-notes"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Dropped on tiles yesterday, glass is cracked near the top corner but display still lights up."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="pickup-date"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Preferred Pickup Date <span className="text-red-500">*</span>
              </label>
              <input
                id="pickup-date"
                type="date"
                min={getTodayISO()}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="pickup-slot"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Preferred Pickup Time <span className="text-red-500">*</span>
              </label>
              <select
                id="pickup-slot"
                value={pickupTimeSlot}
                onChange={(e) => setPickupTimeSlot(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {PICKUP_TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Approximate Pickup Location */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="pickup-area"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Approximate Pickup Location <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleUseBrowserLocation}
                disabled={locating}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                {locating ? 'Checking location...' : 'Use My Location (Optional)'}
              </button>
            </div>

            <input
              id="pickup-area"
              type="text"
              value={pickupArea}
              onChange={(e) => setPickupArea(e.target.value)}
              placeholder="Enter neighborhood or approximate landmark (demo)"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

            {/* Quick demo neighborhood presets */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {DEMO_LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelectDemoLocation(loc)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedLocationId === loc.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {loc.shortArea}
                </button>
              ))}
            </div>

            {locationNotice && (
              <p className="mt-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                {locationNotice}
              </p>
            )}

            <p className="mt-2 text-[11px] text-slate-500">
              Privacy protection: Only your approximate neighborhood is displayed to repair shops while comparing quotations.
            </p>
          </div>
        </section>

        {/* Submit Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <Link
            to="/select-phone"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Device
          </Link>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Find Nearby Shops
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
