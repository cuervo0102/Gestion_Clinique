import React, { useState } from 'react';
import DoctorsPage from './Doctor_Page';  

const DashboardAdmin = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="admin-dashboard">
      <nav>
        <ul>
          <li onClick={() => handleNavigation('dashboard')}>Dashboard</li>
          <li onClick={() => handleNavigation('doctors')}>Doctors</li>
        </ul>
      </nav>

      <div className="page-content">
        {currentPage === 'dashboard' && <h2>Welcome to the Admin Dashboard</h2>}
        {currentPage === 'doctors' && <DoctorsPage />} 
      </div>
    </div>
  );
};

export default DashboardAdmin;
