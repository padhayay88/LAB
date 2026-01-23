import React, { useState } from 'react';
import axios from 'axios';
// import './AddPatient.css'; // Create this file for styling

const AddPatient = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [generatedData, setGeneratedData] = useState(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/patients`, formData);
            setMessage('Patient registered successfully!');
            setGeneratedData({
                patientId: response.data.patientId,
                eveningNumber: response.data.eveningNumber,
                registrationDate: response.data.createdAt
            });
            setFormData({ name: '', phone: '' });
        } catch (error) {
            setMessage('Error registering patient. Please try again.');
            console.error('Error saving patient:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-patient-container">
            <h1>Register New Patient</h1>
            <form onSubmit={handleSubmit} className="patient-form">
                <input
                    type="text"
                    name="name"
                    placeholder="Patient Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register Patient'}
                </button>
            </form>
            {message && <p className="message">{message}</p>}
            {generatedData && (
                <div className="generated-data">
                    <h2>Patient Registration Details</h2>
                    <p><strong>Patient ID:</strong> {generatedData.patientId}</p>
                    {generatedData.eveningNumber && <p><strong>Evening Number:</strong> {generatedData.eveningNumber}</p>}
                </div>
            )}
        </div>
    );
};

export default AddPatient;
