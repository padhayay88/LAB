import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './ReportsManagement.css'; // Create this file for styling

const ReportsManagement = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingReport, setEditingReport] = useState(null);
    const [formData, setFormData] = useState({
        patientId: '',
        testId: '',
        result: '',
        status: 'Pending',
        file: null
    });

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        if (filterStatus === 'All') {
            setFilteredReports(reports);
        } else {
            setFilteredReports(reports.filter(report => report.status === filterStatus));
        }
    }, [filterStatus, reports]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/reports`);
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        try {
            if (editingReport) {
                await axios.put(`${process.env.REACT_APP_API_URL}/reports/${editingReport._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL}/reports`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            fetchReports();
            setShowForm(false);
            setEditingReport(null);
        } catch (error) {
            console.error('Error saving report:', error);
        }
    };

    const handleMarkAsReviewed = async (reportId) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/reports/${reportId}`, { status: 'Reviewed' });
            fetchReports();
        } catch (error) {
            console.error('Error marking report as reviewed:', error);
        }
    };

    return (
        <div className="reports-management">
            <h1>Medical Reports Management</h1>
            <div className="filter-container">
                <label>Filter by Status: </label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Reviewed">Reviewed</option>
                </select>
            </div>
            <button onClick={() => setShowForm(true)}>Add New Report</button>

            {showForm && (
                <form onSubmit={handleSubmit}>
                    {/* Form fields for patientId, testId, result, status */}
                    <input type="file" name="file" onChange={handleFileChange} />
                    <button type="submit">{editingReport ? 'Update' : 'Upload'} Report</button>
                </form>
            )}

            <div className="report-list">
                {loading ? <p>Loading reports...</p> : filteredReports.map(report => (
                    <div key={report._id} className={`report-card status-${report.status.toLowerCase()}`}>
                        <p>Patient ID: {report.patientId}</p>
                        <p>Test ID: {report.testId}</p>
                        <p>Status: {report.status}</p>
                        {report.status === 'Completed' && (
                            <button onClick={() => handleMarkAsReviewed(report._id)}>Mark as Reviewed</button>
                        )}
                        {/* Add view/download button for the report file */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportsManagement;
