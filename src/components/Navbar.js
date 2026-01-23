import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onLogout }) => {
    return (
        <nav className="navbar">
            <div className="navbar-logo"><Link to="/dashboard">Diagnostic Lab</Link></div>
            <ul className="navbar-links">
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/patients">Patients</Link></li>
                <li><Link to="/reports">Reports</Link></li>
                <li><Link to="/analytics">Analytics</Link></li>
                <li><button onClick={onLogout} className="logout-button">Logout</button></li>
            </ul>
        </nav>
    );
};

export default Navbar;