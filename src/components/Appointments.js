import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Appointments.css';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        date: '',
        time: '',
        status: 'Scheduled',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5001/api/appointments');
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
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
            if (editingAppointment) {
                await axios.put(`http://localhost:5001/api/appointments/${editingAppointment._id}`, formData);
            } else {
                await axios.post('http://localhost:5001/api/appointments', formData);
            }
            fetchAppointments();
            setShowForm(false);
            setEditingAppointment(null);
            setFormData({
                patientId: '',
                doctorId: '',
                date: '',
                time: '',
                status: 'Scheduled',
                notes: ''
            });
        } catch (error) {
            console.error('Error saving appointment:', error);
        }
    };

    const handleEdit = (appointment) => {
        setEditingAppointment(appointment);
        setFormData({
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status,
            notes: appointment.notes
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this appointment?')) {
            try {
                await axios.delete(`http://localhost:5001/api/appointments/${id}`);
                fetchAppointments();
            } catch (error) {
                console.error('Error deleting appointment:', error);
            }
        }
    };

    return (
        <div className="appointments">
            <h1>Appointments</h1>
            <button onClick={() => setShowForm(true)}>Add Appointment</button>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="appointment-form">
                    <h2>{editingAppointment ? 'Edit Appointment' : 'Add Appointment'}</h2>
                    <input
                        type="text"
                        name="patientId"
                        placeholder="Patient ID"
                        value={formData.patientId}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="doctorId"
                        placeholder="Doctor ID"
                        value={formData.doctorId}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                    />
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <textarea
                        name="notes"
                        placeholder="Notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                    />
                    <button type="submit">{editingAppointment ? 'Update' : 'Add'}</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditingAppointment(null); }}>Cancel</button>
                </form>
            )}

            {/* Appointment List */}
            <div className="appointment-list">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    appointments.map((appointment) => (
                        <div key={appointment._id} className={`appointment-card ${appointment.status === 'Completed' ? 'completed' : ''}`}>
                            <h3>Appointment ID: {appointment._id}</h3>
                            <p>Patient ID: {appointment.patientId}</p>
                            <p>Doctor ID: {appointment.doctorId}</p>
                            <p>Date: {appointment.date}</p>
                            <p>Time: {appointment.time}</p>
                            <p>Status: {appointment.status}</p>
                            <p>Notes: {appointment.notes}</p>
                            <button onClick={() => handleEdit(appointment)}>Edit</button>
                            <button onClick={() => handleDelete(appointment._id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Appointments;
