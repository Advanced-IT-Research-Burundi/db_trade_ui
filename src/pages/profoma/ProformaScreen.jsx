import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import StatCard from '../../components/Card/StatCard.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { Link } from 'react-router-dom';


const ProformaScreen = () => {
  const [proformas, setProformas] = useState([]);
  const [loading] = useState(false);
  const [stats, setStats] = useState({});
  const [selectedProformas, setSelectedProformas] = useState([]);
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
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, proformaId: null });
  const toast = useRef(null);

  const dispatch = useDispatch();

  const { data } = useSelector((state) => ({
    data: state.apiData?.data?.proformas
  }));

  useEffect(() => {
    loadProformas();
  }, []);
  useEffect(() => {
    if(data){
      setProformas(data?.proformas?.data || []);
      setStats(data?.stats || {});
      setPagination({
        current_page: data?.current_page,
        last_page: data?.last_page,
        total: data?.total,
        from: data?.from,
        to: data?.to
      });
    }
  }, [data]);

  const loadProformas = async (page = 1) => {
    try {
    
      const params = { page, ...filters };
    
      dispatch(fetchApiData({ url: '/api/proformas', itemKey: 'proformas', method: 'GET', params }));
       
      
    } catch (error) {
      showToast('error', error.message);
    }
  };


  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProformas(1);
  };

  const handleReset = () => {
    setFilters({ search: '', date_from: '', date_to: '', status: '' });
    setTimeout(() => loadProformas(1), 0);
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedProformas(proformas.map(p => p.id));
    } else {
      setSelectedProformas([]);
    }
  };

  const handleSelectProforma = (proformaId, checked) => {
    if (checked) {
      setSelectedProformas(prev => [...prev, proformaId]);
    } else {
      setSelectedProformas(prev => prev.filter(id => id !== proformaId));
      setSelectAll(false);
    }
  };

  const handleDeleteProforma = async (proformaId) => {
    try {
      dispatch(fetchApiData({ url: `/api/proformas/${proformaId}`, itemKey: 'proformas', method: 'DELETE' }));
      if (response.success) {
        showToast('success', 'Proforma supprimé avec succès');
        loadProformas(pagination.current_page);
      } else {
        showToast('error', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, proformaId: null });
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

  const getStatusBadge = (proforma) => {
    if (proforma.due_amount == 0) {
      return <span className="badge bg-success"><i className="pi pi-check-circle me-1"></i>Payé</span>;
    }
    if (proforma.due_amount < proforma.total_amount) {
      return <span className="badge bg-warning"><i className="pi pi-clock me-1"></i>Partiel</span>;
    }
    return <span className="badge bg-danger"><i className="pi pi-times-circle me-1"></i>Impayé</span>;
  };

  const getClientInfo = (clientData) => {
    try {
      const client = typeof clientData === 'string' ? JSON.parse(clientData) : clientData;
      return client || {};
    } catch {
      return {};
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;
    return formatDate(date);
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
              onClick={() => loadProformas(pagination.current_page - 1)} 
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
                <button className="page-link" onClick={() => loadProformas(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadProformas(pagination.current_page + 1)} 
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
                <i className="pi pi-file me-2"></i>Gestion des Proformas

               
              </h2>
              <p className="text-muted mb-0">{pagination.total} proforma(s) au total</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => { loadProformas(pagination.current_page); }} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? 'Actualisation...' : 'Actualiser'}
              </button>
              <Link to="/proforma/create" className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>Nouveau Proforma
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <StatCard 
          icon="dollar" 
          title="Montant Total" 
          value={formatCurrency(stats.totalRevenue || 0)} 
          color="primary" 
          loading={loading} 
        />
        <StatCard 
          icon="check-circle" 
          title="Proformas Payés" 
          value={stats.paidProformas || 0} 
          color="success" 
          loading={loading} 
        />
        <StatCard 
          icon="clock" 
          title="Créances" 
          value={formatCurrency(stats.totalDue || 0)} 
          color="warning" 
          loading={loading} 
        />
        <StatCard 
          icon="calendar" 
          title="Aujourd'hui" 
          value={stats.todayProformas || 0} 
          color="info" 
          loading={loading} 
        />
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Rechercher</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Rechercher un proforma..."
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
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-filter me-1"></i>Filtrer
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-times-circle me-1"></i>Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Proformas Table */}
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
                  <th className="border-0 px-4 py-3">Proforma #</th>
                  <th className="border-0 px-4 py-3">Client</th>
                  <th className="border-0 px-4 py-3">Date</th>
                  <th className="border-0 px-4 py-3">Montant Total</th>
                  <th className="border-0 px-4 py-3">Reste</th>
                  <th className="border-0 px-4 py-3">Statut</th>
                  <th className="border-0 px-4 py-3">Agence</th>
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
                ) : proformas.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>Aucun proforma trouvé</h5>
                        <p className="mb-0">Commencez par créer votre premier proforma</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  proformas.map((proforma) => {
                    const client = getClientInfo(proforma.client);
                    return (
                      <tr key={proforma.id}>
                        <td className="px-4">
                          <input 
                            type="checkbox" 
                            className="form-check-input"
                            checked={selectedProformas.includes(proforma.id)}
                            onChange={(e) => handleSelectProforma(proforma.id, e.target.checked)}
                          />
                        </td>
                        <td className="px-4">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 p-2 rounded me-2">
                              <i className="pi pi-file text-primary"></i>
                            </div>
                            <div>
                              <strong className="text-primary">
                                PRO-{proforma.id.toString().padStart(6, '0')}
                              </strong>
                              <br />
                              <small className="text-muted">
                                {new Date(proforma.created_at).toLocaleTimeString('fr-FR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="px-4">
                          <div>
                            <strong>{client.name || 'Client non spécifié'}</strong>
                            <br />
                            <small className="text-muted">{client.phone || ''}</small>
                          </div>
                        </td>
                        <td className="px-4">
                          <div>
                            <strong>{formatDate(proforma.sale_date)}</strong>
                            <br />
                            <small className="text-muted">{getTimeAgo(proforma.sale_date)}</small>
                          </div>
                        </td>
                        <td className="px-4">
                          <strong className="text-dark">{formatCurrency(proforma.total_amount)}</strong>
                        </td>
                        <td className="px-4">
                          {proforma.due_amount > 0 ? (
                            <span className="text-warning">{formatCurrency(proforma.due_amount)}</span>
                          ) : (
                            <span className="text-success">0 FBU</span>
                          )}
                        </td>
                        <td className="px-4">{getStatusBadge(proforma)}</td>
                        <td className="px-4">
                          <small className="text-muted">{proforma.agency?.name || 'Non spécifiée'}</small>
                        </td>
                        <td className="px-4">
                          <strong>{proforma.invoice_type || 'Non Valide'}</strong>
                        </td>
                        <td className="px-4">
                          <div className="btn-group" role="group">
                            <Link 
                              to={`/proforma/${proforma.id}`} 
                              className="btn btn-sm btn-outline-primary" 
                              title="Voir"
                            >
                              <i className="pi pi-eye"></i>
                            </Link>
                            <Link 
                              to={`/proforma/${proforma.id}/edit`} 
                              className="btn btn-sm btn-outline-success" 
                              title="Modifier"
                            >
                              <i className="pi pi-pencil"></i>
                            </Link>
                            
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger" 
                              title="Supprimer"
                              onClick={() => setDeleteModal({ show: true, proformaId: proforma.id })}
                            >
                              <i className="pi pi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                    onClick={() => setDeleteModal({ show: false, proformaId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer ce proforma ? Cette action est irréversible.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, proformaId: null })}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteProforma(deleteModal.proformaId)}
                  >
                    <i className="pi pi-trash me-1"></i>Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, proformaId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default ProformaScreen;