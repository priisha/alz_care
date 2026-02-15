import { supabase } from '../supabase';
import type { Patient } from '../types';

export interface PatientRepository {
    getPatient(id: string): Promise<Patient | null>;
    subscribeToPatient(
        id: string,
        onUpdate: (patient: Patient) => void,
        onAlert?: (alert: import('../types').Alert) => void
    ): () => void;
    getLocationHistory(patientId: string): Promise<import('../types').LocationData[]>;
    getAlerts(patientId: string): Promise<import('../types').Alert[]>;
    updateAlertStatus(id: number, status: 'Active' | 'Acknowledged' | 'Resolved'): Promise<void>;
}

export class SupabasePatientRepository implements PatientRepository {
    async getPatient(id: string): Promise<Patient | null> {
        const { data: patient, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !patient) {
            console.error('Error fetching patient:', error);
            return null;
        }

        // Fetch latest location
        const { data: locations } = await supabase
            .from('locations')
            .select('*')
            .eq('patient_id', id)
            .order('recorded_at', { ascending: false })
            .limit(1);

        // Fetch active alerts count
        const { count } = await supabase
            .from('alerts')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', id)
            .eq('status', 'Active');

        return {
            ...patient,
            latest_location: locations?.[0] || undefined,
            active_alerts_count: count || 0,
        } as Patient;
    }

    // Note: Subscription logic is tricky with multiple tables. 
    // For simplicity, we'll just listen to patient updates for now 
    // and trigger a full re-fetch or assume partial updates.
    // Ideally, we'd listen to 'alerts' and 'locations' too.
    subscribeToPatient(
        id: string,
        onUpdate: (patient: Patient) => void,
        onAlert?: (alert: import('../types').Alert) => void
    ): () => void {
        // Helper to refresh full state
        const refresh = async () => {
            const p = await this.getPatient(id);
            if (p) onUpdate(p);
        };

        const uniqueChannelId = `patient-full-${id}-${Math.random().toString(36).substring(7)}`;
        const channel = supabase.channel(uniqueChannelId)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'patients', filter: `id=eq.${id}` },
                () => refresh()
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'locations', filter: `patient_id=eq.${id}` },
                () => refresh()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'alerts', filter: `patient_id=eq.${id}` },
                (payload) => {
                    refresh();
                    // Only trigger toast for new alerts
                    if (onAlert && payload.eventType === 'INSERT' && payload.new) {
                        onAlert(payload.new as import('../types').Alert);
                    }
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }

    async getLocationHistory(patientId: string): Promise<import('../types').LocationData[]> {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('patient_id', patientId)
            .order('recorded_at', { ascending: false });

        if (error) {
            console.error('Error fetching location history:', error);
            return [];
        }

        return data as import('../types').LocationData[];
    }

    async getAlerts(patientId: string): Promise<import('../types').Alert[]> {
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching alerts:', error);
            return [];
        }

        return data as import('../types').Alert[];
    }

    async updateAlertStatus(id: number, status: 'Active' | 'Acknowledged' | 'Resolved'): Promise<void> {
        const updates: any = { status };

        if (status === 'Resolved') {
            updates.resolved_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('alerts')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating alert status:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const patientService = new SupabasePatientRepository();
