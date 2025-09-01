import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import StatCard from '../../components/Card/StatCard.jsx';
import { API_CONFIG } from '../../services/config.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useNavigate } from 'react-router-dom';


const TransactionScreen = () => {
  const intl = useIntl();
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
  const navigate = useNavigate();      
  const dispatch = useDispatch();
  const { data , loading} = useSelector(state => state.apiData);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
        if (data.transactions) {
            setTransactions(data.transactions.transactions.data || []);
            setCashRegisters(data.transactions.cashRegisters || []);
            setAgencies(data.transactions.agencies || []);
            setUsers(data.transactions.users || []);

            setStats(data.transactions.stats || {});
            setPagination({
              current_page: data.transactions.transactions.current_page,
              last_page: data.transactions.transactions.last_page,
              total: data.transactions.transactions.total,
              from: data.transactions.transactions.from,
              to: data.transactions.transactions.to
            });
        }
      }, [data]);

   async function loadTransactions(page = 1) {
            try {
              const params = { page, ...filters };
              dispatch(fetchApiData({ url: API_CONFIG.ENDPOINTS.CASH_TRANSACTIONS, itemKey: 'transactions', params }));
             
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
        showToast('success', intl.formatMessage({id: "transaction.transactionDeleted"}));
        loadTransactions(pagination.current_page);
      } else {
        showToast('error', response.message || intl.formatMessage({id: "transaction.deleteError"}));
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
        showToast('success', intl.formatMessage({id: "transaction.transactionCancelled"}));
        loadTransactions(pagination.current_page);
      } else {
        showToast('error', response.message || intl.formatMessage({id: "transaction.cancelError"}));
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setCancelModal({ show: false, transactionId: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? intl.formatMessage({id: "transaction.error"}) : intl.formatMessage({id: "transaction.success"}), 
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
    return type === 'in' ? intl.formatMessage({id: "transaction.inflow"}) : intl.formatMessage({id: "transaction.outflow"});
  };

  const getAmountBadge = (transaction) => {
    const colorClass = transaction.type === 'in' ? 'bg-success' : 'bg-danger';
    return (
      <span className={`badge ${colorClass}`}>
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
                <i className="pi pi-credit-card me-2"></i>{intl.formatMessage({id: "transaction.title"})}
              </h2>
              <p className="text-muted mb-0">{pagination.total} {intl.formatMessage({id: "transaction.totalTransactions"})}</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => { loadTransactions(pagination.current_page); }} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? intl.formatMessage({id: "transaction.refreshing"}) : intl.formatMessage({id: "transaction.refresh"})}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <StatCard icon="dollar" title={intl.formatMessage({id: "transaction.totalInflow"})} value={formatCurrency(stats.totalInflow || 0)} color="success" loading={loading} />
        <StatCard icon="money-bill-wave" title={intl.formatMessage({id: "transaction.totalOutflow"})} value={formatCurrency(stats.totalOutflow || 0)} color="danger" loading={loading} />
        <StatCard icon="balance-scale" title={intl.formatMessage({id: "transaction.balance"})} value={formatCurrency((stats.totalInflow || 0) - (stats.totalOutflow || 0))} color="info" loading={loading} />
        <StatCard icon="calendar" title={intl.formatMessage({id: "transaction.todayTransactions"})} value={stats.todayCount || 0} color="warning" loading={loading} />
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-filter me-2"></i>{intl.formatMessage({id: "transaction.searchFilters"})}
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "transaction.search"})}</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={intl.formatMessage({id: "transaction.searchPlaceholder"})}
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "transaction.cashRegister"})}</label>
              <select 
                className="form-select" 
                value={filters.cash_register_id} 
                onChange={(e) => handleFilterChange('cash_register_id', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "transaction.all"})}</option>
                {cashRegisters.map(cashRegister => (
                  <option key={cashRegister.id} value={cashRegister.id}>
                    {intl.formatMessage({id: "transaction.cashRegisterNumber"})}{cashRegister.id} - {cashRegister.user?.full_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-1">
              <label className="form-label">{intl.formatMessage({id: "transaction.type"})}</label>
              <select 
                className="form-select" 
                value={filters.type} 
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "transaction.allMasculine"})}</option>
                <option value="in">{intl.formatMessage({id: "transaction.inflow"})}</option>
                <option value="out">{intl.formatMessage({id: "transaction.outflow"})}</option>
              </select>
            </div>
            
            <div className="col-md-1">
              <label className="form-label">{intl.formatMessage({id: "transaction.agency"})}</label>
              <select 
                className="form-select" 
                value={filters.agency_id} 
                onChange={(e) => handleFilterChange('agency_id', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "transaction.all"})}</option>
                {agencies.map(agency => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-1">
              <label className="form-label">{intl.formatMessage({id: "transaction.user"})}</label>
              <select 
                className="form-select" 
                value={filters.user_id} 
                onChange={(e) => handleFilterChange('user_id', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "transaction.allMasculine"})}</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-1">
              <label className="form-label">{intl.formatMessage({id: "transaction.startDate"})}</label>
              <input 
                type="date" 
                className="form-control" 
                value={filters.date_from} 
                onChange={(e) => handleFilterChange('date_from', e.target.value)} 
              />
            </div>
            
            <div className="col-md-1">
              <label className="form-label">{intl.formatMessage({id: "transaction.endDate"})}</label>
              <input 
                type="date" 
                className="form-control" 
                value={filters.date_to} 
                onChange={(e) => handleFilterChange('date_to', e.target.value)} 
              />
            </div>
            
            <div className="col-md-1">
              <label className="form-label">{intl.formatMessage({id: "transaction.minAmount"})}</label>
              <input 
                type="number" 
                className="form-control" 
                value={filters.amount_min} 
                onChange={(e) => handleFilterChange('amount_min', e.target.value)} 
              />
            </div>
            
            <div className="col-md-1">
              <label className="form-label">{intl.formatMessage({id: "transaction.maxAmount"})}</label>
              <input 
                type="number" 
                className="form-control" 
                value={filters.amount_max} 
                onChange={(e) => handleFilterChange('amount_max', e.target.value)} 
              />
            </div>
            
            <div className="col-md-1 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-search"></i>
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-refresh"></i>
              </button>
              <button type="button" className="btn btn-info" onClick={() => navigate('/transactions/export')}>
                <i className="pi pi-download"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>{intl.formatMessage({id: "transaction.transactionsList"})}
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "transaction.id"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "transaction.date"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "transaction.cashRegister"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "transaction.type"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "transaction.amount"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "transaction.description"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "transaction.reference"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "transaction.agency"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "transaction.createdBy"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "transaction.actions"})}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && loading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{intl.formatMessage({id: "transaction.loading"})}</span>
                      </div>
                    </td>
                  </tr>
                ) : data.transactions == undefined && transactions.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>{intl.formatMessage({id: "transaction.noTransactionsFound"})}</h5>
                        <p className="mb-0">{intl.formatMessage({id: "transaction.tryModifyingCriteria"})}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4">
                        <span className="badge bg-light text-dark">#{transaction.id}</span>
                      </td>
                      <td className="px-4">
                        <div>
                          <div>
                            <strong>{formatDate(transaction.created_at)}</strong>
                          </div>
                          <div>
                            <small className="text-muted">{formatTime(transaction.created_at)}</small>
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-info bg-opacity-10 p-2 rounded me-2">
                            <i className="pi pi-wallet text-info"></i>
                          </div>
                          <div>
                            <strong>{intl.formatMessage({id: "transaction.cashRegisterNumber"})}{transaction.cash_register?.id}</strong>
                            <br />
                            <small className="text-muted">{transaction.cash_register?.user?.name}</small>
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        <span className={`badge ${transaction.type === 'in' ? 'bg-success' : 'bg-danger'}`}>
                          {getTypeBadge(transaction.type)}
                        </span>
                      </td>
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
                          <span className="text-muted">{intl.formatMessage({id: "transaction.notAssigned"})}</span>
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
                            title={intl.formatMessage({id: "transaction.view"})}
                          >
                            <i className="pi pi-eye"></i>
                          </a>
                          {canEdit(transaction) && (
                            <a 
                              href={`/cash-transactions/${transaction.id}/edit`} 
                              className="btn btn-sm btn-outline-warning" 
                              title={intl.formatMessage({id: "transaction.edit"})}
                            >
                              <i className="pi pi-pencil"></i>
                            </a>
                          )}
                          {canCancel(transaction) && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-warning" 
                              title={intl.formatMessage({id: "transaction.cancel"})}
                              onClick={() => setCancelModal({ show: true, transactionId: transaction.id })}
                            >
                              <i className="pi pi-times"></i>
                            </button>
                          )}
                          {canDelete(transaction) && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger" 
                              title={intl.formatMessage({id: "transaction.delete"})}
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
                {intl.formatMessage({id: "transaction.showing"})} {pagination.from} {intl.formatMessage({id: "transaction.to"})} {pagination.to} {intl.formatMessage({id: "transaction.on"})} {pagination.total} {intl.formatMessage({id: "transaction.results"})}
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
                    <i className="pi pi-times me-2"></i>{intl.formatMessage({id: "transaction.cancelTransaction"})}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setCancelModal({ show: false, transactionId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{intl.formatMessage({id: "transaction.cancelMessage"})}</p>
                  <div className="alert alert-info">
                    <i className="pi pi-info me-2"></i>
                    {intl.formatMessage({id: "transaction.cancelNote"})}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setCancelModal({ show: false, transactionId: null })}
                  >
                    {intl.formatMessage({id: "transaction.cancel"})}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-warning"
                    onClick={() => handleCancelTransaction(cancelModal.transactionId)}
                  >
                    <i className="pi pi-times me-1"></i>{intl.formatMessage({id: "transaction.confirmCancel"})}
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
                    <i className="pi pi-exclamation-triangle me-2"></i>{intl.formatMessage({id: "transaction.confirmDelete"})}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setDeleteModal({ show: false, transactionId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{intl.formatMessage({id: "transaction.deleteMessage"})}</p>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info me-2"></i>
                    {intl.formatMessage({id: "transaction.deleteWarning"})}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, transactionId: null })}
                  >
                    {intl.formatMessage({id: "transaction.cancel"})}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteTransaction(deleteModal.transactionId)}
                  >
                    <i className="pi pi-trash me-1"></i>{intl.formatMessage({id: "transaction.delete"})}
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