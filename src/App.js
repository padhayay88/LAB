import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainLayout from './components/MainLayout';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import PatientQueue from './components/PatientQueue';
import Tests from './components/Tests';
import ReportsManagement from './components/ReportsManagement';
import Payments from './components/Payments';
import LabPerformanceOverview from './components/LabPerformanceOverview';
import Settings from './components/Settings';
import Admin from './components/Admin';
import AddPatient from './components/AddPatient';
import PatientProfile from './components/PatientProfile';
import NotFound from './components/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/patients" element={<MainLayout><Patients /></MainLayout>} />
          <Route path="/patient-queue" element={<MainLayout><PatientQueue /></MainLayout>} />
          <Route path="/tests" element={<MainLayout><Tests /></MainLayout>} />
          <Route path="/reports" element={<MainLayout><ReportsManagement /></MainLayout>} />
          <Route path="/payments" element={<MainLayout><Payments /></MainLayout>} />
          <Route path="/analytics" element={<MainLayout><LabPerformanceOverview /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
          <Route path="/admin" element={<MainLayout><Admin /></MainLayout>} />
          <Route path="/patients/new" element={<MainLayout><AddPatient /></MainLayout>} />
          <Route path="/patient/:patientId" element={<MainLayout><PatientProfile /></MainLayout>} />
          <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
