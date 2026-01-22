import React from 'react';
import { Bar } from 'react-chartjs-2';
import './Dashboard.css';

const Dashboard = () => {
    const data = {
        labels: ['Patients', 'Tests', 'Reports', 'Appointments', 'Inventory'],
        datasets: [
            {
                label: 'Statistics',
                data: [50, 120, 80, 30, 60],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Pathology Dashboard Statistics',
            },
        },
    };

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <Bar data={data} options={options} />
        </div>
    );
};

export default Dashboard;