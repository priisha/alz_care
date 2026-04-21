import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RealTimeTracking from './pages/RealTimeTracking';
import LocationHistory from './pages/LocationHistory';
import Alerts from './pages/Alerts';
import About from './pages/About';
import Login from './pages/Login'; 
import { ToastProvider } from './context/ToastContext';
import AlertListener from './components/AlertListener';

// Initialize Supabase
const supabase = createClient(
  'https://innjqpuucklkbqwfbptu.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubmpxcHV1Y2tsa2Jxd2ZicHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMzkzNDAsImV4cCI6MjA4NjcxNTM0MH0.f-hl3R6OO3PF3VejSg8o7r2nsJli-c17SxSjbvAWLrc'
);

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <ToastProvider>
      <Router>
        {!session ? (
          <Routes>
            <Route path="*" element={<Login supabase={supabase} />} />
          </Routes>
        ) : (
          <>
            {/* The global listener that detects the ESP32 database inserts */}
            <AlertListener /> 
            
            <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1"> 
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tracking" element={<RealTimeTracking />} />
                  <Route path="/history" element={<LocationHistory />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Navigate to="/" />} />
                </Routes>
              </main>
              <footer className="text-center p-6 text-xs text-gray-400">
                © 2026 AlzCare. All rights reserved.
              </footer>
            </div>
          </>
        )}
      </Router>
    </ToastProvider>
  );
}

export default App;