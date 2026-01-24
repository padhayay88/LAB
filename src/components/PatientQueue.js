import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PatientQueue.css';

const PatientQueue = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatientQueue();
    }, []);

    const fetchPatientQueue = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/patients/enriched`);
            // Sort by evening number for queue order
            const sortedPatients = response.data.sort((a, b) => a.eveningNumber - b.eveningNumber);
            setPatients(sortedPatients);
        } catch (error) {
            console.error('Error fetching patient queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = (patientId, newStatus) => {
        setPatients(patients.map(patient => 
            patient._id === patientId 
                ? { ...patient, queueStatus: newStatus }
                : patient
        ));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Waiting': return 'status-waiting';
            case 'Sample Collected': return 'status-collected';
            case 'In Progress': return 'status-progress';
            case 'Completed': return 'status-completed';
            default: return 'status-waiting';
        }
    };

    if (loading) {
        return (
            <div className="patient-queue-page">
                <div className="loading-spinner">
                    <p>Loading patient queue...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-queue-page">
            <div className="queue-header">
                <h1>Patient Queue (Today)</h1>
                <div className="queue-stats">
                    <div className="stat-card">
                        <span className="stat-number">{patients.length}</span>
                        <span className="stat-label">Total Patients</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{patients.filter(p => p.queueStatus === 'Waiting').length}</span>
                        <span className="stat-label">Waiting</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{patients.filter(p => p.queueStatus === 'Completed').length}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
            </div>

            <div className="queue-container">
                <div className="queue-table-wrapper">
                    <table className="queue-table">
                        <thead>
                            <tr>
                                <th>Token</th>
                                <th>Patient Name</th>
                                <th>Phone</th>
                                <th>Test</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((patient) => (
                                <tr key={patient._id} className="queue-row">
                                    <td className="token-cell">
                                        <span className="token-number">{patient.eveningNumber}</span>
                                    </td>
                                    <td className="patient-name-cell">
                                        <div className="patient-info">
                                            <span className="name">{patient.name}</span>
                                            <span className="id">ID: {patient.patientId}</span>
                                        </div>
                                    </td>
                                    <td className="phone-cell">{patient.phone}</td>
                                    <td className="test-cell">
                                        <span className="test-count">{patient.totalTests} Tests</span>
                                    </td>
                                    <td className="status-cell">
                                        <span className={`status-badge ${getStatusColor(patient.queueStatus || 'Waiting')}`}>
                                            {patient.queueStatus || 'Waiting'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            {(!patient.queueStatus || patient.queueStatus === 'Waiting') && (
                                                <button 
                                                    className="action-btn collect-btn"
                                                    onClick={() => handleStatusUpdate(patient._id, 'Sample Collected')}
                                                >
                                                    Collect Sample
                                                </button>
                                            )}
                                            {patient.queueStatus === 'Sample Collected' && (
                                                <button 
                                                    className="action-btn progress-btn"
                                                    onClick={() => handleStatusUpdate(patient._id, 'In Progress')}
                                                >
                                                    Start Testing
                                                </button>
                                            )}
                                            {patient.queueStatus === 'In Progress' && (
                                                <button 
                                                    className="action-btn complete-btn"
                                                    onClick={() => handleStatusUpdate(patient._id, 'Completed')}
                                                >
                                                    Complete
                                                </button>
                                            )}
                                            <button 
                                                className="action-btn view-btn"
                                                onClick={() => window.location.href = `/patient/${patient.patientId}`}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PatientQueue;
