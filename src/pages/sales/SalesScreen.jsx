import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import StatCard from '../../components/Card/StatCard.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';

const SalesScreen = () => {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    date_from: '',
    date_to: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, saleId: null });
  const toast = useRef(null);
  const navigate = useNavigate();

  const { data } = useSelector((state) => ({
    data : state.apiData?.data
  }));

  const dispatch = useDispatch();

  useEffect(() => {
    loadSales();
    loadStats();
  }, []);

  useEffect(() => {
    if (data) {
      setSales(data?.sales?.sales?.data || []);
      setPagination({
        current_page: data?.sales?.sales?.current_page,
        last_page: data?.sales?.sales?.last_page,
        total: data?.sales?.sales?.total,
        from: data?.sales?.sales?.from,
        to: data?.sales?.sales?.to
      });
      setStats(data?.sales?.stats || {});
      }

  }, [data])

  const loadSales = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, ...filters };
      dispatch(fetchApiData({ url: '/api/sales', itemKey: 'sales', method: 'GET', params }));
       
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      dispatch(fetchApiData({ url: '/api/sales', itemKey: 'sales', method: 'GET' }));
    } catch (error) {
      console.error('Erreur stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadSales(1);
  };

  const handleReset = () => {
    setFilters({ search: '', date_from: '', date_to: '', status: '' });
    setTimeout(() => loadSales(1), 0);
  };

  const handleDeleteSale = async (saleId) => {
    try {
      const response = await ApiService.delete(`/api/sales/${saleId}`);
      if (response.success) {
        showToast('success', 'Vente supprimée avec succès');
        loadSales(pagination.current_page);
        loadStats();
      } else {
        showToast('error', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, saleId: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ severity, summary: severity === 'error' ? 'Erreur' : 'Succès', detail, life: 3000 });
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' F';
  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

  const getStatusBadge = (sale) => {
    if (sale.due_amount == 0) return <span className="badge bg-success"><i className="pi pi-check-circle me-1"></i>Payé</span>;
    if (sale.paid_amount > 0) return <span className="badge bg-warning"><i className="pi pi-clock me-1"></i>Partiel</span>;
    return <span className="badge bg-danger"><i className="pi pi-x-circle me-1"></i>Impayé</span>;
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
            <button className="page-link" onClick={() => loadSales(pagination.current_page - 1)} disabled={pagination.current_page === 1}>
              <i className="pi pi-chevron-left"></i>
            </button>
          </li>
          
          {getVisiblePages().map((page, index) => (
            <li key={index} className={`page-item ${page === pagination.current_page ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button className="page-link" onClick={() => loadSales(page)}>{page}</button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => loadSales(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page}>
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
                <i className="pi pi-cart-check-fill me-2"></i>Gestion des Ventes
              </h2>
              <p className="text-muted mb-0">{pagination.total} vente(s) au total</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary" onClick={() => { loadSales(pagination.current_page); loadStats(); }} disabled={loading}>
                <i className="pi pi-arrow-clockwise me-1"></i>
                {loading ? 'Actualisation...' : 'Actualiser'}
              </button>
              <button  onClick={()=>navigate('/sales/create')} className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>Nouvelle Vente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <StatCard icon="money-bill" title="Total" value={formatCurrency(stats.totalRevenue || 0)} color="primary" loading={statsLoading} />
        <StatCard icon="check-circle" title="Ventes Payées" value={stats.paidSales || 0} color="success" loading={statsLoading} />
        <StatCard icon="clock" title="Créances" value={formatCurrency(stats.totalDue || 0)} color="warning" loading={statsLoading} />
        <StatCard icon="calendar" title="Aujourd'hui" value={stats.todaySales || 0} color="info" loading={statsLoading} />
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Rechercher</label>
              <div className="input-group">
                <span className="input-group-text"><i className="pi pi-search"></i></span>
                <input type="text" className="form-control" placeholder="Rechercher une vente..." 
                       value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label">Date début</label>
              <input type="date" className="form-control" value={filters.date_from} 
                     onChange={(e) => handleFilterChange('date_from', e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Date fin</label>
              <input type="date" className="form-control" value={filters.date_to} 
                     onChange={(e) => handleFilterChange('date_to', e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Statut</label>
              <select className="form-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
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
                    <td colSpan="9" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>Aucune vente trouvée</h5>
                        <p className="mb-0">Commencez par créer votre première vente</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sales.map((sale, index) => (
                    <tr key={index}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-2">
                            <i className="pi pi-tag text-primary"></i>
                          </div>
                          <div>
                            <strong className="text-primary">#{sale.id.toString().padStart(6, '0')}</strong>
                            <br />
                            <small className="text-muted">
                              {new Date(sale.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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
                          <small className="text-muted">{new Date(sale.sale_date).toLocaleDateString('fr-FR', { weekday: 'short' })}</small>
                        </div>
                      </td>
                      <td className="px-4"><strong className="text-dark">{formatCurrency(sale.total_amount)}</strong></td>
                      <td className="px-4"><span className="text-success">{formatCurrency(sale.paid_amount)}</span></td>
                      <td className="px-4">
                        {sale.due_amount > 0 ? (
                          <span className="text-warning">{formatCurrency(sale.due_amount)}</span>
                        ) : (
                          <span className="text-success">0 F</span>
                        )}
                      </td>
                      <td className="px-4">{getStatusBadge(sale)}</td>
                      <td className="px-4"><strong>{sale.type_facture || 'Standard'}</strong></td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <Link to={`/sales/${sale.id}`} className="btn btn-sm btn-outline-primary" title="Voir">
                            <i className="pi pi-eye"></i>
                          </Link>
                          <a href={`/sales/${sale.id}/edit`} className="btn btn-sm btn-outline-warning" title="Modifier">
                            <i className="pi pi-pencil"></i>
                          </a>
                          <button type="button" className="btn btn-sm btn-outline-danger" title="Supprimer"
                                  onClick={() => setDeleteModal({ show: true, saleId: sale.id })}>
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
                  <button type="button" className="btn-close btn-close-white"
                          onClick={() => setDeleteModal({ show: false, saleId: null })}></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer cette vente ? Cette action est irréversible.</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary"
                          onClick={() => setDeleteModal({ show: false, saleId: null })}>
                    Annuler
                  </button>
                  <button type="button" className="btn btn-danger"
                          onClick={() => handleDeleteSale(deleteModal.saleId)}>
                    <i className="pi pi-trash me-1"></i>Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={() => setDeleteModal({ show: false, saleId: null })}></div>
        </>
      )}
    </div>
  );
};

export default SalesScreen;