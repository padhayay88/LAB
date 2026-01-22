import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css'; // Make sure to create/update this CSS file

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalTests: 0,
        pendingReports: 0,
        todaysAppointments: 0,
        monthlyRevenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [patientsRes, testsRes, reportsRes, appointmentsRes, financeRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/patients`),
                    axios.get(`${process.env.REACT_APP_API_URL}/tests`),
                    axios.get(`${process.env.REACT_APP_API_URL}/reports`),
                    axios.get(`${process.env.REACT_APP_API_URL}/appointments`),
                    axios.get(`${process.env.REACT_APP_API_URL}/finance`)
                ]);

                // Today's Appointments
                const today = new Date().toISOString().split('T')[0];
                const todaysAppointments = appointmentsRes.data.filter(app => app.date === today).length;

                // Pending Reports
                const pendingReports = reportsRes.data.filter(report => report.status === 'Pending').length;

                // Monthly Revenue
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const monthlyRevenue = financeRes.data
                    .filter(record => {
                        const recordDate = new Date(record.date);
                        return record.transactionType === 'Income' &&
                               recordDate.getMonth() === currentMonth &&
                               recordDate.getFullYear() === currentYear;
                    })
                    .reduce((sum, record) => sum + parseFloat(record.amount), 0);

                setStats({
                    totalPatients: patientsRes.data.length,
                    totalTests: testsRes.data.length,
                    pendingReports,
                    todaysAppointments,
                    monthlyRevenue,
                });
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
            {loading ? (
                <p>Loading dashboard...</p>
            ) : (
                <div className="stats-overview">
                    <div className="stat-card green">
                        <h3>Total Patients</h3>
                        <p>{stats.totalPatients}</p>
                    </div>
                    <div className="stat-card green">
                        <h3>Total Tests</h3>
                        <p>{stats.totalTests}</p>
                    </div>
                    <div className="stat-card yellow">
                        <h3>Pending Reports</h3>
                        <p>{stats.pendingReports}</p>
                    </div>
                    <div className="stat-card green">
                        <h3>Today's Appointments</h3>
                        <p>{stats.todaysAppointments}</p>
                    </div>
                    <div className="stat-card green">
                        <h3>Monthly Revenue</h3>
                        <p>${stats.monthlyRevenue.toFixed(2)}</p>
                    </div>
                </div>
            )}
            {/* Future charts will go here */}
        </div>
    );
};

export default Dashboard;