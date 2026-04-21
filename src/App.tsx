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
import Landing from './pages/Landing'; 
import UpdatePassword from './components/UpdatePassword'; // Added this
import { ToastProvider } from './context/ToastContext';
import AlertListener from './components/AlertListener';

// Initialize Supabase
const supabase = createClient(
  'https://innjqpuucklkbqwfbptu.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubmpxcHV1Y2tsa2Jxd2ZicHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMzkzNDAsImV4cCI6MjA4NjcxNTM0MH0.f-hl3R6OO3PF3VejSg8o7r2nsJli-c17SxSjbvAWLrc'
);

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Removed manual navigate() calls here to let the <Routes> 
      // logic handle redirection based on the new session state.
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading AlzCare...</div>;

  return (
    <ToastProvider>
      <Router>
        {/* If logged in, we listen for hardware alerts globally */}
        {session && <AlertListener />} 
        
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
          {/* Only show Navbar if logged in */}
          {session && <Navbar />}

          <main className="flex-1"> 
            <Routes>
              {/* PUBLIC ROUTES */}
              {/* When session is null, "/" renders <Landing />. No more auto-redirect to login. */}
              <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Landing />} />
              <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Login supabase={supabase} />} />
              <Route path="/signup" element={session ? <Navigate to="/dashboard" /> : <Login supabase={supabase} isSignUp={true} />} />
              <Route path="/about" element={<About />} />
              
              {/* Password Reset Callback Route */}
              <Route path="/update-password" element={<UpdatePassword supabase={supabase} />} />

              {/* PROTECTED ROUTES */}
              <Route 
                path="/dashboard" 
                element={session ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/tracking" 
                element={session ? <RealTimeTracking /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/history" 
                element={session ? <LocationHistory /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/alerts" 
                element={session ? <Alerts /> : <Navigate to="/login" />} 
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <footer className="text-center p-6 text-xs text-gray-400">
            © 2026 AlzCare. All rights reserved.
          </footer>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;