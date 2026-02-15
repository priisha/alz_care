import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RealTimeTracking from './pages/RealTimeTracking';
import LocationHistory from './pages/LocationHistory';
import Alerts from './pages/Alerts';
import { ToastProvider } from './context/ToastContext';
import AlertListener from './components/AlertListener';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <AlertListener />
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tracking" element={<RealTimeTracking />} />
            <Route path="/history" element={<LocationHistory />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/about" element={<div className="p-10">About Page</div>} />
          </Routes>
          
          <footer className="text-center p-6 text-xs text-gray-400">
            © 2025 AlzCare. All rights reserved. contact@alzcare.com | +977-9860889646
          </footer>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;