import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
// import './PatientProfile.css'; // Create this file for styling

const PatientProfile = () => {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [tests, setTests] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const patientRes = await axios.get(`${process.env.REACT_APP_API_URL}/patients/${patientId}`);
                const testsRes = await axios.get(`${process.env.REACT_APP_API_URL}/tests?patientId=${patientId}`);
                const paymentsRes = await axios.get(`${process.env.REACT_APP_API_URL}/finance?patientId=${patientId}`);

                setPatient(patientRes.data);
                setTests(testsRes.data);
                setPayments(paymentsRes.data);
            } catch (error) {
                console.error('Error fetching patient profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [patientId]);

    if (loading) {
        return <div>Loading patient profile...</div>;
    }

    if (!patient) {
        return <div>Patient not found.</div>;
    }

    const totalAmount = tests.reduce((sum, test) => sum + test.price, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const dueAmount = totalAmount - totalPaid;

    return (
        <div className="patient-profile">
            <h1>Patient Profile</h1>
            <div className="patient-info">
                <h2>{patient.name}</h2>
                <p><strong>Age:</strong> {patient.age}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <p><strong>Contact:</strong> {patient.contact}</p>
                <p><strong>Address:</strong> {patient.address}</p>
            </div>

            <div className="tests-section">
                <h3>Tests</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Test Name</th>
                            <th>Date</th>
                            <th>Price</th>
                            <th>Report Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tests.map(test => (
                            <tr key={test._id}>
                                <td>{test.testName}</td>
                                <td>{new Date(test.date).toLocaleDateString()}</td>
                                <td>${test.price}</td>
                                <td>N/A</td> {/* Placeholder for report status */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="payment-summary">
                <h3>Payment Summary</h3>
                <p><strong>Total Amount:</strong> ${totalAmount.toFixed(2)}</p>
                <p><strong>Total Paid:</strong> ${totalPaid.toFixed(2)}</p>
                <p><strong>Due Amount:</strong> ${dueAmount.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default PatientProfile;
