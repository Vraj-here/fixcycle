import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Star,
  Clock,
  Truck,
  CheckCircle2,
  Smartphone,
  ClipboardList,
  Scale,
  UserCheck,
  Navigation,
} from 'lucide-react';
import { BRANDS, getTotalModelCount } from '../data/brands';
import { useFixCycle } from '../context/FixCycleContext';

export default function HomePage() {
  const { updateDraft } = useFixCycle();
  const navigate = useNavigate();
  const location = useLocation();

  // Support scrolling to #how-it-works when navigated from other routes
  useEffect(() => {
    if (location.hash === '#how-it-works') {
      const el = document.getElementById('how-it-works');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 80);
      }
    }
  }, [location.hash]);

  const handleSelectBrandShortcut = (brandId) => {
    updateDraft({ brandId, model: '' });
    navigate('/select-phone');
  };

  const howItWorksSteps = [
    {
      num: '01',
      icon: Smartphone,
      title: 'Select your phone',
      desc: 'Choose your smartphone brand and model from our organized device catalog.',
    },
    {
      num: '02',
      icon: ClipboardList,
      title: 'Describe the issue',
      desc: 'Pick the symptoms, optionally attach a photo for reference, and set a pickup slot.',
    },
    {
      num: '03',
      icon: MapPin,
      title: 'Compare nearby repair shops',
      desc: 'Explore verified demo shops on the map and compare multiple transparent quotations.',
    },
    {
      num: '04',
      icon: UserCheck,
      title: 'Choose your repair partner',
      desc: 'Select your preferred shop and choose technician or delivery partner pickup.',
    },
    {
      num: '05',
      icon: Navigation,
      title: 'Track pickup and delivery',
      desc: 'Follow your doorstep pickup, repair progress, and return delivery step by step.',
    },
  ];

  const whyFixCycleItems = [
    {
      icon: Scale,
      title: 'Compare multiple repair quotations',
      desc: 'Receive clear price ranges and turnaround estimates from nearby shops before committing.',
    },
    {
      icon: MapPin,
      title: 'Discover nearby repair shops',
      desc: 'View both independent repair labs and brand-authorized service centres on one map.',
    },
    {
      icon: Star,
      title: 'Check ratings and reviews',
      desc: 'Evaluate shop profiles, authorization status, warranty terms, and customer feedback.',
    },
    {
      icon: Truck,
      title: 'Convenient doorstep pickup',
      desc: 'Choose collection by the repair shop’s own technician or a shop-assigned delivery partner.',
    },
    {
      icon: ShieldCheck,
      title: 'Transparent repair estimates',
      desc: 'Every booking clearly separates initial estimates from confirmed final inspection prices.',
    },
    {
      icon: Clock,
      title: 'Track the pickup and return journey',
      desc: 'Monitor every milestone from pickup arrival to workbench repair and safe doorstep return.',
    },
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-semibold text-blue-700">
                <ShieldCheck className="w-4 h-4" />
                Transparent Mobile Repair Marketplace
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Your Phone Deserves Better. We Bring Repair to Your Doorstep.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Find trusted nearby repair shops, compare quotations and get your smartphone repaired without the hassle of visiting multiple stores.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/select-phone"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Find a Repair Shop
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  How It Works
                </a>
              </div>

              {/* Trust Highlights */}
              <div className="pt-4 grid grid-cols-3 gap-4 max-w-lg border-t border-slate-100">
                <div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">{BRANDS.length} Brands</p>
                  <p className="text-xs text-slate-500">{getTotalModelCount()}+ latest models</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">Pune Map</p>
                  <p className="text-xs text-slate-500">FC Rd, Kothrud &amp; more</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">Live Tracking</p>
                  <p className="text-xs text-slate-500">10-step transparency</p>
                </div>
              </div>
            </div>

            {/* Clean Modern Product Visual Composition */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-[#F8FAFC] border border-slate-200 p-5 sm:p-6 shadow-card-hover">
                {/* Top Status Card */}
                <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-card mb-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">iPhone 14 · Screen Repair</p>
                        <p className="text-[11px] text-slate-500">3 nearby quotations ready</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                      Compare
                    </span>
                  </div>

                  {/* Mini Quotation Comparison Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-xl bg-blue-50/70 border border-blue-200 px-3 py-2.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-900">QuickFix Mobile Lab</span>
                          <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            RECOMMENDED
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">★ 4.8 · 3 hrs · Tech Pickup</p>
                      </div>
                      <span className="text-xs font-bold text-slate-900">₹1,800–₹2,400</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Apex Care Authorized</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">★ 4.9 · 5 hrs · Authorized</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">₹2,400–₹3,100</span>
                    </div>
                  </div>
                </div>

                {/* Live Doorstep Pickup Tracker Preview */}
                <div className="rounded-2xl bg-slate-900 text-white p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300">
                      <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      Doorstep Pickup Active
                    </span>
                    <span className="text-[11px] text-slate-400">ETA ~8 mins</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                      RJ
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">Rohan Joshi · Delivery Partner</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Heading to FC Road, Pune (Demo Route)
                      </p>
                    </div>
                    <Link
                      to="/track"
                      className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors shrink-0"
                    >
                      Track
                    </Link>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    Illustrative preview
                  </span>
                  <Link to="/shops" className="font-semibold text-blue-600 hover:text-blue-700">
                    Open Interactive Map →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
              Simple 5-Step Process
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              How FixCycle Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Go from a cracked screen or weak battery to doorstep repair tracking in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {howItWorksSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="rounded-2xl bg-white border border-slate-200 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">{step.num}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY FIXCYCLE */}
      <section className="py-16 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
              Built for Trust &amp; Clarity
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Why FixCycle?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Skip the guesswork of visiting multiple repair counters. Compare shops openly and stay updated at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyFixCycleItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-6 hover:border-blue-200 hover:bg-white transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* POPULAR BRANDS */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
                Supported Devices
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Popular Smartphone Brands
              </h2>
              <p className="text-sm text-slate-600 mt-1.5">
                Pick your brand to select your model and compare nearby repair shops.
              </p>
            </div>
            <Link
              to="/select-phone"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all models
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
            {BRANDS.map((brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => handleSelectBrandShortcut(brand.id)}
                className="group rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 text-left shadow-card hover:border-blue-500 hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`h-10 w-10 rounded-xl ${brand.accentBg} ${brand.accentText} flex items-center justify-center text-xs font-bold tracking-tight`}
                  >
                    {brand.monogram}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{brand.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{brand.tagline}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CALL TO ACTION */}
      <section className="pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 text-white px-6 py-12 sm:px-12 sm:py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
                Ready to get started?
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Get your phone fixed without leaving home.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
                Select your device, compare honest quotations from nearby repair shops, and watch your pickup arrive on a live map.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Link
                to="/select-phone"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                Start Repair Request
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shops"
                className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-100 hover:bg-slate-700 transition-colors"
              >
                Explore Shop Map
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
