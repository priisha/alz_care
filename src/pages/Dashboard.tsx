import React, { useEffect, useState } from 'react';
import { patientService } from '../services/patientService';
import { supabase } from '../supabase';
import { CheckCircle, AlertTriangle, Activity, MapPin, Clock, PlusCircle, Bell } from 'lucide-react';
import type { Patient } from '../types';
import RegisterDevice from '../components/RegisterDevice';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasDevice, setHasDevice] = useState<boolean>(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initDashboard = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: link, error } = await supabase
          .from('caregiver_patients')
          .select('patient_id')
          .eq('caregiver_id', user.id)
          .single();

        if (error || !link) {
          setHasDevice(false);
          setLoading(false);
          return;
        }

        setHasDevice(true);
        const deviceId = link.patient_id;

        const patient = await patientService.getPatient(deviceId);
        if (patient) {
          setData(patient);
        }

        unsubscribe = patientService.subscribeToPatient(deviceId, (updatedPatient) => {
          setData(updatedPatient);
        });

      } catch (error) {
        console.error("Dashboard Init Error:", error);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasDevice) {
    return (
      <div className="p-8 bg-secondary min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <PlusCircle className="mx-auto text-blue-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-800">No Device Linked</h2>
            <p className="text-gray-500">Please enter your wearable's MAC address to start monitoring.</p>
          </div>
          <RegisterDevice />
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-10 text-center text-gray-500 italic">Device linked, but waiting for first data sync...</div>;

  return (
    <div className="p-8 bg-secondary min-h-screen">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-500">Monitor {data.name.split(' ')[0]}’s safety in real time</p>
        </div>
        <div className="text-right text-xs text-gray-400">
           Device ID: <span className="font-mono font-bold text-gray-500">{data.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Patient Status Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition-transform hover:scale-[1.02]">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Patient Status</p>
            <h3 className={`text-2xl font-black ${data.status === 'Safe' ? 'text-green-600' : 'text-red-600'}`}>
              {data.status}
            </h3>
          </div>
          <div className={`p-3 rounded-full ${data.status === 'Safe' ? 'bg-green-100' : 'bg-red-100'}`}>
            {data.status === 'Safe' ? <CheckCircle className="text-green-600" /> : <AlertTriangle className="text-red-600" />}
          </div>
        </div>

        {/* Active Alerts Card - FIXED SECTION */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition-transform hover:scale-[1.02]">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Alerts</p>
            <h3 className={`text-2xl font-black ${(data.active_alerts_count ?? 0) > 0 ? 'text-red-600' : 'text-gray-800'}`}>
              {data.active_alerts_count || 0}
            </h3>
          </div>
          <div className={`p-3 rounded-full ${(data.active_alerts_count ?? 0) > 0 ? 'bg-red-100 animate-pulse' : 'bg-gray-100'}`}>
            <Bell size={20} className={(data.active_alerts_count ?? 0) > 0 ? 'text-red-600' : 'text-gray-400'} />
          </div>
        </div>

        {/* Device Connectivity Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition-transform hover:scale-[1.02]">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Device Connectivity</p>
            <h3 className="text-2xl font-black text-blue-600">{data.device_status || 'Online'}</h3>
          </div>
          <div className="p-3 rounded-full bg-blue-100">
            <Activity className="text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile/Detailed Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Detailed Information</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${data.status === 'Safe' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {data.status}
            </span>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {data.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{data.name}</h2>
                <p className="text-xs text-gray-400">Device MAC: {data.id}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg"><MapPin className="text-blue-600" size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Current Location</p>
                  <p className="text-gray-700 text-sm font-medium">{data.latest_location?.address || 'Searching for GPS...'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg"><Clock className="text-blue-600" size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Last Data Received</p>
                  <p className="text-gray-700 text-sm font-medium">
                    {data.last_updated ? new Date(data.last_updated).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form to change device remains accessible */}
        <div className="hidden lg:block">
          <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300">
             <p className="text-sm font-semibold text-gray-500 mb-4">Switch or Register New Device</p>
             <RegisterDevice />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;