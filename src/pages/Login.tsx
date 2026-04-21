import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

interface LoginProps {
  supabase: any;
  isSignUp?: boolean; 
}

export default function Login({ supabase, isSignUp = false }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false); // New state for password reset
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleAuth = async () => {
    if (!email || (!forgotMode && !password)) {
      showToast("Please enter the required fields.", "warning");
      return;
    }

    setLoading(true);

    if (forgotMode) {
      // --- PASSWORD RESET LOGIC ---
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        showToast(error.message, "error");
      } else {
        showToast("Password reset link sent! Check your inbox.", "success");
        setForgotMode(false);
      }
      setLoading(false);
    } else if (isSignUp) {
      // --- CREATE ACCOUNT LOGIC ---
      const { error } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password 
      });

      if (error) {
        showToast(error.message, "error");
      } else {
        showToast("Success! Check your email for a confirmation link.", "success");
        navigate('/login'); 
      }
      setLoading(false);
    } else {
      // --- LOGIN LOGIC ---
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });

      if (error) {
        showToast(error.message, "error");
        setLoading(false);
      } else {
        showToast("Welcome back to AlzCare!", "success");
      }
    }
  };

  const headerTitle = forgotMode ? "Reset Password" : (isSignUp ? "Create an account" : "Welcome back");
  const subTitle = forgotMode ? "Enter your email to receive a reset link" : (isSignUp ? "Join the caregiver community" : "Sign in to your caregiver account");
  const buttonText = loading ? "Processing..." : (forgotMode ? "Send Reset Link" : (isSignUp ? "Create Account" : "Log In"));

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Left Panel */}
      <div className="hidden md:flex w-5/12 bg-blue-900 flex-col justify-center px-10 py-16">
        <div 
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-8 cursor-pointer hover:scale-105 transition-transform" 
          onClick={() => navigate('/')}
        >
          <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" strokeWidth={2}
               strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-white leading-snug mb-4">
          AlzCare<br />Caregiver Portal
        </h1>
        <div className="w-9 h-0.5 bg-blue-400 rounded mb-5" />
        <p className="text-sm text-blue-300 font-light leading-relaxed">
          A dedicated platform for caregivers managing Alzheimer's patients with compassion and precision.
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm border-2 border-blue-700 rounded-2xl p-9 bg-white shadow-xl">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">{headerTitle}</h2>
          <p className="text-sm text-slate-400 font-light mb-7">{subTitle}</p>
          
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:border-blue-700 outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          {!forgotMode && (
            <div className="mb-1">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:border-blue-700 outline-none transition"
                placeholder="••••••••"
              />
            </div>
          )}
          
          {!isSignUp && (
            <div className="text-right mb-5">
              <button 
                onClick={() => setForgotMode(!forgotMode)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                {forgotMode ? "Back to Login" : "Forgot password?"}
              </button>
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className={`w-full py-3 ${loading ? 'bg-slate-400' : (isSignUp ? 'bg-emerald-600' : 'bg-blue-700')} text-white text-sm font-medium rounded-xl transition mt-4`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}