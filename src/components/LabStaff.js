import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LabStaff.css';

const LabStaff = () => {
    const [labStaff, setLabStaff] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        contact: '',
        email: '',
        shift: 'Morning'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLabStaff();
    }, []);

    const fetchLabStaff = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5001/api/labstaff');
            setLabStaff(response.data);
        } catch (error) {
            console.error('Error fetching lab staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingStaff) {
                await axios.put(`http://localhost:5001/api/labstaff/${editingStaff._id}`, formData);
            } else {
                await axios.post('http://localhost:5001/api/labstaff', formData);
            }
            fetchLabStaff();
            setShowForm(false);
            setEditingStaff(null);
            setFormData({
                name: '',
                role: '',
                contact: '',
                email: '',
                shift: 'Morning'
            });
        } catch (error) {
            console.error('Error saving lab staff:', error);
        }
    };

    const handleEdit = (staff) => {
        setEditingStaff(staff);
        setFormData({
            name: staff.name,
            role: staff.role,
            contact: staff.contact,
            email: staff.email,
            shift: staff.shift
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await axios.delete(`http://localhost:5001/api/labstaff/${id}`);
                fetchLabStaff();
            } catch (error) {
                console.error('Error deleting lab staff:', error);
            }
        }
    };

    return (
        <div className="labstaff">
            <h1>Lab Staff</h1>
            <button onClick={() => setShowForm(true)}>Add Staff Member</button>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="labstaff-form">
                    <h2>{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="role"
                        placeholder="Role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="contact"
                        placeholder="Contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                    <select
                        name="shift"
                        value={formData.shift}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                    </select>
                    <button type="submit">{editingStaff ? 'Update' : 'Add'}</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditingStaff(null); }}>Cancel</button>
                </form>
            )}

            {/* Lab Staff List */}
            <div className="labstaff-list">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    labStaff.map((staff) => (
                        <div key={staff._id} className="labstaff-card">
                            <h3>{staff.name}</h3>
                            <p>Role: {staff.role}</p>
                            <p>Contact: {staff.contact}</p>
                            <p>Email: {staff.email}</p>
                            <p>Shift: {staff.shift}</p>
                            <button onClick={() => handleEdit(staff)}>Edit</button>
                            <button onClick={() => handleDelete(staff._id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LabStaff;
