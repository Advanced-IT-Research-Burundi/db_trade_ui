import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import StatCard from '../../components/Card/StatCard.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { API_CONFIG } from '../../services/config.js';


const TransactionScreen = () => {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => ({
    data: state.apiData?.data?.transactions,
    loading: state.apiData.loading,
    error: state.apiData.error
  }));

  useEffect(() => {
    loadTransactions();
  }, []);


  
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [cashRegisters, setCashRegisters] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    cash_register_id: '',
    type: '',
    agency_id: '',
    user_id: '',
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, transactionId: null });
  const [cancelModal, setCancelModal] = useState({ show: false, transactionId: null });
  const toast = useRef(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async (page = 1) => {
    try {
      const params = { page, ...filters };
      dispatch(fetchApiData({
        url: API_CONFIG.ENDPOINTS.CASH_TRANSACTIONS,
        itemKey: 'transactions',
        params
      }));  
      
        setTransactions(data?.transactions?.data || []);

        setCashRegisters(data?.cashRegisters || []);
        setAgencies(data?.agencies || []);
        setUsers(data?.users || []);

        setStats(data?.stats || {});
        setPagination({
          current_page: data?.transactions?.current_page,
          last_page: data?.transactions?.last_page,
          total: data?.transactions?.total,
          from: data?.transactions?.from,
          to: data?.transactions?.to
        });
    } catch (error) {
      showToast('error', error.message);
    } 
  };





  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTransactions(1);
  };

  const handleReset = () => {
    setFilters({ 
      search: '', cash_register_id: '', type: '', agency_id: '', user_id: '', 
      date_from: '', date_to: '', amount_min: '', amount_max: '' 
    });
    setTimeout(() => loadTransactions(1), 0);
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      const response = await ApiService.delete(`/api/cash-transactions/${transactionId}`);
      if (response.success) {
        showToast('success', 'Transaction supprimée avec succès');
        loadTransactions(pagination.current_page);
      } else {
        showToast('error', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, transactionId: null });
  };

  const handleCancelTransaction = async (transactionId) => {
    try {
      const response = await ApiService.post(`/api/cash-transactions/${transactionId}/cancel`);
      if (response.success) {
        showToast('success', 'Transaction annulée avec succès');
        loadTransactions(pagination.current_page);
      } else {
        showToast('error', response.message || 'Erreur lors de l\'annulation');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setCancelModal({ show: false, transactionId: null });
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
  const formatTime = (date) => new Date(date).toLocaleTimeString('fr-FR');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' FBU';
  };

  const getTypeBadge = (type) => {
    if (type === 'in') {
      return (
        <span className="badge bg-success">
          <i className="pi pi-arrow-down me-1"></i>Entrée
        </span>
      );
    }
    return (
      <span className="badge bg-danger">
        <i className="pi pi-arrow-up me-1"></i>Sortie
      </span>
    );
  };

  const getAmountBadge = (transaction) => {
    const colorClass = transaction.type === 'in' ? 'bg-success' : 'bg-danger';
    return (
      <span className={`badge ${colorClass}`}>
        <i className="pi pi-money-bill me-1"></i>
        {formatCurrency(transaction.amount)}
      </span>
    );
  };

  const canEdit = (transaction) => {
    const diffHours = Math.abs(new Date() - new Date(transaction.created_at)) / 36e5;
    return diffHours <= 24;
  };

  const canCancel = (transaction) => {
    const diffHours = Math.abs(new Date() - new Date(transaction.created_at)) / 36e5;
    return diffHours <= 48 && !transaction.description?.includes('[ANNULÉE]');
  };

  const canDelete = (transaction) => {
    const diffMinutes = Math.abs(new Date() - new Date(transaction.created_at)) / 6e4;
    return diffMinutes <= 60;
  };

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

    if (loading && !data) return <LoadingComponent />;
    if (error) return <ErrorComponent error={error} />;

    return (
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadTransactions(pagination.current_page - 1)} 
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
                <button className="page-link" onClick={() => loadTransactions(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadTransactions(pagination.current_page + 1)} 
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
                <i className="pi pi-sync me-2"></i>Gestion des Transactions
              </h2>
              <p className="text-muted mb-0">{pagination.total} transaction(s) au total</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => { loadTransactions(pagination.current_page);  }} 
              >
                <i className="pi pi-refresh me-1"></i>
                Actualiser
              </button>
              <a href="/cash-transactions/create" className="btn btn-primary">
                <i className="pi pi-plus me-1"></i>Nouvelle Transaction
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <StatCard 
          icon="list" 
          title="Total Transactions" 
          value={stats.total_count || 0} 
          color="primary" 
      
        />
        <StatCard 
          icon="arrow-down" 
          title="Total Entrées" 
          value={formatCurrency(stats.total_in || 0)} 
          color="success" 

        />
        <StatCard 
          icon="arrow-up" 
          title="Total Sorties" 
          value={formatCurrency(stats.total_out || 0)} 
          color="danger" 

        />
        <StatCard 
          icon="calendar" 
          title="Aujourd'hui" 
          value={stats.today_count || 0} 
          color="info" 

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
            <div className="col-md-3">
              <label className="form-label">Recherche</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Description, référence..."
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Caisse</label>
              <select 
                className="form-select" 
                value={filters.cash_register_id} 
                onChange={(e) => handleFilterChange('cash_register_id', e.target.value)}
              >
                <option value="">Toutes</option>
                {cashRegisters.map(cashRegister => (
                  <option key={cashRegister.id} value={cashRegister.id}>
                    Caisse #{cashRegister.id} - {cashRegister.user?.full_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Type</label>
              <select 
                className="form-select" 
                value={filters.type} 
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Tous</option>
                <option value="in">Entrée</option>
                <option value="out">Sortie</option>
              </select>
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
              <label className="form-label">Utilisateur</label>
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
              <label className="form-label">Montant min</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="0"
                value={filters.amount_min} 
                onChange={(e) => handleFilterChange('amount_min', e.target.value)} 
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Montant max</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="1000000"
                value={filters.amount_max} 
                onChange={(e) => handleFilterChange('amount_max', e.target.value)} 
              />
            </div>
            
            <div className="col-md-2 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary" >
                <i className="pi pi-search"></i>
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-refresh"></i>
              </button>
              <a href="/cash-transactions/export" className="btn btn-outline-success">
                <i className="pi pi-download"></i>
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>Liste des Transactions
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">#</th>
                  <th className="border-0 px-4 py-3">Date</th>
                  <th className="border-0 px-4 py-3">Caisse</th>
                  <th className="border-0 px-4 py-3">Type</th>
                  <th className="border-0 px-4 py-3">Montant</th>
                  <th className="border-0 px-4 py-3">Description</th>
                  <th className="border-0 px-4 py-3">Référence</th>
                  <th className="border-0 px-4 py-3">Agence</th>
                  <th className="border-0 px-4 py-3">Créé par</th>
                  <th className="border-0 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>Aucune transaction trouvée</h5>
                        <p className="mb-0">Essayez de modifier vos critères de recherche ou créez une nouvelle transaction</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4">
                        <strong>#{transaction.id}</strong>
                      </td>
                      <td className="px-4">
                        <div className="text-muted small">
                          <div className="mb-1">
                            <i className="pi pi-calendar me-1"></i>
                            {formatDate(transaction.created_at)}
                          </div>
                          <div>
                            <i className="pi pi-clock me-1"></i>
                            {formatTime(transaction.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="pi pi-wallet text-primary"></i>
                          </div>
                          <div>
                            <strong>Caisse #{transaction.cash_register?.id}</strong>
                            <br />
                            <small className="text-muted">{transaction.cash_register?.user?.name}</small>
                          </div>
                        </div>
                      </td>
                      <td className="px-4">{getTypeBadge(transaction.type)}</td>
                      <td className="px-4">{getAmountBadge(transaction)}</td>
                      <td className="px-4">
                        <div style={{ maxWidth: '200px' }} title={transaction.description}>
                          {truncateText(transaction.description, 50)}
                        </div>
                      </td>
                      <td className="px-4">
                        {transaction.reference_id ? (
                          <span className="badge bg-info">
                            #{transaction.reference_id}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4">
                        {transaction.agency ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-building text-info me-2"></i>
                            {transaction.agency.name}
                          </div>
                        ) : (
                          <span className="text-muted">Non assigné</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <i className="pi pi-user-check text-success me-2"></i>
                          {transaction.created_by?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <a 
                            href={`/cash-transactions/${transaction.id}`} 
                            className="btn btn-sm btn-outline-info" 
                            title="Voir"
                          >
                            <i className="pi pi-eye"></i>
                          </a>
                          {canEdit(transaction) && (
                            <a 
                              href={`/cash-transactions/${transaction.id}/edit`} 
                              className="btn btn-sm btn-outline-warning" 
                              title="Modifier"
                            >
                              <i className="pi pi-pencil"></i>
                            </a>
                          )}
                          {canCancel(transaction) && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-warning" 
                              title="Annuler"
                              onClick={() => setCancelModal({ show: true, transactionId: transaction.id })}
                            >
                              <i className="pi pi-times"></i>
                            </button>
                          )}
                          {canDelete(transaction) && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger" 
                              title="Supprimer"
                              onClick={() => setDeleteModal({ show: true, transactionId: transaction.id })}
                            >
                              <i className="pi pi-trash"></i>
                            </button>
                          )}
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

      {/* Cancel Modal */}
      {cancelModal.show && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className="pi pi-times me-2"></i>Annuler la transaction
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setCancelModal({ show: false, transactionId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir annuler cette transaction ?</p>
                  <div className="alert alert-info">
                    <i className="pi pi-info me-2"></i>
                    <strong>Note :</strong> L'annulation va créer une transaction inverse pour compenser.
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setCancelModal({ show: false, transactionId: null })}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-warning"
                    onClick={() => handleCancelTransaction(cancelModal.transactionId)}
                  >
                    <i className="pi pi-times me-1"></i>Confirmer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setCancelModal({ show: false, transactionId: null })}
          ></div>
        </>
      )}

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
                    onClick={() => setDeleteModal({ show: false, transactionId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.</p>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info me-2"></i>
                    <strong>Attention :</strong> La suppression ne peut être effectuée que dans l'heure suivant la création.
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, transactionId: null })}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteTransaction(deleteModal.transactionId)}
                  >
                    <i className="pi pi-trash me-1"></i>Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, transactionId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default TransactionScreen;