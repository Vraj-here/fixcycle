import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  RotateCcw,
  Info,
  PlusCircle,
} from 'lucide-react';
import { BRANDS, getBrandById, getTotalModelCount } from '../data/brands';
import { useFixCycle } from '../context/FixCycleContext';

export default function SelectPhonePage() {
  const { draftRequest, updateDraft, addToast } = useFixCycle();
  const navigate = useNavigate();

  const [selectedBrandId, setSelectedBrandId] = useState(draftRequest.brandId || '');
  const [selectedModel, setSelectedModel] = useState(draftRequest.model || '');
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const totalModels = useMemo(() => getTotalModelCount(), []);
  const selectedBrand = useMemo(
    () => getBrandById(selectedBrandId),
    [selectedBrandId]
  );

  // Filter brands by brand name OR matching model name
  const filteredBrands = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    if (!q) return BRANDS;
    return BRANDS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        b.models.some((m) => m.toLowerCase().includes(q))
    );
  }, [brandSearch]);

  const filteredModels = useMemo(() => {
    if (!selectedBrand) return [];
    const q = modelSearch.trim().toLowerCase();
    if (!q) return selectedBrand.models;
    return selectedBrand.models.filter((m) => m.toLowerCase().includes(q));
  }, [selectedBrand, modelSearch]);

  const handleBrandClick = (brandId) => {
    setSelectedBrandId(brandId);
    if (brandId !== selectedBrandId) {
      setSelectedModel('');
      setModelSearch('');
      setCustomModel('');
    }
    setErrorMsg('');
    updateDraft({ brandId, model: brandId === selectedBrandId ? selectedModel : '' });
  };

  const handleModelClick = (modelName) => {
    setSelectedModel(modelName);
    setCustomModel('');
    setErrorMsg('');
    updateDraft({ brandId: selectedBrandId, model: modelName });
  };

  const handleApplyCustomModel = () => {
    const cleaned = customModel.trim();
    if (cleaned.length < 2) {
      setErrorMsg('Please enter at least 2 characters for your model name.');
      return;
    }
    setSelectedModel(cleaned);
    setErrorMsg('');
    updateDraft({ brandId: selectedBrandId, model: cleaned });
    addToast(`Selected custom model: ${selectedBrand.name} ${cleaned}`, 'success');
  };

  const handleResetSelection = () => {
    setSelectedBrandId('');
    setSelectedModel('');
    setModelSearch('');
    setCustomModel('');
    updateDraft({ brandId: '', model: '' });
  };

  const handleContinue = () => {
    if (!selectedBrandId) {
      setErrorMsg('Please select your smartphone brand first.');
      return;
    }
    if (!selectedModel) {
      setErrorMsg('Please select or enter your smartphone model before continuing.');
      return;
    }
    updateDraft({ brandId: selectedBrandId, model: selectedModel });
    addToast(`Selected ${selectedBrand.name} ${selectedModel}`, 'success');
    navigate('/describe-problem');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Progress Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[11px]">
            1
          </span>
          <span>STEP 1 OF 4 · SELECT YOUR DEVICE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Which smartphone needs repair?
        </h1>
        <p className="text-sm text-slate-600 mt-1.5">
          Choose from <strong>{BRANDS.length} smartphone brands</strong> and{' '}
          <strong>{totalModels}+ market models</strong> to find compatible repair shops in Pune.
        </p>
      </div>

      {/* Inline Validation Error */}
      {errorMsg && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: SELECT BRAND */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">
              1. Select Brand ({filteredBrands.length})
            </h2>
            {selectedBrand && (
              <button
                type="button"
                onClick={handleResetSelection}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Search brand or model..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {filteredBrands.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center text-sm text-slate-500">
            No brands match “{brandSearch}”.{' '}
            <button
              type="button"
              onClick={() => setBrandSearch('')}
              className="font-semibold text-blue-600 underline"
            >
              Show all {BRANDS.length} brands
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {filteredBrands.map((brand) => {
              const isSelected = brand.id === selectedBrandId;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => handleBrandClick(brand.id)}
                  className={`relative rounded-2xl border p-3.5 sm:p-4 text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100 shadow-card'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-card'
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 absolute top-3 right-3" />
                  )}
                  <div
                    className={`h-9 w-9 rounded-xl ${brand.accentBg} ${brand.accentText} flex items-center justify-center text-xs font-bold mb-2.5`}
                  >
                    {brand.monogram}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {brand.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {brand.models.length} models
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* STEP 2: SELECT MODEL */}
      {selectedBrand && (
        <section className="mb-8 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                2. Select {selectedBrand.name} Model
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedBrand.models.length} popular models listed — or type any other model below
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder={`Filter ${selectedBrand.name} models...`}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {filteredModels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[360px] overflow-y-auto thin-scrollbar pr-1">
              {filteredModels.map((model) => {
                const isActive = selectedModel === model;
                return (
                  <button
                    key={model}
                    type="button"
                    onClick={() => handleModelClick(model)}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
                      isActive
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50/70 text-slate-800 hover:bg-white hover:border-blue-300'
                    }`}
                  >
                    <span className="truncate">{model}</span>
                    {isActive && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center">
              <p className="text-sm font-medium text-slate-700">
                No listed {selectedBrand.name} models match “{modelSearch}”.
              </p>
              <button
                type="button"
                onClick={() => setModelSearch('')}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Custom Model Fallback Input */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="flex-1">
              <label
                htmlFor="custom-model-input"
                className="block text-xs font-semibold text-slate-600 mb-1"
              >
                Don’t see your exact {selectedBrand.name} model? Enter it manually:
              </label>
              <input
                id="custom-model-input"
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder={`e.g. ${selectedBrand.name} custom or older model`}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyCustomModel}
              className="sm:self-end inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Use This Model
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            Shop availability varies by brand and spare-part stock. Compatible Pune shops will be filtered automatically.
          </p>
        </section>
      )}

      {/* STEP 3: CONFIRM DEVICE */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                selectedBrand && selectedModel
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                3. Confirm Device
              </p>
              {selectedBrand && selectedModel ? (
                <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  {selectedBrand.name} — {selectedModel}
                </p>
              ) : (
                <p className="text-sm text-slate-500 mt-0.5">
                  {selectedBrand
                    ? `Selected ${selectedBrand.name}. Now choose a model above.`
                    : 'Choose a smartphone brand and model to continue.'}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {selectedBrand && selectedModel && (
              <button
                type="button"
                onClick={handleResetSelection}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Change Device
              </button>
            )}
            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Continue to Problem Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
