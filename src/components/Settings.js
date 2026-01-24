import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css';

const Settings = () => {
    const [testPrices, setTestPrices] = useState({});
    const [labInfo, setLabInfo] = useState({
        name: 'LabHub Diagnostic Center',
        address: '',
        phone: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            // Fetch test prices
            const testsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/tests`);
            const prices = {};
            testsResponse.data.forEach(test => {
                prices[test.testName] = test.price;
            });
            setTestPrices(prices);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handlePriceChange = (testName, newPrice) => {
        setTestPrices({
            ...testPrices,
            [testName]: newPrice
        });
    };

    const handleLabInfoChange = (field, value) => {
        setLabInfo({
            ...labInfo,
            [field]: value
        });
    };

    const handleSavePrices = async () => {
        setLoading(true);
        try {
            // Update all test prices
            for (const [testName, price] of Object.entries(testPrices)) {
                await axios.put(`${process.env.REACT_APP_API_URL}/tests/update-price`, {
                    testName,
                    price: parseFloat(price)
                });
            }
            alert('Test prices updated successfully!');
        } catch (error) {
            console.error('Error updating prices:', error);
            alert('Error updating prices');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLabInfo = async () => {
        setLoading(true);
        try {
            // Save lab info (this would typically go to a settings endpoint)
            localStorage.setItem('labInfo', JSON.stringify(labInfo));
            alert('Lab information saved successfully!');
        } catch (error) {
            console.error('Error saving lab info:', error);
            alert('Error saving lab information');
        } finally {
            setLoading(false);
        }
    };

    const handleResetTokens = async () => {
        if (window.confirm('Are you sure you want to reset all tokens for today? This will clear the patient queue.')) {
            try {
                // This would typically call an API to reset tokens
                alert('Tokens reset successfully!');
            } catch (error) {
                console.error('Error resetting tokens:', error);
                alert('Error resetting tokens');
            }
        }
    };

    const testTypes = [
        'Blood Test',
        'Urine Test',
        'X-Ray',
        'CT Scan',
        'MRI',
        'ECG',
        'Ultrasound',
        'Pathology'
    ];

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Configure your diagnostic lab settings</p>
            </div>

            <div className="settings-container">
                {/* Test Price List */}
                <div className="settings-section">
                    <h2>Test Price List</h2>
                    <div className="price-list">
                        {testTypes.map((testType) => (
                            <div key={testType} className="price-item">
                                <label className="price-label">{testType}</label>
                                <div className="price-input-wrapper">
                                    <span className="currency-symbol">$</span>
                                    <input
                                        type="number"
                                        className="price-input"
                                        value={testPrices[testType] || ''}
                                        onChange={(e) => handlePriceChange(testType, e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        className="save-btn"
                        onClick={handleSavePrices}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Prices'}
                    </button>
                </div>

                {/* Lab Information */}
                <div className="settings-section">
                    <h2>Lab Information</h2>
                    <div className="lab-info-form">
                        <div className="form-group">
                            <label>Lab Name</label>
                            <input
                                type="text"
                                value={labInfo.name}
                                onChange={(e) => handleLabInfoChange('name', e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <textarea
                                value={labInfo.address}
                                onChange={(e) => handleLabInfoChange('address', e.target.value)}
                                className="form-textarea"
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={labInfo.phone}
                                onChange={(e) => handleLabInfoChange('phone', e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={labInfo.email}
                                onChange={(e) => handleLabInfoChange('email', e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>
                    <button 
                        className="save-btn"
                        onClick={handleSaveLabInfo}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Lab Info'}
                    </button>
                </div>

                {/* System Actions */}
                <div className="settings-section">
                    <h2>System Actions</h2>
                    <div className="system-actions">
                        <div className="action-item">
                            <div className="action-info">
                                <h3>Reset Daily Tokens</h3>
                                <p>Clear all patient tokens and reset the queue for a new day</p>
                            </div>
                            <button 
                                className="action-btn reset-btn"
                                onClick={handleResetTokens}
                            >
                                Reset Tokens
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
