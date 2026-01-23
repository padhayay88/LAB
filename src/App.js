import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import LabPerformanceOverview from './components/LabPerformanceOverview';
import Admin from './components/Admin';
import Login from './components/Login';
import Patients from './components/Patients';
import './App.css';
import Footer from './components/Footer';
import AddPatient from './components/AddPatient';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './components/NotFound';
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
        {isAuthenticated && <Navbar onLogout={handleLogout} />}
        <Routes>
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Login onLogin={handleLogin} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute allowedRoles={['Admin', 'Lab Staff']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/reports" element={<ReportsManagement />} />
            <Route path="/analytics" element={<LabPerformanceOverview />} />
            <Route path="/patients/new" element={<AddPatient />} />
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
