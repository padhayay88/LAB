import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isAuthenticated, onLogout }) => {
    const userRole = localStorage.getItem('role');

    return (
        <nav className="navbar">
            <div className="navbar-logo"><Link to="/">Diagnostic Lab</Link></div>
            <ul className="navbar-links">
                {isAuthenticated ? (
                    <>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/patient-test-payment-list">Master List</Link></li>
                        <li><Link to="/patients">Patients</Link></li>
                        <li><Link to="/tests">Tests</Link></li>
                        <li><Link to="/reports">Medical Reports Management</Link></li>
                        <li><Link to="/appointments">Appointments</Link></li>
                        <li><Link to="/inventory">Inventory</Link></li>
                        <li><Link to="/billing">Billing</Link></li>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        {userRole === 'Admin' && (
                            <>
                                <li><Link to="/lab-staff">Lab Staff</Link></li>
                                <li><Link to="/analytics">Lab Performance</Link></li>
                                <li><Link to="/admin">Admin</Link></li>
                            </>
                        )}
                        <li><button onClick={onLogout} className="logout-button">Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/login">Login</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;