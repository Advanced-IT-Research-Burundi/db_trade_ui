import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const toast = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/api/profil');
      
      if (response.success) {
        setUser(response.data || {});
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: response.data.message || 'Erreur lors du chargement du profil',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Erreur de connexion:', error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur de connexion',
        detail: error.message,
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const updateProfilePhoto = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('profile_photo', selectedFile);

      const response = await ApiService.post('/api/update-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Photo de profil mise à jour avec succès',
          life: 3000
        });
        loadProfile(); 
        setSelectedFile(null);
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: response.data.message || 'Erreur lors de la mise à jour',
          life: 3000
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: error.message,
        life: 3000
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseigné';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGenderDisplay = (gender) => {
    switch (gender) {
      case 'male':
        return (
          <>
            <i className="bi bi-gender-male text-primary me-1"></i>
            Masculin
          </>
        );
      case 'female':
        return (
          <>
            <i className="bi bi-gender-female text-danger me-1"></i>
            Féminin
          </>
        );
      default:
        return 'Non spécifié';
    }
  };

  const renderPermissions = (permissions) => {
    if (!permissions) return <span className="text-muted">Aucune permission spécifique</span>;
    
    const permissionArray = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
    
    if (!Array.isArray(permissionArray) || permissionArray.length === 0) {
      return <span className="text-muted">Aucune permission spécifique</span>;
    }

    return permissionArray.map((permission, index) => (
      <span key={index} className="badge bg-secondary me-1 mb-1">
        {permission}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Erreur lors du chargement du profil utilisateur
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <div className="d-flex align-items-center">
                <i className="bi bi-person-circle me-2 fs-4"></i>
                <h4 className="mb-0">Profil Utilisateur</h4>
              </div>
            </div>
            
            <div className="card-body">
              <div className="row">
                {/* Section Photo de Profil */}
                <div className="col-md-4 col-lg-3">
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      {user.profile_photo ? (
                        <img 
                          src={`/storage/${user.profile_photo}`}
                          alt="Photo de profil"
                          className="rounded-circle border border-3 border-primary shadow"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle border border-3 border-secondary bg-light d-flex align-items-center justify-content-center shadow"
                          style={{ width: '150px', height: '150px' }}
                        >
                          <i className="bi bi-person-fill text-secondary" style={{ fontSize: '4rem' }}></i>
                        </div>
                      )}
                      <button 
                        className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle shadow"
                        style={{ width: '35px', height: '35px' }}
                        data-bs-toggle="modal"
                        data-bs-target="#photoModal"
                      >
                        <i className="bi bi-camera-fill"></i>
                      </button>
                    </div>
                    
                    <h5 className="mt-3 mb-1">
                      {user.first_name} {user.last_name}
                    </h5>
                    <p className="text-muted">
                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Non défini'}
                    </p>
                    
                    <div className="mb-3">
                      {user.status === 'active' ? (
                        <span className="badge bg-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Actif
                        </span>
                      ) : (
                        <span className="badge bg-danger">
                          <i className="bi bi-x-circle me-1"></i>
                          Inactif
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Informations Personnelles */}
                <div className="col-md-8 col-lg-9">
                  <div className="row">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">
                            <i className="bi bi-person-vcard me-2"></i>
                            Informations Personnelles
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-person me-1"></i>
                                Prénom
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {user.first_name || 'Non renseigné'}
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-person me-1"></i>
                                Nom
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {user.last_name || 'Non renseigné'}
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-envelope me-1"></i>
                                Email
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {user.email}
                                {user.email_verified_at ? (
                                  <i className="bi bi-patch-check-fill text-success ms-1" title="Email vérifié"></i>
                                ) : (
                                  <i className="bi bi-exclamation-triangle-fill text-warning ms-1" title="Email non vérifié"></i>
                                )}
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-telephone me-1"></i>
                                Téléphone
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {user.phone || 'Non renseigné'}
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-calendar-event me-1"></i>
                                Date de naissance
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {formatDate(user.date_of_birth)}
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-gender-ambiguous me-1"></i>
                                Genre
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {getGenderDisplay(user.gender)}
                              </div>
                            </div>
                            
                            <div className="col-12">
                              <label className="form-label text-muted small">
                                <i className="bi bi-geo-alt me-1"></i>
                                Adresse
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {user.address || 'Non renseignée'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Sécurité */}
                  <div className="row">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">
                            <i className="bi bi-shield-lock me-2"></i>
                            Sécurité
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-shield-check me-1"></i>
                                Authentification à deux facteurs
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {user.two_factor_enabled ? (
                                  <span className="badge bg-success">
                                    <i className="bi bi-check-circle me-1"></i>
                                    Activée
                                  </span>
                                ) : (
                                  <span className="badge bg-warning">
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    Désactivée
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-key me-1"></i>
                                Changement de mot de passe requis
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {user.must_change_password ? (
                                  <span className="badge bg-danger">
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    Oui
                                  </span>
                                ) : (
                                  <span className="badge bg-success">
                                    <i className="bi bi-check-circle me-1"></i>
                                    Non
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-clock-history me-1"></i>
                                Dernière connexion
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {user.last_login_at ? formatDateTime(user.last_login_at) : 'Jamais connecté'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Permissions et Rôles */}
                  <div className="row">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">
                            <i className="bi bi-award me-2"></i>
                            Rôles et Permissions
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-person-badge me-1"></i>
                                Rôle
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                <span className="badge bg-primary fs-6">
                                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Non défini'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="col-12">
                              <label className="form-label text-muted small">
                                <i className="bi bi-key-fill me-1"></i>
                                Permissions
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {renderPermissions(user.permissions)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Organisation */}
                  <div className="row">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-light">
                          <h6 className="mb-0">
                            <i className="bi bi-building me-2"></i>
                            Organisation
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-building me-1"></i>
                                Entreprise
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {user.company_id ? `ID: ${user.company_id}` : 'Non assigné'}
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-shop me-1"></i>
                                Agence
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {user.agency_id ? `ID: ${user.agency_id}` : 'Non assigné'}
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-person-plus me-1"></i>
                                Créé par
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {user.created_by ? `ID: ${user.created_by}` : 'Auto-inscription'}
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <label className="form-label text-muted small">
                                <i className="bi bi-calendar-plus me-1"></i>
                                Date de création
                              </label>
                              <div className="form-control-plaintext fw-semibold">
                                {formatDateTime(user.created_at)}
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
        </div>
      </div>

      {/* Modal pour la modification de photo */}
      <div className="modal fade" id="photoModal" tabIndex="-1" aria-labelledby="photoModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="photoModalLabel">
                <i className="bi bi-camera me-2"></i>
                Modifier la photo de profil
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="profile_photo" className="form-label">
                  Choisir une nouvelle photo
                </label>
                <input 
                  type="file" 
                  className="form-control" 
                  id="profile_photo" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="form-text">
                  Formats acceptés : JPG, PNG, GIF. Taille maximale : 2MB
                </div>
              </div>
              
              {selectedFile && (
                <div className="mb-3">
                  <small className="text-muted">
                    Fichier sélectionné: {selectedFile.name}
                  </small>
                </div>
              )}
              
              <div className="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  data-bs-dismiss="modal"
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={updateProfilePhoto}
                  disabled={!selectedFile}
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          transition: transform 0.2s ease-in-out;
        }

        .card:hover {
          transform: translateY(-2px);
        }

        .form-control-plaintext {
          padding: 0.375rem 0;
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 0.5rem;
        }

        .badge {
          font-size: 0.75rem;
          padding: 0.35em 0.65em;
        }

        .position-relative .btn {
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
};

export default ProfileScreen;