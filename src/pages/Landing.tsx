import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Activity } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl">
        <div className="flex justify-center mb-6 text-blue-600">
          <Heart size={64} fill="currentColor" />
        </div>
        
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Welcome to <span className="text-blue-600">AlzCare</span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-10">
          Advanced real-time monitoring and fall detection for your loved ones. 
          Stay connected, stay informed, and ensure safety with every step.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <Shield className="mx-auto text-green-500 mb-2" />
            <h3 className="font-semibold">Secure Tracking</h3>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <Activity className="mx-auto text-red-500 mb-2" />
            <h3 className="font-semibold">Fall Detection</h3>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <Heart className="mx-auto text-pink-500 mb-2" />
            <h3 className="font-semibold">Caregiver Alerts</h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Log In to Dashboard
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors"
          >
            Create New Account
          </button>
        </div>
      </div>
      
      <footer className="mt-20 text-slate-400 text-sm">
        © 2026 AlzCare Systems. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;