import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Billing.css';

const Billing = () => {
    const [finances, setFinances] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingFinance, setEditingFinance] = useState(null);
    const [formData, setFormData] = useState({
        transactionType: 'Income',
        amount: '',
        description: '',
        date: '',
        category: '',
        patientId: '',
        appointmentId: '',
        invoiceId: '',
        paymentMethod: '',
        transactionId: '',
        dueDate: '',
        paidDate: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFinances();
    }, []);

    const fetchFinances = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/finance`);
            setFinances(response.data);
        } catch (error) {
            console.error('Error fetching finances:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingFinance) {
                await axios.put(`${process.env.REACT_APP_API_URL}/finance/${editingFinance._id}`, formData);
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL}/finance`, formData);
            }
            fetchFinances();
            setShowForm(false);
            setEditingFinance(null);
            setFormData({
                transactionType: 'Income',
                amount: '',
                description: '',
                date: '',
                patientId: ''
            });
        } catch (error) {
            console.error('Error saving finance record:', error);
        }
    };

    const handleEdit = (finance) => {
        setEditingFinance(finance);
        setFormData({
            transactionType: finance.transactionType,
            amount: finance.amount,
            description: finance.description,
            date: finance.date,
            category: finance.category,
            patientId: finance.patientId,
            appointmentId: finance.appointmentId,
            invoiceId: finance.invoiceId,
            paymentMethod: finance.paymentMethod,
            transactionId: finance.transactionId,
            dueDate: finance.dueDate,
            paidDate: finance.paidDate
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this finance record?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/finance/${id}`);
                fetchFinances();
            } catch (error) {
                console.error('Error deleting finance record:', error);
            }
        }
    };

    return (
        <div className="billing">
            <h1>Billing</h1>
            <button onClick={() => setShowForm(true)}>Add Finance Record</button>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="billing-form">
                    <h2>{editingFinance ? 'Edit Finance Record' : 'Add Finance Record'}</h2>
                    <select
                        name="transactionType"
                        value={formData.transactionType}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                    </select>
                    <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="patientId"
                        placeholder="Patient ID"
                        value={formData.patientId}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="appointmentId"
                        placeholder="Appointment ID"
                        value={formData.appointmentId}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="invoiceId"
                        placeholder="Invoice ID"
                        value={formData.invoiceId}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="paymentMethod"
                        placeholder="Payment Method"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="transactionId"
                        placeholder="Transaction ID"
                        value={formData.transactionId}
                        onChange={handleInputChange}
                    />
                    <input
                        type="date"
                        name="dueDate"
                        placeholder="Due Date"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                    />
                    <input
                        type="date"
                        name="paidDate"
                        placeholder="Paid Date"
                        value={formData.paidDate}
                        onChange={handleInputChange}
                    />
                    <button type="submit">{editingFinance ? 'Update' : 'Add'}</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditingFinance(null); }}>Cancel</button>
                </form>
            )}

            {/* Finance List */}
            <div className="billing-list">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    finances.map((finance) => (
                        <div key={finance._id} className={`billing-card ${finance.transactionType === 'Income' ? 'income' : 'expense'}`}>
                            <h3>{finance.transactionType}</h3>
                            <p>Amount: ${finance.amount}</p>
                            <p>Description: {finance.description}</p>
                            <p>Date: {new Date(finance.date).toLocaleDateString()}</p>
                            <p>Category: {finance.category}</p>
                            <p>Patient ID: {finance.patientId}</p>
                            <p>Appointment ID: {finance.appointmentId}</p>
                            <p>Invoice ID: {finance.invoiceId}</p>
                            <p>Payment Method: {finance.paymentMethod}</p>
                            <p>Transaction ID: {finance.transactionId}</p>
                            <p>Due Date: {finance.dueDate ? new Date(finance.dueDate).toLocaleDateString() : 'N/A'}</p>
                            <p>Paid Date: {finance.paidDate ? new Date(finance.paidDate).toLocaleDateString() : 'N/A'}</p>
                            <button onClick={() => handleEdit(finance)}>Edit</button>
                            <button onClick={() => handleDelete(finance._id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Billing;
