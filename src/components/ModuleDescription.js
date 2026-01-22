import React from 'react';
import './ModuleDescription.css';

const ModuleDescription = () => {
    return (
        <div className="module-description">
            <h1>Module Description</h1>
            <p>This system is divided into several modules:</p>
            <ul>
                <li><strong>Patients Module:</strong> Manage patient records and history.</li>
                <li><strong>Tests Module:</strong> Add, view, and manage diagnostic tests.</li>
                <li><strong>Reports Module:</strong> Generate and manage test reports.</li>
                <li><strong>Doctors Module:</strong> Manage doctor details and assigned reports.</li>
                <li><strong>Inventory Module:</strong> Track stock levels and machine maintenance.</li>
            </ul>
        </div>
    );
};

export default ModuleDescription;