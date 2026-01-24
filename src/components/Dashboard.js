import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalPatientsToday: 0,
        totalTestsToday: 0,
        pendingReports: 0,
        completedReports: 0,
        todaysRevenue: 0,
    });
    const [todaysPatients, setTodaysPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [patientsRes, testsRes, reportsRes, financeRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/patients`),
                    axios.get(`${process.env.REACT_APP_API_URL}/tests`),
                    axios.get(`${process.env.REACT_APP_API_URL}/reports`),
                    axios.get(`${process.env.REACT_APP_API_URL}/finance`)
                ]);

                const today = new Date().toISOString().slice(0, 10);

                const todaysPatientsData = patientsRes.data.filter(p => p.registrationDate.slice(0, 10) === today);
                const todaysTestsData = testsRes.data.filter(t => t.createdAt.slice(0, 10) === today);
                const pendingReportsCount = reportsRes.data.filter(r => r.status === 'Pending').length;
                const completedReportsCount = reportsRes.data.filter(r => r.status === 'Completed').length;
                const todaysRevenueData = financeRes.data
                    .filter(f => f.date.slice(0, 10) === today && f.transactionType === 'Income')
                    .reduce((acc, curr) => acc + curr.amount, 0);

                const enrichedPatients = todaysPatientsData.map(patient => {
                    const patientTests = testsRes.data.filter(test => test.patientId === patient._id);
                    const lastTest = patientTests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                    return {
                        ...patient,
                        lastTest: lastTest ? lastTest.testName : 'N/A',
                        status: lastTest ? lastTest.status : 'Registered'
                    };
                });

                setStats({
                    totalPatientsToday: todaysPatientsData.length,
                    totalTestsToday: todaysTestsData.length,
                    pendingReports: pendingReportsCount,
                    completedReports: completedReportsCount,
                    todaysRevenue: todaysRevenueData
                });
                setTodaysPatients(enrichedPatients.sort((a, b) => a.eveningNumber - b.eveningNumber));

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="dashboard">
            <h1>Lab Management Dashboard</h1>
            {loading ? <p>Loading dashboard...</p> : (
                <>
                    <div className="dashboard-cards">
                        <div className="dashboard-card">
                            <h3>Total Patients (Today)</h3>
                            <div className="number">{stats.totalPatientsToday}</div>
                            <div className="subtitle">New registrations</div>
                            <div className="trend up">↑ Active today</div>
                        </div>
                        <div className="dashboard-card">
                            <h3>Total Tests (Today)</h3>
                            <div className="number">{stats.totalTestsToday}</div>
                            <div className="subtitle">Lab tests conducted</div>
                            <div className="trend up">↑ Processing</div>
                        </div>
                        <div className="dashboard-card">
                            <h3>Pending Reports</h3>
                            <div className="number">{stats.pendingReports}</div>
                            <div className="subtitle">Awaiting completion</div>
                            <div className="trend down">↓ To be done</div>
                        </div>
                        <div className="dashboard-card">
                            <h3>Completed Reports</h3>
                            <div className="number">{stats.completedReports}</div>
                            <div className="subtitle">Finished today</div>
                            <div className="trend up">↑ Completed</div>
                        </div>
                        <div className="dashboard-card">
                            <h3>Today's Revenue</h3>
                            <div className="number">${stats.todaysRevenue.toFixed(2)}</div>
                            <div className="subtitle">Total income</div>
                            <div className="trend up">↑ Good day</div>
                        </div>
                    </div>

                    <div className="dashboard-sections">
                        <div className="dashboard-section">
                            <h2>Today's Registered Patients</h2>
                            <div className="patient-list">
                                {todaysPatients.map(patient => (
                                    <div key={patient.patientId} className="patient-item">
                                        <div className="patient-info">
                                            <div className="patient-name">{patient.name}</div>
                                            <div className="patient-details">
                                                #{patient.eveningNumber} • {patient.phone} • {patient.lastTest}
                                            </div>
                                        </div>
                                        <div className="patient-actions">
                                            <Link to={`/patient/${patient._id}`} className="btn-small btn-primary">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="dashboard-section">
                            <h2>Quick Actions</h2>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                <Link to="/patients/new" className="btn-small btn-primary" style={{padding: '1rem', textAlign: 'center'}}>
                                    Register New Patient
                                </Link>
                                <Link to="/patients" className="btn-small btn-primary" style={{padding: '1rem', textAlign: 'center'}}>
                                    View All Patients
                                </Link>
                                <Link to="/reports" className="btn-small btn-primary" style={{padding: '1rem', textAlign: 'center'}}>
                                    Manage Reports
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;