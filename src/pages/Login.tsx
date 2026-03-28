import { useState } from 'react';

export default function Login({ supabase }: { supabase: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <div className="flex min-h-screen bg-slate-900">

      {/* Left Panel */}
      <div className="hidden md:flex w-5/12 bg-blue-900 flex-col justify-center px-10 py-16">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-8">
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
        <div className="inline-flex items-center gap-2 mt-6 bg-white/10 border border-white/15 rounded-lg px-3 py-2 w-fit">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-blue-200 uppercase tracking-widest font-medium">Secure & Private</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 items-center justify-center px-8 py-12 bg-white">

        {/* Blue Border Card */}
        <div className="w-full max-w-sm border-2 border-blue-700 rounded-2xl p-9 bg-white shadow-[0_4px_32px_rgba(29,78,216,0.08)]">

          <h2 className="text-xl font-semibold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-400 font-light mb-7">Sign in to your caregiver account</p>
         
         <div className="mb-4">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-500 placeholder-slate-400 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition"
            />
          </div>

           <div className="mb-1">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-500 placeholder-slate-400 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 transition"
            />
          </div>
          
          <div className="text-right mb-5">
            <a href="#" className="text-xs text-blue-400 hover:text-blue-300">Forgot password?</a>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white text-sm font-medium rounded-xl transition"
          >
            Log In
          </button>

          <p className="text-center text-xs text-slate-600 mt-6">
            Need access?{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Contact your administrator</a>
          </p>
        </div>
      </div>
    </div>
  );
}