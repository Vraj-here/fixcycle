import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Smartphone,
  Wrench,
  LayoutDashboard,
  Bike,
  ClipboardList,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useFixCycle } from '../context/FixCycleContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout, bookings } = useFixCycle();
  const location = useLocation();
  const navigate = useNavigate();

  const activeBookingsCount = bookings.filter((b) => b.status !== 'phone_delivered').length;

  const handleHowItWorksClick = (e) => {
    e.preventDefault();
    setMobileOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#how-it-works');
    }
  };

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/');
  };

  const roleDashboardLink =
    currentUser?.role === 'shop_owner'
      ? { to: '/shop-dashboard', label: 'Shop Dashboard', icon: LayoutDashboard }
      : currentUser?.role === 'delivery_partner'
      ? { to: '/delivery-dashboard', label: 'Delivery Dashboard', icon: Bike }
      : { to: '/my-bookings', label: 'My Bookings', icon: ClipboardList };

  const DashboardIcon = roleDashboardLink.icon;

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* FixCycle Brand Logo */}
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <div className="relative flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
                <Wrench className="w-2.5 h-2.5 absolute -bottom-0.5 -right-1 text-blue-100" />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Fix<span className="text-blue-600">Cycle</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wide">
                PUNE DOORSTEP REPAIR
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <a
              href="/#how-it-works"
              onClick={handleHowItWorksClick}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              How It Works
            </a>
            <NavLink to="/shops" className={navLinkClass}>
              Find Repair Shops
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About Us
            </NavLink>
            <NavLink to={roleDashboardLink.to} className={navLinkClass}>
              <span className="inline-flex items-center gap-1.5">
                <DashboardIcon className="w-4 h-4" />
                {roleDashboardLink.label}
                {(!currentUser || currentUser.role === 'customer') &&
                  activeBookingsCount > 0 && (
                    <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                      {activeBookingsCount}
                    </span>
                  )}
              </span>
            </NavLink>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5">
                  <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {currentUser.initials}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 max-w-[110px] truncate">
                    {currentUser.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                Sign In
              </Link>
            )}
            <Link
              to="/select-phone"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/select-phone"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-lg">
          <div className="px-4 py-4 space-y-1.5">
            <NavLink
              to="/"
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              Home
            </NavLink>
            <a
              href="/#how-it-works"
              onClick={handleHowItWorksClick}
              className="block rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </a>
            <NavLink
              to="/shops"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              Find Repair Shops (Pune)
            </NavLink>
            <NavLink
              to="/quotations"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              Compare Quotations
            </NavLink>
            <NavLink
              to="/track"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              Live Tracking
            </NavLink>
            <NavLink
              to={roleDashboardLink.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {roleDashboardLink.label}
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              About Us
            </NavLink>

            <div className="pt-3 mt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              {currentUser ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
              )}
              <Link
                to="/select-phone"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Start Repair
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
