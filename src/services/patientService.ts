import { supabase } from '../supabase'; 
import type { Patient, LocationData, Alert } from '../types';

// RE-EXPORT supabase so other components (like RegisterDevice) can use the same instance
export { supabase };

export interface PatientRepository {
    getPatient(id: string): Promise<Patient | null>;
    subscribeToPatient(
        id: string,
        onUpdate: (patient: Patient) => void,
        onAlert?: (alert: Alert) => void
    ): () => void;
    getLocationHistory(patientId: string): Promise<LocationData[]>;
    getAlerts(patientId: string): Promise<Alert[]>;
    updateAlertStatus(id: number, status: 'Active' | 'Acknowledged' | 'Resolved'): Promise<void>;
}

export class SupabasePatientRepository implements PatientRepository {
    // 1. Fetch patient details, latest location, and alert count
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

        // Fetch latest location from locations table
        const { data: locations } = await supabase
            .from('locations')
            .select('*')
            .eq('patient_id', id)
            .order('recorded_at', { ascending: false })
            .limit(1);

        // Fetch active alerts count from alerts table
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

    // 2. Real-time subscription for Patients, Locations, and Alerts
    subscribeToPatient(
        id: string,
        onUpdate: (patient: Patient) => void,
        onAlert?: (alert: Alert) => void
    ): () => void {
        const refresh = async () => {
            const p = await this.getPatient(id);
            if (p) onUpdate(p);
        };

        const channel = supabase.channel(`patient-monitor-${id}`)
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
                { event: 'INSERT', schema: 'public', table: 'alerts', filter: `patient_id=eq.${id}` },
                (payload) => {
                    refresh();
                    if (onAlert) onAlert(payload.new as Alert);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }

    // 3. Get history for breadcrumb mapping
    async getLocationHistory(patientId: string): Promise<LocationData[]> {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('patient_id', patientId)
            .order('recorded_at', { ascending: false });

        return error ? [] : (data as LocationData[]);
    }

    // 4. Get all alerts for the logs
    async getAlerts(patientId: string): Promise<Alert[]> {
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        return error ? [] : (data as Alert[]);
    }

    // 5. Update alert status (e.g., Resolving a fall)
    async updateAlertStatus(id: number, status: 'Active' | 'Acknowledged' | 'Resolved'): Promise<void> {
        const updates: any = { status };
        if (status === 'Resolved') updates.resolved_at = new Date().toISOString();

        const { error } = await supabase
            .from('alerts')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
    }
}

// Export the singleton instance to be used across the app
export const patientService = new SupabasePatientRepository();