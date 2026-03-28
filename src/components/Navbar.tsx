import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Map, History, Bell, Info, LogOut } from 'lucide-react';
import { supabase } from '../supabase'; // Ensure this path is correct

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string): string => 
    location.pathname === path ? 'bg-blue-800 text-white' : 'text-blue-200 hover:text-white';

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect to login page immediately
      navigate('/login');
    } catch (error: any) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <nav className="bg-primary text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-50 navbar">
      <div className="flex items-center gap-2">
        <Activity className="h-8 w-8" />
        <div>
          <h1 className="text-xl font-bold">AlzCare</h1>
          <p className="text-xs text-blue-200">Smart Care for Peace of Mind</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm font-medium">
        <div className="flex gap-2">
          <Link to="/" className={`flex items-center gap-1 px-3 py-2 rounded-md transition ${isActive('/')}`}>
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link to="/tracking" className={`flex items-center gap-1 px-3 py-2 rounded-md transition ${isActive('/tracking')}`}>
            <Map size={16} /> Real-Time Tracking
          </Link>
          <Link to="/history" className={`flex items-center gap-1 px-3 py-2 rounded-md transition ${isActive('/history')}`}>
            <History size={16} /> Location History
          </Link>
          <Link to="/alerts" className={`flex items-center gap-1 px-3 py-2 rounded-md transition ${isActive('/alerts')}`}>
            <Bell size={16} /> Alerts
          </Link>
          <Link to="/about" className={`flex items-center gap-1 px-3 py-2 rounded-md transition ${isActive('/about')}`}>
            <Info size={16} /> About
          </Link>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-blue-700 mx-2"></div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-2 rounded-md text-red-300 hover:text-white hover:bg-red-800/50 transition"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;