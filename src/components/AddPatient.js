import React, { useState } from 'react';
import axios from 'axios';
// import './AddPatient.css'; // Create this file for styling

const AddPatient = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        contact: '', // Changed from phone to contact to match Patients.js
        address: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            // Replace with your actual backend endpoint
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/patients`, formData);
            setMessage('Patient registered successfully!');
            setFormData({ name: '', age: '', gender: '', contact: '', address: '' });
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
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                />
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                <input
                    type="text"
                    name="contact"
                    placeholder="Phone Number"
                    value={formData.contact}
                    onChange={handleInputChange}
                    required
                />
                 <input
                    type="text"
                    name="address"
                    placeholder="Address (Optional)"
                    value={formData.address}
                    onChange={handleInputChange}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register Patient'}
                </button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default AddPatient;
