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

// 1. Initialize Supabase
const supabase = createClient('YOUR_URL', 'YOUR_KEY');

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);

  // 2. Check login status
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
          /* 3. If NOT logged in, to only show the Login page */
          <Routes>
            <Route path="*" element={<Login supabase={supabase} />} />
          </Routes>
        ) : (
          /* 4. If logged in,  to show the full app */
          <>
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