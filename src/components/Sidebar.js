import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            path: '/dashboard',
            badge: null
        },
        {
            id: 'patients',
            label: 'Patients',
            icon: '👥',
            path: '/patients',
            badge: null
        },
        {
            id: 'patient-queue',
            label: 'Patient Queue (Today)',
            icon: '📋',
            path: '/patient-queue',
            badge: null
        },
        {
            id: 'tests',
            label: 'Tests',
            icon: '🔬',
            path: '/tests',
            badge: null
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: '📄',
            path: '/reports',
            badge: 3 // Example: 3 pending reports
        },
        {
            id: 'payments',
            label: 'Payments',
            icon: '💰',
            path: '/payments',
            badge: 2 // Example: 2 pending payments
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: '📈',
            path: '/analytics',
            badge: null
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: '⚙️',
            path: '/settings',
            badge: null
        },
        {
            id: 'logout',
            label: 'Logout',
            icon: '🚪',
            path: '/logout',
            badge: null
        }
    ];

    const handleMenuClick = (item) => {
        setActiveMenu(item.id);
        if (item.id === 'logout') {
            // Handle logout logic
            console.log('Logging out...');
            // Navigate to home or login page
            navigate('/');
        } else {
            navigate(item.path);
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="lab-logo">
                    <div className="logo-icon">🏥</div>
                    <div className="lab-name">
                        <h2>LabHub</h2>
                        <p>Diagnostic Lab</p>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul className="menu-list">
                    {menuItems.map((item) => (
                        <li key={item.id} className="menu-item">
                            <button
                                className={`menu-button ${activeMenu === item.id ? 'active' : ''}`}
                                onClick={() => handleMenuClick(item)}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-label">{item.label}</span>
                                {item.badge && (
                                    <span className="menu-badge">{item.badge}</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">👤</div>
                    <div className="user-details">
                        <p className="user-name">Lab Admin</p>
                        <p className="user-role">Administrator</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
