import React, { useState } from 'react';
// import { patientService } from '../services/patientService';
import { supabase } from '../supabase';
const RegisterDevice: React.FC = () => {
  const [macAddress, setMacAddress] = useState('');
  const [patientName, setPatientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
        if (linkError.code === '23505') throw new Error("This device is already linked to an account.");
        throw linkError;
      }

      alert("Device successfully linked! You can now track this patient.");
      setMacAddress('');
      setPatientName('');

    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Link New Device</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Device MAC Address</label>
          <input 
            type="text" 
            placeholder="e.g. 4C11AE69B210"
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={macAddress}
            onChange={(e) => setMacAddress(e.target.value.toUpperCase().replace(/[^A-Z0-1]/g, ""))}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Patient Name</label>
          <input 
            type="text" 
            placeholder="Full Name"
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Linking...' : 'Register Device'}
        </button>
      </form>
    </div>
  );
};

export default RegisterDevice;