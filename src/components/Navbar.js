import React from 'react';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">Diagnostic Lab</div>
            <ul className="navbar-links">
                <li><a href="/">Home</a></li>
                <li><a href="/patients">Patients</a></li>
                <li><a href="/tests">Tests</a></li>
                <li><a href="/reports">Reports</a></li>
                <li><a href="/doctors">Doctors</a></li>
                <li><a href="/appointments">Appointments</a></li>
                <li><a href="/lab-staff">Lab Staff</a></li>
                <li><a href="/inventory">Inventory</a></li>
                <li><a href="/billing">Billing</a></li>
                <li><a href="/analytics">Analytics</a></li>
                <li><a href="/admin">Admin</a></li>
                <li><a href="/login">Login</a></li>
            </ul>
        </nav>
    );
};

export default Navbar;