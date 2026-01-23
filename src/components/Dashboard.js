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
            <h1>Dashboard</h1>
            {loading ? <p>Loading dashboard...</p> : (
                <>
                    <div className="stats-overview">
                        <div className="stat-card"><h3>Total Patients (Today)</h3><p>{stats.totalPatientsToday}</p></div>
                        <div className="stat-card"><h3>Total Tests (Today)</h3><p>{stats.totalTestsToday}</p></div>
                        <div className="stat-card"><h3>Pending Reports</h3><p>{stats.pendingReports}</p></div>
                        <div className="stat-card"><h3>Completed Reports</h3><p>{stats.completedReports}</p></div>
                        <div className="stat-card"><h3>Today’s Revenue</h3><p>${stats.todaysRevenue.toFixed(2)}</p></div>
                    </div>

                    <div className="todays-patients">
                        <h2>Today's Registered Patients</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Evening Number</th>
                                    <th>Patient Name</th>
                                    <th>Phone Number</th>
                                    <th>Last Test</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todaysPatients.map(patient => (
                                    <tr key={patient.patientId}>
                                        <td>{patient.eveningNumber}</td>
                                        <td><Link to={`/patient/${patient._id}`}>{patient.name}</Link></td>
                                        <td>{patient.phone}</td>
                                        <td>{patient.lastTest}</td>
                                        <td>{patient.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;