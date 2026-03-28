import React, { useState, useEffect } from 'react';
import { patientService } from '../services/patientService';
import { supabase } from '../supabase';import type { LocationData } from '../types';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import type { Alert } from '../types';

const Alerts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Active' | 'Acknowledged' | 'Resolved'>('Active');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);

  const fetchAlerts = async (id: string) => {
    const data = await patientService.getAlerts(id);
    setAlerts(data);
    setLoading(false);
  };

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const setupAlerts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: link } = await supabase
        .from('caregiver_patients')
        .select('patient_id')
        .eq('caregiver_id', user.id)
        .single();

      if (link) {
        setPatientId(link.patient_id);
        await fetchAlerts(link.patient_id);

        // Subscribe to all changes for this patient
        unsubscribe = patientService.subscribeToPatient(
          link.patient_id,
          () => fetchAlerts(link.patient_id), // Refresh on any patient status change
          (newAlert) => {
            // Optional: Show a browser notification or toast here for a new alert
            fetchAlerts(link.patient_id);
          }
        );
      } else {
        setLoading(false);
      }
    };

    setupAlerts();
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-8 bg-secondary min-h-screen">
      <h2 className="text-2xl font-bold mb-1">Fall Detection & Alerts</h2>
      <p className="text-gray-500 mb-6">Monitor and manage patient emergencies</p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden min-h-[500px]">
        <div className="flex border-b border-gray-200">
          {(['Active', 'Acknowledged', 'Resolved'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab} {tab === 'Active' && alerts.filter(a => a.status === 'Active').length > 0 && 
                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {alerts.filter(a => a.status === 'Active').length}
                </span>
              }
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-10">Searching for alerts...</div>
          ) : !patientId ? (
            <div className="text-center py-10 text-gray-500">Register a device to receive alerts.</div>
          ) : (
            <div className="space-y-4">
              {alerts.filter(a => a.status === activeTab).map(alert => (
                <div key={alert.id} className="border border-gray-200 rounded-lg p-6 flex justify-between items-start bg-white shadow-sm hover:border-blue-200 transition">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-full h-fit ${alert.status === 'Resolved' ? 'bg-green-50' : 'bg-red-50'}`}>
                      {alert.status === 'Resolved' ? <CheckCircle className="text-green-500" /> : <AlertTriangle className="text-red-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800 text-lg">{alert.type}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${alert.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">Ref ID: {alert.id}</p>
                      
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} /> 
                        {alert.status === 'Resolved' && alert.resolved_at 
                          ? `Resolved: ${new Date(alert.resolved_at).toLocaleString()}` 
                          : `Detected: ${new Date(alert.created_at).toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {alert.status === 'Active' && (
                      <button 
                        onClick={() => patientService.updateAlertStatus(alert.id, 'Acknowledged')}
                        className="text-xs bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 font-bold"
                      >
                        Acknowledge
                      </button>
                    )}
                    {(alert.status === 'Active' || alert.status === 'Acknowledged') && (
                      <button 
                        onClick={() => patientService.updateAlertStatus(alert.id, 'Resolved')}
                        className="text-xs border border-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-50 font-medium"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {alerts.filter(a => a.status === activeTab).length === 0 && (
                <div className="text-center text-gray-400 py-10">
                  No {activeTab.toLowerCase()} alerts in logs.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;