import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Tests.css';

const Tests = () => {
    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [filters, setFilters] = useState({ testType: 'All', status: 'All', date: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTests();
    }, []);

    useEffect(() => {
        filterTests();
    }, [filters, tests]);

    const fetchTests = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/tests`);
            const enrichedTests = await Promise.all(response.data.map(async (test) => {
                try {
                    const patientResponse = await axios.get(`${process.env.REACT_APP_API_URL}/patients/${test.patientId}`);
                    return { ...test, patientName: patientResponse.data.name };
                } catch {
                    return { ...test, patientName: 'Unknown' };
                }
            }));
            setTests(enrichedTests);
        } catch (error) {
            console.error('Error fetching tests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTests = () => {
        let filtered = tests;
        
        if (filters.testType !== 'All') {
            filtered = filtered.filter(test => test.testName === filters.testType);
        }
        
        if (filters.status !== 'All') {
            filtered = filtered.filter(test => test.status === filters.status);
        }
        
        if (filters.date) {
            filtered = filtered.filter(test => {
                const testDate = new Date(test.createdAt).toDateString();
                const filterDate = new Date(filters.date).toDateString();
                return testDate === filterDate;
            });
        }
        
        setFilteredTests(filtered);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'In Progress': return 'status-progress';
            case 'Completed': return 'status-completed';
            default: return 'status-pending';
        }
    };

    if (loading) {
        return (
            <div className="tests-page">
                <div className="loading-spinner">
                    <p>Loading tests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tests-page">
            <div className="tests-header">
                <h1>Tests Management</h1>
                <div className="tests-stats">
                    <div className="stat-card">
                        <span className="stat-number">{tests.length}</span>
                        <span className="stat-label">Total Tests</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{tests.filter(t => t.status === 'Pending').length}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{tests.filter(t => t.status === 'Completed').length}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
            </div>

            <div className="filters-section">
                <div className="filter-container">
                    <select name="testType" value={filters.testType} onChange={handleFilterChange}>
                        <option value="All">All Test Types</option>
                        <option value="Blood Test">Blood Test</option>
                        <option value="Urine Test">Urine Test</option>
                        <option value="X-Ray">X-Ray</option>
                        <option value="CT Scan">CT Scan</option>
                        <option value="MRI">MRI</option>
                        <option value="ECG">ECG</option>
                        <option value="Ultrasound">Ultrasound</option>
                        <option value="Pathology">Pathology</option>
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
                </div>
            </div>

            <div className="tests-container">
                <div className="tests-table-wrapper">
                    <table className="tests-table">
                        <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Test Type</th>
                                <th>Price</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTests.map((test) => (
                                <tr key={test._id} className="test-row">
                                    <td className="patient-name-cell">{test.patientName}</td>
                                    <td className="test-type-cell">{test.testName}</td>
                                    <td className="price-cell">${test.price}</td>
                                    <td className="date-cell">{new Date(test.createdAt).toLocaleDateString()}</td>
                                    <td className="status-cell">
                                        <span className={`status-badge ${getStatusColor(test.status)}`}>
                                            {test.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className="action-btn view-btn"
                                            onClick={() => window.location.href = `/patient/${test.patientId}`}
                                        >
                                            View Patient
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Tests;
