import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { API_CONFIG } from '../../services/config.js';

const StockScreen = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [creators, setCreators] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    agency_id: '',
    created_by: '',
    user_id: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, stockId: null });
  const toast = useRef(null);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { data } = useSelector(state => state.apiData);

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    if (data) {
      setStocks(data?.stocks?.stocks?.data || []);
      setAgencies(data?.stocks?.agencies || []);
      setCreators(data?.stocks?.creators || []);
      setUsers(data?.stocks?.users || []);
    }
  }, [data]);

  async function loadStocks(page = 1) {
    try {
      setLoading(true);
      const params = { page, ...filters };
      dispatch(fetchApiData({ url: API_CONFIG.ENDPOINTS.STOCKS, itemKey: 'stocks', params }));
      if (data) {
          setPagination({
          current_page: data?.stocks?.stocks?.current_page,
          last_page: data?.stocks?.stocks?.last_page,
          total: data?.stocks?.stocks?.total,
          from: data?.stocks?.stocks?.from,
          to: data?.stocks?.stocks?.to
        });
      } else {
        showToast('error', 'Erreur lors du chargement');
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
    loadStocks(1);
  };

  const handleReset = () => {
    setFilters({ search: '', agency_id: '', created_by: '', user_id: '' });
    setTimeout(() => loadStocks(1), 0);
  };

  const handleDeleteStock = async (stockId) => {
    try {
      dispatch(fetchApiData({ url: API_CONFIG.ENDPOINTS.STOCKS + `/${stockId}`, itemKey: 'stocks', method: 'DELETE' }));
      if (data) {
        showToast('success', 'Stock supprimé avec succès');
        loadStocks(pagination.current_page);
      } else {
        showToast('error', 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, stockId: null });
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

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
              onClick={() => loadStocks(pagination.current_page - 1)} 
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
                <button className="page-link" onClick={() => loadStocks(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadStocks(pagination.current_page + 1)} 
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
                <i className="pi pi-box me-2"></i>Gestion des Stocks
              </h2>
              <p className="text-muted mb-0">{pagination.total} stock(s) au total</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => loadStocks(pagination.current_page)} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? 'Actualisation...' : 'Actualiser'}
              </button>
              <a onClick={() => navigate('/stocks/transfer')} className="btn btn-outline-info">
                <i className="pi pi-sync me-1"></i>Transfert Entre Stock
              </a>
              <a onClick={() => navigate('/stocks/create')} className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>Nouveau Stock
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
            <div className="col-md-3">
              <label className="form-label">Recherche</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Nom, localisation ou description..."
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-2">
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
            
            <div className="col-md-2">
              <label className="form-label">Créé par</label>
              <select 
                className="form-select" 
                value={filters.created_by} 
                onChange={(e) => handleFilterChange('created_by', e.target.value)}
              >
                <option value="">Tous</option>
                {creators.map(creator => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Assigné à</label>
              <select 
                className="form-select" 
                value={filters.user_id} 
                onChange={(e) => handleFilterChange('user_id', e.target.value)}
              >
                <option value="">Tous</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3 d-flex align-items-end gap-2">
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

      {/* Stocks Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>Liste des Stocks
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Nom</th>
                  <th className="border-0 px-4 py-3">Localisation</th>
                  <th className="border-0 px-4 py-3">Description</th>
                  <th className="border-0 px-4 py-3">Agence</th>
                  <th className="border-0 px-4 py-3">Créé par</th>
                  <th className="border-0 px-4 py-3">Assigné à</th>
                  <th className="border-0 px-4 py-3">Créé le</th>
                  <th className="border-0 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : stocks.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>Aucun stock trouvé</h5>
                        <p className="mb-0">Essayez de modifier vos critères de recherche ou créez un nouveau stock</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stocks.map((stock) => (
                    <tr key={stock.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="pi pi-box text-primary"></i>
                          </div>
                          <strong className="text-primary">{stock.name}</strong>
                        </div>
                      </td>
                      <td className="px-4">
                        {stock.location ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-map-marker text-muted me-2"></i>
                            {stock.location}
                          </div>
                        ) : (
                          <span className="text-muted">Non spécifiée</span>
                        )}
                      </td>
                      <td className="px-4">
                        {stock.description ? (
                          <span title={stock.description}>
                            {truncateText(stock.description, 50)}
                          </span>
                        ) : (
                          <span className="text-muted">Aucune description</span>
                        )}
                      </td>
                      <td className="px-4">
                        {stock.agency ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-building text-info me-2"></i>
                            {stock.agency.name}
                          </div>
                        ) : (
                          <span className="text-muted">Non assigné</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <i className="pi pi-user-check text-success me-2"></i>
                          {stock.created_by?.full_name || stock.created_by?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4">
                        {stock.user ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-user text-warning me-2"></i>
                            {stock.user.name}
                          </div>
                        ) : (
                          <span className="text-muted">Non assigné</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div>
                          <strong>{formatDate(stock.created_at)}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(stock.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </small>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <a 
                             onClick={() => navigate(`/stocks/${stock.id}`)}
                            className="btn btn-sm btn-outline-info" 
                            title="Voir"
                          >
                            <i className="pi pi-eye"></i>
                          </a>
                          <a 
                            href={`/stocks/${stock.id}/edit`} 
                            className="btn btn-sm btn-outline-warning" 
                            title="Modifier"
                          >
                            <i className="pi pi-pencil"></i>
                          </a>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger" 
                            title="Supprimer"
                            onClick={() => setDeleteModal({ show: true, stockId: stock.id })}
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
                    onClick={() => setDeleteModal({ show: false, stockId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer ce stock ? Cette action est irréversible.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, stockId: null })}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteStock(deleteModal.stockId)}
                  >
                    <i className="pi pi-trash me-1"></i>Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, stockId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default StockScreen;