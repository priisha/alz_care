export interface LocationData {
    id?: number;
    patient_id?: string;
    lat: number;
    lng: number;
    address?: string;
    recorded_at?: string;
}

export interface Patient {
    id: string;
    name: string;
    status: 'Safe' | 'Wandering' | 'Fall Detected' | 'Offline';
    device_status: 'Online' | 'Offline' | 'Low Battery';
    last_updated: string;
    // 'location' is now fetched separately or joined
    latest_location?: LocationData;
    active_alerts_count?: number;
}

export interface Alert {
    id: number;
    patient_id: string;
    type: string;
    severity: 'Low' | 'Medium' | 'High';
    status: 'Active' | 'Acknowledged' | 'Resolved';
    created_at: string;
    resolved_at?: string;
}

export interface HistoryItem {
    location: string;
    time: string;
    date: string;
    coords: string;
}