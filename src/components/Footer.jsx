import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Wrench } from 'lucide-react';
import { useFixCycle } from '../context/FixCycleContext';

export default function Footer() {
  const { resetDemoData } = useFixCycle();

  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Fix<span className="text-blue-600">Cycle</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed">
              Find trusted repair shops. Compare prices. Get doorstep pickup. Track your repair. Get your phone back.
            </p>
            <p className="text-xs text-slate-400">
              First-Year Engineering Prototype · Simulated Demo Data
            </p>
          </div>

          {/* Customer Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Customer Flow
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/select-phone" className="hover:text-blue-600 transition-colors">
                  Select Your Phone
                </Link>
              </li>
              <li>
                <Link to="/describe-problem" className="hover:text-blue-600 transition-colors">
                  Describe Your Problem
                </Link>
              </li>
              <li>
                <Link to="/shops" className="hover:text-blue-600 transition-colors">
                  Find Nearby Repair Shops
                </Link>
              </li>
              <li>
                <Link to="/quotations" className="hover:text-blue-600 transition-colors">
                  Compare Quotations
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-blue-600 transition-colors">
                  Live Tracking (Demo)
                </Link>
              </li>
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Dashboards
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/my-bookings" className="hover:text-blue-600 transition-colors">
                  Customer — My Bookings
                </Link>
              </li>
              <li>
                <Link to="/shop-dashboard" className="hover:text-blue-600 transition-colors">
                  Shop Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/delivery-dashboard" className="hover:text-blue-600 transition-colors">
                  Delivery Partner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600 transition-colors">
                  Sign In / Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Notice */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 mb-4">
              <li>
                <Link to="/about" className="hover:text-blue-600 transition-colors">
                  About FixCycle
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={resetDemoData}
                  className="hover:text-blue-600 transition-colors text-left"
                >
                  Reset Prototype Demo Data
                </button>
              </li>
            </ul>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500 leading-relaxed flex items-start gap-2">
              <Wrench className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                All shops, prices, reviews and GPS movement shown in this prototype are demonstration data.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FixCycle Prototype. Built for academic demonstration.</p>
          <p>Maps powered by Leaflet &amp; OpenStreetMap contributors.</p>
        </div>
      </div>
    </footer>
  );
}
