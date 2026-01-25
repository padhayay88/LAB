import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PatientProfile.css';

const PatientProfile = () => {
    const { id, patientId, _id } = useParams();
    const patientIdentifier = patientId || _id || id;
    const [patientData, setPatientData] = useState({ patient: null, tests: [], reports: [], finances: [] });
    const [loading, setLoading] = useState(true);

    const [newTest, setNewTest] = useState({ testName: '', price: '' });
    const [newPayment, setNewPayment] = useState({ amount: '', paymentMode: 'Cash' });
    const [reportFile, setReportFile] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/patients/${patientIdentifier}/details`);
            setPatientData(response.data);
        } catch (error) {
            console.error('Error fetching patient details:', error);
        } finally {
            setLoading(false);
        }
    }, [patientIdentifier]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddTest = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/tests`, { ...newTest, patientId: patientIdentifier });
            setNewTest({ testName: '', price: '' });
            fetchData();
        } catch (error) {
            console.error('Error adding test:', error);
        }
    };

    const handleUpdateTestStatus = async (testId, status) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/tests/${testId}`, { status });
            fetchData();
        } catch (error) {
            console.error('Error updating test status:', error);
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            const paymentData = {
                ...newPayment, 
                patientId: patientIdentifier, 
                transactionType: 'Income',
                category: 'Test Payment',
                status: 'Paid'
            };
            
            console.log('Adding payment:', paymentData);
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/finance`, paymentData);
            console.log('Payment added successfully:', response.data);
            
            setNewPayment({ amount: '', paymentMode: 'Cash' });
            
            // Refresh data to show the new payment
            await fetchData();
            
            // Show success message
            alert('Payment added successfully!');
        } catch (error) {
            console.error('Error adding payment:', error);
            alert('Error adding payment: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUploadReport = async (testId) => {
        if (!reportFile) return;
        const formData = new FormData();
        formData.append('report', reportFile);
        formData.append('patientId', patientIdentifier);
        formData.append('testId', testId);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/reports`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setReportFile(null);
            fetchData();
        } catch (error) {
            console.error('Error uploading report:', error);
        }
    };

    if (loading) return <p>Loading patient details...</p>;
    if (!patientData.patient) return <p>Patient not found.</p>;

    const { patient, tests, reports, finances } = patientData;
    const totalAmount = tests.reduce((acc, test) => acc + test.price, 0);
    const paidAmount = finances.filter(f => f.transactionType === 'Income').reduce((acc, p) => acc + p.amount, 0);
    const dueAmount = totalAmount - paidAmount;

    return (
        <div className="patient-detail-page">
            <div className="patient-info-section">
                <h2>Patient Information</h2>
                <p><strong>Name:</strong> {patient.name}</p>
                <p><strong>Phone:</strong> {patient.phone}</p>
                <p><strong>Patient ID:</strong> {patient.patientId}</p>
                <p><strong>Registration Date:</strong> {new Date(patient.registrationDate).toLocaleDateString()}</p>
                <p><strong>Evening Number:</strong> {patient.eveningNumber}</p>
            </div>

            <div className="test-management-section">
                <h2>Test Management</h2>
                <form onSubmit={handleAddTest}>
                    <input type="text" value={newTest.testName} onChange={e => setNewTest({...newTest, testName: e.target.value})} placeholder="Test Type" required />
                    <input type="number" value={newTest.price} onChange={e => setNewTest({...newTest, price: e.target.value})} placeholder="Test Price" required />
                    <button type="submit">Add Test</button>
                </form>
                <table>
                    <thead><tr><th>Test Type</th><th>Price</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {tests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(test => (
                            <tr key={test._id}>
                                <td>{test.testName}</td>
                                <td>${test.price.toFixed(2)}</td>
                                <td>{new Date(test.createdAt).toLocaleDateString()}</td>
                                <td>{test.status}</td>
                                <td>
                                    <select value={test.status} onChange={e => handleUpdateTestStatus(test._id, e.target.value)}>
                                        <option value="Waiting">Waiting</option>
                                        <option value="Sample Collected">Sample Collected</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="report-management-section">
                <h2>Report Management</h2>
                <table>
                    <thead><tr><th>Test</th><th>Report Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {tests.map(test => {
                            const report = reports.find(r => r.testId === test._id);
                            return (
                                <tr key={test._id}>
                                    <td>{test.testName}</td>
                                    <td>{report ? 'Completed' : 'Pending'}</td>
                                    <td>
                                        {!report ? (
                                            <>
                                                <input type="file" onChange={e => setReportFile(e.target.files[0])} />
                                                <button onClick={() => handleUploadReport(test._id)}>Upload</button>
                                            </>
                                        ) : <a href={`${process.env.REACT_APP_API_URL}/${report.filePath}`} target="_blank" rel="noopener noreferrer">View Report</a>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="payment-management-section">
                <h2>Payment / Amount Management</h2>
                <div className="payment-summary">
                    <p><strong>Total Amount:</strong> ${totalAmount.toFixed(2)}</p>
                    <p><strong>Paid Amount:</strong> ${paidAmount.toFixed(2)}</p>
                    <p><strong>Due Amount:</strong> ${dueAmount.toFixed(2)}</p>
                </div>
                <form onSubmit={handleAddPayment}>
                    <input type="number" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} placeholder="Amount" required />
                    <select value={newPayment.paymentMode} onChange={e => setNewPayment({...newPayment, paymentMode: e.target.value})}>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                    </select>
                    <button type="submit">Add Payment</button>
                </form>
                <table>
                    <thead><tr><th>Amount</th><th>Payment Mode</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>
                        {finances.filter(f => f.transactionType === 'Income').length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    No payments recorded yet
                                </td>
                            </tr>
                        ) : (
                            finances.filter(f => f.transactionType === 'Income').sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).map(payment => (
                                <tr key={payment._id}>
                                    <td>${payment.amount.toFixed(2)}</td>
                                    <td>{payment.paymentMode}</td>
                                    <td>{new Date(payment.date || payment.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{ 
                                            background: '#27ae60', 
                                            color: 'white', 
                                            padding: '4px 8px', 
                                            borderRadius: '12px', 
                                            fontSize: '12px' 
                                        }}>
                                            {payment.status || 'Paid'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientProfile;
