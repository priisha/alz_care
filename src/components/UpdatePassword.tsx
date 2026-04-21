import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function UpdatePassword({ supabase }: { supabase: any }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleUpdate = async () => {
    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "warning");
      return;
    }
    
    setLoading(true);
    
    // Updates the user's password in Supabase
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Password updated! You can now log in.", "success");
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl p-9 shadow-2xl border-t-4 border-blue-700">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Set New Password</h2>
        <p className="text-slate-500 text-xs mb-6 font-light">
          Enter a new secure password for your AlzCare account.
        </p>
        
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:border-blue-700 outline-none transition"
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className={`w-full py-3 bg-blue-700 text-white rounded-xl font-medium transition hover:bg-blue-800 active:scale-[0.98] ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}