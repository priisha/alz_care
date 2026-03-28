import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { patientService } from '../services/patientService';
import { supabase } from '../supabase';
import L from 'leaflet';
import type { Patient } from '../types';

// --- Leaflet Icon Fix ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Helper Component: Moves map camera when coordinates change ---
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const startTracking = async () => {
      try {
        // 1. Get Logged-in Caregiver
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // 2. Find linked Patient MAC Address
        const { data: link, error: linkErr } = await supabase
          .from('caregiver_patients')
          .select('patient_id')
          .eq('caregiver_id', user.id)
          .single();

        if (linkErr || !link) {
          setErrorMsg("No device linked. Please register your wearable on the Dashboard.");
          setLoading(false);
          return;
        }

        const deviceId = link.patient_id;

        // 3. Fetch Initial Data via your Repository
        const initialData = await patientService.getPatient(deviceId);
        if (initialData) {
          setPatient(initialData);
          if (initialData.latest_location) {
            setCoords([initialData.latest_location.lat, initialData.latest_location.lng]);
          }
        }

        // 4. Subscribe to Live Updates
        unsubscribe = patientService.subscribeToPatient(
          deviceId,
          (updatedPatient) => {
            setPatient(updatedPatient);
            if (updatedPatient.latest_location) {
              setCoords([updatedPatient.latest_location.lat, updatedPatient.latest_location.lng]);
            }
          },
          (newAlert) => {
            console.log("Emergency Alert Received!", newAlert);
            // If you have a toast system, trigger it here
          }
        );

      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    startTracking();

    // Clean up subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // --- UI States ---
  if (loading) return <div className="flex h-screen items-center justify-center font-bold">Connecting to Wearable...</div>;
  
  if (errorMsg) return (
    <div className="p-10 text-center">
      <p className="text-red-500 font-bold">{errorMsg}</p>
    </div>
  );

  if (!patient || !coords) return (
    <div className="p-10 text-center">
      <p className="text-gray-500">Device linked, but no GPS data received yet. Ensure your ESP32 is powered on.</p>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-grow relative z-0">
        <MapContainer center={coords} zoom={16} style={{ height: '100%', width: '100%' }}>
          <MapUpdater center={coords} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <Marker position={coords}>
            <Popup>
              <div className="font-sans">
                <p className="font-bold">{patient.name}</p>
                <p className="text-xs">Status: {patient.status}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
        
        {/* Floating Patient Info Card */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-white p-5 rounded-2xl shadow-2xl border border-gray-100 w-72">
           <div className="flex items-center gap-2 mb-2">
             <div className={`h-3 w-3 rounded-full animate-pulse ${patient.status === 'Safe' ? 'bg-green-500' : 'bg-red-500'}`}></div>
             <p className={`text-xs font-black uppercase tracking-widest ${patient.status === 'Safe' ? 'text-green-600' : 'text-red-600'}`}>
               {patient.status === 'Safe' ? 'Monitoring Live' : 'Emergency Detected'}
             </p>
           </div>
           
           <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
           <p className="text-sm text-gray-500 mb-3">{patient.id}</p>
           
           <div className="flex justify-between items-center py-2 border-t border-gray-100">
             <div>
               <p className="text-[10px] text-gray-400 uppercase">Latitude</p>
               <p className="text-sm font-mono text-gray-700">{coords[0].toFixed(6)}</p>
             </div>
             <div className="text-right">
               <p className="text-[10px] text-gray-400 uppercase">Longitude</p>
               <p className="text-sm font-mono text-gray-700">{coords[1].toFixed(6)}</p>
             </div>
           </div>
           
           <div className="mt-2 text-[10px] text-gray-400 italic">
             Last synced: {new Date().toLocaleTimeString()}
           </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTracking;