import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './AddTest.css'; // Create this file for styling

const AddTest = () => {
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({
        patientId: '',
        testType: '',
        testDate: '',
        price: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/patients`);
                setPatients(response.data);
            } catch (error) {
                console.error('Error fetching patients:', error);
            }
        };
        fetchPatients();
    }, []);

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
            await axios.post(`${process.env.REACT_APP_API_URL}/tests`, formData);
            setMessage('Test added successfully!');
            setFormData({ patientId: '', testType: '', testDate: '', price: '' });
        } catch (error) {
            setMessage('Error adding test. Please try again.');
            console.error('Error saving test:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-test-container">
            <h1>Add New Test</h1>
            <form onSubmit={handleSubmit} className="test-form">
                <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                        <option key={patient._id} value={patient._id}>
                            {patient.name} (ID: {patient._id})
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    name="testType"
                    placeholder="Test Type (e.g., Blood, X-Ray)"
                    value={formData.testType}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="date"
                    name="testDate"
                    value={formData.testDate}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Test Price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Test'}
                </button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default AddTest;
