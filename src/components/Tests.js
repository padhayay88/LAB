import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Tests.css';

const Tests = () => {
    const [tests, setTests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    const [formData, setFormData] = useState({
        testName: '',
        description: '',
        price: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5001/api/tests');
            setTests(response.data);
        } catch (error) {
            console.error('Error fetching tests:', error);
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
        const data = {
            ...formData,
            price: parseFloat(formData.price)
        };

        try {
            if (editingTest) {
                await axios.put(`http://localhost:5001/api/tests/${editingTest._id}`, data);
            } else {
                await axios.post('http://localhost:5001/api/tests', data);
            }
            fetchTests();
            setShowForm(false);
            setEditingTest(null);
            setFormData({
                testName: '',
                description: '',
                price: ''
            });
        } catch (error) {
            console.error('Error saving test:', error);
        }
    };

    const handleEdit = (test) => {
        setEditingTest(test);
        setFormData({
            testName: test.testName,
            description: test.description,
            price: test.price.toString()
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this test?')) {
            try {
                await axios.delete(`http://localhost:5001/api/tests/${id}`);
                fetchTests();
            } catch (error) {
                console.error('Error deleting test:', error);
            }
        }
    };

    return (
        <div className="tests">
            <h1>Tests</h1>
            <button onClick={() => setShowForm(true)}>Add Test</button>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="test-form">
                    <h2>{editingTest ? 'Edit Test' : 'Add Test'}</h2>
                    <input
                        type="text"
                        name="testName"
                        placeholder="Test Name"
                        value={formData.testName}
                        onChange={handleInputChange}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                    />
                    <button type="submit">{editingTest ? 'Update' : 'Add'}</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditingTest(null); }}>Cancel</button>
                </form>
            )}

            {/* Test List */}
            <div className="test-list">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    tests.map((test) => (
                        <div key={test._id} className="test-card">
                            <h3>{test.testName}</h3>
                            <p>Description: {test.description}</p>
                            <p>Price: ${test.price}</p>
                            <button onClick={() => handleEdit(test)}>Edit</button>
                            <button onClick={() => handleDelete(test._id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Tests;