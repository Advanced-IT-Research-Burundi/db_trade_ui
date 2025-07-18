import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import StatCard from '../../components/Card/StatCard.jsx';


const PurchaseScreen = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    purchase_date: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, purchaseId: null });
  const toast = useRef(null);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, ...filters };
      const response = await ApiService.get('/api/purchases', params);
      
      if (response.success) {
        setPurchases(response.data.purchases.data || []);

        setStats(response.data.stats || {});
        setPagination({
          current_page: response.data.purchases.current_page,
          last_page: response.data.purchases.last_page,
          total: response.data.purchases.total,
          from: response.data.purchases.from,
          to: response.data.purchases.to
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
    loadPurchases(1);
  };

  const handleReset = () => {
    setFilters({ search: '', status: '', purchase_date: '' });
    setTimeout(() => loadPurchases(1), 0);
  };

  const handleDeletePurchase = async (purchaseId) => {
    try {
      const response = await ApiService.delete(`/api/purchases/${purchaseId}`);
      if (response.success) {
        showToast('success', 'Achat supprimé avec succès');
        loadPurchases(pagination.current_page);
      } else {
        showToast('error', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, purchaseId: null });
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FBU';
  };

  const getStatusBadge = (purchase) => {
    if (purchase.due_amount == 0) {
      return <span className="badge bg-success"><i className="pi pi-check-circle me-1"></i>Payé</span>;
    }
    if (purchase.paid_amount > 0) {
      return <span className="badge bg-warning"><i className="pi pi-clock me-1"></i>Partiel</span>;
    }
    return <span className="badge bg-danger"><i className="pi pi-times-circle me-1"></i>Impayé</span>;
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
              onClick={() => loadPurchases(pagination.current_page - 1)} 
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
                <button className="page-link" onClick={() => loadPurchases(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadPurchases(pagination.current_page + 1)} 
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
                <i className="pi pi-shopping-cart me-2"></i>Gestion des Achats
              </h2>
              <p className="text-muted mb-0">{pagination.total} achat(s) au total</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => { loadPurchases(pagination.current_page);  }} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? 'Actualisation...' : 'Actualiser'}
              </button>
              <a href="/purchases/create" className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>Nouvel Achat
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <StatCard 
          icon="shopping-cart" 
          title="Total Achats" 
          value={stats.totalPurchases || 0} 
          color="primary" 
          loading={loading} 
        />
        <StatCard 
          icon="money-bill" 
          title="Montant Total" 
          value={formatCurrency(stats.totalAmount || 0)} 
          color="success" 
          loading={loading} 
        />
        <StatCard 
          icon="check-circle" 
          title="Achats Payés" 
          value={stats.paidPurchases || 0} 
          color="info" 
          loading={loading} 
        />
        <StatCard 
          icon="exclamation-triangle" 
          title="En Attente" 
          value={stats.pendingPurchases || 0} 
          color="warning" 
          loading={loading} 
        />
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
            <div className="col-md-4">
              <label className="form-label">Recherche</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Fournisseur, stock..."
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Statut</label>
              <select 
                className="form-select" 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="paid">Payé</option>
                <option value="partial">Partiellement payé</option>
                <option value="unpaid">Non payé</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Date d'achat</label>
              <input 
                type="date" 
                className="form-control" 
                value={filters.purchase_date} 
                onChange={(e) => handleFilterChange('purchase_date', e.target.value)} 
              />
            </div>
            
            <div className="col-md-2 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-search me-1"></i>Filtrer
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-refresh me-1"></i>Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>Liste des Achats
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">ID</th>
                  <th className="border-0 px-4 py-3">Fournisseur</th>
                  <th className="border-0 px-4 py-3">Stock</th>
                  <th className="border-0 px-4 py-3">Date d'achat</th>
                  <th className="border-0 px-4 py-3">Montant Total</th>
                  <th className="border-0 px-4 py-3">Montant Payé</th>
                  <th className="border-0 px-4 py-3">Reste à Payer</th>
                  <th className="border-0 px-4 py-3">Statut</th>
                  <th className="border-0 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : purchases.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>Aucun achat trouvé</h5>
                        <p className="mb-0">Commencez par créer votre premier achat</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="px-4">
                        <span className="badge bg-secondary">#{purchase.id.toString().padStart(6, '0')}</span>
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <i className="pi pi-building text-muted me-2"></i>
                          {purchase.supplier?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <i className="pi pi-box text-muted me-2"></i>
                          {purchase.stock?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4">
                        <div>
                          <strong>{formatDate(purchase.purchase_date)}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(purchase.purchase_date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                          </small>
                        </div>
                      </td>
                      <td className="px-4">
                        <strong className="text-success">{formatCurrency(purchase.total_amount)}</strong>
                      </td>
                      <td className="px-4">
                        <span className="text-info">{formatCurrency(purchase.paid_amount)}</span>
                      </td>
                      <td className="px-4">
                        {purchase.due_amount > 0 ? (
                          <span className="text-danger">{formatCurrency(purchase.due_amount)}</span>
                        ) : (
                          <span className="text-success">0 FBU</span>
                        )}
                      </td>
                      <td className="px-4">{getStatusBadge(purchase)}</td>
                      <td className="px-4">
                        <div className="dropdown">
                          <button 
                            className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                            type="button" 
                            data-bs-toggle="dropdown"
                          >
                            <i className="pi pi-ellipsis-v"></i>
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <a className="dropdown-item" href={`/purchases/${purchase.id}`}>
                                <i className="pi pi-eye me-2"></i>Voir
                              </a>
                            </li>
                            <li>
                              <a className="dropdown-item" href={`/purchases/${purchase.id}/edit`}>
                                <i className="pi pi-pencil me-2"></i>Modifier
                              </a>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button 
                                className="dropdown-item text-danger" 
                                onClick={() => setDeleteModal({ show: true, purchaseId: purchase.id })}
                              >
                                <i className="pi pi-trash me-2"></i>Supprimer
                              </button>
                            </li>
                          </ul>
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
                    onClick={() => setDeleteModal({ show: false, purchaseId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer cet achat ? Cette action est irréversible.</p>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>Attention :</strong> La suppression de cet achat pourrait affecter les stocks et inventaires.
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, purchaseId: null })}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeletePurchase(deleteModal.purchaseId)}
                  >
                    <i className="pi pi-trash me-1"></i>Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, purchaseId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default PurchaseScreen;