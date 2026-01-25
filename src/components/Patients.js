import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Patients.css';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnrichedPatients = async () => {
            setLoading(true);
            try {
                console.log('Fetching patients from:', `${process.env.REACT_APP_API_URL}/patients/enriched`);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/patients/enriched`);
                console.log('Patients response:', response.data);
                setPatients(response.data);
            } catch (error) {
                console.error('Error fetching enriched patients:', error);
                console.error('Error details:', error.response?.data);
                
                // Fallback to regular patients endpoint
                try {
                    console.log('Trying fallback to regular patients endpoint');
                    const fallbackResponse = await axios.get(`${process.env.REACT_APP_API_URL}/patients`);
                    console.log('Fallback patients response:', fallbackResponse.data);
                    
                    // Enrich the data manually
                    const enrichedData = fallbackResponse.data.map(patient => ({
                        ...patient,
                        totalTests: 0,
                        dueAmount: 0
                    }));
                    setPatients(enrichedData);
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchEnrichedPatients();
    }, []);

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
    );

    return (
        <div className="patients-list-page">
            <h1>Patient Management</h1>
            <div className="toolbar">
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button onClick={() => navigate('/patients/new')}>Register New Patient</button>
            </div>
            {loading ? (
                <div className="loading-spinner">
                    <p>Loading patients...</p>
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="no-patients">
                    <h3>No Patients Found</h3>
                    <p>{searchTerm ? 'Try adjusting your search terms' : 'Start by registering your first patient'}</p>
                    <button onClick={() => navigate('/patients/new')} className="toolbar-button">
                        Register First Patient
                    </button>
                </div>
            ) : (
                <div className="patients-table-container">
                    <table className="patients-table">
                        <thead>
                            <tr>
                                <th>Evening Number</th>
                                <th>Patient Name</th>
                                <th>Phone</th>
                                <th>Total Tests</th>
                                <th>Due Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.map(patient => (
                                <tr 
                                    key={patient.patientId} 
                                    onClick={() => navigate(`/patient/${patient.patientId}`)} 
                                    className="patient-row"
                                >
                                    <td className="evening-number">{patient.eveningNumber}</td>
                                    <td className="patient-name">{patient.name}</td>
                                    <td className="patient-phone">{patient.phone}</td>
                                    <td>
                                        <span className="test-count">{patient.totalTests}</span>
                                    </td>
                                    <td className="due-amount">
                                        ${patient.dueAmount ? patient.dueAmount.toFixed(2) : '0.00'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Patients;