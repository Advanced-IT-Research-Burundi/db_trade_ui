import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
      setIsSidebarCollapsed(true);
    }

    // Gérer le redimensionnement
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsSidebarCollapsed(true);
      } else if (localStorage.getItem('sidebarCollapsed') !== 'true') {
        setIsSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Appel initial

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} className="no-print"/>
      
      <div className="main-wrapper">
        <Header onSidebarToggle={toggleSidebar} className="no-print" />
        
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;