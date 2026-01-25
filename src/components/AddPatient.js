import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddPatient.css';

const AddPatient = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        age: '',
        gender: '',
        address: '',
        emergencyContact: '',
        medicalHistory: ''
    });
    const [testData, setTestData] = useState({
        testName: '',
        price: '',
        addTest: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [generatedData, setGeneratedData] = useState(null);
    const [errors, setErrors] = useState({});
    const [testPrices, setTestPrices] = useState({});
    const [availableTokens, setAvailableTokens] = useState([]);

    useEffect(() => {
        fetchTestPrices();
        fetchAvailableTokens();
    }, []);

    const fetchTestPrices = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/tests`);
            const prices = {};
            response.data.forEach(test => {
                prices[test.testName] = test.price;
            });
            setTestPrices(prices);
        } catch (error) {
            console.error('Error fetching test prices:', error);
        }
    };

    const fetchAvailableTokens = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/patients`);
            const usedTokens = response.data.map(p => p.eveningNumber);
            const allTokens = Array.from({length: 100}, (_, i) => i + 1);
            const available = allTokens.filter(token => !usedTokens.includes(token));
            setAvailableTokens(available.slice(0, 10));
        } catch (error) {
            console.error('Error fetching tokens:', error);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Patient name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (formData.age && (formData.age < 0 || formData.age > 150)) {
            newErrors.age = 'Please enter a valid age';
        }
        
        if (testData.addTest) {
            if (!testData.testName) {
                newErrors.testName = 'Please select a test type';
            }
            if (!testData.price || testData.price <= 0) {
                newErrors.price = 'Please enter a valid test price';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleTestChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setTestData({ ...testData, [name]: checked });
        } else {
            setTestData({ ...testData, [name]: value });
            if (name === 'testName' && testPrices[value]) {
                setTestData(prev => ({ ...prev, price: testPrices[value] }));
            }
        }
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setMessage('Please fix the errors in the form');
            return;
        }
        
        setLoading(true);
        setMessage('');
        try {
            console.log('Submitting patient data:', formData);
            console.log('API URL:', `${process.env.REACT_APP_API_URL}/patients`);
            
            // Register patient first
            const patientResponse = await axios.post(`${process.env.REACT_APP_API_URL}/patients`, {
                ...formData,
                email: formData.email || null,
                age: formData.age ? parseInt(formData.age) : null,
                gender: formData.gender || null,
                address: formData.address || null,
                emergencyContact: formData.emergencyContact || null,
                medicalHistory: formData.medicalHistory || null
            });
            console.log('Patient registered successfully:', patientResponse.data);
            const patient = patientResponse.data;
            
            // If test is to be added, register it
            if (testData.addTest && testData.testName && testData.price) {
                await axios.post(`${process.env.REACT_APP_API_URL}/tests`, {
                    testName: testData.testName,
                    price: parseFloat(testData.price),
                    patientId: patient._id,
                    status: 'Waiting'
                });
            }
            
            setMessage('✅ Patient registered successfully!');
            setGeneratedData({
                patientId: patient.patientId,
                eveningNumber: patient.eveningNumber,
                registrationDate: patient.createdAt,
                testAdded: testData.addTest,
                testName: testData.addTest ? testData.testName : null
            });
            
            // Reset form
            setFormData({
                name: '',
                phone: '',
                email: '',
                age: '',
                gender: '',
                address: '',
                emergencyContact: '',
                medicalHistory: ''
            });
            setTestData({ testName: '', price: '', addTest: false });
            setErrors({});
            
            // Refresh available tokens
            await fetchAvailableTokens();
            
        } catch (error) {
            console.error('Error registering patient:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            
            let errorMessage = '❌ Error registering patient. Please try again.';
            
            if (error.response?.status === 400) {
                errorMessage = '❌ Invalid data provided. Please check all fields.';
            } else if (error.response?.status === 500) {
                errorMessage = '❌ Server error. Please try again later.';
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
                errorMessage = '❌ Cannot connect to server. Please check if the backend is running.';
            } else if (error.message) {
                errorMessage = `❌ ${error.message}`;
            }
            
            setMessage(errorMessage);
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
                        <div className="form-row">
                            <div className="form-group">
                                <label>Patient Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter patient name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter 10-digit phone number"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    maxLength="10"
                                    className={errors.phone ? 'error' : ''}
                                />
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter email address (optional)"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>
                            <div className="form-group">
                                <label>Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="Enter age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="150"
                                    className={errors.age ? 'error' : ''}
                                />
                                {errors.age && <span className="error-message">{errors.age}</span>}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Emergency Contact</label>
                                <input
                                    type="tel"
                                    name="emergencyContact"
                                    placeholder="Emergency contact number"
                                    value={formData.emergencyContact}
                                    onChange={handleInputChange}
                                    maxLength="10"
                                />
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <label>Address</label>
                            <textarea
                                name="address"
                                placeholder="Enter complete address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Medical History (if any)</label>
                            <textarea
                                name="medicalHistory"
                                placeholder="Enter any relevant medical history or allergies"
                                value={formData.medicalHistory}
                                onChange={handleInputChange}
                                rows="3"
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
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Test Type *</label>
                                        <select
                                            name="testName"
                                            value={testData.testName}
                                            onChange={handleTestChange}
                                            required
                                            className={errors.testName ? 'error' : ''}
                                        >
                                            <option value="">Select Test</option>
                                            <option value="Blood Test">Blood Test - ${testPrices['Blood Test'] || '50'}</option>
                                            <option value="Urine Test">Urine Test - ${testPrices['Urine Test'] || '30'}</option>
                                            <option value="X-Ray">X-Ray - ${testPrices['X-Ray'] || '200'}</option>
                                            <option value="CT Scan">CT Scan - ${testPrices['CT Scan'] || '500'}</option>
                                            <option value="MRI">MRI - ${testPrices['MRI'] || '800'}</option>
                                            <option value="ECG">ECG - ${testPrices['ECG'] || '100'}</option>
                                            <option value="Ultrasound">Ultrasound - ${testPrices['Ultrasound'] || '150'}</option>
                                            <option value="Pathology">Pathology - ${testPrices['Pathology'] || '75'}</option>
                                        </select>
                                        {errors.testName && <span className="error-message">{errors.testName}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Test Price ($) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            placeholder="Enter test price"
                                            value={testData.price}
                                            onChange={handleTestChange}
                                            step="0.01"
                                            min="0"
                                            required
                                            className={errors.price ? 'error' : ''}
                                        />
                                        {errors.price && <span className="error-message">{errors.price}</span>}
                                    </div>
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
                                <strong>✓ {generatedData.testName} Test Registered Successfully</strong>
                            </div>
                        )}
                        <div className="detail-item">
                            <strong>Next Available Tokens:</strong> {availableTokens.slice(0, 5).join(', ')}
                        </div>
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
