import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Scale,
  Truck,
  Lock,
  Code2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function AboutPage() {
  const pillars = [
    {
      icon: Scale,
      title: 'Transparent Quotation Comparison',
      desc: 'Instead of walking into one store and accepting an opaque quote, customers compare multiple nearby repair shops by rating, distance, estimated price, and turnaround time.',
    },
    {
      icon: ShieldCheck,
      title: 'Honest Shop Categorization',
      desc: 'FixCycle clearly distinguishes Independent Repair Shops from Brand-Authorized Service Centres. An independent shop is never falsely labeled as official.',
    },
    {
      icon: Truck,
      title: 'Flexible Doorstep Pickup',
      desc: 'Supports both shop-owner/technician pickup and dedicated delivery-partner collection, with visible pickup-person identity and Booking ID handover checks.',
    },
    {
      icon: Lock,
      title: 'Privacy-First Design',
      desc: 'Only an approximate neighborhood is used while browsing shops and comparing quotes. Location permission is always optional and never collected silently.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Intro */}
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          About FixCycle
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Making smartphone repair transparent, convenient, and trustworthy.
        </h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
          FixCycle is a mobile repair marketplace prototype focused solely on connecting smartphone owners with nearby repair shops and doorstep pickup-and-delivery tracking. It is not a phone-selling or device-exchange platform — its sole purpose is helping you get your existing phone repaired safely without visiting multiple stores.
        </p>
      </section>

      {/* Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pillars.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl bg-white border border-slate-200 p-6 shadow-card"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1.5">
                {item.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </section>

      {/* Prototype & Academic Architecture Section */}
      <section className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Engineering Prototype &amp; Demonstration Notes
            </h2>
            <p className="text-xs text-slate-500">
              Designed to be clean, zero-budget, understandable, and easy to present.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Technology Stack Used
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                React 18 + Vite (fast modular UI)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Tailwind CSS + Lucide Icons (responsive minimalist UI)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Leaflet + OpenStreetMap (free interactive maps)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Browser localStorage (persistent client-side demo state)
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              What a Real Production Launch Would Add
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Verified shop KYC onboarding &amp; service authorization checks
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Secure backend authentication, encrypted database &amp; OTP handover
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                Real-time WebSocket GPS streaming with permission controls
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Escrow payment protection &amp; insured device transit coverage
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Try the complete end-to-end flow</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Select a phone, compare shop quotes, book pickup, and watch the live simulated tracker.
          </p>
        </div>
        <Link
          to="/select-phone"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shrink-0"
        >
          Start Repair Flow
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
