import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';

const Header = ({ onSidebarToggle, pageTitle = 'Dashboard' }) => {
  const { user, logout } = useAuth();

  const userMenuItems = [
    {
      label: user?.name || 'Utilisateur',
      icon: 'pi pi-user',
      className: 'font-bold',
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
      className: 'text-red-500',
      command: logout
    }
  ];

  const notificationItems = [
    {
      label: 'Notifications',
      className: 'font-bold',
      disabled: true
    },
    {
      separator: true
    },
    {
      label: 'Nouvelle commande reçue',
      icon: 'pi pi-shopping-cart',
      badge: '5 min'
    },
    {
      label: 'Stock faible pour le produit X',
      icon: 'pi pi-exclamation-triangle',
      badge: '15 min'
    },
    {
      label: 'Paiement en attente',
      icon: 'pi pi-clock',
      badge: '1h'
    },
    {
      separator: true
    },
    {
      label: 'Voir toutes les notifications',
      icon: 'pi pi-eye',
      className: 'text-center'
    }
  ];

  return (
    <nav 
      className="top-navbar d-flex align-items-center justify-content-between px-4 shadow-sm"
      style={{
        height: 'var(--navbar-height)',
        background: 'linear-gradient(90deg, #fff 0%, #f8f9fa 100%)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 998
      }}
    >
      <div className="d-flex align-items-center">
        <Button
          icon="pi pi-bars"
          className="p-button-text p-button-rounded sidebar-toggle me-3"
          onClick={onSidebarToggle}
          style={{ 
            color: 'var(--text-primary)',
            border: 'none',
            fontSize: '1.2rem'
          }}
          tooltip="Basculer le menu"
          tooltipOptions={{ position: 'bottom' }}
        />
        <div className="d-none d-md-block">
          <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
            {pageTitle}
          </h4>
          <small className="text-muted">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Recherche */}
        <div className="search-container d-none d-lg-block">
          <div className="p-inputgroup" style={{ maxWidth: '300px' }}>
            <span className="p-inputgroup-addon">
              <i className="pi pi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher..."
              style={{ 
                border: '1px solid var(--border-color)',
                borderRadius: '6px 0 0 6px'
              }}
            />
          </div>
        </div>

        {/* Panier */}
        <Button
          icon="pi pi-shopping-cart"
          className="p-button-text p-button-rounded position-relative"
          style={{ color: 'var(--text-primary)' }}
          tooltip="Panier"
          tooltipOptions={{ position: 'bottom' }}
        >
          <Badge 
            value="0" 
            severity="danger" 
            style={{ 
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              minWidth: '18px',
              height: '18px',
              fontSize: '0.7rem'
            }}
          />
        </Button>

        {/* Notifications */}
        <div className="notification-container">
          <Button
            icon="pi pi-bell"
            className="p-button-text p-button-rounded position-relative"
            style={{ color: 'var(--text-primary)' }}
            tooltip="Notifications"
            tooltipOptions={{ position: 'bottom' }}
          >
            <Badge 
              value="3" 
              severity="warning"
              style={{ 
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                minWidth: '18px',
                height: '18px',
                fontSize: '0.7rem',
                animation: 'pulse 2s infinite'
              }}
            />
          </Button>
        </div>

        {/* Menu utilisateur */}
        <div className="user-menu d-flex align-items-center">
          <Avatar
            icon="pi pi-user"
            shape="circle"
            size="large"
            style={{ 
              backgroundColor: 'var(--primary-blue)',
              color: 'white',
              marginRight: '10px'
            }}
          />
          <div className="d-none d-md-block me-2">
            <div className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {user?.name || 'Utilisateur'}
            </div>
            <small className="text-muted">{user?.email || 'email@example.com'}</small>
          </div>
          <Button
            icon="pi pi-angle-down"
            className="p-button-text p-button-rounded"
            style={{ color: 'var(--text-primary)' }}
            onClick={logout}
          />
        </div>
      </div>

      <style jsx>{`
        .search-container .p-inputgroup-addon {
          background: var(--primary-blue);
          color: white;
          border-color: var(--primary-blue);
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .user-menu:hover .p-avatar {
          transform: scale(1.05);
          transition: transform 0.2s ease;
        }
      `}</style>
    </nav>
  );
};

export default Header;