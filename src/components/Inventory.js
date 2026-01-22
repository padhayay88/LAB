import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Inventory.css';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        itemName: '',
        quantity: '',
        supplier: '',
        expiryDate: '',
        price: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/inventory`);
            setInventory(response.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
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
            if (editingItem) {
                await axios.put(`${process.env.REACT_APP_API_URL}/inventory/${editingItem._id}`, formData);
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL}/inventory`, formData);
            }
            fetchInventory();
            setShowForm(false);
            setEditingItem(null);
            setFormData({
                itemName: '',
                quantity: '',
                supplier: '',
                expiryDate: '',
                price: ''
            });
        } catch (error) {
            console.error('Error saving inventory item:', error);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            itemName: item.itemName,
            quantity: item.quantity,
            supplier: item.supplier,
            expiryDate: item.expiryDate,
            price: item.price
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this inventory item?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/inventory/${id}`);
                fetchInventory();
            } catch (error) {
                console.error('Error deleting inventory item:', error);
            }
        }
    };

    return (
        <div className="inventory">
            <h1>Inventory</h1>
            <button onClick={() => setShowForm(true)}>Add Inventory Item</button>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="inventory-form">
                    <h2>{editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</h2>
                    <input
                        type="text"
                        name="itemName"
                        placeholder="Item Name"
                        value={formData.itemName}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="number"
                        name="quantity"
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="supplier"
                        placeholder="Supplier"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                    />
                    <button type="submit">{editingItem ? 'Update' : 'Add'}</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); }}>Cancel</button>
                </form>
            )}

            {/* Inventory List */}
            <div className="inventory-list">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    inventory.map((item) => (
                        <div key={item._id} className="inventory-card">
                            <h3>{item.itemName}</h3>
                            <p>Quantity: {item.quantity}</p>
                            <p>Supplier: {item.supplier}</p>
                            <p>Expiry Date: {new Date(item.expiryDate).toLocaleDateString()}</p>
                            <p>Price: ${item.price}</p>
                            <button onClick={() => handleEdit(item)}>Edit</button>
                            <button onClick={() => handleDelete(item._id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Inventory;
