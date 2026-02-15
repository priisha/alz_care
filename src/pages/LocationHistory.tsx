import React from 'react';
import { MapPin } from 'lucide-react';


import { patientService } from '../services/patientService';
import type { LocationData } from '../types';
import { format } from 'date-fns';

const LocationHistory: React.FC = () => {
  const [history, setHistory] = React.useState<LocationData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await patientService.getLocationHistory('P001');
        setHistory(data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-8 bg-secondary min-h-screen flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Location History</h2>
            <p className="text-sm text-gray-500">View Chandreshwor's past locations timeline</p>
        </div>

        {loading ? (
            <div className="text-center py-10">Loading history...</div>
        ) : history.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No location history found.</div>
        ) : (
        <div className="relative border-l-2 border-blue-200 ml-4 space-y-8">
            {history.map((item, index) => (
                <div key={item.id || index} className="ml-6 relative">
                    <span className="absolute -left-[33px] top-6 h-4 w-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></span>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-start gap-3">
                            <MapPin className="text-blue-500 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-gray-800">{item.address || 'Unknown Location'}</h4>
                                <p className="text-xs text-gray-500 font-mono mt-1">{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {item.recorded_at 
                                      ? format(new Date(item.recorded_at), 'MMM d, yyyy, h:mm a') 
                                      : 'Unknown Time'}
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