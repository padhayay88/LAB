import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
    const [stats, setStats] = useState({
        todaysTests: 0,
        pendingSamples: 0,
        revenue: 0,
        lowStockItems: 0,
        operationalMachines: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch tests count
            const testsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/tests`);
            const todaysTests = testsResponse.data.filter(test => {
                const testDate = new Date(test.createdAt);
                const today = new Date();
                return testDate.toDateString() === today.toDateString();
            }).length;

            // Fetch pending reports (assuming status 'Pending')
            const reportsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/reports`);
            const pendingSamples = reportsResponse.data.filter(report => report.status === 'Pending').length;

            // Fetch revenue from finance records
            const financeResponse = await axios.get(`${process.env.REACT_APP_API_URL}/finance`);
            const revenue = financeResponse.data
                .filter(record => record.transactionType === 'Income')
                .reduce((sum, record) => sum + parseFloat(record.amount), 0);

            // Fetch low stock items (assuming quantity < 10 is low)
            const inventoryResponse = await axios.get(`${process.env.REACT_APP_API_URL}/inventory`);
            const lowStockItems = inventoryResponse.data.filter(item => item.quantity < 10).length;

            // For operational machines, we'll simulate this as all machines are operational for now
            const operationalMachines = 5; // This could be fetched from a machines API if available

            setStats({
                todaysTests,
                pendingSamples,
                revenue,
                lowStockItems,
                operationalMachines
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            {loading ? (
                <p>Loading dashboard data...</p>
            ) : (
                <div className="dashboard-cards">
                    <div className="card">
                        <h3>Today's Tests</h3>
                        <p>{stats.todaysTests}</p>
                    </div>
                    <div className="card">
                        <h3>Pending Samples</h3>
                        <p>{stats.pendingSamples}</p>
                    </div>
                    <div className="card">
                        <h3>Revenue Summary</h3>
                        <p>${stats.revenue.toFixed(2)}</p>
                    </div>
                    <div className="card">
                        <h3>Low Stock Alert</h3>
                        <p>{stats.lowStockItems} Items</p>
                    </div>
                    <div className="card">
                        <h3>Machine Status</h3>
                        <p>{stats.operationalMachines} Operational</p>
                    </div>
                </div>
            )}

            <div className="admin-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <button onClick={() => window.location.href = '/patients'}>Manage Patients</button>
                    <button onClick={() => window.location.href = '/tests'}>View Tests</button>
                    <button onClick={() => window.location.href = '/reports'}>Generate Reports</button>
                    <button onClick={() => window.location.href = '/inventory'}>Check Inventory</button>
                    <button onClick={() => window.location.href = '/billing'}>Financial Overview</button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
