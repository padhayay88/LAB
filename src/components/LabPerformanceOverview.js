import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import './Analytics.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const LabPerformanceOverview = () => {
    const [analyticsData, setAnalyticsData] = useState({
        testsByMonth: [],
        revenueByMonth: [],
        patientCount: 0,
        testCount: 0,
        reportCount: 0,
        appointmentCount: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchAnalyticsData = useCallback(async () => {
        try {
            const [testsRes, reportsRes, patientsRes, appointmentsRes, financeRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/tests`),
                axios.get(`${process.env.REACT_APP_API_URL}/reports`),
                axios.get(`${process.env.REACT_APP_API_URL}/patients`),
                axios.get(`${process.env.REACT_APP_API_URL}/appointments`),
                axios.get(`${process.env.REACT_APP_API_URL}/finance`)
            ]);

            // Process tests by month
            const testsByMonth = processTestsByMonth(testsRes.data);
            const revenueByMonth = processRevenueByMonth(financeRes.data);

            setAnalyticsData({
                testsByMonth,
                revenueByMonth,
                patientCount: patientsRes.data.length,
                testCount: testsRes.data.length,
                reportCount: reportsRes.data.length,
                appointmentCount: appointmentsRes.data.length
            });
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

// eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    const processTestsByMonth = (tests) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const monthlyCounts = new Array(12).fill(0);

        tests.forEach(test => {
            const testDate = new Date(test.createdAt);
            if (testDate.getFullYear() === currentYear) {
                monthlyCounts[testDate.getMonth()]++;
            }
        });

        return {
            labels: months,
            datasets: [{
                label: 'Tests',
                data: monthlyCounts,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }]
        };
    };

    const processRevenueByMonth = (finances) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = new Array(12).fill(0);

        finances.forEach(record => {
            if (record.transactionType === 'Income') {
                const recordDate = new Date(record.date);
                if (recordDate.getFullYear() === currentYear) {
                    monthlyRevenue[recordDate.getMonth()] += parseFloat(record.amount);
                }
            }
        });

        return {
            labels: months,
            datasets: [{
                label: 'Revenue ($)',
                data: monthlyRevenue,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
            }]
        };
    };

    const reportStatusData = {
        labels: ['Pending', 'Completed', 'Reviewed'],
        datasets: [{
            data: [
                analyticsData.reportCount * 0.3, // Assuming 30% pending
                analyticsData.reportCount * 0.6, // Assuming 60% completed
                analyticsData.reportCount * 0.1  // Assuming 10% reviewed
            ],
            backgroundColor: [
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
            ],
            borderColor: [
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
        }]
    };

    if (loading) {
        return <div className="analytics"><h1>Lab Performance Overview</h1><p>Loading analytics data...</p></div>;
    }

    return (
        <div className="analytics">
            <h1>Lab Performance Overview</h1>

            <div className="stats-overview">
                <div className="stat-card">
                    <h3>Total Patients</h3>
                    <p>{analyticsData.patientCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Tests</h3>
                    <p>{analyticsData.testCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Reports</h3>
                    <p>{analyticsData.reportCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Appointments</h3>
                    <p>{analyticsData.appointmentCount}</p>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart">
                    <h2>Tests by Month</h2>
                    <Bar data={analyticsData.testsByMonth} />
                </div>

                <div className="chart">
                    <h2>Revenue by Month</h2>
                    <Line data={analyticsData.revenueByMonth} />
                </div>

                <div className="chart">
                    <h2>Report Status Distribution</h2>
                    <Pie data={reportStatusData} />
                </div>
            </div>
        </div>
    );
};

export default LabPerformanceOverview;
