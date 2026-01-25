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
        fetchReports();
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
            {loading ? (
                <div className="loading-spinner">
                    <p>Loading reports...</p>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="no-reports">
                    <h3>No Reports Found</h3>
                    <p>{filters.status !== 'All' || filters.date || filters.patient ? 'Try adjusting your filters' : 'No reports available yet'}</p>
                </div>
            ) : (
                <div className="reports-table-container">
                    <table className="reports-table">
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
                                    <td className="patient-name-cell">{report.patientId ? report.patientId.name : 'N/A'}</td>
                                    <td className="test-name-cell">{report.testId ? report.testId.testName : 'N/A'}</td>
                                    <td className="date-cell">{new Date(report.date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-cell status-${report.status.toLowerCase()}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReportsManagement;
