import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';

const SuppliersShowScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useRef(null);
  
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données du fournisseur
  const loadSupplier = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.get(`/api/suppliers/${id}`);
      
      if (response.success) {
        setSupplier(response.data);
      } else {
        setError(response.message || 'Erreur lors du chargement du fournisseur');
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: response.message || 'Erreur lors du chargement du fournisseur',
          life: 3000
        });
      }
    } catch (error) {
      const errorMessage = 'Erreur lors du chargement du fournisseur: ' + error.message;
      setError(errorMessage);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: errorMessage,
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Supprimer le fournisseur
  const handleDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur "${supplier.name}" ?`)) {
      try {
        const response = await ApiService.delete(`/api/suppliers/${id}`);
        
        if (response.success) {
          toast.current.show({
            severity: 'success',
            summary: 'Succès',
            detail: 'Fournisseur supprimé avec succès',
            life: 3000
          });
          
          // Rediriger vers la liste après suppression
          setTimeout(() => {
            navigate('/suppliers');
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
          detail: 'Erreur lors de la suppression: ' + error.message,
          life: 3000
        });
      }
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadSupplier();
  }, [id]);

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      {/* En-tête avec boutons d'action */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-eye me-2"></i>
                  Détails du fournisseur
                </h4>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    title="Retour à la liste"
                    onClick={() => navigate('/suppliers')}
                  >
                    <i className="pi pi-arrow-left me-2"></i>
                    Retour
                  </button>
                  {supplier && (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-warning btn-sm"
                        title="Modifier"
                        onClick={() => navigate(`/suppliers/${id}/edit`)}
                      >
                        <i className="pi pi-pencil me-2"></i>
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        title="Supprimer"
                        onClick={handleDelete}
                      >
                        <i className="pi pi-trash me-2"></i>
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <i className="pi pi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                  <h5 className="text-danger mt-3">Erreur</h5>
                  <p className="text-muted">{error}</p>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={loadSupplier}
                  >
                    <i className="pi pi-refresh me-2"></i>
                    Réessayer
                  </button>
                </div>
              ) : supplier ? (
                <div className="row">
                  {/* Informations principales */}
                  <div className="col-md-8">
                    <div className="card h-100">
                      <div className="card-header">
                        <h5 className="card-title m-0">
                          <i className="pi pi-info-circle me-2"></i>
                          Informations générales
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="border-bottom pb-3">
                              <label className="form-label text-muted small">Nom du fournisseur</label>
                              <div className="d-flex align-items-center">
                                <i className="pi pi-building text-primary me-2"></i>
                                <h5 className="m-0">{supplier.name}</h5>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="border-bottom pb-3">
                              <label className="form-label text-muted small">Email</label>
                              <div className="d-flex align-items-center">
                                <i className="pi pi-envelope text-primary me-2"></i>
                                {supplier.email ? (
                                  <a 
                                    href={`mailto:${supplier.email}`} 
                                    className="text-decoration-none"
                                  >
                                    {supplier.email}
                                  </a>
                                ) : (
                                  <span className="text-muted">Non renseigné</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="border-bottom pb-3">
                              <label className="form-label text-muted small">Téléphone</label>
                              <div className="d-flex align-items-center">
                                <i className="pi pi-phone text-primary me-2"></i>
                                {supplier.phone ? (
                                  <a 
                                    href={`tel:${supplier.phone}`} 
                                    className="text-decoration-none"
                                  >
                                    {supplier.phone}
                                  </a>
                                ) : (
                                  <span className="text-muted">Non renseigné</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="pb-3">
                              <label className="form-label text-muted small">Adresse</label>
                              <div className="d-flex align-items-start">
                                <i className="pi pi-map-marker text-primary me-2 mt-1"></i>
                                {supplier.address ? (
                                  <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {supplier.address}
                                  </div>
                                ) : (
                                  <span className="text-muted">Non renseignée</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Métadonnées */}
                  <div className="col-md-4">
                    <div className="card h-100">
                      <div className="card-header">
                        <h5 className="card-title m-0">
                          <i className="pi pi-clock me-2"></i>
                          Métadonnées
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="border-bottom pb-3">
                              <label className="form-label text-muted small">ID</label>
                              <div className="d-flex align-items-center">
                                <i className="pi pi-hashtag text-primary me-2"></i>
                                <span className="badge bg-secondary">{supplier.id}</span>
                              </div>
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="border-bottom pb-3">
                              <label className="form-label text-muted small">Date de création</label>
                              <div className="d-flex align-items-center">
                                <i className="pi pi-calendar-plus text-success me-2"></i>
                                <small>{formatDate(supplier.created_at)}</small>
                              </div>
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="pb-3">
                              <label className="form-label text-muted small">Dernière modification</label>
                              <div className="d-flex align-items-center">
                                <i className="pi pi-calendar-minus text-warning me-2"></i>
                                <small>{formatDate(supplier.updated_at)}</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="pi pi-building text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">Fournisseur non trouvé</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section actions rapides */}
      {supplier && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="card-title m-0">
                  <i className="pi pi-cog me-2"></i>
                  Actions rapides
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6 col-lg-3">
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100"
                      onClick={() => navigate(`/suppliers/${id}/edit`)}
                    >
                      <i className="pi pi-pencil me-2"></i>
                      Modifier les informations
                    </button>
                  </div>
                  
                  {supplier.email && (
                    <div className="col-md-6 col-lg-3">
                      <a
                        href={`mailto:${supplier.email}`}
                        className="btn btn-outline-info w-100"
                      >
                        <i className="pi pi-envelope me-2"></i>
                        Envoyer un email
                      </a>
                    </div>
                  )}
                  
                  {supplier.phone && (
                    <div className="col-md-6 col-lg-3">
                      <a
                        href={`tel:${supplier.phone}`}
                        className="btn btn-outline-success w-100"
                      >
                        <i className="pi pi-phone me-2"></i>
                        Appeler
                      </a>
                    </div>
                  )}
                  
                  <div className="col-md-6 col-lg-3">
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={handleDelete}
                    >
                      <i className="pi pi-trash me-2"></i>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersShowScreen;