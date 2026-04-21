import React, { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const supabase = createClient(
  'https://innjqpuucklkbqwfbptu.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlubmpxcHV1Y2tsa2Jxd2ZicHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMzkzNDAsImV4cCI6MjA4NjcxNTM0MH0.f-hl3R6OO3PF3VejSg8o7r2nsJli-c17SxSjbvAWLrc'
);

const AlertListener: React.FC = () => {
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          const { type, severity, lat, lng } = payload.new;

          // Trigger a global popup notification
          toast.error(`🚨 ${type}!`, {
            duration: 8000,
            position: 'top-right',
            style: {
              background: '#b91c1c',
              color: '#fff',
              padding: '16px',
              fontWeight: 'bold',
            },
          });

          // Play an alarm sound
          const audio = new Audio('/alert.mp3');
          audio.play().catch(() => console.log("Audio requires user interaction first."));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null; // This component has no UI, it just listens
};

export default AlertListener;