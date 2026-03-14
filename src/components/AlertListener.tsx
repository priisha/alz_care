import React, { useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { patientService } from '../services/patientService';

const AlertListener: React.FC = () => {
    const { showToast } = useToast();

    useEffect(() => {
        const unsubscribe = patientService.subscribeToPatient(
            'P001',
            () => { },
            (newAlert) => {
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
