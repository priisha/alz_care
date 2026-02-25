import React, { useEffect, useState } from 'react';
import { patientService } from '../services/patientService';
import { CheckCircle, AlertTriangle, Activity, MapPin, Clock } from 'lucide-react';
import type { Patient } from '../types';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        const patient = await patientService.getPatient('P001');
        if (patient) {
          setData(patient);
        }
      } catch (error) {
        console.error("Failed to fetch patient data", error);
      } finally {
        setLoading(false);
      }
    };

    init();

    const unsubscribe = patientService.subscribeToPatient('P001', (updatedPatient) => {
      setData(updatedPatient);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;
  if (!data) return <div className="p-10 text-center">No Data Available</div>;

  return (
    <div className="p-8 bg-secondary min-h-screen">
      <h2 className="text-2xl font-bold mb-1 text-gray-800">Dashboard</h2>
      <p className="text-gray-500 mb-6">Monitor {data.name.split(' ')[0]}’s location and safety in real time</p>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">Patient Status</p>
            <h3 className={`text-2xl font-bold ${data.status === 'Safe' ? 'text-green-600' : 'text-red-600'}`}>{data.status}</h3>
          </div>
          <div className={`p-3 rounded-full ${data.status === 'Safe' ? 'bg-green-100' : 'bg-red-100'}`}>
            {data.status === 'Safe' ? <CheckCircle className="text-green-600" /> : <AlertTriangle className="text-red-600" />}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">Active Alerts</p>
            <h3 className="text-2xl font-bold text-gray-800">{data.active_alerts_count || 0}</h3>
          </div>
          <div className="p-3 rounded-full bg-red-50">
            <AlertTriangle className="text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">Device Status</p>
            <h3 className="text-2xl font-bold text-gray-800">{data.device_status}</h3>
          </div>
          <div className="p-3 rounded-full bg-blue-50">
            <Activity className="text-blue-500" />
          </div>
        </div>
      </div>

      {/* Patient Information Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700">Patient Information</h3>
        </div>
        <div className="p-6 relative">
          <span className="absolute top-6 right-6 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full uppercase">
            {data.status}
          </span>
          
          <h2 className="text-xl font-bold text-gray-800">{data.name}</h2>
          <p className="text-sm text-gray-500 mb-6">Patient ID: {data.id}</p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="text-xs text-gray-400">Current Location</p>
                <p className="text-gray-700 font-medium">{data.latest_location?.address || 'Unknown Address'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="text-xs text-gray-400">Last Updated</p>
                <p className="text-gray-700 font-medium">{data.last_updated}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;