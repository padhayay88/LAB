import React, { useState } from 'react';
import axios from 'axios';
// import './AddPatient.css'; // Create this file for styling

const AddPatient = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA'
        },
        emergencyContact: {
            name: '',
            relationship: '',
            phone: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        if (keys.length === 1) {
            setFormData({ ...formData, [name]: value });
        } else if (keys.length === 2) {
            setFormData({
                ...formData,
                [keys[0]]: {
                    ...formData[keys[0]],
                    [keys[1]]: value
                }
            });
        } else if (keys.length === 3) {
            setFormData({
                ...formData,
                [keys[0]]: {
                    ...formData[keys[0]],
                    [keys[1]]: {
                        ...formData[keys[0]][keys[1]],
                        [keys[2]]: value
                    }
                }
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            // Replace with your actual backend endpoint
            await axios.post(`${process.env.REACT_APP_API_URL}/api/patients`, formData);
            setMessage('Patient registered successfully!');
            setFormData({
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                gender: '',
                email: '',
                phone: '',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'USA'
                },
                emergencyContact: {
                    name: '',
                    relationship: '',
                    phone: ''
                }
            });
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
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="date"
                    name="dateOfBirth"
                    placeholder="Date of Birth"
                    value={formData.dateOfBirth}
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
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
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
                <input
                    type="text"
                    name="address.street"
                    placeholder="Street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    name="address.city"
                    placeholder="City"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    name="address.state"
                    placeholder="State"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    name="address.zipCode"
                    placeholder="Zip Code"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    name="emergencyContact.name"
                    placeholder="Emergency Contact Name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    name="emergencyContact.relationship"
                    placeholder="Relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    name="emergencyContact.phone"
                    placeholder="Emergency Contact Phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    required
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
