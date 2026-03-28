import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { patientService } from '../services/patientService';
import { createClient } from '@supabase/supabase-js'; // Import Supabase
import L from 'leaflet';
import type { Patient } from '../types';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Initialize Supabase 
const supabase = createClient('https://innjqpuucklkbqwfbptu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubmpxcHV1Y2tsa2Jxd2ZicHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMzkzNDAsImV4cCI6MjA4NjcxNTM0MH0.f-hl3R6OO3PF3VejSg8o7r2nsJli-c17SxSjbvAWLrc');

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const RealTimeTracking: React.FC = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initTracking = async () => {
      // 1. Get the Logged-in Caregiver's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Find which Patient is linked to this Caregiver
      const { data: linkData, error: linkError } = await supabase
        .from('caregiver_patients')
        .select('patient_id')
        .eq('caregiver_id', user.id)
        .single();

      if (linkError || !linkData) {
        console.error("No linked patient found for this caregiver");
        setLoading(false);
        return;
      }

      const linkedId = linkData.patient_id;

      // 3. Fetch Initial Patient Data using the Dynamic ID
      try {
        const data = await patientService.getPatient(linkedId);
        if (data) {
          setPatient(data);
          if (data.latest_location?.lat && data.latest_location?.lng) {
             setCoords([data.latest_location.lat, data.latest_location.lng]); 
          }
        }
      } catch (error) {
        console.error("Error loading patient", error);
      } finally {
        setLoading(false);
      }

      // 4. Subscribe to Real-time Updates for the Dynamic ID
      const unsubscribe = patientService.subscribeToPatient(linkedId, (updated) => {
        setPatient(updated);
        if (updated.latest_location?.lat && updated.latest_location?.lng) {
          setCoords([updated.latest_location.lat, updated.latest_location.lng]);
        }
      });

      return unsubscribe;
    };

    let unsubFunction: any;
    initTracking().then(unsub => unsubFunction = unsub);

    return () => {
      if (unsubFunction) unsubFunction();
    };
  }, []);
  
  if (loading) return <div className="p-10">Searching for linked device...</div>;
  if (!patient || !coords) return <div className="p-10">No live data available for this device yet.</div>;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="flex-grow relative z-0">
        <MapContainer center={coords} zoom={15} style={{ height: '100%', width: '100%' }}>
          <MapUpdater center={coords} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <Marker position={coords}>
            <Popup>{patient.name} <br/> {patient.status}</Popup>
          </Marker>
        </MapContainer>
        
        {/* Floating Card */}
        <div className="absolute bottom-6 left-6 z-[400] bg-white p-4 rounded-lg shadow-lg max-w-sm">
           <div className="flex items-center gap-2 mb-1">
             <div className={`h-2 w-2 rounded-full animate-pulse ${patient.status === 'Fall Detected' ? 'bg-red-600' : 'bg-green-600'}`}></div>
             <p className="text-xs font-bold text-gray-800 uppercase">
               {patient.status === 'Fall Detected' ? 'EMERGENCY DETECTED' : 'Live Tracking'}
             </p>
           </div>
           <p className="font-bold text-gray-800">{patient.name}</p>
           <p className="text-xs text-gray-500 mt-1">
             {coords[0].toFixed(6)}, {coords[1].toFixed(6)}
           </p>
           <p className="text-[10px] text-gray-400 mt-2 italic">Device: {patient.id}</p>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTracking;