import React, { useState } from 'react';
import DoctorsPage from './Doctor_Page';  
import Assistant from './Assistant_Page';

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
        </ul>


      <div className="page-content">
        {currentPage === 'dashboard' && <h2>Welcome to the Admin Dashboard</h2>}
        {currentPage === 'doctors' && <DoctorsPage />} 
        {currentPage === 'assistants' && <Assistant />} 
      </div>
    </div>
  );
};

export default DashboardAdmin;
