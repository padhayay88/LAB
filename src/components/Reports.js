import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingReport, setEditingReport] = useState(null);
    const [formData, setFormData] = useState({
        patientId: '',
        testId: '',
        result: '',
        status: 'pending',
        date: '',
        doctorId: '',
        interpretation: '',
        attachments: [],
        reviewedBy: '',
        reviewedAt: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5001/api/reports');
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
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
            if (editingReport) {
                await axios.put(`http://localhost:5001/api/reports/${editingReport._id}`, formData);
            } else {
                await axios.post('http://localhost:5001/api/reports', formData);
            }
            fetchReports();
            setShowForm(false);
            setEditingReport(null);
            setFormData({
                patientId: '',
                testId: '',
                result: '',
                status: 'pending',
                date: '',
                doctorId: '',
                interpretation: '',
                attachments: [],
                reviewedBy: '',
                reviewedAt: ''
            });
        } catch (error) {
            console.error('Error saving report:', error);
        }
    };

    const handleEdit = (report) => {
        setEditingReport(report);
        setFormData({
            patientId: report.patientId,
            testId: report.testId,
            result: report.result,
            status: report.status,
            date: report.date,
            doctorId: report.doctorId,
            interpretation: report.interpretation,
            attachments: report.attachments,
            reviewedBy: report.reviewedBy,
            reviewedAt: report.reviewedAt
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                await axios.delete(`http://localhost:5001/api/reports/${id}`);
                fetchReports();
            } catch (error) {
                console.error('Error deleting report:', error);
            }
        }
    };

    return (
        <div className="reports">
            <h1>Reports</h1>
            <button onClick={() => setShowForm(true)}>Add Report</button>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="report-form">
                    <h2>{editingReport ? 'Edit Report' : 'Add Report'}</h2>
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
                        name="testId"
                        placeholder="Test ID"
                        value={formData.testId}
                        onChange={handleInputChange}
                        required
                    />
                    <textarea
                        name="results"
                        placeholder="Results"
                        value={formData.results}
                        onChange={handleInputChange}
                        required
                    />
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Reviewed">Reviewed</option>
                    </select>
                    <input
                        type="datetime-local"
                        name="generatedAt"
                        value={formData.generatedAt}
                        onChange={handleInputChange}
                        required
                    />
                    <button type="submit">{editingReport ? 'Update' : 'Add'}</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditingReport(null); }}>Cancel</button>
                </form>
            )}

            {/* Report List */}
            <div className="report-list">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    reports.map((report) => (
                        <div key={report._id} className={`report-card ${report.status === 'Completed' ? 'completed' : ''}`}>
                            <h3>Report ID: {report._id}</h3>
                            <p>Patient ID: {report.patientId}</p>
                            <p>Test ID: {report.testId}</p>
                            <p>Status: {report.status}</p>
                            <p>Date: {new Date(report.date).toLocaleString()}</p>
                            <p>Result: {report.result}</p>
                            <p>Doctor ID: {report.doctorId}</p>
                            <p>Interpretation: {report.interpretation}</p>
                            <p>Attachments: {report.attachments.join(', ')}</p>
                            <p>Reviewed By: {report.reviewedBy}</p>
                            <p>Reviewed At: {report.reviewedAt ? new Date(report.reviewedAt).toLocaleString() : 'N/A'}</p>
                            <button onClick={() => handleEdit(report)}>Edit</button>
                            <button onClick={() => handleDelete(report._id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reports;
