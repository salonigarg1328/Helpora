import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';

import Login from './pages/Login';
import Register from './pages/Register';
import VictimDashboard from './pages/VictimDashboard';
import NgoDashboard from './pages/NgoDashboard';
import VictimHistory from './pages/VictimHistory';
import NgoHistory from './pages/NgoHistory';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/" element={<LandingPage />} />
        {/* Protected routes */}
        <Route
          path="/victim-dashboard"
          element={
            <ProtectedRoute allowedRoles={['victim']}>
              <VictimDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/victim-dashboard/history"
          element={
            <ProtectedRoute allowedRoles={['victim']}>
              <VictimHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo-dashboard"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <NgoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo-dashboard/history"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <NgoHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;