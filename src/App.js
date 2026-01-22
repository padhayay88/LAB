import Navbar from './components/Navbar';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import Appointments from './components/Appointments';
import LabStaff from './components/LabStaff';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import LabPerformanceOverview from './components/LabPerformanceOverview';
import Admin from './components/Admin';
import Login from './components/Login';
import Patients from './components/Patients';
import Tests from './components/Tests';

import Doctors from './components/Doctors';
import './App.css';
import Footer from './components/Footer';
import AboutSystem from './components/AboutSystem';
import Objectives from './components/Objectives';
import ModuleDescription from './components/ModuleDescription';
import FutureScope from './components/FutureScope';
import AddPatient from './components/AddPatient';
import AddTest from './components/AddTest';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './components/NotFound';
import PatientTestPaymentList from './components/PatientTestPaymentList';
import PatientProfile from './components/PatientProfile';
import ReportsManagement from './components/ReportsManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    // No need for navigate('/login') here as PrivateRoute will handle redirection.
  };
  return (
    <Router>
      <div className="App">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/about-system" element={<AboutSystem />} />
          <Route path="/objectives" element={<Objectives />} />
          <Route path="/module-description" element={<ModuleDescription />} />
          <Route path="/future-scope" element={<FutureScope />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute allowedRoles={['Admin', 'Lab Staff']} />}>
            <Route path="/patients" element={<Patients />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/reports" element={<ReportsManagement />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/lab-staff" element={<LabStaff />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/analytics" element={<LabPerformanceOverview />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients/new" element={<AddPatient />} />
            <Route path="/tests/new" element={<AddTest />} />
            <Route path="/patient-test-payment-list" element={<PatientTestPaymentList />} />
            <Route path="/patient/:patientId" element={<PatientProfile />} />
          </Route>

          {/* Admin Only Route */}
          <Route element={<PrivateRoute allowedRoles={['Admin']} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* Not Found Route */}
          <Route path="*" element={<NotFound />} />

        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
