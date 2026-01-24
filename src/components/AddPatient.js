import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddPatient.css';

const AddPatient = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });
    const [testData, setTestData] = useState({
        testName: '',
        price: '',
        addTest: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [generatedData, setGeneratedData] = useState(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTestChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setTestData({ ...testData, [name]: checked });
        } else {
            setTestData({ ...testData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            // Register patient first
            const patientResponse = await axios.post(`${process.env.REACT_APP_API_URL}/patients`, formData);
            const patient = patientResponse.data;
            
            // If test is to be added, register it
            if (testData.addTest && testData.testName && testData.price) {
                await axios.post(`${process.env.REACT_APP_API_URL}/tests`, {
                    testName: testData.testName,
                    price: parseFloat(testData.price),
                    patientId: patient._id
                });
            }
            
            setMessage('Patient registered successfully!');
            setGeneratedData({
                patientId: patient.patientId,
                eveningNumber: patient.eveningNumber,
                registrationDate: patient.createdAt,
                testAdded: testData.addTest
            });
            setFormData({ name: '', phone: '' });
            setTestData({ testName: '', price: '', addTest: false });
        } catch (error) {
            setMessage('Error registering patient. Please try again.');
            console.error('Error saving patient:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewPatient = () => {
        if (generatedData) {
            navigate(`/patient/${generatedData.patientId}`);
        }
    };

    return (
        <div className="add-patient-container">
            <div className="form-header">
                <h1>Register New Patient</h1>
                <p>Add patient information and optionally register tests</p>
            </div>
            
            <div className="form-content">
                <form onSubmit={handleSubmit} className="patient-form">
                    <div className="form-section">
                        <h3>Patient Information</h3>
                        <div className="form-group">
                            <label>Patient Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter patient name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Enter phone number"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="test-toggle">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="addTest"
                                    checked={testData.addTest}
                                    onChange={handleTestChange}
                                />
                                <span className="checkmark"></span>
                                Add Test Registration
                            </label>
                        </div>
                        
                        {testData.addTest && (
                            <div className="test-details">
                                <h4>Test Details</h4>
                                <div className="form-group">
                                    <label>Test Type</label>
                                    <select
                                        name="testName"
                                        value={testData.testName}
                                        onChange={handleTestChange}
                                        required
                                    >
                                        <option value="">Select Test</option>
                                        <option value="Blood Test">Blood Test</option>
                                        <option value="Urine Test">Urine Test</option>
                                        <option value="X-Ray">X-Ray</option>
                                        <option value="CT Scan">CT Scan</option>
                                        <option value="MRI">MRI</option>
                                        <option value="ECG">ECG</option>
                                        <option value="Ultrasound">Ultrasound</option>
                                        <option value="Pathology">Pathology</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Test Price ($)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="Enter test price"
                                        value={testData.price}
                                        onChange={handleTestChange}
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Registering...' : 'Register Patient'}
                        </button>
                        <button type="button" onClick={() => navigate('/patients')} className="btn-secondary">
                            View All Patients
                        </button>
                    </div>
                </form>
            </div>
            
            {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
            
            {generatedData && (
                <div className="generated-data">
                    <h2>🎉 Registration Successful!</h2>
                    <div className="patient-details">
                        <div className="detail-item">
                            <strong>Patient ID:</strong> {generatedData.patientId}
                        </div>
                        <div className="detail-item">
                            <strong>Evening Number:</strong> {generatedData.eveningNumber}
                        </div>
                        <div className="detail-item">
                            <strong>Registration Date:</strong> {new Date(generatedData.registrationDate).toLocaleDateString()}
                        </div>
                        {generatedData.testAdded && (
                            <div className="detail-item success">
                                <strong>✓ Test Registered Successfully</strong>
                            </div>
                        )}
                    </div>
                    <div className="action-buttons">
                        <button onClick={handleViewPatient} className="btn-primary">
                            View Patient Profile
                        </button>
                        <button onClick={() => window.location.reload()} className="btn-secondary">
                            Register Another Patient
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddPatient;
