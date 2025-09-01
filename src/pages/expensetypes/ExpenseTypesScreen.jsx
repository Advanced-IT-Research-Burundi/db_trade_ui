import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { API_CONFIG } from '../../services/config.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useNavigate } from 'react-router-dom';

const ExpenseTypeScreen = () => {
  const intl = useIntl();
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    agency_id: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, expenseTypeId: null });
  const toast = useRef(null);

  const navigate = useNavigate();      
  const dispatch = useDispatch();
  const { data , loading} = useSelector(state => state.apiData);

  useEffect(() => {
    loadExpenseTypes();
  }, []);

  useEffect(() => {
      if (data.expense_types) {

          setExpenseTypes(data.expense_types.expense_types?.data || []);

          setAgencies(data.expense_types?.agencies || []);
          setPagination({
            current_page: data.expense_types.expense_types?.current_page,
            last_page: data.expense_types.expense_types?.last_page,
            total: data.expense_types.expense_types?.total,
            from: data.expense_types.expense_types?.from,
            to: data.expense_types.expense_types?.to
          });
      }
    }, [data]);

    async function loadExpenseTypes(page = 1) {
        try {
          const params = { page, ...filters };
          dispatch(fetchApiData({ url: API_CONFIG.ENDPOINTS.EXPENSE_TYPES, itemKey: 'expense_types', params }));

        } catch (error) {
          showToast('error', error.message);
        } 
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadExpenseTypes(1);
  };

  const handleReset = () => {
    setFilters({ search: '', agency_id: '' });
    setTimeout(() => loadExpenseTypes(1), 0);
  };

  const handleDeleteExpenseType = async (expenseTypeId) => {
    try {
      const response = await ApiService.delete(`/api/expense-types/${expenseTypeId}`);
      if (response.success) {
        showToast('success', intl.formatMessage({id: "expenseType.typeDeleted"}));
        loadExpenseTypes(pagination.current_page);
      } else {
        showToast('error', response.message || intl.formatMessage({id: "expenseType.deleteError"}));
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, expenseTypeId: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? intl.formatMessage({id: "expenseType.error"}) : intl.formatMessage({id: "expenseType.success"}), 
      detail, 
      life: 3000 
    });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

  const truncateText = (text, maxLength = 100) => {
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
              onClick={() => loadExpenseTypes(pagination.current_page - 1)} 
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
                <button className="page-link" onClick={() => loadExpenseTypes(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadExpenseTypes(pagination.current_page + 1)} 
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
                <i className="pi pi-tags me-2"></i>{intl.formatMessage({id: "expenseType.title"})}
              </h2>
              <p className="text-muted mb-0">{pagination.total} {intl.formatMessage({id: "expenseType.totalTypes"})}</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => loadExpenseTypes(pagination.current_page)} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? intl.formatMessage({id: "expenseType.refreshing"}) : intl.formatMessage({id: "expenseType.refresh"})}
              </button>
              <a
               onClick={() => navigate('/expense-types/create')}
               className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>{intl.formatMessage({id: "expenseType.newType"})}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-filter me-2"></i>{intl.formatMessage({id: "expenseType.searchFilters"})}
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-5">
              <label className="form-label">{intl.formatMessage({id: "expenseType.search"})}</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={intl.formatMessage({id: "expenseType.searchPlaceholder"})}
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-5">
              <label className="form-label">{intl.formatMessage({id: "expenseType.agency"})}</label>
              <select 
                className="form-select" 
                value={filters.agency_id} 
                onChange={(e) => handleFilterChange('agency_id', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "expenseType.all"})}</option>
                {agencies.map(agency => (
                  <option key={agency.id} value={agency.id}>
                    {agency.label || agency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-search me-1"></i>{intl.formatMessage({id: "expenseType.searchBtn"})}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-refresh me-1"></i>{intl.formatMessage({id: "expenseType.reset"})}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Expense Types Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>{intl.formatMessage({id: "expenseType.typesList"})}
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "expenseType.name"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "expenseType.description"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "expenseType.agency"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "expenseType.createdOn"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "expenseType.actions"})}</th>
                </tr>
              </thead>
              <tbody>
                {expenseTypes.length === 0 && loading  ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{intl.formatMessage({id: "expenseType.loading"})}</span>
                      </div>
                    </td>
                  </tr>
                ) : data.expense_types == undefined && expenseTypes.length === 0 ?  (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>{intl.formatMessage({id: "expenseType.noTypesFound"})}</h5>
                        <p className="mb-0">{intl.formatMessage({id: "expenseType.tryModifyingCriteria"})}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenseTypes.map((expenseType) => (
                    <tr key={expenseType.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="pi pi-tag text-primary"></i>
                          </div>
                          <strong className="text-primary">{expenseType.name}</strong>
                        </div>
                      </td>
                      <td className="px-4">
                        {expenseType.description ? (
                          <span title={expenseType.description}>
                            {truncateText(expenseType.description, 100)}
                          </span>
                        ) : (
                          <span className="text-muted">{intl.formatMessage({id: "expenseType.noDescription"})}</span>
                        )}
                      </td>
                      <td className="px-4">
                        {expenseType.agency ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-building text-info me-2"></i>
                            {expenseType.agency.name}
                          </div>
                        ) : (
                          <span className="text-muted">{intl.formatMessage({id: "expenseType.notAssigned"})}</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div>
                          <strong>{formatDate(expenseType.created_at)}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(expenseType.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </small>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <a 
                            onClick={() => navigate(`/expense-types/${expenseType.id}/edit`)}
                            className="btn btn-sm btn-outline-warning" 
                            title={intl.formatMessage({id: "expenseType.edit"})}
                          >
                            <i className="pi pi-pencil"></i>
                          </a>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger" 
                            title={intl.formatMessage({id: "expenseType.delete"})}
                            onClick={() => setDeleteModal({ show: true, expenseTypeId: expenseType.id })}
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
                {intl.formatMessage({id: "expenseType.showing"})} {pagination.from} {intl.formatMessage({id: "expenseType.to"})} {pagination.to} {intl.formatMessage({id: "expenseType.on"})} {pagination.total} {intl.formatMessage({id: "expenseType.results"})}
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
                    <i className="pi pi-exclamation-triangle me-2"></i>{intl.formatMessage({id: "expenseType.confirmDelete"})}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setDeleteModal({ show: false, expenseTypeId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{intl.formatMessage({id: "expenseType.deleteMessage"})}</p>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>{intl.formatMessage({id: "expenseType.deleteWarning"})}</strong> {intl.formatMessage({id: "expenseType.deleteWarningMessage"})}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, expenseTypeId: null })}
                  >
                    {intl.formatMessage({id: "expenseType.cancel"})}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteExpenseType(deleteModal.expenseTypeId)}
                  >
                    <i className="pi pi-trash me-1"></i>{intl.formatMessage({id: "expenseType.delete"})}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, expenseTypeId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default ExpenseTypeScreen;