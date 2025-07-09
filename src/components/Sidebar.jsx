import React from 'react';
import { useLocation } from 'react-router-dom';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { icon: 'pi pi-home', label: 'Dashboard', path: '/dashboard' },
    { icon: 'pi pi-dollar', label: 'Ventes', path: '/sales' },
    { icon: 'pi pi-box', label: 'Stocks', path: '/stocks' },
    { icon: 'pi pi-shopping-bag', label: 'Produits', path: '/products' },
    { icon: 'pi pi-tags', label: 'Catégories', path: '/categories' },
    { icon: 'pi pi-user', label: 'Clients', path: '/clients' },
    { icon: 'pi pi-truck', label: 'Fournisseurs', path: '/suppliers' },
    { icon: 'pi pi-shopping-cart', label: 'Achats', path: '/purchases' },
    { icon: 'pi pi-users', label: 'Utilisateurs', path: '/users' },
    { icon: 'pi pi-car', label: 'Véhicules', path: '/vehicles' },
    { icon: 'pi pi-wallet', label: 'Caisse', path: '/cash-registers' },
    { icon: 'pi pi-refresh', label: 'Transactions', path: '/transactions' },
    { icon: 'pi pi-money-bill', label: 'Dépenses', path: '/expenses' },
    { icon: 'pi pi-cog', label: 'Types de dépenses', path: '/expense-types' },
    { icon: 'pi pi-chart-bar', label: 'Rapports', path: '/reports' },
  ];

  return (
    <>
      <nav 
        className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 'var(--sidebar-width)',
          height: '100vh',
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-color)',
          zIndex: 1000,
          transition: 'transform 0.3s ease',
          transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
          overflowY: 'auto'
        }}
      >
        <div 
          className="sidebar-brand p-3 d-flex align-items-center"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <i className="pi pi-desktop me-2"></i>
          Advanced IT
        </div>

        <ul className="sidebar-nav list-unstyled p-0">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item">
              <a
                href={item.path}
                className={`nav-link d-flex align-items-center px-3 py-2 text-decoration-none ${
                  location.pathname === item.path ? 'active' : ''
                }`}
                style={{
                  color: 'var(--sidebar-color)',
                  backgroundColor: location.pathname === item.path ? 'var(--sidebar-active-bg)' : 'transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.backgroundColor = 'var(--sidebar-hover-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.path) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <i className={`${item.icon} me-2`}></i>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Overlay pour mobile */}
      {!isCollapsed && (
        <div 
          className="overlay d-block d-lg-none"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;