import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { patientService } from '../services/patientService';
import { supabase } from '../supabase';import type { LocationData } from '../types';
import { format } from 'date-fns';

const LocationHistory: React.FC = () => {
  const [history, setHistory] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    const setupRealtimeHistory = async () => {
      try {
        // 1. Get logged-in caregiver ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Find the patient linked to this caregiver
        const { data: link } = await supabase
          .from('caregiver_patients')
          .select('patient_id')
          .eq('caregiver_id', user.id)
          .single();

        if (link) {
          setPatientId(link.patient_id);
          // 3. Initial fetch for this specific patient
          const data = await patientService.getLocationHistory(link.patient_id);
          setHistory(data);

          // 4. Real-time subscription for new locations
          const channel = supabase
            .channel('realtime-history')
            .on('postgres_changes', 
              { event: 'INSERT', schema: 'public', table: 'locations', filter: `patient_id=eq.${link.patient_id}` }, 
              (payload) => {
                setHistory(prev => [payload.new as LocationData, ...prev]);
              }
            )
            .subscribe();

          return () => { supabase.removeChannel(channel); };
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };

    setupRealtimeHistory();
  }, []);

  return (
    <div className="p-8 bg-secondary min-h-screen flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Location History</h2>
          <p className="text-sm text-gray-500">View real-time movement timeline</p>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading history...</div>
        ) : !patientId ? (
          <div className="text-center py-10 text-gray-500">No device registered to your account.</div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No location data received yet.</div>
        ) : (
          <div className="relative border-l-2 border-blue-200 ml-4 space-y-8">
            {history.map((item, index) => (
              <div key={item.id || index} className="ml-6 relative">
                <span className="absolute -left-[33px] top-6 h-4 w-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></span>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-blue-500 mt-1" size={18} />
                    <div>
                      <h4 className="font-bold text-gray-800">{item.address || 'GPS Update'}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-1">{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {item.recorded_at ? format(new Date(item.recorded_at), 'MMM d, yyyy, h:mm a') : 'Just now'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationHistory;