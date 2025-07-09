import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ onSidebarToggle, pageTitle = 'Dashboard' }) => {
  const { user, logout } = useAuth();

  return (
    <nav 
      className="top-navbar d-flex align-items-center justify-content-between px-3"
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--navbar-bg)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 998
      }}
    >
      <div className="d-flex align-items-center">
        <button 
          className="btn btn-outline-secondary sidebar-toggle me-3"
          onClick={onSidebarToggle}
          style={{ border: 'none' }}
        >
          <i className="pi pi-bars"></i>
        </button>
        <h5 className="mb-0 d-none d-md-block" style={{ color: 'var(--text-primary)' }}>
          {pageTitle}
        </h5>
      </div>

      <div className="d-flex align-items-center">
        {/* Panier */}
        <button className="btn btn-outline-secondary position-relative me-3">
          <i className="pi pi-shopping-cart"></i>
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            0
          </span>
        </button>

        {/* Notifications */}
        <div className="dropdown me-3">
          <button 
            className="btn btn-outline-secondary position-relative"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i className="pi pi-bell"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><h6 className="dropdown-header">Notifications</h6></li>
            <li><a className="dropdown-item" href="#">Nouvelle commande reçue</a></li>
            <li><a className="dropdown-item" href="#">Stock faible pour le produit X</a></li>
            <li><a className="dropdown-item" href="#">Paiement en attente</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li><a className="dropdown-item text-center" href="#">Voir toutes les notifications</a></li>
          </ul>
        </div>
        <button 
                className="dropdown-item text-danger"
                onClick={logout}
                style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
              >
                <i className="pi pi-sign-out me-2"></i>Déconnexion
              </button>

        {/* Menu utilisateur */}
        <div className="dropdown">
          <button 
            className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i className="pi pi-user me-2"></i>
            <span className="d-none d-md-inline">{user?.name || 'Utilisateur'}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><h6 className="dropdown-header">{user?.email || 'email@example.com'}</h6></li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <a className="dropdown-item" href="/profile">
                <i className="pi pi-user me-2"></i>Mon Profil
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="/settings">
                <i className="pi pi-cog me-2"></i>Paramètres
              </a>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button 
                className="dropdown-item text-danger"
                onClick={logout}
                style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
              >
                <i className="pi pi-sign-out me-2"></i>Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;