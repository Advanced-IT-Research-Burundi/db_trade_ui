import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { API_CONFIG } from '../../services/config.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useNavigate, Link } from 'react-router-dom';
import ImportHeader  from './ImportHeader.jsx';
import useFormat from '../../hooks/useFormat.js';



const CommandesListsScreen = () => {
  const [commandes, setCommandes] = useState([]);
  const [filters, setFilters] = useState({
    search: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, commandeId: null });
  const toast = useRef(null);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { data, loading } = useSelector(state => state.apiData);
  const formatDate = useFormat().formatDate;

  useEffect(() => {
    loadCommandes();
  }, []);

  useEffect(() => {
    if (data.commandes) {
      setCommandes(data.commandes.data || []);
      setPagination({
        current_page: data.commandes.current_page,
        last_page: data.commandes.last_page,
        total: data.commandes.total,
        from: data.commandes.from,
        to: data.commandes.to
      });
    }
  }, [data]);

  // Debounced search effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (filters.search !== '') {
        loadCommandes(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [filters.search]);

  async function loadCommandes(page = 1, per_page = 10) {
    try {
      const params = { page, per_page, ...filters };
      dispatch(fetchApiData({ 
        url: API_CONFIG.ENDPOINTS.COMMANDES, 
        itemKey: 'commandes', 
        params 
      }));
    } catch (error) {
      showToast('error', error.message);
    }
  }

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCommandes(1);
  };

  const handleReset = () => {
    setFilters({ search: '' });
    setTimeout(() => loadCommandes(1), 0);
  };

  const handleDeleteCommande = async (commandeId) => {
    try {
      const response = await ApiService.delete(`/api/commandes/${commandeId}`);
      if (response.success) {
        showToast('success', 'Commande supprimée avec succès');
        loadCommandes(pagination.current_page);
      } else {
        showToast('error', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, commandeId: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? 'Erreur' : 'Succès', 
      detail, 
      life: 3000 
    });
  };

  const formatWeight = (weight) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(weight) + ' kg';
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getWeightBadgeColor = (weight) => {
    if (weight > 1000) return 'bg-danger';
    if (weight > 500) return 'bg-warning';
    return 'bg-success';
  };

  const Pagination = () => {
    if (pagination.last_page <= 1) return null;

    const getVisiblePages = () => {
      const current = pagination.current_page;
      const last = pagination.last_page;
      const pages = [];

      if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
      }

      pages.push(1);
      if (current > 4) pages.push('...');
      
      const start = Math.max(2, current - 1);
      const end = Math.min(last - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < last - 3) pages.push('...');
      pages.push(last);
      
      return pages;
    };

    return (
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadCommandes(pagination.current_page - 1)} 
              disabled={pagination.current_page === 1}
            >
              <i className="pi pi-chevron-left"></i>
            </button>
          </li>
          
          {getVisiblePages().map((page, index) => (
            <li key={index} className={`page-item ${page === pagination.current_page ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button className="page-link" onClick={() => loadCommandes(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadCommandes(pagination.current_page + 1)} 
              disabled={pagination.current_page === pagination.last_page}
            >
              <i className="pi pi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      
      {/* Import Header */}
      <ImportHeader />
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary mb-1">
                <i className="pi pi-truck me-2"></i>Gestion des Commandes
              </h2>
              <p className="text-muted mb-0">{pagination.total} commande(s) au total</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => loadCommandes(pagination.current_page)} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? 'Actualisation...' : 'Actualiser'}
              </button>
              <button 
                onClick={() => navigate('/commandes/create')} 
                className="btn btn-primary"
              >
                <i className="pi pi-plus-circle me-1"></i>Nouvelle Commande
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-filter me-2"></i>Filtres de recherche
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Recherche</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Matricule, véhicule, poids ou commentaire..."
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-4 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-search me-1"></i>Rechercher
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-refresh me-1"></i>Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Commandes Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>Liste des Commandes
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">#</th>
                  <th className="border-0 px-4 py-3">Date</th>
                  <th className="border-0 px-4 py-3">Véhicule</th>
                  <th className="border-0 px-4 py-3">Immatriculation</th>
                  <th className="border-0 px-4 py-3">Poids</th>
                  <th className="border-0 px-4 py-3">Commentaire</th>
                  <th className="border-0 px-4 py-3">Status</th>
                  <th className="border-0 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {commandes.length === 0 && loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.commandes === undefined && commandes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>Aucune commande trouvée</h5>
                        <p className="mb-0">Essayez de modifier vos critères de recherche ou créez une nouvelle commande</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  commandes.map((commande) => (
                    <tr key={commande.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="pi pi-hashtag text-primary"></i>
                          </div>
                          <strong className="text-primary">{commande.id}</strong>
                        </div>
                      </td>
                      <td className="px-4">
                        <div>
                          <strong>{formatDate(commande.created_at)}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(commande.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </small>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <i className="pi pi-car text-info me-2"></i>
                          {commande.vehicule || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4">
                        <span className="badge bg-secondary">{commande.matricule}</span>
                      </td>
                      <td className="px-4">
                        <span className={`badge text-white ${getWeightBadgeColor(commande.poids)}`}>
                          {formatWeight(commande.poids)}
                        </span>
                      </td>
                      <td className="px-4">
                        {commande.commentaire ? (
                          <span title={commande.commentaire}>
                            {truncateText(commande.commentaire, 30)}
                          </span>
                        ) : (
                          <em className="text-muted">Aucun commentaire</em>
                        )}
                      </td>
                      <td className="px-4">
                        <span className="badge bg-info text-white">En cours</span>
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <Link 
                            to={`/commandes/${commande.id}`} 
                            className="btn btn-sm btn-outline-info" 
                            title="Voir"
                          >
                            <i className="pi pi-eye"></i>
                          </Link>
                         
                          <Link 
                            to={`/commandes/${commande.id}/edit`} 
                            className="btn btn-sm btn-outline-warning" 
                            title="Modifier"
                          >
                            <i className="pi pi-pencil"></i>
                          </Link>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger" 
                            title="Supprimer"
                            onClick={() => setDeleteModal({ show: true, commandeId: commande.id })}
                          >
                            <i className="pi pi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="card-footer bg-transparent border-0">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Affichage de {pagination.from} à {pagination.to} sur {pagination.total} résultats
              </div>
              <Pagination />
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">
                    <i className="pi pi-exclamation-triangle me-2"></i>Confirmer la suppression
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setDeleteModal({ show: false, commandeId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, commandeId: null })}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteCommande(deleteModal.commandeId)}
                  >
                    <i className="pi pi-trash me-1"></i>Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, commandeId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default CommandesListsScreen;