import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { LoginForm } from './components/ui/LoginForm';

export function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<div>Register Form (Coming Soon)</div>} />
        </Route>

        {/* Main app routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<div>Dashboard (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  );
} 