import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Payments.css';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [filters, setFilters] = useState({ status: 'All', date: '', patient: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        filterPayments();
    }, [filters, payments]);

    const fetchPayments = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/payments`);
            console.log('Fetched payments:', response.data);
            
            const enrichedPayments = await Promise.all(response.data.map(async (payment) => {
                try {
                    const patientResponse = await axios.get(`${process.env.REACT_APP_API_URL}/patients/${payment.patientId}`);
                    return { 
                        ...payment, 
                        patientName: patientResponse.data.name,
                        patientPhone: patientResponse.data.phone,
                        patientAge: patientResponse.data.age,
                        patientGender: patientResponse.data.gender
                    };
                } catch {
                    return { 
                        ...payment, 
                        patientName: 'Unknown Patient',
                        patientPhone: 'N/A',
                        patientAge: 'N/A',
                        patientGender: 'N/A'
                    };
                }
            }));
            setPayments(enrichedPayments);
            setFilteredPayments(enrichedPayments);
            console.log('Enriched payments:', enrichedPayments);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPayments = () => {
        let filtered = payments;
        
        if (filters.status !== 'All') {
            filtered = filtered.filter(payment => payment.status === filters.status);
        }
        
        if (filters.date) {
            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.createdAt).toDateString();
                const filterDate = new Date(filters.date).toDateString();
                return paymentDate === filterDate;
            });
        }
        
        if (filters.patient) {
            filtered = filtered.filter(payment => 
                payment.patientName.toLowerCase().includes(filters.patient.toLowerCase())
            );
        }
        
        setFilteredPayments(filtered);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'status-paid';
            case 'Pending': return 'status-pending';
            case 'Overdue': return 'status-overdue';
            default: return 'status-pending';
        }
    };

    const calculateTotals = () => {
        const today = new Date().toDateString();
        const todayPayments = payments.filter(payment => 
            new Date(payment.createdAt).toDateString() === today
        );
        
        const totalRevenue = payments
            .filter(p => p.transactionType === 'Income')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
            
        const pendingAmount = payments
            .filter(p => p.status === 'Pending')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        return {
            todayCollection: todayPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
            totalRevenue,
            pendingAmount
        };
    };

    if (loading) {
        return (
            <div className="payments-page">
                <div className="loading-spinner">
                    <p>Loading payments...</p>
                </div>
            </div>
        );
    }

    const totals = calculateTotals();

    return (
        <div className="payments-page">
            <div className="payments-header">
                <h1>Payments & Billing</h1>
                <div className="payments-stats">
                    <div className="stat-card">
                        <span className="stat-number">${totals.todayCollection.toFixed(2)}</span>
                        <span className="stat-label">Today's Collection</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">${totals.totalRevenue.toFixed(2)}</span>
                        <span className="stat-label">Total Revenue</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">${totals.pendingAmount.toFixed(2)}</span>
                        <span className="stat-label">Pending Amount</span>
                    </div>
                </div>
            </div>

            <div className="filters-section">
                <div className="filter-container">
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="All">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                    <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
                    <input type="text" name="patient" value={filters.patient} onChange={handleFilterChange} placeholder="Search by patient name..." />
                </div>
            </div>

            <div className="payments-container">
                <div className="payments-table-wrapper">
                    <table className="payments-table">
                        <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Amount</th>
                                <th>Payment Mode</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((payment) => (
                                <tr key={payment._id} className="payment-row">
                                    <td className="patient-name-cell">{payment.patientName}</td>
                                    <td className="amount-cell">${payment.amount}</td>
                                    <td className="payment-mode-cell">{payment.paymentMode}</td>
                                    <td className="date-cell">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                    <td className="status-cell">
                                        <span className={`status-badge ${getStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className="action-btn view-btn"
                                            onClick={() => window.location.href = `/patient/${payment.patientId}`}
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

export default Payments;
