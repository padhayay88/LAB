import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReportsManagement.css';

const ReportsManagement = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [filters, setFilters] = useState({ status: 'All', date: '', patient: '' });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnrichedReports = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/reports/enriched`);
                setReports(response.data);
                setFilteredReports(response.data);
            } catch (error) {
                console.error('Error fetching enriched reports:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEnrichedReports();
    }, []);

    useEffect(() => {
        let tempReports = reports;
        if (filters.status !== 'All') {
            tempReports = tempReports.filter(report => report.status === filters.status);
        }
        if (filters.date) {
            tempReports = tempReports.filter(report => new Date(report.date).toLocaleDateString() === new Date(filters.date).toLocaleDateString());
        }
        if (filters.patient) {
            tempReports = tempReports.filter(report => report.patientId && report.patientId.name.toLowerCase().includes(filters.patient.toLowerCase()));
        }
        setFilteredReports(tempReports);
    }, [filters, reports]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="reports-management-page">
            <h1>Reports Management</h1>
            <div className="filters">
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                </select>
                <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
                <input type="text" name="patient" value={filters.patient} onChange={handleFilterChange} placeholder="Filter by Patient Name..." />
            </div>
            {loading ? <p>Loading reports...</p> : (
                <table>
                    <thead>
                        <tr>
                            <th>Patient Name</th>
                            <th>Test Name</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.map(report => (
                            <tr key={report._id} onClick={() => navigate(`/patient/${report.patientId._id}`)} className="report-row">
                                <td>{report.patientId ? report.patientId.name : 'N/A'}</td>
                                <td>{report.testId ? report.testId.testName : 'N/A'}</td>
                                <td>{new Date(report.date).toLocaleDateString()}</td>
                                <td>{report.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ReportsManagement;
