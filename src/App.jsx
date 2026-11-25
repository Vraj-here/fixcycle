import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { FixCycleProvider } from './context/FixCycleContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import SelectPhonePage from './pages/SelectPhonePage';
import DescribeProblemPage from './pages/DescribeProblemPage';
import NearbyShopsPage from './pages/NearbyShopsPage';
import CompareQuotationsPage from './pages/CompareQuotationsPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import LiveTrackingPage from './pages/LiveTrackingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ShopDashboardPage from './pages/ShopDashboardPage';
import DeliveryDashboardPage from './pages/DeliveryDashboardPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <FixCycleProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/select-phone" element={<SelectPhonePage />} />
            <Route path="/describe-problem" element={<DescribeProblemPage />} />
            <Route path="/shops" element={<NearbyShopsPage />} />
            <Route path="/quotations" element={<CompareQuotationsPage />} />
            <Route
              path="/booking-confirmation/:id"
              element={<BookingConfirmationPage />}
            />
            <Route path="/track" element={<LiveTrackingPage />} />
            <Route path="/track/:id" element={<LiveTrackingPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route
              path="/shop-dashboard"
              element={
                <ProtectedRoute allowedRoles={['shop_owner']}>
                  <ShopDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery-dashboard"
              element={
                <ProtectedRoute allowedRoles={['delivery_partner']}>
                  <DeliveryDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician-dashboard"
              element={
                <ProtectedRoute allowedRoles={['delivery_partner']}>
                  <DeliveryDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FixCycleProvider>
  );
}
