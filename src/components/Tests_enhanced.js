import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Tests.css';

const Tests = () => {
    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'All',
        testType: 'All',
        dateRange: 'All',
        searchTerm: ''
    });
    const [selectedTest, setSelectedTest] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Realistic test types with categories
    const testCategories = {
        'Blood Tests': ['Complete Blood Count', 'Blood Sugar', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid Profile'],
        'Urine Tests': ['Routine Urine', 'Urine Culture', '24-Hour Protein', 'Microalbumin'],
        'Imaging': ['X-Ray Chest', 'X-Ray Abdomen', 'CT Scan Head', 'CT Scan Chest', 'MRI Brain', 'MRI Spine', 'Ultrasound Abdomen'],
        'Cardiac': ['ECG', 'Echocardiogram', 'Stress Test', 'Holter Monitor'],
        'Pathology': ['Biopsy', 'Pap Smear', 'FNAC', 'Histopathology']
    };

    const statusColors = {
        'Waiting': 'status-waiting',
        'Sample Collected': 'status-collected',
        'In Progress': 'status-progress',
        'Completed': 'status-completed',
        'Report Ready': 'status-ready'
    };

    useEffect(() => {
        fetchTests();
    }, []);

    useEffect(() => {
        filterTests();
    }, [filters, tests]);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/tests`);
            const enrichedTests = await Promise.all(response.data.map(async (test) => {
                try {
                    const patientResponse = await axios.get(`${process.env.REACT_APP_API_URL}/patients/${test.patientId}`);
                    return {
                        ...test,
                        patientName: patientResponse.data.name,
                        patientPhone: patientResponse.data.phone,
                        patientAge: patientResponse.data.age,
                        patientGender: patientResponse.data.gender
                    };
                } catch {
                    return {
                        ...test,
                        patientName: 'Unknown Patient',
                        patientPhone: 'N/A',
                        patientAge: 'N/A',
                        patientGender: 'N/A'
                    };
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

        // Filter by status
        if (filters.status !== 'All') {
            filtered = filtered.filter(test => test.status === filters.status);
        }

        // Filter by test type
        if (filters.testType !== 'All') {
            filtered = filtered.filter(test => test.testName.includes(filters.testType));
        }

        // Filter by date range
        const today = new Date();
        if (filters.dateRange === 'Today') {
            filtered = filtered.filter(test => {
                const testDate = new Date(test.createdAt);
                return testDate.toDateString() === today.toDateString();
            });
        } else if (filters.dateRange === 'Week') {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(test => {
                const testDate = new Date(test.createdAt);
                return testDate >= weekAgo;
            });
        } else if (filters.dateRange === 'Month') {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(test => {
                const testDate = new Date(test.createdAt);
                return testDate >= monthAgo;
            });
        }

        // Filter by search term
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(test =>
                test.patientName.toLowerCase().includes(searchLower) ||
                test.testName.toLowerCase().includes(searchLower) ||
                test.patientPhone.includes(searchLower)
            );
        }

        setFilteredTests(filtered);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters({
            ...filters,
            [filterName]: value
        });
    };

    const handleStatusUpdate = async (testId, newStatus) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/tests/${testId}`, { status: newStatus });
            fetchTests();
        } catch (error) {
            console.error('Error updating test status:', error);
        }
    };

    const handleViewDetails = (test) => {
        setSelectedTest(test);
        setShowDetails(true);
    };

    const getTestCategory = (testName) => {
        for (const [category, tests] of Object.entries(testCategories)) {
            if (tests.some(t => testName.includes(t))) {
                return category;
            }
        }
        return 'Other';
    };

    const getTestStats = () => {
        const today = new Date();
        const todayTests = tests.filter(test => {
            const testDate = new Date(test.createdAt);
            return testDate.toDateString() === today.toDateString();
        });

        return {
            total: tests.length,
            today: todayTests.length,
            waiting: tests.filter(t => t.status === 'Waiting').length,
            completed: tests.filter(t => t.status === 'Completed').length,
            reportReady: tests.filter(t => t.status === 'Report Ready').length
        };
    };

    const stats = getTestStats();

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
                <h1>Test Management</h1>
                <div className="test-stats">
                    <div className="stat-card">
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-label">Total Tests</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{stats.today}</span>
                        <span className="stat-label">Today</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{stats.waiting}</span>
                        <span className="stat-label">Waiting</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{stats.completed}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{stats.reportReady}</span>
                        <span className="stat-label">Report Ready</span>
                    </div>
                </div>
            </div>

            <div className="filters-section">
                <div className="filter-container">
                    <div className="filter-group">
                        <label>Status</label>
                        <select 
                            value={filters.status} 
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Waiting">Waiting</option>
                            <option value="Sample Collected">Sample Collected</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Report Ready">Report Ready</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Test Type</label>
                        <select 
                            value={filters.testType} 
                            onChange={(e) => handleFilterChange('testType', e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="Blood">Blood Tests</option>
                            <option value="Urine">Urine Tests</option>
                            <option value="X-Ray">X-Ray</option>
                            <option value="CT">CT Scan</option>
                            <option value="MRI">MRI</option>
                            <option value="ECG">ECG</option>
                            <option value="Ultrasound">Ultrasound</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Date Range</label>
                        <select 
                            value={filters.dateRange} 
                            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        >
                            <option value="All">All Time</option>
                            <option value="Today">Today</option>
                            <option value="Week">This Week</option>
                            <option value="Month">This Month</option>
                        </select>
                    </div>
                    <div className="filter-group search-group">
                        <label>Search</label>
                        <input
                            type="text"
                            placeholder="Search by patient name, test, or phone..."
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="tests-container">
                <div className="tests-table-wrapper">
                    <table className="tests-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Test Details</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-tests">
                                        <div className="no-tests-content">
                                            <h3>No Tests Found</h3>
                                            <p>Try adjusting your filters or search terms</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTests.map((test) => (
                                    <tr key={test._id} className="test-row">
                                        <td className="patient-cell">
                                            <div className="patient-info">
                                                <div className="patient-name">{test.patientName}</div>
                                                <div className="patient-details">
                                                    {test.patientAge}y, {test.patientGender} • {test.patientPhone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="test-cell">
                                            <div className="test-info">
                                                <div className="test-name">{test.testName}</div>
                                                <div className="test-id">ID: {test.patientId}</div>
                                            </div>
                                        </td>
                                        <td className="category-cell">
                                            <span className="category-badge">
                                                {getTestCategory(test.testName)}
                                            </span>
                                        </td>
                                        <td className="price-cell">
                                            <span className="price">${test.price.toFixed(2)}</span>
                                        </td>
                                        <td className="date-cell">
                                            {new Date(test.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="status-cell">
                                            <select 
                                                value={test.status} 
                                                onChange={(e) => handleStatusUpdate(test._id, e.target.value)}
                                                className={`status-select ${statusColors[test.status]}`}
                                            >
                                                <option value="Waiting">Waiting</option>
                                                <option value="Sample Collected">Sample Collected</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Report Ready">Report Ready</option>
                                            </select>
                                        </td>
                                        <td className="actions-cell">
                                            <button 
                                                className="action-btn view-btn"
                                                onClick={() => handleViewDetails(test)}
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
            </div>

            {/* Test Details Modal */}
            {showDetails && selectedTest && (
                <div className="test-details-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Test Details</h2>
                            <button className="close-btn" onClick={() => setShowDetails(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>Patient Information</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Name:</label>
                                        <span>{selectedTest.patientName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Phone:</label>
                                        <span>{selectedTest.patientPhone}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Age:</label>
                                        <span>{selectedTest.patientAge}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Gender:</label>
                                        <span>{selectedTest.patientGender}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="detail-section">
                                <h3>Test Information</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Test Name:</label>
                                        <span>{selectedTest.testName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Category:</label>
                                        <span>{getTestCategory(selectedTest.testName)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Price:</label>
                                        <span>${selectedTest.price.toFixed(2)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Status:</label>
                                        <span className={`status-badge ${statusColors[selectedTest.status]}`}>
                                            {selectedTest.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="detail-section">
                                <h3>Timeline</h3>
                                <div className="timeline">
                                    <div className="timeline-item">
                                        <div className="timeline-date">
                                            {new Date(selectedTest.createdAt).toLocaleString()}
                                        </div>
                                        <div className="timeline-event">
                                            Test Registered
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tests;
