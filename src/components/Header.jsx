import React, { useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/cartReducer.jsx';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';

//imprt useNavigate
import { useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector.jsx';

import { useIntl } from "react-intl"



const Header = ({ onSidebarToggle, pageTitle = 'Tableau de bord' }) => {
  const { user, logout, isLoading, getUserInfo } = useAuth();
  const { getTotalQuantity } = useCart();
  const userMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = React.useState(false);


  const intl=useIntl()

    const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setIsNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsNotificationMenuOpen(false);
  };

  const toggleNotificationMenu = () => {
    setIsNotificationMenuOpen(!isNotificationMenuOpen);
    setIsUserMenuOpen(false);
  };

  

  const handleSettingsClick = () => {
    window.location.href = '/settings';
    setIsUserMenuOpen(false);
  };

  const handleMessagesClick = () => {
    window.location.href = '/messages';
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const closeAllMenus = () => {
    
  };

  // Obtenir les informations utilisateur avec la fonction du contexte
  const userInfo = getUserInfo ? getUserInfo() : {
    name: isLoading ? 'Chargement...' : (user?.name || user?.username || user?.firstName || 'Utilisateur'),
    email: isLoading ? 'Chargement...' : (user?.email || 'Email non disponible')
  };

  return (
    <nav className="navbar no-print navbar-expand-lg navbar-light bg-white shadow-sm sticky-top border-bottom">
      <div className="container-fluid px-4">
        {/* Section gauche */}
        
        <div className="d-flex align-items-center">
          <Button
            icon="pi pi-bars"
            className="p-button-text p-button-rounded me-3"
            onClick={onSidebarToggle}
            tooltip="Basculer le menu"
            tooltipOptions={{ position: 'bottom' }}
          />
          <div>
            <h5 className="mb-0 fw-normal text-dark">
              {intl.formatMessage({id:"header.dashboard"})}
            </h5>
          </div>
        </div>

        {/* Section droite */}
        <div className="d-flex align-items-center">
          {/* Panier */}
          <div className="mx-4">
            <LanguageSelector onToggleParent={closeAllMenus} />
          </div>
          <div 
          onClick={() => navigate('/sales/create')}
          className="position-relative me-3">
            <Button
              icon="pi pi-shopping-cart"
              className="p-button-text p-button-rounded"
              tooltip="Panier"
              tooltipOptions={{ position: 'bottom' }}
            />
            <Badge
              value={getTotalQuantity()}
              severity="danger"
              className="position-absolute top-0 start-100 translate-middle"
              style={{ fontSize: '0.65rem' }}
            />
          </div>

          {/* Notifications */}
          <div className="position-relative me-3" ref={notificationMenuRef}>
            <Button
              icon="pi pi-bell"
              className="p-button-text p-button-rounded"
              tooltip="Notifications"
              tooltipOptions={{ position: 'bottom' }}
              onClick={toggleNotificationMenu}
            />
            <Badge
              value="3"
              severity="warning"
              className="position-absolute top-0 start-100 translate-middle"
              style={{ fontSize: '0.65rem', animation: 'pulse 2s infinite' }}
            />

            {/* Dropdown Notifications */}
            {isNotificationMenuOpen && (
              <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-lg border-0" style={{ width: '350px', zIndex: 1050 }}>
                <div className="px-3 py-2 border-bottom">
                  <h6 className="mb-0 fw-bold text-primary">Notifications récentes</h6>
                </div>
                <div className="notification-item px-3 py-2 border-bottom hover-bg-light">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-start">
                      <i className="pi pi-shopping-cart text-success me-2 mt-1"></i>
                      <span className="small">Nouvelle commande reçue</span>
                    </div>
                    <small className="text-muted">5 min</small>
                  </div>
                </div>
                <div className="notification-item px-3 py-2 border-bottom hover-bg-light">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-start">
                      <i className="pi pi-exclamation-triangle text-warning me-2 mt-1"></i>
                      <span className="small">Stock faible pour le produit X</span>
                    </div>
                    <small className="text-muted">15 min</small>
                  </div>
                </div>
                <div className="notification-item px-3 py-2 border-bottom hover-bg-light">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-start">
                      <i className="pi pi-clock text-info me-2 mt-1"></i>
                      <span className="small">Paiement en attente</span>
                    </div>
                    <small className="text-muted">1h</small>
                  </div>
                </div>
                <div className="px-3 py-2 text-center">
                  <a href="/notifications" className="text-primary fw-bold text-decoration-none small">
                    Voir toutes les notifications
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Menu utilisateur */}
          <div className="position-relative" ref={userMenuRef}>
            <div
              className="d-flex align-items-center p-2 rounded hover-bg-light"
              style={{ cursor: 'pointer' }}
              onClick={toggleUserMenu}
            >
              <Avatar
                icon="pi pi-user"
                shape="circle"
                size="normal"
                className="me-2"
                style={{
                  backgroundColor: 'var(--primary-blue)',
                  color: 'white',
                  width: '32px',
                  height: '32px'
                }}
              />

              <div className="d-none d-md-block me-2">
                <div className="fw-medium text-dark" style={{ fontSize: '0.9rem' }}>
                  {userInfo.name}
                </div>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {userInfo.email}
                </small>
              </div>
              <i className={`pi pi-angle-${isUserMenuOpen ? 'up' : 'down'} text-muted`}></i>
            </div>

          

            {/* Dropdown Menu Utilisateur */}
            {isUserMenuOpen && (
              <div className="dropdown-menu show position-absolute end-0 mt-2 shadow-lg border-0" style={{ width: '200px', zIndex: 1050 }}>
                {/* <div className="dropdown-item-text px-3 py-2 border-bottom">
                  <div className="fw-bold text-primary small">BURUNDI UBWIZA</div>
                </div> */}
                <button
                  className="dropdown-item d-flex align-items-center px-3 py-2 hover-bg-light"
                   onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate('/profile')}}
                >
                  <i className="pi pi-user me-2 text-muted"></i>
                  <span>Profile</span>
                </button>
                <button
                  className="dropdown-item d-flex align-items-center justify-content-between px-3 py-2 hover-bg-light"
                  onClick={handleSettingsClick}
                >
                  <div className="d-flex align-items-center">
                    <i className="pi pi-cog me-2 text-muted"></i>
                    <span>Settings</span>
                  </div>
                  <small className="text-muted">⌘+O</small>
                </button>
                <button
                  className="dropdown-item d-flex align-items-center justify-content-between px-3 py-2 hover-bg-light"
                  onClick={handleMessagesClick}
                >
                  <div className="d-flex align-items-center">
                    <i className="pi pi-envelope me-2 text-muted"></i>
                    <span>Messages</span>
                  </div>
                  <Badge value="2" severity="info" className="ms-2" style={{ fontSize: '0.7rem' }} />
                </button>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item d-flex align-items-center justify-content-between px-3 py-2 hover-bg-light text-danger"
                  onClick={handleLogout}
                >
                  <div className="d-flex align-items-center">
                    <i className="pi pi-sign-out me-2"></i>
                    <span>Logout</span>
                  </div>
                  <small className="text-muted">⌘+Q</small>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS optimisé */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .hover-bg-light:hover {
          background-color: #f8f9fa !important;
          transition: background-color 0.2s ease;
        }

        .dropdown-menu {
          border-radius: 8px;
          border: 1px solid #e9ecef;
          background: white;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }

        .dropdown-item {
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-size: 0.875rem;
          transition: background-color 0.15s ease-in-out;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
        }

        .notification-item:hover {
          background-color: #f8f9fa;
          cursor: pointer;
        }

        .p-button:hover {
          background-color: #f8f9fa !important;
          border-color: transparent !important;
        }

        .p-button:focus {
          box-shadow: none !important;
        }

        .navbar {
          height: 60px;
        }

        .dropdown-item.text-danger:hover {
          background-color: #f8d7da;
          color: #721c24 !important;
        }
      `}</style>
    </nav>
  );
};

export default Header;
