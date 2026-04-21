import React, { useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const AlertListener: React.FC = () => {
  useEffect(() => {
    const channel = supabase
      .channel('realtime-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, 
      (payload) => {
        const { type, severity, lat, lng } = payload.new;
        
        toast.error(`${type} Detected!`, {
          duration: 6000,
          position: 'top-right',
          style: { border: '2px solid #ef4444', padding: '16px', fontWeight: 'bold' }
        });

        // Auto-play alert sound
        new Audio('/alert-sound.mp3').play().catch(() => {});
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return null;
};

export default AlertListener;