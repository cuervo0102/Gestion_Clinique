import React from 'react';
import { Link } from 'react-router-dom';
import '../admin_dashboard.css'

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>
      <p>Welcome to the Admin Dashboard. From here, you can manage Assistants, Doctors, Appointments, and Diseases.</p>

      <div className="dashboard-links">
        <h3>Manage Assistants</h3>
        <ul>
          <li><Link to="/create-assistant">Create Assistant</Link></li>
          <li><Link to="/assistants">List Assistants</Link></li>
        </ul>

        <h3>Manage Doctors</h3>
        <ul>
          <li><Link to="/create-doctor">Create Doctor</Link></li>
          <li><Link to="/doctors">List Doctors</Link></li>
        </ul>

        <h3>Manage Appointments</h3>
        <ul>
          <li><Link to="/create-appointment">Create Appointment</Link></li>
          <li><Link to="/appointments">List Appointments</Link></li>
        </ul>

        <h3>Manage Diseases</h3>
        <ul>
          <li><Link to="/create-disease">Create Disease</Link></li>
          <li><Link to="/diseases">List Diseases</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
