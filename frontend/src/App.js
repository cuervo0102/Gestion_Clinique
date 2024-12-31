import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Welcome from "./component/Welcome";
import CreatePatient from "./component/Create_Patient";
import LoginPatient from "./component/Login_Patient";
import PatientTable from "./component/GetAllPatients";
import Calendar from "./component/calender";
import Navbar from "./component/Navbar";
import HomeSection from "./component/Home";
import Appointment from "./component/MakeAppointement";
import Dashboard from "./component/Admin_Dashboard";
import LoginAdmin from "./component/AdminLogin";

// Navigation component
const Navigation = () => {
  return (
    <nav style={styles.nav}>
      <ul style={styles.navList}>
        {/* <li style={styles.navItem}>
          <Link to="/" style={styles.navLink}>Home</Link>
        </li> */}
        <li style={styles.navItem}>
          <Link to="/" style={styles.navLink}>Dashboard</Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/create-patient" style={styles.navLink}>Register</Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/login-patient" style={styles.navLink}>Login</Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/patients" style={styles.navLink}>Patients List</Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/calender" style={styles.navLink}>Calendar</Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/navbar" style={styles.navLink}>Navbar</Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/home" style={styles.navLink}>Home</Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/appointement" style={styles.navLink}>Appoi</Link>
        </li>
        <li style={styles.navItem}>
          <Link to="/admin" style={styles.navLink}>Admin</Link>
        </li>
      </ul>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div style={styles.container}>
        <Navigation />
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-patient" element={<CreatePatient />} />
            <Route path="/login-patient" element={<LoginPatient />} />
            <Route path="/patients" element={<PatientTable />} />
            <Route path="/calender" element={<Calendar />} />
            <Route path="/navbar" element={<Navbar />} />
            <Route path="/home" element={<HomeSection />} />
            <Route path="/appointement" element={<Appointment />} />
            <Route path="/Admin" element={<LoginAdmin />} />

            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Inline styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  nav: {
    backgroundColor: '#333',
    padding: '1rem',
    marginBottom: '2rem'
  },
  navList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    gap: '1rem'
  },
  navItem: {
    margin: 0
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  }
};

export default App;