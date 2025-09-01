import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { API_CONFIG } from '../../services/config.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useNavigate } from 'react-router-dom';

const CashRegisterScreen = () => {
  const intl = useIntl();
  const [cashRegisters, setCashRegisters] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    agency_id: '',
    status: '',
    date_from: '',
    date_to: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, cashRegisterId: null });
  const [closeModal, setCloseModal] = useState({ show: false, cashRegisterId: null });
  const [openModal, setOpenModal] = useState({ show: false, cashRegisterId: null });
  const toast = useRef(null);
  const navigate = useNavigate();
    
  const dispatch = useDispatch();
  const { data , loading} = useSelector(state => state.apiData);

  useEffect(() => {
    loadCashRegisters();
  }, []);

   useEffect(() => {
      if (data.cash_registers) {
          setCashRegisters(data.cash_registers.cash_registers?.data || []);
          setAgencies(data.cash_registers.agencies || [])
          setPagination({
            current_page: data.cash_registers.cash_registers?.current_page,
            last_page: data.cash_registers.cash_registers?.last_page,
            total: data.cash_registers.cash_registers?.total,
            from: data.cash_registers.cash_registers?.from,
            to: data.cash_registers.cash_registers?.to
          });
      }
    }, [data]);

  async function loadCashRegisters(page = 1) {
          try {
            const params = { page, ...filters };
            dispatch(fetchApiData({ url: API_CONFIG.ENDPOINTS.CASH_REGISTERS, itemKey: 'cash_registers', params }));
           
          } catch (error) {
            showToast('error', error.message);
          } 
        };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCashRegisters(1);
  };

  const handleReset = () => {
    setFilters({ search: '', agency_id: '', status: '', date_from: '', date_to: '' });
    setTimeout(() => loadCashRegisters(1), 0);
  };

  const handleDeleteCashRegister = async (cashRegisterId) => {
    try {
      const response = await ApiService.delete(`/api/cash-registers/${cashRegisterId}`);
      if (response.success) {
        showToast('success', intl.formatMessage({id: "cashRegister.cashRegisterDeleted"}));
        loadCashRegisters(pagination.current_page);
      } else {
        showToast('error', response.message || intl.formatMessage({id: "cashRegister.deleteError"}));
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, cashRegisterId: null });
  };

  const handleCloseCashRegister = async (cashRegisterId) => {
    try {
      const response = await ApiService.post(`/api/cash-register/${cashRegisterId}/close`);
      if (response.success) {
        showToast('success', intl.formatMessage({id: "cashRegister.cashRegisterClosed"}));
        loadCashRegisters(pagination.current_page);
      } else {
        showToast('error', response.message || intl.formatMessage({id: "cashRegister.closeError"}));
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setCloseModal({ show: false, cashRegisterId: null });
  };

  const handleOpenCashRegister = async (cashRegisterId) => {
    try {
      const response = await ApiService.post(`/api/cash-register/${cashRegisterId}/open`);
      if (response.success) {
        showToast('success', intl.formatMessage({id: "cashRegister.cashRegisterOpened"}));
        loadCashRegisters(pagination.current_page);
      } else {
        showToast('error', response.message || intl.formatMessage({id: "cashRegister.openError"}));
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setOpenModal({ show: false, cashRegisterId: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? intl.formatMessage({id: "cashRegister.error"}) : intl.formatMessage({id: "cashRegister.success"}), 
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
          <span className="badge bg-success">
            <i className="pi pi-unlock me-1"></i>
            {intl.formatMessage({id: "cashRegister.open"})}
          </span>
        );
      case 'closed':
        return (
          <span className="badge bg-secondary">
            <i className="pi pi-lock me-1"></i>
            {intl.formatMessage({id: "cashRegister.closed"})}
          </span>
        );
      case 'suspended':
        return (
          <span className="badge bg-warning">
            <i className="pi pi-pause me-1"></i>
            {intl.formatMessage({id: "cashRegister.suspended"})}
          </span>
        );
      default:
        return <span className="badge bg-secondary">{intl.formatMessage({id: "cashRegister.unknown"})}</span>;
    }
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
              onClick={() => loadCashRegisters(pagination.current_page - 1)} 
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
                <button className="page-link" onClick={() => loadCashRegisters(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadCashRegisters(pagination.current_page + 1)} 
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
                <i className="pi pi-wallet me-2"></i>
                {intl.formatMessage({id: "cashRegister.title"})}
              </h2>
              <p className="text-muted mb-0">{pagination.total} {intl.formatMessage({id: "cashRegister.totalCashRegisters"})}</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => loadCashRegisters(pagination.current_page)} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? intl.formatMessage({id: "cashRegister.refreshing"}) : intl.formatMessage({id: "cashRegister.refresh"})}
              </button>
              <a onClick={() => navigate('/cash-registers/create')}
               className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>{intl.formatMessage({id: "cashRegister.newCashRegister"})}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-filter me-2"></i>{intl.formatMessage({id: "cashRegister.searchFilters"})}
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">{intl.formatMessage({id: "cashRegister.search"})}</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={intl.formatMessage({id: "cashRegister.searchPlaceholder"})}
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "cashRegister.agency"})}</label>
              <select 
                className="form-select" 
                value={filters.agency_id} 
                onChange={(e) => handleFilterChange('agency_id', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "cashRegister.all"})}</option>
                {agencies.map(agency => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "cashRegister.status"})}</label>
              <select 
                className="form-select" 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "cashRegister.allStatuses"})}</option>
                <option value="open">{intl.formatMessage({id: "cashRegister.open"})}</option>
                <option value="closed">{intl.formatMessage({id: "cashRegister.closed"})}</option>
                <option value="suspended">{intl.formatMessage({id: "cashRegister.suspended"})}</option>
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "cashRegister.startDate"})}</label>
              <input 
                type="date" 
                className="form-control" 
                value={filters.date_from} 
                onChange={(e) => handleFilterChange('date_from', e.target.value)} 
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "cashRegister.endDate"})}</label>
              <input 
                type="date" 
                className="form-control" 
                value={filters.date_to} 
                onChange={(e) => handleFilterChange('date_to', e.target.value)} 
              />
            </div>
            
            <div className="col-md-1 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-search"></i>
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-refresh"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Cash Registers Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>{intl.formatMessage({id: "cashRegister.cashRegistersList"})}
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "cashRegister.user"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "cashRegister.currentBalance"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "cashRegister.status"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "cashRegister.dates"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "cashRegister.agency"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "cashRegister.createdBy"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "cashRegister.actions"})}</th>
                </tr>
              </thead>
              <tbody>
                { cashRegisters.length === 0 && loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{intl.formatMessage({id: "cashRegister.loading"})}</span>
                      </div>
                    </td>
                  </tr>
                ) : data.cashRegisters == undefined && cashRegisters.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>{intl.formatMessage({id: "cashRegister.noCashRegistersFound"})}</h5>
                        <p className="mb-0">{intl.formatMessage({id: "cashRegister.tryModifyingCriteria"})}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cashRegisters.map((cashRegister) => (
                    <tr key={cashRegister.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="pi pi-user text-primary"></i>
                          </div>
                          <div>
                            <strong className="text-primary">
                              {cashRegister.user?.name || 'N/A'}
                            </strong>
                            <br />
                            <small className="text-muted">
                              {cashRegister.user?.email || ''}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        <strong className="text-success">
                          {formatCurrency(cashRegister.balance)}
                        </strong>
                      </td>
                      <td className="px-4">{getStatusBadge(cashRegister.status)}</td>
                      <td className="px-4">
                        <div>
                          <div>
                            <i className="pi pi-unlock text-success me-1"></i>
                            <strong>{intl.formatMessage({id: "cashRegister.opened"})}: {formatDateTime(cashRegister.opened_at)}</strong>
                          </div>
                          {cashRegister.closed_at && (
                            <div className="mt-1">
                              <i className="pi pi-lock text-secondary me-1"></i>
                              <small>{intl.formatMessage({id: "cashRegister.closedAt"})}: {formatDateTime(cashRegister.closed_at)}</small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4">
                        {cashRegister.agency ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-building text-info me-2"></i>
                            {cashRegister.agency.name}
                          </div>
                        ) : (
                          <span className="text-muted">{intl.formatMessage({id: "cashRegister.notAssigned"})}</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <i className="pi pi-user-check text-success me-2"></i>
                          {cashRegister.created_by?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <a 
                            onClick={() => navigate(`/cash-registers/${cashRegister.id}`)}
                            className="btn btn-sm btn-outline-info" 
                            title={intl.formatMessage({id: "cashRegister.view"})}
                          >
                            <i className="pi pi-eye"></i>
                          </a>
                          {/* Bouton d'ouverture - visible uniquement si la caisse est fermée ou suspendue */}
                          {(cashRegister.status === 'closed' || cashRegister.status === 'suspended') && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-success" 
                              title={intl.formatMessage({id: "cashRegister.openAction"})}
                              onClick={() => setOpenModal({ show: true, cashRegisterId: cashRegister.id })}
                            >
                              <i className="pi pi-unlock"></i>
                            </button>
                          )}
                          {/* Bouton de fermeture - visible uniquement si la caisse est ouverte */}
                          {cashRegister.status === 'open' && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-secondary" 
                              title={intl.formatMessage({id: "cashRegister.closeAction"})}
                              onClick={() => setCloseModal({ show: true, cashRegisterId: cashRegister.id })}
                            >
                              <i className="pi pi-lock"></i>
                            </button>
                          )}
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger" 
                            title={intl.formatMessage({id: "cashRegister.delete"})}
                            onClick={() => setDeleteModal({ show: true, cashRegisterId: cashRegister.id })}
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
                {intl.formatMessage({id: "cashRegister.showing"})} {pagination.from} {intl.formatMessage({id: "cashRegister.to"})} {pagination.to} {intl.formatMessage({id: "cashRegister.on"})} {pagination.total} {intl.formatMessage({id: "cashRegister.results"})}
              </div>
              <Pagination />
            </div>
          </div>
        )}
      </div>

      {/* Open Modal */}
      {openModal.show && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">
                    <i className="pi pi-unlock me-2"></i>{intl.formatMessage({id: "cashRegister.openCashRegister"})}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setOpenModal({ show: false, cashRegisterId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{intl.formatMessage({id: "cashRegister.openMessage"})}</p>
                  <div className="alert alert-info">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>{intl.formatMessage({id: "cashRegister.openInfo"})}</strong> {intl.formatMessage({id: "cashRegister.openInfoMessage"})}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setOpenModal({ show: false, cashRegisterId: null })}
                  >
                    {intl.formatMessage({id: "cashRegister.cancel"})}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => handleOpenCashRegister(openModal.cashRegisterId)}
                  >
                    <i className="pi pi-unlock me-1"></i>{intl.formatMessage({id: "cashRegister.openAction"})}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setOpenModal({ show: false, cashRegisterId: null })}
          ></div>
        </>
      )}

      {/* Close Modal */}
      {closeModal.show && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className="pi pi-lock me-2"></i>{intl.formatMessage({id: "cashRegister.closeCashRegister"})}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setCloseModal({ show: false, cashRegisterId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{intl.formatMessage({id: "cashRegister.closeMessage"})}</p>
                  <div className="alert alert-info">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>{intl.formatMessage({id: "cashRegister.closeWarning"})}</strong> {intl.formatMessage({id: "cashRegister.closeWarningMessage"})}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setCloseModal({ show: false, cashRegisterId: null })}
                  >
                    {intl.formatMessage({id: "cashRegister.cancel"})}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-warning"
                    onClick={() => handleCloseCashRegister(closeModal.cashRegisterId)}
                  >
                    <i className="pi pi-lock me-1"></i>{intl.formatMessage({id: "cashRegister.closeAction"})}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setCloseModal({ show: false, cashRegisterId: null })}
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
                    <i className="pi pi-exclamation-triangle me-2"></i>{intl.formatMessage({id: "cashRegister.confirmDelete"})}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setDeleteModal({ show: false, cashRegisterId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{intl.formatMessage({id: "cashRegister.deleteMessage"})}</p>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>{intl.formatMessage({id: "cashRegister.deleteWarning"})}</strong> {intl.formatMessage({id: "cashRegister.deleteWarningMessage"})}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, cashRegisterId: null })}
                  >
                    {intl.formatMessage({id: "cashRegister.cancel"})}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteCashRegister(deleteModal.cashRegisterId)}
                  >
                    <i className="pi pi-trash me-1"></i>{intl.formatMessage({id: "cashRegister.delete"})}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, cashRegisterId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default CashRegisterScreen;