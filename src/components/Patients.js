import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Patients.css';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        contact: '',
        address: '',
        medicalHistory: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5001/api/patients');
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            medicalHistory: formData.medicalHistory.split(',').map(item => item.trim())
        };

        try {
            if (editingPatient) {
                await axios.put(`http://localhost:5001/api/patients/${editingPatient._id}`, data);
            } else {
                await axios.post('http://localhost:5001/api/patients', data);
            }
            fetchPatients();
            setShowForm(false);
            setEditingPatient(null);
            setFormData({
                name: '',
                age: '',
                gender: '',
                contact: '',
                address: '',
                medicalHistory: ''
            });
        } catch (error) {
            console.error('Error saving patient:', error);
        }
    };

    const handleEdit = (patient) => {
        setEditingPatient(patient);
        setFormData({
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            contact: patient.contact,
            address: patient.address,
            medicalHistory: patient.medicalHistory.join(', ')
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this patient?')) {
            try {
                await axios.delete(`http://localhost:5001/api/patients/${id}`);
                fetchPatients();
            } catch (error) {
                console.error('Error deleting patient:', error);
            }
        }
    };

    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="patients">
            <h1>Patients</h1>

            {/* Search Bar */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <button onClick={() => setShowForm(true)}>Add Patient</button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="patient-form">
                    <h2>{editingPatient ? 'Edit Patient' : 'Add Patient'}</h2>
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
                        placeholder="Contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                    />
                    <textarea
                        name="medicalHistory"
                        placeholder="Medical History (comma separated)"
                        value={formData.medicalHistory}
                        onChange={handleInputChange}
                    />
                    <button type="submit">{editingPatient ? 'Update' : 'Add'}</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditingPatient(null); }}>Cancel</button>
                </form>
            )}

            {/* Patient List */}
            <div className="patient-list">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    filteredPatients.map((patient) => (
                        <div key={patient._id} className="patient-card">
                            <h3>{patient.name}</h3>
                            <p>Age: {patient.age}</p>
                            <p>Gender: {patient.gender}</p>
                            <p>Contact: {patient.contact}</p>
                            <p>Address: {patient.address}</p>
                            <h4>Medical History:</h4>
                            <ul>
                                {patient.medicalHistory.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                            <button onClick={() => handleEdit(patient)}>Edit</button>
                            <button onClick={() => handleDelete(patient._id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Patients;