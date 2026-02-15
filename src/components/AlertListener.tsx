import React, { useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { patientService } from '../services/patientService';

const AlertListener: React.FC = () => {
    const { showToast } = useToast();

    useEffect(() => {
        // Subscribe globally to 'P001' (this could be dynamic based on login)
        const unsubscribe = patientService.subscribeToPatient(
            'P001',
            () => { /* we might not care about generic updates here, handled in pages */ },
            (newAlert) => {
                // Using 'error' type to make it Red as requested
                showToast(`${newAlert.type}: ${newAlert.severity} Severity`, 'error');
            }
        );

        return () => {
            unsubscribe();
        };
    }, [showToast]);

    return null;
};

export default AlertListener;
