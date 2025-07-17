import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';

const UsersShowScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les données de l'utilisateur
  const loadUser = async () => {
    setLoading(true);
    try {
      const response = await ApiService.get(`/api/users/${id}`);
      
      if (response.success) {
        setUser(response.data);
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: response.message || 'Erreur lors du chargement de l\'utilisateur',
          life: 3000
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors du chargement de l\'utilisateur' + error.message,
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  // Formater le nom complet
  const getFullName = () => {
    if (!user) return 'Utilisateur';
    const parts = [];
    if (user.first_name) parts.push(user.first_name);
    if (user.last_name) parts.push(user.last_name);
    return parts.join(' ') || 'Utilisateur';
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success fs-6">Actif</span>;
      case 'inactive':
        return <span className="badge bg-danger fs-6">Inactif</span>;
      case 'suspended':
        return <span className="badge bg-warning fs-6">Suspendu</span>;
      default:
        return <span className="badge bg-secondary fs-6">{status}</span>;
    }
  };

  // Obtenir le badge de rôle
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge bg-primary fs-6">Administrateur</span>;
      case 'manager':
        return <span className="badge bg-info fs-6">Manager</span>;
      case 'salesperson':
        return <span className="badge bg-secondary fs-6">Vendeur</span>;
      default:
        return <span className="badge bg-secondary fs-6">{role}</span>;
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formater la date et l'heure
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Supprimer l'utilisateur
  const handleDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${getFullName()}" ?`)) {
      try {
        const response = await ApiService.delete(`/api/users/${id}`);
        
        if (response.success) {
          toast.current.show({
            severity: 'success',
            summary: 'Succès',
            detail: 'Utilisateur supprimé avec succès',
            life: 3000
          });
          
          setTimeout(() => {
            navigate('/users');
          }, 1000);
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message || 'Erreur lors de la suppression',
            life: 3000
          });
        }
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la suppression' + error.message,
          life: 3000
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <i className="pi pi-spin pi-spinner me-2"></i>
          Chargement des données...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <i className="pi pi-exclamation-triangle me-2"></i>
          Utilisateur non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            {/* Header */}
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-user me-2"></i>
                  Détails de l'utilisateur
                </h4>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(`/users/${id}/edit`)}
                    title="Modifier"
                  >
                    <i className="pi pi-pencil me-2"></i>
                    Modifier
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleDelete}
                    title="Supprimer"
                  >
                    <i className="pi pi-trash me-2"></i>
                    Supprimer
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate('/users')}
                    title="Retour à la liste"
                  >
                    <i className="pi pi-arrow-left"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="row">
                {/* Informations principales */}
                <div className="col-lg-4">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <div className="mb-3">
                        {user.profile_photo ? (
                          <img
                            src={user.profile_photo}
                            alt={getFullName()}
                            className="rounded-circle mb-3"
                            width="120"
                            height="120"
                          />
                        ) : (
                          <div 
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{width: '120px', height: '120px', fontSize: '48px'}}
                          >
                            {getFullName().charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <h5 className="card-title mb-1">{getFullName()}</h5>
                      <p className="text-muted mb-3">{user.email}</p>
                      
                      <div className="d-flex justify-content-center gap-2 mb-3">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                      </div>
                      
                      {user.email_verified_at && (
                        <div className="text-success mb-2">
                          <i className="pi pi-check-circle me-1"></i>
                          Email vérifié
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Détails */}
                <div className="col-lg-8">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title mb-4">
                        <i className="pi pi-info-circle me-2"></i>
                        Informations détaillées
                      </h5>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">
                            <i className="pi pi-user me-2"></i>
                            Prénom
                          </label>
                          <div className="fw-bold">{user.first_name || 'N/A'}</div>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">
                            <i className="pi pi-user me-2"></i>
                            Nom
                          </label>
                          <div className="fw-bold">{user.last_name || 'N/A'}</div>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">
                            <i className="pi pi-envelope me-2"></i>
                            Email
                          </label>
                          <div className="fw-bold">{user.email}</div>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">
                            <i className="pi pi-phone me-2"></i>
                            Téléphone
                          </label>
                          <div className="fw-bold">{user.phone || 'N/A'}</div>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">
                            <i className="pi pi-calendar me-2"></i>
                            Date de naissance
                          </label>
                          <div className="fw-bold">{formatDate(user.date_of_birth)}</div>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">
                            <i className="pi pi-users me-2"></i>
                            Genre
                          </label>
                          <div className="fw-bold">
                            {user.gender === 'male' ? 'Homme' : 
                             user.gender === 'female' ? 'Femme' : 
                             user.gender || 'N/A'}
                          </div>
                        </div>
                        
                        <div className="col-12 mb-3">
                          <label className="form-label text-muted">
                            <i className="pi pi-map-marker me-2"></i>
                            Adresse
                          </label>
                          <div className="fw-bold">{user.address || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Informations système */}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title mb-3">
                        <i className="pi pi-cog me-2"></i>
                        Informations système
                      </h5>
                      
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label text-muted">
                            <i className="pi pi-calendar-plus me-2"></i>
                            Date de création
                          </label>
                          <div className="fw-bold">{formatDateTime(user.created_at)}</div>
                        </div>
                        
                        <div className="col-md-4 mb-3">
                          <label className="form-label text-muted">
                            <i className="pi pi-calendar-minus me-2"></i>
                            Dernière modification
                          </label>
                          <div className="fw-bold">{formatDateTime(user.updated_at)}</div>
                        </div>
                        
                        <div className="col-md-4 mb-3">
                          <label className="form-label text-muted">
                            <i className="pi pi-check-circle me-2"></i>
                            Email vérifié le
                          </label>
                          <div className="fw-bold">{formatDateTime(user.email_verified_at)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersShowScreen;