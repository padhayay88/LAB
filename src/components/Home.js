import React from 'react';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faVial, faFileAlt, faUserMd, faCalendarAlt, faBoxes } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
    return (
        <div className="home">
            <header className="home-header">
                <h1>Welcome to the Diagnostic Lab Management System</h1>
                <p>Your one-stop solution for managing all diagnostic services efficiently.</p>
                <button className="cta-button">Get Started</button>
            </header>

            {/* Quick Action Cards */}
            <section className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="cards">
                    <div className="card">
                        <FontAwesomeIcon icon={faUserPlus} size="2x" />
                        <h3>Register Patient</h3>
                    </div>
                    <div className="card">
                        <FontAwesomeIcon icon={faVial} size="2x" />
                        <h3>Add Test</h3>
                    </div>
                    <div className="card">
                        <FontAwesomeIcon icon={faFileAlt} size="2x" />
                        <h3>View Reports</h3>
                    </div>
                    <div className="card">
                        <FontAwesomeIcon icon={faUserMd} size="2x" />
                        <h3>Doctors</h3>
                    </div>
                    <div className="card">
                        <FontAwesomeIcon icon={faCalendarAlt} size="2x" />
                        <h3>Appointments</h3>
                    </div>
                    <div className="card">
                        <FontAwesomeIcon icon={faBoxes} size="2x" />
                        <h3>Inventory</h3>
                    </div>
                </div>
            </section>

            {/* System Overview Section */}
            <section className="system-overview">
                <h2>What This System Can Do</h2>
                <ul>
                    <li>Manage all diagnostic tests</li>
                    <li>Store patient records securely</li>
                    <li>Generate digital reports</li>
                    <li>Support doctors & lab staff</li>
                    <li>Works for labs, hospitals & government</li>
                </ul>
            </section>

            {/* Statistics Section */}
            <section className="statistics">
                <h2>Our Achievements</h2>
                <div className="stats">
                    <div className="stat">
                        <h3>🧪 500+</h3>
                        <p>Tests Supported</p>
                    </div>
                    <div className="stat">
                        <h3>👤 10,000+</h3>
                        <p>Patients</p>
                    </div>
                    <div className="stat">
                        <h3>📄 50,000+</h3>
                        <p>Reports Generated</p>
                    </div>
                    <div className="stat">
                        <h3>🏥 Multi-Lab</h3>
                        <p>Support</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;