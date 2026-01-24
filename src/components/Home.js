import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faVial, faFileAlt, faUserMd, faCalendarAlt, faBoxes } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
    const navigate = useNavigate();
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
                    <div className="card" onClick={() => navigate("/patients/new")}>
                        <FontAwesomeIcon icon={faUserPlus} size="2x" />
                        <h3>Register Patient</h3>
                    </div>
                    <div className="card" onClick={() => navigate("/patients")}>
                        <FontAwesomeIcon icon={faVial} size="2x" />
                        <h3>Add Test</h3>
                    </div>
                    <div className="card" onClick={() => navigate("/patients")}>
                        <FontAwesomeIcon icon={faUserMd} size="2x" />
                        <h3>Patients</h3>
                    </div>
                    <div className="card" onClick={() => navigate("/reports")}>
                        <FontAwesomeIcon icon={faFileAlt} size="2x" />
                        <h3>Reports</h3>
                    </div>
                    <div className="card" onClick={() => navigate("/analytics")}>
                        <FontAwesomeIcon icon={faCalendarAlt} size="2x" />
                        <h3>Analytics</h3>
                    </div>
                    <div className="card" onClick={() => navigate("/admin")}>
                        <FontAwesomeIcon icon={faBoxes} size="2x" />
                        <h3>Admin</h3>
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


        </div>
    );
};

export default Home;