import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import './LabPerformanceOverview.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const LabPerformanceOverview = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/analytics/summary`);
                setAnalytics(response.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const formatChartData = (data, label, labels, type = 'bar') => {
        const chartData = {
            labels,
            datasets: [{
                label,
                data,
                backgroundColor: type === 'line' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                tension: type === 'line' ? 0.1 : 0,
            }]
        };
        return chartData;
    };

    if (loading) return <p>Loading analytics...</p>;
    if (!analytics) return <p>No analytics data found.</p>;

    const dailyTestChartData = formatChartData(
        analytics.charts.dailyTestCounts.map(d => d.count),
        'Tests per Day',
        analytics.charts.dailyTestCounts.map(d => d._id)
    );

    const monthlyReportChartData = formatChartData(
        analytics.charts.monthlyReportCounts.map(d => d.count),
        'Reports per Month',
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, analytics.charts.monthlyReportCounts.length)
    );

    const revenueTrendChartData = formatChartData(
        analytics.charts.revenueTrends.map(d => d.total),
        'Revenue per Month',
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, analytics.charts.revenueTrends.length),
        'line'
    );

    return (
        <div className="analytics-page">
            <h1>Lab Performance Overview</h1>
            <div className="stats-grid">
                <div className="stat-card"><h3>Daily Patients</h3><p>{analytics.daily.patients}</p></div>
                <div className="stat-card"><h3>Daily Tests</h3><p>{analytics.daily.tests}</p></div>
                <div className="stat-card"><h3>Daily Revenue</h3><p>${analytics.daily.revenue.toFixed(2)}</p></div>
                <div className="stat-card"><h3>Monthly Patients</h3><p>{analytics.monthly.patients}</p></div>
                <div className="stat-card"><h3>Monthly Tests</h3><p>{analytics.monthly.tests}</p></div>
                <div className="stat-card"><h3>Monthly Revenue</h3><p>${analytics.monthly.revenue.toFixed(2)}</p></div>
            </div>
            <div className="charts-grid">
                <div className="chart-container"><h2>Daily Tests (Last 7 Days)</h2><Bar data={dailyTestChartData} /></div>
                <div className="chart-container"><h2>Monthly Reports</h2><Bar data={monthlyReportChartData} /></div>
                <div className="chart-container"><h2>Monthly Revenue Trends</h2><Line data={revenueTrendChartData} /></div>
            </div>
        </div>
    );
};

export default LabPerformanceOverview;
