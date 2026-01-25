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
        fetchReports();
    }, []);

    useEffect(() => {
        let tempReports = reports;
        if (filters.status !== 'All') {
            tempReports = tempReports.filter(report => report.status === filters.status);
        }
        if (filters.date) {
            tempReports = tempReports.filter(report => new Date(report.createdAt).toLocaleDateString() === new Date(filters.date).toLocaleDateString());
        }
        if (filters.patient) {
            tempReports = tempReports.filter(report => report.patientId && report.patientId.name && report.patientId.name.toLowerCase().includes(filters.patient.toLowerCase()));
        }
        setFilteredReports(tempReports);
    }, [filters, reports]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/reports`);
            console.log('Fetched reports:', response.data);
            
            const enrichedReports = await Promise.all(response.data.map(async (report) => {
                try {
                    const patientResponse = await axios.get(`${process.env.REACT_APP_API_URL}/patients/${report.patientId}`);
                    const testResponse = await axios.get(`${process.env.REACT_APP_API_URL}/tests/${report.testId}`);
                    return { 
                        ...report, 
                        patientName: patientResponse.data.name,
                        patientPhone: patientResponse.data.phone,
                        testInfo: testResponse.data
                    };
                } catch {
                    return { 
                        ...report, 
                        patientName: 'Unknown Patient',
                        patientPhone: 'N/A'
                    };
                }
            }));
            setReports(enrichedReports);
            setFilteredReports(enrichedReports);
            console.log('Enriched reports:', enrichedReports);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleViewDetails = (report) => {
        navigate(`/patient/${report.patientId._id}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'Completed': return 'status-completed';
            default: return 'status-pending';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="reports-management-page">
            <h1>Reports Management</h1>
            <div className="filters">
                <div className="filter-group">
                    <label>Status</label>
                    <select 
                        value={filters.status} 
                        onChange={(e) => handleFilterChange(e)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Date</label>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => handleFilterChange(e)}
                    />
                </div>
                <div className="filter-group search-group">
                    <label>Search</label>
                    <input
                        type="text"
                        placeholder="Search by patient name or report ID..."
                        value={filters.patient}
                        onChange={(e) => handleFilterChange(e)}
                    />
                </div>
            </div>

            <div className="reports-container">
                {loading ? (
                    <div className="loading-spinner">
                        <p>Loading reports...</p>
                    </div>
                ) : (
                    <div className="reports-table-wrapper">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Test</th>
                                    <th>Report Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="no-reports">
                                            <div className="no-reports-content">
                                                <h3>No Reports Found</h3>
                                                <p>Try adjusting your filters or generate some reports for patients</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report._id} className="report-row">
                                            <td className="patient-cell">
                                                <div className="patient-info">
                                                    <div className="patient-name">{report.patientName}</div>
                                                    <div className="patient-details">{report.patientPhone}</div>
                                                </div>
                                            </td>
                                            <td className="test-cell">
                                                <div className="test-info">
                                                    <div className="test-name">{report.testInfo.testName}</div>
                                                    <div className="test-price">₹{report.testInfo.price ? report.testInfo.price.toFixed(2) : '0.00'}</div>
                                                </div>
                                            </td>
                                            <td className="date-cell">
                                                {formatDate(report.createdAt)}
                                            </td>
                                            <td className="status-cell">
                                                <span className={`status-badge ${getStatusColor(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <button 
                                                    className="action-btn view-btn"
                                                    onClick={() => handleViewDetails(report)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsManagement;
