import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';

const SupplierScreen = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    agency_id: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, supplierId: null });
  const toast = useRef(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, ...filters };
      const response = await ApiService.get('/api/suppliers', params);
      
      if (response.success) {
        setSuppliers(response.data.suppliers.data || []);

        setAgencies(response.data.agencies || []);
        setPagination({
          current_page: response.data.suppliers.current_page,
          last_page: response.data.suppliers.last_page,
          total: response.data.suppliers.total,
          from: response.data.suppliers.from,
          to: response.data.suppliers.to
        });
      } else {
        showToast('error', response.message || 'Erreur lors du chargement');
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadSuppliers(1);
  };

  const handleReset = () => {
    setFilters({ search: '', agency_id: '' });
    setTimeout(() => loadSuppliers(1), 0);
  };

  const handleDeleteSupplier = async (supplierId) => {
    try {
      const response = await ApiService.delete(`/api/suppliers/${supplierId}`);
      if (response.success) {
        showToast('success', 'Fournisseur supprimé avec succès');
        loadSuppliers(pagination.current_page);
      } else {
        showToast('error', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, supplierId: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? 'Erreur' : 'Succès', 
      detail, 
      life: 3000 
    });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

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
              onClick={() => loadSuppliers(pagination.current_page - 1)} 
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
                <button className="page-link" onClick={() => loadSuppliers(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadSuppliers(pagination.current_page + 1)} 
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
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary mb-1">
                <i className="pi pi-truck me-2"></i>Gestion des Fournisseurs
              </h2>
              <p className="text-muted mb-0">{pagination.total} fournisseur(s) au total</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => loadSuppliers(pagination.current_page)} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? 'Actualisation...' : 'Actualiser'}
              </button>
              <a href="/suppliers/create" className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>Nouveau Fournisseur
              </a>
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
            <div className="col-md-6">
              <label className="form-label">Recherche</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Nom, email ou téléphone..."
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Agence</label>
              <select 
                className="form-select" 
                value={filters.agency_id} 
                onChange={(e) => handleFilterChange('agency_id', e.target.value)}
              >
                <option value="">Toutes</option>
                {agencies.map(agency => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2 d-flex align-items-end gap-2">
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

      {/* Suppliers Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>Liste des Fournisseurs
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Nom</th>
                  <th className="border-0 px-4 py-3">Téléphone</th>
                  <th className="border-0 px-4 py-3">Email</th>
                  <th className="border-0 px-4 py-3">Adresse</th>
                  <th className="border-0 px-4 py-3">Agence</th>
                  <th className="border-0 px-4 py-3">Créé le</th>
                  <th className="border-0 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>Aucun fournisseur trouvé</h5>
                        <p className="mb-0">Essayez de modifier vos critères de recherche ou créez un nouveau fournisseur</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="pi pi-truck text-primary"></i>
                          </div>
                          <strong className="text-primary">{supplier.name}</strong>
                        </div>
                      </td>
                      <td className="px-4">
                        {supplier.phone ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-phone text-muted me-2"></i>
                            {supplier.phone}
                          </div>
                        ) : (
                          <span className="text-muted">Non renseigné</span>
                        )}
                      </td>
                      <td className="px-4">
                        {supplier.email ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-envelope text-muted me-2"></i>
                            <span title={supplier.email}>
                              {supplier.email.length > 25 
                                ? supplier.email.substring(0, 25) + '...' 
                                : supplier.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">Non renseigné</span>
                        )}
                      </td>
                      <td className="px-4">
                        {supplier.address ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-map-marker text-muted me-2"></i>
                            <span title={supplier.address}>
                              {supplier.address.length > 30 
                                ? supplier.address.substring(0, 30) + '...' 
                                : supplier.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">Non renseignée</span>
                        )}
                      </td>
                      <td className="px-4">
                        {supplier.agency ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-building text-info me-2"></i>
                            {supplier.agency.name}
                          </div>
                        ) : (
                          <span className="text-muted">Non assignée</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div>
                          <strong>{formatDate(supplier.created_at)}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(supplier.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </small>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <a 
                            href={`/suppliers/${supplier.id}`} 
                            className="btn btn-sm btn-outline-info" 
                            title="Voir"
                          >
                            <i className="pi pi-eye"></i>
                          </a>
                          <a 
                            href={`/suppliers/${supplier.id}/edit`} 
                            className="btn btn-sm btn-outline-warning" 
                            title="Modifier"
                          >
                            <i className="pi pi-pencil"></i>
                          </a>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger" 
                            title="Supprimer"
                            onClick={() => setDeleteModal({ show: true, supplierId: supplier.id })}
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
                    onClick={() => setDeleteModal({ show: false, supplierId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.</p>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>Attention :</strong> La suppression de ce fournisseur pourrait affecter les achats et commandes associés.
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, supplierId: null })}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteSupplier(deleteModal.supplierId)}
                  >
                    <i className="pi pi-trash me-1"></i>Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, supplierId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default SupplierScreen;