import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PatientQueue.css';

const PatientQueue = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState('All');

    // Realistic departments for filtering
    const departments = ['All', 'General', 'Blood Test', 'X-Ray', 'Ultrasound', 'Pathology', 'ECG'];

    useEffect(() => {
        fetchPatientQueue();
        
        // Update time every second
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Auto-refresh queue every 30 seconds
        let queueInterval;
        if (autoRefresh) {
            queueInterval = setInterval(() => {
                fetchPatientQueue();
            }, 30000);
        }

        return () => {
            clearInterval(timeInterval);
            if (queueInterval) clearInterval(queueInterval);
        };
    }, [autoRefresh]);

    const fetchPatientQueue = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/patients/enriched`);
            
            // Get today's patients only
            const today = new Date().toDateString();
            const todayPatients = response.data.filter(patient => {
                const patientDate = new Date(patient.registrationDate || patient.createdAt).toDateString();
                return patientDate === today;
            });

            // Sort by evening number for queue order
            const sortedPatients = todayPatients.sort((a, b) => a.eveningNumber - b.eveningNumber);
            
            // Enrich with test information
            const enrichedPatients = await Promise.all(sortedPatients.map(async (patient) => {
                try {
                    const testsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/tests`);
                    const patientTests = testsResponse.data.filter(test => test.patientId === patient._id);
                    
                    return {
                        ...patient,
                        tests: patientTests,
                        primaryTest: patientTests.length > 0 ? patientTests[0].testName : 'General',
                        totalTests: patientTests.length,
                        queueStatus: patient.queueStatus || determineQueueStatus(patientTests),
                        estimatedWaitTime: calculateWaitTime(patient.eveningNumber, sortedPatients),
                        priority: determinePriority(patient)
                    };
                } catch (error) {
                    return {
                        ...patient,
                        tests: [],
                        primaryTest: 'General',
                        totalTests: 0,
                        queueStatus: patient.queueStatus || 'Waiting',
                        estimatedWaitTime: 15,
                        priority: 'Normal'
                    };
                }
            }));

            setPatients(enrichedPatients);
        } catch (error) {
            console.error('Error fetching patient queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const determineQueueStatus = (tests) => {
        if (tests.length === 0) return 'Waiting';
        
        const statuses = tests.map(test => test.status);
        if (statuses.every(status => status === 'Waiting')) return 'Waiting';
        if (statuses.every(status => status === 'Completed')) return 'Completed';
        if (statuses.some(status => status === 'In Progress')) return 'In Progress';
        if (statuses.some(status => status === 'Sample Collected')) return 'Sample Collected';
        
        return 'Waiting';
    };

    const calculateWaitTime = (tokenNumber, allPatients) => {
        const avgTimePerPatient = 15; // minutes
        const patientsAhead = allPatients.filter(p => p.eveningNumber < tokenNumber && 
            (p.queueStatus === 'Waiting' || p.queueStatus === 'Sample Collected')).length;
        return patientsAhead * avgTimePerPatient;
    };

    const determinePriority = (patient) => {
        // Simple priority logic based on age and tests
        if (patient.age && patient.age > 65) return 'Senior';
        if (patient.totalTests > 3) return 'Multiple Tests';
        return 'Normal';
    };

    const handleStatusUpdate = async (patientId, newStatus) => {
        try {
            // Update patient queue status
            await axios.put(`${process.env.REACT_APP_API_URL}/patients/${patientId}`, {
                queueStatus: newStatus
            });

            // Update all associated tests
            const testsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/tests`);
            const patientTests = testsResponse.data.filter(test => test.patientId === patientId);
            
            for (const test of patientTests) {
                let testStatus = newStatus;
                if (newStatus === 'Sample Collected') testStatus = 'Sample Collected';
                else if (newStatus === 'In Progress') testStatus = 'In Progress';
                else if (newStatus === 'Completed') testStatus = 'Completed';
                
                await axios.put(`${process.env.REACT_APP_API_URL}/tests/${test._id}`, {
                    status: testStatus
                });
            }

            // Refresh the queue
            fetchPatientQueue();
        } catch (error) {
            console.error('Error updating status:', error);
        }
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

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Senior': return 'priority-senior';
            case 'Multiple Tests': return 'priority-multiple';
            default: return 'priority-normal';
        }
    };

    const getQueueStats = () => {
        const stats = {
            total: patients.length,
            waiting: patients.filter(p => p.queueStatus === 'Waiting').length,
            inProgress: patients.filter(p => p.queueStatus === 'In Progress').length,
            completed: patients.filter(p => p.queueStatus === 'Completed').length,
            avgWaitTime: patients.length > 0 ? 
                Math.round(patients.reduce((sum, p) => sum + (p.estimatedWaitTime || 0), 0) / patients.length) : 0
        };
        return stats;
    };

    const stats = getQueueStats();

    const filteredPatients = selectedDepartment === 'All' 
        ? patients 
        : patients.filter(p => p.primaryTest.includes(selectedDepartment));

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
                <div className="header-top">
                    <h1>Patient Queue Management</h1>
                    <div className="current-time">
                        <div className="time-display">
                            {currentTime.toLocaleTimeString()}
                        </div>
                        <div className="date-display">
                            {currentTime.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>
                
                <div className="queue-stats">
                    <div className="stat-card">
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-label">Total Patients</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{stats.waiting}</span>
                        <span className="stat-label">Waiting</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{stats.inProgress}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{stats.completed}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{stats.avgWaitTime}m</span>
                        <span className="stat-label">Avg Wait</span>
                    </div>
                </div>
            </div>

            <div className="queue-controls">
                <div className="control-group">
                    <label>Department Filter:</label>
                    <select 
                        value={selectedDepartment} 
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
                <div className="control-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        Auto-refresh (30s)
                    </label>
                </div>
                <button className="refresh-btn" onClick={fetchPatientQueue}>
                    Refresh Now
                </button>
            </div>

            <div className="queue-container">
                <div className="queue-table-wrapper">
                    <table className="queue-table">
                        <thead>
                            <tr>
                                <th>Token</th>
                                <th>Patient</th>
                                <th>Department</th>
                                <th>Priority</th>
                                <th>Wait Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-patients">
                                        <div className="no-patients-content">
                                            <h3>No Patients in Queue</h3>
                                            <p>
                                                {selectedDepartment === 'All' 
                                                    ? 'No patients registered for today' 
                                                    : `No patients in ${selectedDepartment} department`}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <tr key={patient._id} className="queue-row">
                                        <td className="token-cell">
                                            <div className="token-display">
                                                <span className="token-number">{patient.eveningNumber}</span>
                                                <span className="token-label">TOKEN</span>
                                            </div>
                                        </td>
                                        <td className="patient-cell">
                                            <div className="patient-info">
                                                <div className="patient-name">{patient.name}</div>
                                                <div className="patient-details">
                                                    <span className="patient-id">ID: {patient.patientId}</span>
                                                    <span className="patient-age">{patient.age}y</span>
                                                    <span className="patient-phone">{patient.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="department-cell">
                                            <span className="department-badge">{patient.primaryTest}</span>
                                            {patient.totalTests > 1 && (
                                                <div className="test-count">+{patient.totalTests - 1} more</div>
                                            )}
                                        </td>
                                        <td className="priority-cell">
                                            <span className={`priority-badge ${getPriorityColor(patient.priority)}`}>
                                                {patient.priority}
                                            </span>
                                        </td>
                                        <td className="wait-time-cell">
                                            <div className="wait-time">
                                                <span className="time-estimate">{patient.estimatedWaitTime}m</span>
                                                <span className="time-label">est. wait</span>
                                            </div>
                                        </td>
                                        <td className="status-cell">
                                            <span className={`status-badge ${getStatusColor(patient.queueStatus)}`}>
                                                {patient.queueStatus}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PatientQueue;
