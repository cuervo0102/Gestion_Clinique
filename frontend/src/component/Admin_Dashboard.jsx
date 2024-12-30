import React, { useState } from 'react';
import DoctorsPage from './Doctor_Page';  
import Assistant from './Assistant_Page';
import renderPatientPage from './Patient_Case';

const DashboardAdmin = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="admin-dashboard">

        <ul>
          <li onClick={() => handleNavigation('dashboard')}>Dashboard</li>
          <li onClick={() => handleNavigation('doctors')}>Doctors</li>
          <li onClick={() => handleNavigation('assistants')}>Assistants</li>
          <li onClick={() =>  handleNavigation('patient_case')}>Patient Case</li>
        </ul>


      <div className="page-content">
        {currentPage === 'dashboard' && <h2>Welcome to the Admin Dashboard</h2>}
        {currentPage === 'doctors' && <DoctorsPage />} 
        {currentPage === 'assistants' && <Assistant />} 
        {currentPage === 'patient_case' && <renderPatientPage />} 
      </div>
    </div>
  );
};

export default DashboardAdmin;
