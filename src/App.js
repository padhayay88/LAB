import Navbar from './components/Navbar';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Appointments from './components/Appointments';
import LabStaff from './components/LabStaff';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import Analytics from './components/Analytics';
import Admin from './components/Admin';
import Login from './components/Login';
import Patients from './components/Patients';
import Tests from './components/Tests';
import Reports from './components/Reports';
import Doctors from './components/Doctors';
import './App.css';
import Footer from './components/Footer';
import AboutSystem from './components/AboutSystem';
import Objectives from './components/Objectives';
import ModuleDescription from './components/ModuleDescription';
import FutureScope from './components/FutureScope';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/lab-staff" element={<LabStaff />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about-system" element={<AboutSystem />} />
          <Route path="/objectives" element={<Objectives />} />
          <Route path="/module-description" element={<ModuleDescription />} />
          <Route path="/future-scope" element={<FutureScope />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
