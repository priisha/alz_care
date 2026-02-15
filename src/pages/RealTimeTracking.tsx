import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { patientService } from '../services/patientService';
import L from 'leaflet';
import type { Patient } from '../types';

// Leaflet Icon Fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to auto-pan
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

  useEffect(() => {
    const init = async () => {
      try {
        const data = await patientService.getPatient('P001');
        if (data) {
          setPatient(data);
          if (data.latest_location?.lat && data.latest_location?.lng) {
             setCoords([data.latest_location.lat, data.latest_location.lng]); 
          }
        }
      } catch (error) {
        console.error("Error loading patient", error);
      }
    };

    init();

    const unsubscribe = patientService.subscribeToPatient('P001', (updated) => {
      setPatient(updated);
      if (updated.latest_location?.lat && updated.latest_location?.lng) {
        setCoords([updated.latest_location.lat, updated.latest_location.lng]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
  
  if (!patient || !coords) return <div className="p-10">Loading Realtime Data...</div>;

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
            <Popup>{patient.name}</Popup>
          </Marker>
        </MapContainer>
        
        {/* Floating Card */}
        <div className="absolute bottom-6 left-6 z-[400] bg-white p-4 rounded-lg shadow-lg max-w-sm">
           <div className="flex items-center gap-2 mb-1">
             <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
             <p className="text-xs font-bold text-blue-800 uppercase">Live Tracking</p>
           </div>
           <p className="font-bold text-gray-800">Kathmandu, Nepal</p>
           <p className="text-xs text-gray-500 mt-1">
             {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
           </p>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTracking;