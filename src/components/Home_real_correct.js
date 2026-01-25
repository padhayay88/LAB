import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faVial, faFileAlt, faUserMd, faChartLine, faCog, faUsers, faFlask, faClipboardList, faIndianRupeeSign, faCalendarAlt, faBoxes } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayPatients: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        pendingReports: 0,
        activeTests: 0
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            console.log('Fetching dashboard stats from MongoDB...');
            console.log('API URL:', process.env.REACT_APP_API_URL);
            
            // Only use MongoDB backend
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard/summary`);
            console.log('MongoDB Dashboard API response:', response.data);
            
            if (response.data.success) {
                const data = response.data.data;
                const newStats = {
                    totalPatients: data.summary.totalPatients,
                    todayPatients: data.summary.todayPatients,
                    totalRevenue: data.summary.todayRevenue,
                    todayRevenue: data.summary.todayRevenue,
                    pendingReports: data.summary.pendingReports,
                    activeTests: data.summary.pendingReports
                };
                
                console.log('MongoDB stats calculated:', newStats);
                setStats(newStats);
            } else {
                throw new Error(response.data.message || 'Failed to fetch dashboard data');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            console.error('Error details:', error.response?.data);
            
            // Check if it's just empty database
            if (error.response?.status === 200 && (!error.response.data.data || error.response.data.data.summary.totalPatients === 0)) {
                setMessage('📋 Database is empty. Register your first patient to get started!');
            } else {
                setMessage('❌ Unable to connect to database. Please check if backend is running.');
            }
            
            // Set default values if API fails or database is empty
            setStats({
                totalPatients: 0,
                todayPatients: 0,
                totalRevenue: 0,
                todayRevenue: 0,
                pendingReports: 0,
                activeTests: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="home">
            {/* Error Message */}
            {message && (
                <div className="info-message" style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: message.includes('❌') ? '#e74c3c' : '#3498db',
                    color: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    maxWidth: '400px',
                    fontSize: '0.9rem'
                }}>
                    {message}
                    <button 
                        onClick={() => setMessage('')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.2rem',
                            marginLeft: '1rem',
                            cursor: 'pointer',
                            float: 'right'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Hero Section */}
            <header className="home-header">
                <div className="hero-content">
                    <h1>🏥 LabHub Diagnostic Center</h1>
                    <p>Advanced Diagnostic Lab Management System for Modern Healthcare</p>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="stat-number">{loading ? '...' : stats.totalPatients}</span>
                            <span className="stat-label">Total Patients</span>
                        </div>
                        <div className="hero-stat">
                            <span className="stat-number">{loading ? '...' : stats.todayPatients}</span>
                            <span className="stat-label">Today</span>
                        </div>
                        <div className="hero-stat">
                            <span className="stat-number">{loading ? '...' : formatCurrency(stats.todayRevenue)}</span>
                            <span className="stat-label">Today's Revenue</span>
                        </div>
                    </div>
                    <button className="cta-button" onClick={() => navigate("/dashboard")}>
                        Go to Dashboard
                    </button>
                </div>
            </header>

            {/* Real-time Statistics */}
            <section className="real-time-stats">
                <h2>📊 Live Statistics</h2>
                <div className="stats-grid">
                    <div className="stat-card revenue">
                        <div className="stat-icon">
                            <FontAwesomeIcon icon={faIndianRupeeSign} />
                        </div>
                        <div className="stat-info">
                            <h3>{loading ? '...' : formatCurrency(stats.totalRevenue)}</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>
                    <div className="stat-card patients">
                        <div className="stat-icon">
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <div className="stat-info">
                            <h3>{loading ? '...' : stats.totalPatients}</h3>
                            <p>Total Patients</p>
                        </div>
                    </div>
                    <div className="stat-card tests">
                        <div className="stat-icon">
                            <FontAwesomeIcon icon={faFlask} />
                        </div>
                        <div className="stat-info">
                            <h3>{loading ? '...' : stats.activeTests}</h3>
                            <p>Active Tests</p>
                        </div>
                    </div>
                    <div className="stat-card reports">
                        <div className="stat-icon">
                            <FontAwesomeIcon icon={faClipboardList} />
                        </div>
                        <div className="stat-info">
                            <h3>{loading ? '...' : stats.pendingReports}</h3>
                            <p>Pending Reports</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions">
                <h2>⚡ Quick Actions</h2>
                <div className="cards">
                    <div className="card" onClick={() => navigate("/patients/new")}>
                        <FontAwesomeIcon icon={faUserPlus} size="2x" />
                        <h3>Register Patient</h3>
                        <p>Add new patient with complete medical history</p>
                    </div>
                    <div className="card" onClick={() => navigate("/patient-queue")}>
                        <FontAwesomeIcon icon={faUsers} size="2x" />
                        <h3>Patient Queue</h3>
                        <p>Manage today's patient queue with tokens</p>
                    </div>
                    <div className="card" onClick={() => navigate("/tests")}>
                        <FontAwesomeIcon icon={faVial} size="2x" />
                        <h3>Test Management</h3>
                        <p>Manage lab tests and track progress</p>
                    </div>
                    <div className="card" onClick={() => navigate("/reports")}>
                        <FontAwesomeIcon icon={faFileAlt} size="2x" />
                        <h3>Reports</h3>
                        <p>Generate and manage diagnostic reports</p>
                    </div>
                    <div className="card" onClick={() => navigate("/payments")}>
                        <FontAwesomeIcon icon={faIndianRupeeSign} size="2x" />
                        <h3>Payments</h3>
                        <p>Track payments and financial records</p>
                    </div>
                    <div className="card" onClick={() => navigate("/analytics")}>
                        <FontAwesomeIcon icon={faChartLine} size="2x" />
                        <h3>Analytics</h3>
                        <p>View business insights and reports</p>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services">
                <h2>🔬 Our Diagnostic Services</h2>
                <div className="services-grid">
                    <div className="service-card">
                        <h3>🩸 Blood Tests</h3>
                        <p>Complete Blood Count, Blood Sugar, Lipid Profile, Liver Function, Kidney Function, Thyroid Profile</p>
                        <span className="price">Starting from ₹250</span>
                    </div>
                    <div className="service-card">
                        <h3>🧪 Urine Tests</h3>
                        <p>Routine Urine, Urine Culture, 24-Hour Protein, Microalbumin, Drug Testing</p>
                        <span className="price">Starting from ₹150</span>
                    </div>
                    <div className="service-card">
                        <h3>📷 Imaging Services</h3>
                        <p>X-Ray, CT Scan, MRI, Ultrasound, Digital X-Ray, Contrast Studies</p>
                        <span className="price">Starting from ₹500</span>
                    </div>
                    <div className="service-card">
                        <h3>❤️ Cardiac Tests</h3>
                        <p>ECG, Echocardiogram, Stress Test, Holter Monitor, TMT</p>
                        <span className="price">Starting from ₹300</span>
                    </div>
                    <div className="service-card">
                        <h3>🔬 Pathology</h3>
                        <p>Biopsy, Pap Smear, FNAC, Histopathology, Cytology</p>
                        <span className="price">Starting from ₹400</span>
                    </div>
                    <div className="service-card">
                        <h3>🧬 Specialized Tests</h3>
                        <p>Allergy Testing, Hormone Tests, Genetic Testing, COVID-19 Testing</p>
                        <span className="price">Starting from ₹600</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <h2>🚀 Why Choose LabHub?</h2>
                <div className="features-grid">
                    <div className="feature">
                        <h3>⚡ Fast Results</h3>
                        <p>Get your test reports within 24-48 hours for most tests</p>
                    </div>
                    <div className="feature">
                        <h3>🔒 Secure Data</h3>
                        <p>Your medical records are encrypted and stored securely</p>
                    </div>
                    <div className="feature">
                        <h3>👨‍⚕️ Expert Staff</h3>
                        <p>Experienced lab technicians and pathologists</p>
                    </div>
                    <div className="feature">
                        <h3>💰 Affordable Pricing</h3>
                        <p>Competitive pricing with no hidden charges</p>
                    </div>
                    <div className="feature">
                        <h3>📱 Digital Reports</h3>
                        <p>Access your reports online anytime, anywhere</p>
                    </div>
                    <div className="feature">
                        <h3>🏥 NABL Accredited</h3>
                        <p>Nationally accredited laboratory with quality standards</p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="contact">
                <h2>📞 Get in Touch</h2>
                <div className="contact-info">
                    <div className="contact-item">
                        <h3>📍 Address</h3>
                        <p>123 Medical Complex, MG Road, Bangalore, Karnataka 560001</p>
                    </div>
                    <div className="contact-item">
                        <h3>📞 Phone</h3>
                        <p>+91 80 1234 5678 | +91 80 8765 4321</p>
                    </div>
                    <div className="contact-item">
                        <h3>📧 Email</h3>
                        <p>info@labhubdiagnostics.com | support@labhubdiagnostics.com</p>
                    </div>
                    <div className="contact-item">
                        <h3>⏰ Working Hours</h3>
                        <p>Mon-Sat: 7:00 AM - 9:00 PM | Sunday: 8:00 AM - 2:00 PM</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
