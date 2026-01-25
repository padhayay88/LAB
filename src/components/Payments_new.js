import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        setLoading(true);
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
                const paymentDate = new Date(payment.createdAt).toLocaleDateString();
                return paymentDate === new Date(filters.date).toLocaleDateString();
            });
        }
        
        if (filters.patient) {
            filtered = filtered.filter(payment => 
                payment.patientId && 
                payment.patientName && 
                payment.patientName.toLowerCase().includes(filters.patient.toLowerCase())
            );
        }
        setFilteredPayments(filtered);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleViewDetails = (payment) => {
        navigate(`/patient/${payment.patientId._id}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'Completed': return 'status-completed';
            case 'Failed': return 'status-failed';
            default: return 'status-pending';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getPaymentStats = () => {
        const stats = {
            total: payments.length,
            pending: payments.filter(p => p.status === 'Pending').length,
            completed: payments.filter(p => p.status === 'Completed').length,
            failed: payments.filter(p => p.status === 'Failed').length,
            totalRevenue: payments
                .filter(p => p.transactionType === 'Income')
                .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
        };
        return stats;
    };

    const stats = getPaymentStats();

    return (
        <div className="payments-page">
            <h1>Payments Management</h1>
            
            {/* Payment Statistics */}
            <div className="payment-stats">
                <div className="stat-card">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">Total Payments</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{stats.pending}</span>
                    <span className="stat-label">Pending</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{stats.completed}</span>
                    <span className="stat-label">Completed</span>
                </div>
                <div className="stat-card revenue">
                    <span className="stat-number">{formatCurrency(stats.totalRevenue)}</span>
                    <span className="stat-label">Total Revenue</span>
                </div>
            </div>

            <div className="filters">
                <div className="filter-group">
                    <label>Status</label>
                    <select 
                        value={filters.status} 
                        onChange={(e) => handleFilterChange(e)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Date</label>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => handleFilterChange(e)}
                    />
                </div>
                <div className="filter-group search-group">
                    <label>Search</label>
                    <input
                        type="text"
                        placeholder="Search by patient name or payment ID..."
                        value={filters.patient}
                        onChange={(e) => handleFilterChange(e)}
                    />
                </div>
            </div>

            <div className="payments-container">
                {loading ? (
                    <div className="loading-spinner">
                        <p>Loading payments...</p>
                    </div>
                ) : (
                    <div className="payments-table-wrapper">
                        <table className="payments-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Amount</th>
                                    <th>Payment Mode</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="no-payments">
                                            <div className="no-payments-content">
                                                <h3>No Payments Found</h3>
                                                <p>Try adjusting your filters or add some payments for patients</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <tr key={payment._id} className="payment-row">
                                            <td className="patient-cell">
                                                <div className="patient-info">
                                                    <div className="patient-name">{payment.patientName}</div>
                                                    <div className="patient-details">
                                                        {payment.patientAge}y, {payment.patientGender} • {payment.patientPhone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="amount-cell">
                                                <span className="amount">{formatCurrency(payment.amount)}</span>
                                            </td>
                                            <td className="mode-cell">
                                                <span className="payment-mode">{payment.paymentMode}</span>
                                            </td>
                                            <td className="date-cell">
                                                {formatDate(payment.createdAt)}
                                            </td>
                                            <td className="status-cell">
                                                <span className={`status-badge ${getStatusColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <button 
                                                    className="action-btn view-btn"
                                                    onClick={() => handleViewDetails(payment)}
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
                )}
            </div>
        </div>
    );
};

export default Payments;
