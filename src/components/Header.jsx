import React, { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';

const Header = ({ onSidebarToggle, pageTitle = 'Tableau de bord' }) => {
  const { user, logout } = useAuth();
  const userMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  console.log('User:', user);
  const userMenuItems = [
    {
      label: user?.name || 'BURUNDI UBWIZA',
      icon: 'pi pi-user',
      className: 'font-bold text-primary',
      disabled: true
    },
    {
      separator: true
    },
    {
      label: 'Mon Profil',
      icon: 'pi pi-user',
      command: () => {
        window.location.href = '/profile';
      }
    },
    {
      label: 'Paramètres',
      icon: 'pi pi-cog',
      command: () => {
        window.location.href = '/settings';
      }
    },
    {
      separator: true
    },
    {
      label: 'Déconnexion',
      icon: 'pi pi-sign-out',
      className: 'text-danger',
      command: logout
    }
  ];

  const notificationItems = [
    {
      label: 'Notifications récentes',
      className: 'font-bold text-primary',
      disabled: true
    },
    {
      separator: true
    },
    {
      label: 'Nouvelle commande reçue',
      icon: 'pi pi-shopping-cart text-success',
      template: (item) => (
        <div className="d-flex justify-content-between align-items-center px-3 py-2">
          <div className="d-flex align-items-center">
            <i className={item.icon}></i>
            <span className="ms-2">{item.label}</span>
          </div>
          <small className="text-muted">5 min</small>
        </div>
      )
    },
    {
      label: 'Stock faible pour le produit X',
      icon: 'pi pi-exclamation-triangle text-warning',
      template: (item) => (
        <div className="d-flex justify-content-between align-items-center px-3 py-2">
          <div className="d-flex align-items-center">
            <i className={item.icon}></i>
            <span className="ms-2">{item.label}</span>
          </div>
          <small className="text-muted">15 min</small>
        </div>
      )
    },
    {
      label: 'Paiement en attente',
      icon: 'pi pi-clock text-info',
      template: (item) => (
        <div className="d-flex justify-content-between align-items-center px-3 py-2">
          <div className="d-flex align-items-center">
            <i className={item.icon}></i>
            <span className="ms-2">{item.label}</span>
          </div>
          <small className="text-muted">1h</small>
        </div>
      )
    },
    {
      separator: true
    },
    {
      label: 'Voir toutes les notifications',
      icon: 'pi pi-eye',
      className: 'text-center text-primary fw-bold',
      command: () => {
        window.location.href = '/notifications';
      }
    }
  ];

  const toggleUserMenu = (event) => {
    userMenuRef.current.toggle(event);
  };

  const toggleNotificationMenu = (event) => {
    notificationMenuRef.current.toggle(event);
  };

  return (
    <>
      <nav 
        className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top"
        style={{
          height: '60px',
          borderBottom: '1px solid #e9ecef',
          zIndex: 998
        }}
      >
        <div className="container-fluid px-3">
          {/* Section gauche */}
          <div className="d-flex align-items-center">
            <Button
              icon="pi pi-bars"
              className="p-button-text p-button-rounded me-3"
              onClick={onSidebarToggle}
              style={{ 
                color: '#6c757d',
                border: 'none',
                fontSize: '1.1rem',
                width: '40px',
                height: '40px'
              }}
              tooltip="Basculer le menu"
              tooltipOptions={{ position: 'bottom' }}
            />
            <div className="d-flex align-items-center">
              <h5 className="mb-0 fw-normal" style={{ color: '#495057', fontSize: '1.1rem' }}>
                {pageTitle}
              </h5>
            </div>
          </div>

          {/* Section droite */}
          <div className="d-flex align-items-center">
            {/* Panier */}
            <div className="position-relative me-3">
              <Button
                icon="pi pi-shopping-cart"
                className="p-button-text p-button-rounded position-relative p-4"
                style={{ 
                  color: '#6c757d',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  fontSize: '1.1rem'
                }}
                tooltip="Panier"
                tooltipOptions={{ position: 'bottom' }}
              />
              <Badge 
                value="0" 
                severity="danger" 
                className="cart-badge"
                style={{ 
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  minWidth: '16px',
                  height: '16px',
                  fontSize: '0.65rem',
                  borderRadius: '50%',
                  backgroundColor: '#dc3545',
                  color: 'white'
                }}
              />
            </div>

            {/* Notifications */}
            <div className="position-relative me-3">
              <Button
                icon="pi pi-bell"
                className="p-button-text p-button-rounded p-4"
                style={{ 
                  color: '#6c757d',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  fontSize: '1.1rem'
                }}
                tooltip="Notifications"
                tooltipOptions={{ position: 'bottom' }}
                onClick={toggleNotificationMenu}
              />
              <Badge 
                value="3" 
                severity="warning"
                className="notification-badge"
                style={{ 
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  minWidth: '16px',
                  height: '16px',
                  fontSize: '0.65rem',
                  borderRadius: '50%',
                  backgroundColor: '#ffc107',
                  color: 'white'
                }}
              />
              <Menu 
                model={notificationItems} 
                popup 
                ref={notificationMenuRef}
                className="notification-menu"
                style={{ width: '350px' }}
              />
            </div>

            {/* Menu utilisateur */}
            <div className="d-flex align-items-center user-menu-container">
              <div className="me-2" style={{ cursor: 'pointer' }} onClick={toggleUserMenu}>
                <div className="d-flex align-items-center">
                  <Avatar
                    icon="pi pi-user"
                    shape="circle"
                    size="normal"
                    className="me-2"
                    style={{ 
                      backgroundColor: '#007bff',
                      color: 'white',
                      width: '32px',
                      height: '32px'
                    }}
                  />
                  
                  <div className="d-none d-md-block me-2">
                    <div className="fw-medium" style={{ color: '#495057', fontSize: '0.9rem' }}>
                      BURUNDI UBWIZA
                    </div>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      ubwizaburundi@gmail.com
                    </small>
                  </div>
                  <i className="pi pi-angle-down" style={{ color: '#6c757d', fontSize: '0.8rem' }}></i>
                </div>
              </div>
              <Menu 
                model={userMenuItems} 
                popup 
                ref={userMenuRef}
                className="user-menu"
                style={{ width: '200px' }}
              />
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .cart-badge {
          animation: none;
        }
        
        .notification-badge {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .user-menu-container:hover .p-avatar {
          transform: scale(1.05);
          transition: transform 0.2s ease;
        }

        .user-menu-container:hover {
          background-color: #f8f9fa;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        .notification-menu .p-menu-item {
          padding: 0;
        }

        .notification-menu .p-menu-item:hover {
          background-color: #f8f9fa;
        }

        .user-menu .p-menu-item:hover {
          background-color: #f8f9fa;
        }

        .user-menu .p-menu-item.text-danger:hover {
          background-color: #f8d7da;
        }

        .p-button:hover {
          background-color: #f8f9fa !important;
          border-color: transparent !important;
        }

        .p-button:focus {
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
};

export default Header;