import React, { useState, useEffect } from 'react';
import { patientService } from '../services/patientService';
import { AlertTriangle, Clock } from 'lucide-react';
import type { Alert } from '../types';

const Alerts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Active' | 'Acknowledged' | 'Resolved'>('Resolved');

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await patientService.getAlerts('P001');
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();

    // Realtime subscription
    const unsubscribe = patientService.subscribeToPatient(
      'P001',
      () => {
        // Refresh alerts list on any change (including status updates)
        fetchAlerts();
      },
      () => {
        // ideally we just rely on fetchAlerts() above, but for instant feedback on NEW alerts:
        // However, fetchAlerts() will also be called. 
        // Let's stick to just fetchAlerts() for simplicity and consistency, 
        // or keep this for optimistic UI but remove the duplicate append if fetchAlerts happens.
        // Actually, since we changed the service to fire generic updates for ALL alert changes,
        // relying on fetchAlerts() (arg 1) is safer than manual state manipulation here.
        // So we can remove this specific onAlert logic if we want, OR keep it for the toast (Toast is handled in App.tsx).
        // Let's just use fetchAlerts() for the list.
      }
    );


    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="p-8 bg-secondary min-h-screen">
       <h2 className="text-2xl font-bold mb-1">Fall Detection & Alerts</h2>
       <p className="text-gray-500 mb-6">Manage and respond to patient alerts</p>

       <div className="bg-white rounded-lg shadow-md overflow-hidden min-h-[500px]">
          <div className="flex border-b border-gray-200">
            {(['Active', 'Acknowledged', 'Resolved'] as const).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {tab}
                </button>
            ))}
          </div>

          <div className="p-6">
             {loading ? (
                <div className="text-center py-10">Loading alerts...</div>
             ) : (
                <>
                 {alerts.filter(a => a.status === activeTab).map(alert => (
                 <div key={alert.id} className="border border-gray-200 rounded-lg p-6 flex justify-between items-start bg-white shadow-sm">
                    <div className="flex gap-4">
                        <div className="p-3 bg-red-50 rounded-full h-fit">
                            <AlertTriangle className="text-red-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800 text-lg">{alert.type}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${alert.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {alert.severity}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mb-4">Patient ID: {alert.patient_id}</p>
                            
                            <div className="space-y-2">
                                {/* Location removed from Alert type, hiding for now */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock size={16} /> {(alert.status === 'Resolved' && alert.resolved_at) ? new Date(alert.resolved_at).toLocaleString() : new Date(alert.created_at).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-center ${
                            alert.status === 'Active' ? 'bg-red-100 text-red-700' :
                            alert.status === 'Acknowledged' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                            {alert.status}
                        </span>
                        
                        {alert.status === 'Active' && (
                            <button 
                                onClick={async () => {
                                    try {
                                        console.log('Acknowledging alert:', alert.id);
                                        await patientService.updateAlertStatus(alert.id, 'Acknowledged');
                                    } catch (e) {
                                        console.error('Failed to acknowledge:', e);
                                        window.alert('Failed to acknowledge alert');
                                    }
                                }}
                                className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-medium"
                            >
                                Acknowledge
                            </button>
                        )}
                        
                        {(alert.status === 'Active' || alert.status === 'Acknowledged') && (
                            <button 
                                onClick={async () => {
                                    try {
                                        console.log('Resolving alert:', alert.id);
                                        await patientService.updateAlertStatus(alert.id, 'Resolved');
                                    } catch (e) {
                                        console.error('Failed to resolve:', e);
                                        window.alert('Failed to resolve alert');
                                    }
                                }}
                                className="text-xs border border-gray-200 text-gray-600 px-3 py-1 rounded hover:bg-gray-50 font-medium"
                            >
                                Resolve
                            </button>
                        )}
                    </div>
                 </div>
             ))}

             {alerts.filter(a => a.status === activeTab).length === 0 && (
                 <div className="text-center text-gray-400 py-10">
                     No {activeTab.toLowerCase()} alerts found.
                 </div>
             )}

                </>
             )}
          </div>
       </div>
    </div>
  );
};

export default Alerts;