import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';

const SalesScreen = () => {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedSales, setSelectedSales] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    date_from: '',
    date_to: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, saleId: null });
  
  const toast = useRef(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        ...filters
      });

      const response = await ApiService.get(`/api/sales?${params}`);
      
      if (response.success) {
        setSales(response.data.sales.data || []);
        setStats(response.data.stats || {});
        setPagination({
          current_page: response.data.sales.current_page,
          last_page: response.data.sales.last_page,
          per_page: response.data.sales.per_page,
          total: response.data.sales.total,
          from: response.data.sales.from,
          to: response.data.sales.to
        });
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: response.message || 'Erreur lors du chargement',
          life: 3000
        });
      }
    } catch (error) {
      console.log('Erreur de connexion: ' + error.message);
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

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadSales(1);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      date_from: '',
      date_to: '',
      status: ''
    });
    setTimeout(() => loadSales(1), 0);
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedSales(sales.map(sale => sale.id));
    } else {
      setSelectedSales([]);
    }
  };

  const handleSelectSale = (saleId, checked) => {
    if (checked) {
      setSelectedSales(prev => [...prev, saleId]);
    } else {
      setSelectedSales(prev => prev.filter(id => id !== saleId));
      setSelectAll(false);
    }
  };

  const handleDeleteSale = async (saleId) => {
    try {
      const response = await ApiService.delete(`/api/sales/${saleId}`);
      
      if (response.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Vente supprimée avec succès',
          life: 3000
        });
        loadSales(pagination.current_page);
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
        detail: error.message,
        life: 3000
      });
    }
    setDeleteModal({ show: false, saleId: null });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (sale) => {
    if (sale.due_amount == 0) {
      return <span className="badge bg-success"><i className="pi pi-check-circle me-1"></i>Payé</span>;
    } else if (sale.paid_amount > 0) {
      return <span className="badge bg-warning"><i className="pi pi-clock me-1"></i>Partiel</span>;
    } else {
      return <span className="badge bg-danger"><i className="pi pi-x-circle me-1"></i>Impayé</span>;
    }
  };

  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary mb-1">
                <i className="pi pi-cart-check-fill me-2"></i>Gestion des Ventes
              </h2>
              <p className="text-muted mb-0">{pagination.total} vente(s) au total</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => loadSales(pagination.current_page)}
                disabled={loading}
              >
                <i className="pi pi-arrow-clockwise me-1"></i>
                {loading ? 'Actualisation...' : 'Actualiser'}
              </button>
              <a href="/sales/create" className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>Nouvelle Vente
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <i className="pi pi-currency-dollar text-primary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total</h6>
                  <h4 className="mb-0">{formatCurrency(stats.totalRevenue || 0)}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                    <i className="pi pi-check-circle text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Ventes Payées</h6>
                  <h5 className="mb-0">{stats.paidSales || 0}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                    <i className="pi pi-clock text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Créances</h6>
                  <h4 className="mb-0">{formatCurrency(stats.totalDue || 0)}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                    <i className="pi pi-calendar-day text-info fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Aujourd'hui</h6>
                  <h6 className="mb-0">{stats.todaySales || 0}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Rechercher</label>
              <div className="input-group">
                <span className="input-group-text"><i className="pi pi-search"></i></span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Rechercher une vente..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Date début</label>
              <input 
                type="date" 
                className="form-control"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Date fin</label>
              <input 
                type="date" 
                className="form-control"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Statut</label>
              <select 
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Tous</option>
                <option value="paid">Payé</option>
                <option value="partial">Partiel</option>
                <option value="unpaid">Impayé</option>
              </select>
            </div>
            
            <div className="col-md-3 d-flex align-items-end gap-2">
              <a href="/proformas" className="btn btn-outline-primary">
                <i className="pi pi-file-earmark-text me-1"></i>Proforma
              </a>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-funnel me-1"></i>Filtrer
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-x-circle me-1"></i>Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sales Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="form-check-input"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="border-0 px-4 py-3">Vente #</th>
                  <th className="border-0 px-4 py-3">Client</th>
                  <th className="border-0 px-4 py-3">Date</th>
                  <th className="border-0 px-4 py-3">Montant Total</th>
                  <th className="border-0 px-4 py-3">Payé</th>
                  <th className="border-0 px-4 py-3">Reste</th>
                  <th className="border-0 px-4 py-3">Statut</th>
                  <th className="border-0 px-4 py-3">Facture</th>
                  <th className="border-0 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>Aucune vente trouvée</h5>
                        <p className="mb-0">Commencez par créer votre première vente</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="sale-row">
                      <td className="px-4">
                        <input 
                          type="checkbox" 
                          className="form-check-input"
                          checked={selectedSales.includes(sale.id)}
                          onChange={(e) => handleSelectSale(sale.id, e.target.checked)}
                        />
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-2">
                            <i className="pi pi-receipt text-primary"></i>
                          </div>
                          <div>
                            <strong className="text-primary">#{sale.id.toString().padStart(6, '0')}</strong>
                            <br />
                            <small className="text-muted">
                              {new Date(sale.created_at).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        <div>
                          <strong>{sale.client?.name || 'Client supprimé'}</strong>
                          <br />
                          <small className="text-muted">{sale.client?.phone || ''}</small>
                        </div>
                      </td>
                      <td className="px-4">
                        <div>
                          <strong>{formatDate(sale.sale_date)}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(sale.sale_date).toLocaleDateString('fr-FR', { 
                              weekday: 'short' 
                            })}
                          </small>
                        </div>
                      </td>
                      <td className="px-4">
                        <strong className="text-dark">{formatCurrency(sale.total_amount)}</strong>
                      </td>
                      <td className="px-4">
                        <span className="text-success">{formatCurrency(sale.paid_amount)}</span>
                      </td>
                      <td className="px-4">
                        {sale.due_amount > 0 ? (
                          <span className="text-warning">{formatCurrency(sale.due_amount)}</span>
                        ) : (
                          <span className="text-success">0 F</span>
                        )}
                      </td>
                      <td className="px-4">
                        {getStatusBadge(sale)}
                      </td>
                      <td className="px-4">
                        <strong>{sale.type_facture || 'Standard'}</strong>
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <a 
                            href={`/sales/${sale.id}`}
                            className="btn btn-sm btn-outline-primary"
                            title="Voir"
                          >
                            <i className="pi pi-eye"></i>
                          </a>
                          <a 
                            href={`/sales/${sale.id}/edit`}
                            className="btn btn-sm btn-outline-warning"
                            title="Modifier"
                          >
                            <i className="pi pi-pencil"></i>
                          </a>
                          <button 
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Supprimer"
                            onClick={() => setDeleteModal({ show: true, saleId: sale.id })}
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
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => loadSales(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                    >
                      <i className="pi pi-chevron-left"></i>
                    </button>
                  </li>
                  
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === pagination.last_page || 
                      Math.abs(page - pagination.current_page) <= 2
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <li className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )}
                        <li className={`page-item ${pagination.current_page === page ? 'active' : ''}`}>
                          <button 
                            className="page-link"
                            onClick={() => loadSales(page)}
                          >
                            {page}
                          </button>
                        </li>
                      </React.Fragment>
                    ))}
                  
                  <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => loadSales(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                    >
                      <i className="pi pi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
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
                  onClick={() => setDeleteModal({ show: false, saleId: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p>Êtes-vous sûr de vouloir supprimer cette vente ? Cette action est irréversible.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setDeleteModal({ show: false, saleId: null })}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleDeleteSale(deleteModal.saleId)}
                >
                  <i className="pi pi-trash me-1"></i>Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal backdrop */}
      {deleteModal.show && (
        <div 
          className="modal-backdrop show"
          onClick={() => setDeleteModal({ show: false, saleId: null })}
        ></div>
      )}
    </div>
  );
}

export default SalesScreen;