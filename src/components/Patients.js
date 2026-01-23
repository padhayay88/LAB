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
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/patients/enriched`);
                setPatients(response.data);
            } catch (error) {
                console.error('Error fetching enriched patients:', error);
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
            <h1>Patient List</h1>
            <div className="toolbar">
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button onClick={() => navigate('/patients/new')}>Register New Patient</button>
            </div>
            {loading ? <p>Loading patients...</p> : (
                <table>
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
                            <tr key={patient.patientId} onClick={() => navigate(`/patient/${patient._id}`)} className="patient-row">
                                <td>{patient.eveningNumber}</td>
                                <td>{patient.name}</td>
                                <td>{patient.phone}</td>
                                <td>{patient.totalTests}</td>
                                <td>${patient.dueAmount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Patients;