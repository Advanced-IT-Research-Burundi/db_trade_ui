import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { API_CONFIG } from '../../services/config.js';
import ApiService from '../../services/api.js';
import { useNavigate, Link } from 'react-router-dom';
import useFormat from '../../hooks/useFormat.js';
import ImportHeader from './ImportHeader.jsx';


const LivraisonScreen = () => {
  const [commandes, setCommandes] = useState([]);
  const [selectedCommandes, setSelectedCommandes] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'pending' // pending, approved, delivered
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [isValidating, setIsValidating] = useState(false);
  const [expandedCommande, setExpandedCommande] = useState(null);

  const { data, loading } = useSelector(state => state.apiData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  const formatDate = useFormat().formatDate;

  useEffect(() => {
    loadCommandes();
  }, [filters.status]);

  useEffect(() => {
    if (data.commandes && data.stocks) {
      setCommandes(data.commandes.data || []);
      setStocks(data?.stocks?.stocks?.data || []);
      setPagination({
        current_page: data.commandes.current_page,
        last_page: data.commandes.last_page,
        total: data.commandes.total,
        from: data.commandes.from,
        to: data.commandes.to
      });
    }
  }, [data]);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (filters.search !== '') {
        loadCommandes(1);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [filters.search]);

  const loadCommandes = async (page = 1) => {
    try {
      const params = { 
        page, 
        per_page: 10,
        status: filters.status,
        search: filters.search
      };
      dispatch(fetchApiData({ 
        url: API_CONFIG.ENDPOINTS.LIVRAISONS, 
        itemKey: 'livraisoncommandes', 
        params 
      }));
      dispatch(fetchApiData({ url: API_CONFIG.ENDPOINTS.STOCKS, itemKey: 'stocks' }));
           
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    if (name === 'status') {
      setSelectedCommandes([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCommandes(1);
  };

  const handleReset = () => {
    setFilters({ search: '', status: 'pending' });
    setSelectedCommandes([]);
    setTimeout(() => loadCommandes(1), 0);
  };

  const toggleCommandeSelection = (commandeId) => {
    setSelectedCommandes(prev => 
      prev.includes(commandeId)
        ? prev.filter(id => id !== commandeId)
        : [...prev, commandeId]
    );
  };

  const selectAllCommandes = () => {
    if (selectedCommandes.length === commandes.length) {
      setSelectedCommandes([]);
    } else {
      setSelectedCommandes(commandes.map(c => c.id));
    }
  };

  const handleStockChange = (name, value) => {
    setSelectedStock(value);
  };

  const approveCommande = async (commandeId) => {
    try {
      const response = await ApiService.patch(`/api/commandes/${commandeId}/approve`);
      if (response.success) {
        showToast('success', 'Commande approuvée avec succès');
        loadCommandes(pagination.current_page);
      } else {
        showToast('error', response.message || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const validateLivraison = async () => {
    if (selectedCommandes.length === 0) {
      showToast('error', 'Veuillez sélectionner au moins une commande');
      return;
    }

    setIsValidating(true);
    try {
      // Prepare data for delivery validation
      const selectedCommandesData = commandes.filter(c => selectedCommandes.includes(c.id));
      const deliveryData = {
        stock_id: selectedStock,
        commandes: selectedCommandesData.map(commande => ({
          id: commande.id,
          matricule: commande.matricule,
          poids: commande.poids,
          details: commande.details || []
        }))
      };

      console.log('Livraison data:', deliveryData);
      
      const response = await ApiService.post('/api/commande/livraison/valide', deliveryData);
      
      if (response.success) {
        console.log(response)
        showToast('success', response.message || 'Livraison validée avec succès');
        setSelectedCommandes([]);
        loadCommandes(pagination.current_page);
      } else {
        showToast('error', response.message || 'Erreur lors de la validation');
      }
    } catch (error) {
      showToast('error', error.message || 'Erreur lors de la validation de livraison');
    } finally {
      setIsValidating(false);
    }
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? 'Erreur' : 'Succès', 
      detail, 
      life: 3000 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount) ;
  };

  const formatWeight = (weight) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(weight);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-warning text-dark', text: 'En attente', icon: 'pi-clock' },
      approved: { class: 'bg-success', text: 'Approuvée', icon: 'pi-check' },
      delivered: { class: 'bg-primary', text: 'Livrée', icon: 'pi-truck' },
      cancelled: { class: 'bg-danger', text: 'Annulée', icon: 'pi-times' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`badge ${config.class}`}>
        <i className={`pi ${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const toggleExpandCommande = (commandeId) => {
    setExpandedCommande(expandedCommande === commandeId ? null : commandeId);
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
      <ImportHeader />
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary mb-1">
                <i className="pi pi-truck me-2"></i>Bon de Livraison
              </h2>
              <p className="text-muted mb-0">
                {pagination.total} commande(s) • {selectedCommandes.length} sélectionnée(s)
              </p>
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
               <select 
                className="form-select-sm" 
                value={selectedStock} 
                disabled={loading}
                onChange={(e) => handleStockChange('stock_id', e.target.value)}
              >
              <option> Sélectionner le stock</option>
                {stocks.map(stock => (
                  <option key={stock.id} value={stock.id}>
                    {stock.name}
                  </option>
                ))}
              </select>
              {selectedCommandes.length > 0 && (
                <button 
                  className="btn btn-success" 
                  onClick={validateLivraison}
                  disabled={isValidating}
                >
                  <i className="pi pi-check-circle me-1"></i>
                  {isValidating ? 'Validation...' : `Valider ${selectedCommandes.length} commande(s)`}
                </button>
              )}
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
            <div className="col-md-4">
              <label className="form-label">Recherche</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Matricule, véhicule..."
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
                <option value="pending">En attente</option>
                <option value="approved">Approuvées</option>
              </select>
            </div>
            
            <div className="col-md-5 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-search me-1"></i>Rechercher
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-refresh me-1"></i>Reset
              </button>
              {commandes.length > 0 && (
                <button 
                  type="button" 
                  className="btn btn-outline-info" 
                  onClick={selectAllCommandes}
                >
                  <i className="pi pi-check-square me-1"></i>
                  {selectedCommandes.length === commandes.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Commandes Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>Commandes pour livraison
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="form-check-input"
                      checked={selectedCommandes.length === commandes.length && commandes.length > 0}
                      onChange={selectAllCommandes}
                    />
                  </th>
                  <th className="border-0 px-4 py-3">#</th>
                  <th className="border-0 px-4 py-3">Date</th>
                  <th className="border-0 px-4 py-3">Véhicule</th>
                  <th className="border-0 px-4 py-3">Matricule</th>
                  <th className="border-0 px-4 py-3">Poids</th>
                  <th className="border-0 px-4 py-3">Produits</th>
                  <th className="border-0 px-4 py-3">Statut</th>
                  <th className="border-0 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {commandes.length === 0 && loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.commandes === undefined && commandes.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>Aucune commande trouvée</h5>
                        <p className="mb-0">Aucune commande correspondant aux critères de recherche</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  commandes.map((commande) => (
                    <React.Fragment key={commande.id}>
                      <tr className={selectedCommandes.includes(commande.id) ? 'table-active' : ''}>
                        <td className="px-4">
                          <input 
                            type="checkbox" 
                            className="form-check-input"
                            checked={selectedCommandes.includes(commande.id)}
                            onChange={() => toggleCommandeSelection(commande.id)}
                          />
                        </td>
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
                            {commande?.vehicule?.model || commande?.vehicule?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4">
                          <span className="badge bg-secondary">{commande.matricule}</span>
                        </td>
                        <td className="px-4">
                          <span className="badge bg-info text-white">
                            {formatWeight(commande.poids)}
                          </span>
                        </td>
                        <td className="px-4">
                          <button 
                            className="btn btn-sm btn-outline-info"
                            onClick={() => toggleExpandCommande(commande.id)}
                          >
                            <i className={`pi pi-chevron-${expandedCommande === commande.id ? 'up' : 'down'} me-1`}></i>
                            {commande.details?.length || 0} produit(s)
                          </button>
                        </td>
                        <td className="px-4">
                          {getStatusBadge(commande.status || 'pending')}
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
                            {commande.status === 'pending' && (
                              <button 
                                className="btn btn-sm btn-outline-success"
                                onClick={() => approveCommande(commande.id)}
                                title="Approuver"
                              >
                                <i className="pi pi-check"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedCommande === commande.id && commande.details && (
                        <tr>
                          <td colSpan="9" className="px-4 py-3 bg-light">
                            <div className="row">
                              <div className="col-12">
                                <h6 className="mb-3">
                                  <i className="pi pi-box me-2"></i>Produits de la commande #{commande.id}
                                </h6>
                                <div className="table-responsive">
                                  <table className="table table-sm table-bordered">
                                    <thead>
                                      <tr>
                                        <th>Company</th>
                                        <th>Produit</th>
                                        <th>Code</th>
                                        <th>Poids unitaire</th>
                                        <th>Quantité</th>
                                        <th>Poids total</th>
                                        <th>PU</th>
                                        <th>Montant</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {commande.details.map((product, index) => (
                                        <tr key={index}>
                                          <td><span className="badge bg-info text-white">{product.company_code}</span></td>
                                          <td>{product.item_name}</td>
                                          <td><span className="badge bg-secondary">{product.product_code}</span></td>
                                          <td>{formatWeight(product.weight_kg)}</td>
                                          <td className="fw-bold">{product.quantity}</td>
                                          <td className="fw-bold text-primary">
                                            {formatWeight(product.weight_kg * product.quantity)}
                                          </td>
                                          <td>{formatCurrency(product.pu || 0)}</td>
                                          <td className="fw-bold text-success">
                                            {formatCurrency((product.pu || 0) * product.quantity)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr className="table-info">
                                        <th colSpan="5" className="text-end">Total:</th>
                                        <th>
                                          {formatWeight(
                                            commande.details.reduce((sum, p) => sum + (p.weight_kg * p.quantity), 0)
                                          )}
                                        </th>
                                        <th></th>
                                        <th>
                                          {formatCurrency(
                                            commande.details.reduce((sum, p) => sum + ((p.pu || 0) * p.quantity), 0)
                                          )}
                                        </th>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                                {commande.commentaire && (
                                  <div className="mt-3">
                                    <strong>Commentaire:</strong>
                                    <p className="text-muted mb-0">{commande.commentaire}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

      {/* Selection Summary */}
      {selectedCommandes.length > 0 && (
        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4">
          <div className="card shadow-lg border-0">
            <div className="card-body py-3 px-4">
              <div className="d-flex align-items-center gap-3">
                <div>
                  <i className="pi pi-check-circle text-success me-2"></i>
                  <strong>{selectedCommandes.length}</strong> commande(s) sélectionnée(s)
                </div>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={validateLivraison}
                  disabled={isValidating}
                >
                  <i className="pi pi-truck me-1"></i>
                  {isValidating ? 'Validation...' : 'Valider pour livraison'}
                </button>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setSelectedCommandes([])}
                >
                  <i className="pi pi-times me-1"></i>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivraisonScreen;