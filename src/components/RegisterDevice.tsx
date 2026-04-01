import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Tablet, User, Link as LinkIcon, AlertCircle } from 'lucide-react';

const RegisterDevice: React.FC = () => {
  const [macAddress, setMacAddress] = useState('');
  const [patientName, setPatientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Get current caregiver ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in first");

      // 2. Ensure the patient exists in 'patients' table
      // We use upsert so it creates the row if the ESP32 hasn't sent data yet
      const { error: pError } = await supabase
        .from('patients')
        .upsert({ 
          id: macAddress, 
          name: patientName, 
          status: 'Safe',
          device_status: 'Online'
        });

      if (pError) throw pError;

      // 3. Link caregiver to the patient in the bridge table
      const { error: linkError } = await supabase
        .from('caregiver_patients')
        .insert({ 
          caregiver_id: user.id, 
          patient_id: macAddress 
        });

      if (linkError) {
        // Handle duplicate key error gracefully
        if (linkError.code === '23505') throw new Error("This device is already linked to an account.");
        throw linkError;
      }

      alert("Device successfully linked! You can now track this patient.");
      setMacAddress('');
      setPatientName('');
      
      // Smoothly push the user to the dashboard to see their new device
      navigate('/');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto my-8">
      <div className="flex items-center gap-2 mb-4">
        <Tablet className="text-blue-600" size={24} />
        <h2 className="text-xl font-bold text-gray-800">Link New Device</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Device MAC Address / ID
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="e.g. 4C11AE69B210 or P001"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={macAddress}
              // Sanitizes input but allows both numbers and standard letters for custom IDs
              onChange={(e) => setMacAddress(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Patient Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Linking...' : 'Register Device'}
        </button>
      </form>
    </div>
  );
};

export default RegisterDevice;