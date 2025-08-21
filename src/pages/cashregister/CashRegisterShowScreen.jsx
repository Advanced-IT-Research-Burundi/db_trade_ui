import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { API_CONFIG } from '../../services/config.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useNavigate, useParams } from 'react-router-dom';

const CashRegisterShowScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);
  const dispatch = useDispatch();
  
  const [cashRegister, setCashRegister] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsPagination, setTransactionsPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [statistics, setStatistics] = useState({
    totalIn: 0,
    totalOut: 0,
    currentBalance: 0,
    transactionCounts: { in: 0, out: 0, total: 0 }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState({ show: false, transaction: null });
  const [closeModal, setCloseModal] = useState({ show: false });
  const [openModal, setOpenModal] = useState({ show: false });
  const [newTransaction, setNewTransaction] = useState({
    type: '',
    amount: '',
    description: '',
    reference_id: ''
  });

  const { data, loading } = useSelector(state => state.apiData);

  useEffect(() => {
    loadCashRegisterDetails();
  }, [id]);

  useEffect(() => {
    if (data.cash_register_details) {
      setCashRegister(data.cash_register_details.cashRegister);
      console.log('Cash Register Details:', data.cash_register_details);
      setTransactions(data.cash_register_details.transactions?.data || []);
      setTransactionsPagination({
        current_page: data.cash_register_details.transactions?.current_page || 1,
        last_page: data.cash_register_details.transactions?.last_page || 1,
        total: data.cash_register_details.transactions?.total || 0,
        from: data.cash_register_details.transactions?.from || 0,
        to: data.cash_register_details.transactions?.to || 0
      });
      setStatistics(data.cash_register_details.statistics || {
        totalIn: 0,
        totalOut: 0,
        currentBalance: 0,
        transactionCounts: { in: 0, out: 0, total: 0 }
      });
    }
  }, [data]);

  const loadCashRegisterDetails = async (page = 1) => {
    try {
      const params = { page };
      dispatch(fetchApiData({ 
        url: `${API_CONFIG.ENDPOINTS.CASH_REGISTERS}/${id}`, 
        itemKey: 'cash_register_details', 
        params 
      }));
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const response = await ApiService.post('/api/cash-transactions', {
        ...newTransaction,
        cash_register_id: id,
        amount: parseFloat(newTransaction.amount)
      });
      
      if (response.success) {
        showToast('success', 'Transaction ajoutée avec succès');
        setShowAddModal(false);
        setNewTransaction({ type: '', amount: '', description: '', reference_id: '' });
        loadCashRegisterDetails(transactionsPagination.current_page);
      } else {
        showToast('error', response.message || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const handleCloseCashRegister = async () => {
    try {
      const response = await ApiService.post(`/api/cash-register/${id}/close`);
      if (response.success) {
        showToast('success', 'Caisse fermée avec succès');
        loadCashRegisterDetails();
      } else {
        showToast('error', response.message || 'Erreur lors de la fermeture');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setCloseModal({ show: false });
  };

  const handleOpenCashRegister = async () => {
    try {
      const response = await ApiService.post(`/api/cash-register/${id}/open`);
      if (response.success) {
        showToast('success', 'Caisse ouverte avec succès');
        loadCashRegisterDetails();
      } else {
        showToast('error', response.message || 'Erreur lors de l\'ouverture');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setOpenModal({ show: false });
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
  const formatDateTime = (date) => new Date(date).toLocaleString('fr-FR');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' FBU';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span className="badge bg-success fs-6">
            <i className="pi pi-unlock me-1"></i>Ouverte
          </span>
        );
      case 'closed':
        return (
          <span className="badge bg-danger fs-6">
            <i className="pi pi-lock me-1"></i>Fermée
          </span>
        );
      case 'suspended':
        return (
          <span className="badge bg-warning fs-6">
            <i className="pi pi-pause me-1"></i>Suspendue
          </span>
        );
      default:
        return <span className="badge bg-secondary">Inconnu</span>;
    }
  };

  const getDaysActivity = () => {
    if (!cashRegister?.opened_at) return 0;
    const openedDate = new Date(cashRegister.opened_at);
    const today = new Date();
    const diffTime = Math.abs(today - openedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Aujourd'hui" : `${diffDays} jour(s)`;
  };

  if (loading || !cashRegister) {
    return (
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <Toast ref={toast} />
      
     

      {/* En-tête avec actions */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h2 className="mb-2">
            <i className="pi pi-wallet text-primary me-2"></i>
            Caisse #{cashRegister.id}
            {getStatusBadge(cashRegister.status)}
          </h2>
        </div>
        <div className="col-md-4 text-end">
          <div className="btn-group" role="group">
          <button 
              onClick={() => navigate(`/cash-registers`)}
              className="btn btn-outline-secondary"
            >
              <i className="pi pi-arrow-left me-1"></i>
              Retour à la liste
            </button>
            {/* <button 
              onClick={() => navigate(`/cash-registers/${cashRegister.id}/edit`)}
              className="btn btn-outline-warning"
            >
              <i className="pi pi-pencil me-1"></i>
              Modifier
            </button> */}
            {cashRegister.status === 'open' && (
              <button 
                onClick={() => setCloseModal({ show: true })}
                className="btn btn-outline-danger"
              >
                <i className="pi pi-lock me-1"></i>
                Fermer
              </button>
            )}
            {(cashRegister.status === 'closed' || cashRegister.status === 'suspended') && (
              <button 
                onClick={() => setOpenModal({ show: true })}
                className="btn btn-outline-success"
              >
                <i className="pi pi-unlock me-1"></i>
                Ouvrir
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        {/* Informations générales */}
        <div className="col-lg-8">
          <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="pi pi-info-circle me-2"></i>
                Informations générales
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <dl className="row">
                    <dt className="col-sm-5">
                      <i className="pi pi-user text-primary me-1"></i>
                      Utilisateur:
                    </dt>
                    <dd className="col-sm-7">
                      <strong>{cashRegister.user?.name}</strong><br />
                      <small className="text-muted">{cashRegister.user?.email}</small>
                    </dd>

                    {cashRegister.stock && (
                      <>
                        <dt className="col-sm-5">
                          <i className="pi pi-box text-info me-1"></i>
                          Stock:
                        </dt>
                        <dd className="col-sm-7">{cashRegister.stock.name}</dd>
                      </>
                    )}

                    <dt className="col-sm-5">
                      <i className="pi pi-building text-info me-1"></i>
                      Agence:
                    </dt>
                    <dd className="col-sm-7">
                      {cashRegister.agency?.name || 'Non assigné'}
                    </dd>
                  </dl>
                </div>
                <div className="col-md-6">
                  <dl className="row">
                    <dt className="col-sm-5">
                      <i className="pi pi-calendar-check text-success me-1"></i>
                      Ouverture:
                    </dt>
                    <dd className="col-sm-7">{formatDateTime(cashRegister.opened_at)}</dd>

                    {cashRegister.closed_at && (
                      <>
                        <dt className="col-sm-5">
                          <i className="pi pi-calendar-times text-danger me-1"></i>
                          Fermeture:
                        </dt>
                        <dd className="col-sm-7">{formatDateTime(cashRegister.closed_at)}</dd>
                      </>
                    )}

                    <dt className="col-sm-5">
                      <i className="pi pi-user-plus text-success me-1"></i>
                      Créé par:
                    </dt>
                    <dd className="col-sm-7">
                      {cashRegister.created_by?.name || 'N/A'}<br />
                      <small className="text-muted">{formatDateTime(cashRegister.created_at)}</small>
                    </dd>
                  </dl>
                </div>
              </div>

              {cashRegister.description && (
                <div className="row mt-3">
                  <div className="col-12">
                    <dt>
                      <i className="pi pi-comment text-info me-1"></i>
                      Description:
                    </dt>
                    <dd className="mt-2">
                      <div className="alert alert-info">
                        {cashRegister.description}
                      </div>
                    </dd>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transactions */}
          <div className="card shadow">
            <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="pi pi-list me-2"></i>
                Transactions ({transactionsPagination.total})
              </h5>
              {cashRegister.status === 'open' && (
                <button 
                  className="btn btn-sm btn-light" 
                  onClick={() => setShowAddModal(true)}
                >
                  <i className="pi pi-plus-circle me-1"></i>
                  Ajouter
                </button>
              )}
            </div>
            <div className="card-body p-0">
              {transactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Montant</th>
                        <th>Description</th>
                        <th>Référence</th>
                        <th>Utilisateur</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="text-muted small">
                            {formatDateTime(transaction.created_at)}
                          </td>
                          <td>
                            {transaction.type === 'in' ? (
                              <span className="badge bg-success">
                                <i className="pi pi-arrow-down me-1"></i>
                                Entrée
                              </span>
                            ) : (
                              <span className="badge bg-danger">
                                <i className="pi pi-arrow-up me-1"></i>
                                Sortie
                              </span>
                            )}
                          </td>
                          <td>
                            <strong className={transaction.type === 'in' ? 'text-success' : 'text-danger'}>
                              {transaction.type === 'in' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </strong>
                          </td>
                          <td>
                            <span title={transaction.description}>
                              {transaction.description.length > 30 
                                ? transaction.description.substring(0, 30) + '...'
                                : transaction.description
                              }
                            </span>
                          </td>
                          <td>
                            {transaction.reference_id ? (
                              <span className="badge bg-info">#{transaction.reference_id}</span>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>{transaction.created_by?.name || 'N/A'}</td>
                          <td>
                            <button 
                              className="btn btn-outline-info btn-sm"
                              onClick={() => setShowTransactionModal({ show: true, transaction })}
                              title="Voir détails"
                            >
                              <i className="pi pi-eye"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="pi pi-receipt" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                  <h5 className="text-muted mt-3">Aucune transaction</h5>
                  <p className="text-muted">Cette caisse n'a pas encore de transactions.</p>
                  {cashRegister.status === 'open' && (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setShowAddModal(true)}
                    >
                      <i className="pi pi-plus-circle me-2"></i>
                      Ajouter une première transaction
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Résumé financier */}
        <div className="col-lg-4">
          <div className="card shadow mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="card-title mb-0">
                <i className="pi pi-calculator me-2"></i>
                Résumé financier
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <i className="pi pi-money-bill text-success me-2"></i>
                  <strong>Solde d'ouverture:</strong>
                </div>
                <span className="badge bg-success fs-6">
                  {formatCurrency(cashRegister.opening_balance)}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <i className="pi pi-arrow-down text-success me-2"></i>
                  <strong>Total entrées:</strong>
                </div>
                <span className="badge bg-success fs-6">
                  +{formatCurrency(statistics.totalIn)}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <i className="pi pi-arrow-up text-danger me-2"></i>
                  <strong>Total sorties:</strong>
                </div>
                <span className="badge bg-danger fs-6">
                  -{formatCurrency(statistics.totalOut)}
                </span>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <i className="pi pi-wallet text-primary me-2"></i>
                  <strong>Solde actuel:</strong>
                </div>
                <span className="badge bg-primary fs-5">
                  {formatCurrency(statistics.currentBalance)}
                </span>
              </div>

              {cashRegister.closing_balance !== null && (
                <>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <i className="pi pi-lock text-warning me-2"></i>
                      <strong>Solde de fermeture:</strong>
                    </div>
                    <span className="badge bg-warning fs-6">
                      {formatCurrency(cashRegister.closing_balance)}
                    </span>
                  </div>

                  {(() => {
                    const difference = cashRegister.closing_balance - statistics.currentBalance;
                    if (difference !== 0) {
                      return (
                        <div className={`alert alert-${difference > 0 ? 'info' : 'warning'} mt-3`}>
                          <i className="pi pi-info-circle me-2"></i>
                          <strong>Écart:</strong>
                          {difference > 0 ? '+' : ''}{formatCurrency(Math.abs(difference))}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="card shadow">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0">
                <i className="pi pi-cog me-2"></i>
                Actions
              </h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  onClick={() => navigate('/cash-registers')}
                  className="btn btn-outline-secondary"
                >
                  <i className="pi pi-arrow-left me-2"></i>
                  Retour à la liste
                </button>
                <button 
                  onClick={() => navigate(`/cash-registers/${cashRegister.id}/edit`)}
                  className="btn btn-outline-warning"
                >
                  <i className="pi pi-pencil me-2"></i>
                  Modifier
                </button>
                {cashRegister.status !== 'closed' && (
                  <button 
                    className="btn btn-outline-primary" 
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="pi pi-plus-circle me-2"></i>
                    Nouvelle transaction
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="card shadow mt-4">
            <div className="card-header bg-info text-white">
              <h6 className="card-title mb-0">
                <i className="pi pi-chart-bar me-2"></i>
                Statistiques
              </h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6">
                  <div className="border-end">
                    <h4 className="text-success">{statistics.transactionCounts?.in || 0}</h4>
                    <small className="text-muted">Entrées</small>
                  </div>
                </div>
                <div className="col-6">
                  <h4 className="text-danger">{statistics.transactionCounts?.out || 0}</h4>
                  <small className="text-muted">Sorties</small>
                </div>
              </div>
              <hr />
              <div className="text-center">
                <h5 className="text-primary">{statistics.transactionCounts?.total || 0}</h5>
                <small className="text-muted">Total transactions</small>
              </div>
              {cashRegister.opened_at && (
                <>
                  <hr />
                  <div className="text-center">
                    <h6 className="text-info">{getDaysActivity()}</h6>
                    <small className="text-muted">Activité</small>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ajouter Transaction */}
      {showAddModal && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleAddTransaction}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      <i className="pi pi-plus-circle me-2"></i>
                      Nouvelle transaction
                    </h5>
                    <button 
                      type="button" 
                      className="btn-close"
                      onClick={() => setShowAddModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Type</label>
                      <select 
                        className="form-select" 
                        value={newTransaction.type}
                        onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                        required
                      >
                        <option value="">Sélectionner...</option>
                        <option value="in">Entrée</option>
                        <option value="out">Sortie</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Montant (FBU)</label>
                      <input 
                        type="number" 
                        className="form-control"
                        step="0.01" 
                        min="0" 
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                        required 
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-control"
                        rows="3" 
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                        required
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Référence (optionnel)</label>
                      <input 
                        type="number" 
                        className="form-control"
                        value={newTransaction.reference_id}
                        onChange={(e) => setNewTransaction({...newTransaction, reference_id: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowAddModal(false)}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="pi pi-check-circle me-1"></i>
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setShowAddModal(false)}
          ></div>
        </>
      )}

      {/* Modal Détails Transaction */}
      {showTransactionModal.show && showTransactionModal.transaction && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="pi pi-receipt me-2"></i>
                    Détails de la transaction
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setShowTransactionModal({ show: false, transaction: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <dl className="row">
                    <dt className="col-sm-4">Date:</dt>
                    <dd className="col-sm-8">{formatDateTime(showTransactionModal.transaction.created_at)}</dd>

                    <dt className="col-sm-4">Type:</dt>
                    <dd className="col-sm-8">
                      {showTransactionModal.transaction.type === 'in' ? (
                        <span className="badge bg-success">Entrée</span>
                      ) : (
                        <span className="badge bg-danger">Sortie</span>
                      )}
                    </dd>

                    <dt className="col-sm-4">Montant:</dt>
                    <dd className="col-sm-8">
                      <strong className={showTransactionModal.transaction.type === 'in' ? 'text-success' : 'text-danger'}>
                        {showTransactionModal.transaction.type === 'in' ? '+' : '-'}{formatCurrency(showTransactionModal.transaction.amount)}
                      </strong>
                    </dd>

                    <dt className="col-sm-4">Description:</dt>
                    <dd className="col-sm-8">{showTransactionModal.transaction.description}</dd>

                    {showTransactionModal.transaction.reference_id && (
                      <>
                        <dt className="col-sm-4">Référence:</dt>
                        <dd className="col-sm-8">#{showTransactionModal.transaction.reference_id}</dd>
                      </>
                    )}

                    <dt className="col-sm-4">Créé par:</dt>
                    <dd className="col-sm-8">{showTransactionModal.transaction.created_by?.name || 'N/A'}</dd>

                    {showTransactionModal.transaction.agency && (
                      <>
                        <dt className="col-sm-4">Agence:</dt>
                        <dd className="col-sm-8">{showTransactionModal.transaction.agency.name}</dd>
                      </>
                    )}
                  </dl>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowTransactionModal({ show: false, transaction: null })}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setShowTransactionModal({ show: false, transaction: null })}
          ></div>
        </>
      )}

      {/* Modal Fermer Caisse - Suite */}
      {closeModal.show && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className="pi pi-exclamation-triangle me-2"></i>
                    Confirmer la fermeture
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setCloseModal({ show: false })}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-warning">
                    <i className="pi pi-info-circle me-2"></i>
                    Êtes-vous sûr de vouloir fermer cette caisse ?
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h6 className="text-muted">Solde actuel</h6>
                          <h4 className="text-primary">{formatCurrency(statistics.currentBalance)}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h6 className="text-muted">Total transactions</h6>
                          <h4 className="text-info">{statistics.transactionCounts?.total || 0}</h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <small className="text-muted">
                      <i className="pi pi-info-circle me-1"></i>
                      Une fois fermée, vous ne pourrez plus ajouter de transactions à cette caisse.
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setCloseModal({ show: false })}
                  >
                    <i className="pi pi-times me-1"></i>
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleCloseCashRegister}
                  >
                    <i className="pi pi-lock me-1"></i>
                    Confirmer la fermeture
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setCloseModal({ show: false })}
          ></div>
        </>
      )}

      {/* Modal Ouvrir Caisse */}
      {openModal.show && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">
                    <i className="pi pi-unlock me-2"></i>
                    Confirmer l'ouverture
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setOpenModal({ show: false })}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <i className="pi pi-info-circle me-2"></i>
                    Êtes-vous sûr de vouloir ouvrir cette caisse ?
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h6 className="text-muted">Solde d'ouverture</h6>
                          <h4 className="text-success">{formatCurrency(cashRegister.opening_balance)}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h6 className="text-muted">Statut actuel</h6>
                          <h5>{getStatusBadge(cashRegister.status)}</h5>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <small className="text-muted">
                      <i className="pi pi-info-circle me-1"></i>
                      Une fois ouverte, vous pourrez ajouter des transactions à cette caisse.
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setOpenModal({ show: false })}
                  >
                    <i className="pi pi-times me-1"></i>
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={handleOpenCashRegister}
                  >
                    <i className="pi pi-unlock me-1"></i>
                    Confirmer l'ouverture
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setOpenModal({ show: false })}
          ></div>
        </>
      )}

      {/* Pagination pour les transactions */}
      {transactionsPagination.last_page > 1 && (
        <div className="row mt-4">
          <div className="col-12">
            <nav aria-label="Navigation des transactions">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${transactionsPagination.current_page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => loadCashRegisterDetails(transactionsPagination.current_page - 1)}
                    disabled={transactionsPagination.current_page === 1}
                  >
                    <i className="pi pi-angle-left"></i>
                    Précédent
                  </button>
                </li>
                
                {[...Array(Math.min(5, transactionsPagination.last_page))].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <li 
                      key={pageNumber}
                      className={`page-item ${transactionsPagination.current_page === pageNumber ? 'active' : ''}`}
                    >
                      <button 
                        className="page-link"
                        onClick={() => loadCashRegisterDetails(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    </li>
                  );
                })}
                
                <li className={`page-item ${transactionsPagination.current_page === transactionsPagination.last_page ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => loadCashRegisterDetails(transactionsPagination.current_page + 1)}
                    disabled={transactionsPagination.current_page === transactionsPagination.last_page}
                  >
                    Suivant
                    <i className="pi pi-angle-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
            
            <div className="text-center text-muted">
              <small>
                Affichage de {transactionsPagination.from} à {transactionsPagination.to} sur {transactionsPagination.total} transactions
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashRegisterShowScreen;