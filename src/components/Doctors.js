import React, { useState } from 'react';
import './Doctors.css';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [name, setName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [assignedReports, setAssignedReports] = useState('');
    const [remarks, setRemarks] = useState('');
    const [digitalSignature, setDigitalSignature] = useState(false);

    const addDoctor = () => {
        if (name && specialization && assignedReports && remarks) {
            const newDoctor = {
                id: Date.now(),
                name,
                specialization,
                assignedReports: parseInt(assignedReports),
                remarks,
                digitalSignature
            };
            setDoctors([...doctors, newDoctor]);
            // Reset form
            setName('');
            setSpecialization('');
            setAssignedReports('');
            setRemarks('');
            setDigitalSignature(false);
        }
    };

    return (
        <div className="doctors">
            <h1>Doctors</h1>

            {/* Add Doctor Form */}
            <div className="add-doctor-form">
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="text" placeholder="Specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                <input type="number" placeholder="Assigned Reports" value={assignedReports} onChange={(e) => setAssignedReports(e.target.value)} />
                <input type="text" placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                <label>
                    Digital Signature: <input type="checkbox" checked={digitalSignature} onChange={(e) => setDigitalSignature(e.target.checked)} />
                </label>
                <button onClick={addDoctor}>Add Doctor</button>
            </div>

            {/* Doctor List */}
            <div className="doctor-list">
                {doctors.map((doctor) => (
                    <div key={doctor.id} className="doctor-card">
                        <h3>{doctor.name}</h3>
                        <p>Specialization: {doctor.specialization}</p>
                        <p>Assigned Reports: {doctor.assignedReports}</p>
                        <p>Remarks: {doctor.remarks}</p>
                        <p>Digital Signature: {doctor.digitalSignature ? 'Available' : 'Not Available'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Doctors;
