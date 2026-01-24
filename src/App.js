import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import LabPerformanceOverview from './components/LabPerformanceOverview';
import Admin from './components/Admin';
import Patients from './components/Patients';
import './App.css';
import Footer from './components/Footer';
import AddPatient from './components/AddPatient';
import NotFound from './components/NotFound';
import PatientProfile from './components/PatientProfile';
import ReportsManagement from './components/ReportsManagement';

function App() {
  const handleLogout = () => {
    // In a real app, you'd handle token removal here.
    console.log('User logged out');
  };

  return (
    <Router>
      <div className="App">
        <Navbar onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/reports" element={<ReportsManagement />} />
          <Route path="/analytics" element={<LabPerformanceOverview />} />
          <Route path="/patients/new" element={<AddPatient />} />
          <Route path="/patient/:patientId" element={<PatientProfile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
