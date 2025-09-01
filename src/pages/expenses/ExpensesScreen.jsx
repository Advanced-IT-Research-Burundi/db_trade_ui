import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { API_CONFIG } from '../../services/config.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useNavigate } from 'react-router-dom';

const ExpenseScreen = () => {
  const intl = useIntl();
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [filters, setFilters] = useState({
    search: '',
    expense_type_id: '',
    agency_id: '',
    user_id: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, expenseId: null });
  const toast = useRef(null);
  const navigate = useNavigate();      
  const dispatch = useDispatch();
  const { data , loading} = useSelector(state => state.apiData);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    if (data.expenses) {
        setExpenses(data.expenses.expenses.data || []);
        setExpenseTypes(data.expenses.expense_types || []);
        setAgencies(data.expenses.agencies || []);
        setUsers(data.expenses.users || []);
        setPagination({
          current_page: data.expenses.expenses.current_page,
          last_page: data.expenses.expenses.last_page,
          total: data.expenses.expenses.total,
          from: data.expenses.expenses.from,
          to: data.expenses.expenses.to
        });
    }
  }, [data]);

  async function loadExpenses(page = 1) {
      try {
        const params = { page, ...filters };
        dispatch(fetchApiData({ url: API_CONFIG.ENDPOINTS.EXPENSES, itemKey: 'expenses', params }));

      } catch (error) {
        showToast('error', error.message);
      } 
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadExpenses(1);
  };

  const handleReset = () => {
    setFilters({ search: '', expense_type_id: '', agency_id: '', user_id: '' });
    setTimeout(() => loadExpenses(1), 0);
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const response = await ApiService.delete(`/api/expenses/${expenseId}`);
      if (response.success) {
        showToast('success', intl.formatMessage({id: "expense.expenseDeleted"}));
        loadExpenses(pagination.current_page);
      } else {
        showToast('error', response.message || intl.formatMessage({id: "expense.deleteError"}));
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, expenseId: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? intl.formatMessage({id: "expense.error"}) : intl.formatMessage({id: "expense.success"}), 
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
              onClick={() => loadExpenses(pagination.current_page - 1)} 
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
                <button className="page-link" onClick={() => loadExpenses(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadExpenses(pagination.current_page + 1)} 
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
                <i className="pi pi-money-bill me-2"></i>{intl.formatMessage({id: "expense.title"})}
              </h2>
              <p className="text-muted mb-0">{pagination.total} {intl.formatMessage({id: "expense.totalExpenses"})}</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => loadExpenses(pagination.current_page)} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? intl.formatMessage({id: "expense.refreshing"}) : intl.formatMessage({id: "expense.refresh"})}
              </button>
              <a 
              onClick={() => navigate('/expenses/create')}
              className="btn btn-primary"
              >
                <i className="pi pi-plus-circle me-1"></i>{intl.formatMessage({id: "expense.newExpense"})}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-filter me-2"></i>{intl.formatMessage({id: "expense.searchFilters"})}
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">{intl.formatMessage({id: "expense.search"})}</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={intl.formatMessage({id: "expense.searchPlaceholder"})}
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "expense.expenseType"})}</label>
              <select 
                className="form-select" 
                value={filters.expense_type_id} 
                onChange={(e) => handleFilterChange('expense_type_id', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "expense.all"})}</option>
                {expenseTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "expense.agency"})}</label>
              <select 
                className="form-select" 
                value={filters.agency_id} 
                onChange={(e) => handleFilterChange('agency_id', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "expense.allFeminine"})}</option>
                {agencies.map(agency => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "expense.user"})}</label>
              <select 
                className="form-select" 
                value={filters.user_id} 
                onChange={(e) => handleFilterChange('user_id', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "expense.all"})}</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2 mt-4">
                  <label className="form-label "></label>              
                   <div className="col-12 d-flex align-items-end gap-2">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      <i className="pi pi-search me-1"></i>{intl.formatMessage({id: "expense.searchBtn"})}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                      <i className="pi pi-refresh me-1"></i>{intl.formatMessage({id: "expense.reset"})}
                    </button>
                  </div>
            </div>
           
          </form>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>{intl.formatMessage({id: "expense.expensesList"})}
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "expense.date"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "expense.type"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "expense.amount"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "expense.stock"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "expense.user"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "expense.agency"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "expense.actions"})}</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 && loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{intl.formatMessage({id: "expense.loading"})}</span>
                      </div>
                    </td>
                  </tr>
                ) : data.expenses == undefined && expenses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>{intl.formatMessage({id: "expense.noExpensesFound"})}</h5>
                        <p className="mb-0">{intl.formatMessage({id: "expense.tryModifyingCriteria"})}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-4">
                        <div className="text-muted">
                          <div className="mb-1">
                            <i className="pi pi-calendar me-1"></i>
                            <strong>{formatDate(expense.expense_date)}</strong>
                          </div>
                          <div>
                            <i className="pi pi-clock me-1"></i>
                            <small>
                              {new Date(expense.expense_date).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        {expense.expense_type ? (
                          <span className="badge bg-info">
                            <i className="pi pi-tag me-1"></i>
                            {expense.expense_type.name}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4">
                        <span className="badge bg-danger">
                          <i className="pi pi-money-bill me-1"></i>
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>
                      <td className="px-4">
                        {expense.stock ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-box text-muted me-2"></i>
                            {expense.stock.name}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4">
                        {expense.user ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-user text-success me-2"></i>
                            {expense.user.name}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4">
                        {expense.agency ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-building text-info me-2"></i>
                            {expense.agency.name}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <a 
                            href={`/expenses/${expense.id}`} 
                            className="btn btn-sm btn-outline-info" 
                            title={intl.formatMessage({id: "expense.view"})}
                          >
                            <i className="pi pi-eye"></i>
                          </a>
                          <a 
                            onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                            className="btn btn-sm btn-outline-warning" 
                            title={intl.formatMessage({id: "expense.edit"})}
                          >
                            <i className="pi pi-pencil"></i>
                          </a>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger" 
                            title={intl.formatMessage({id: "expense.delete"})}
                            onClick={() => setDeleteModal({ show: true, expenseId: expense.id })}
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
                {intl.formatMessage({id: "expense.showing"})} {pagination.from} {intl.formatMessage({id: "expense.to"})} {pagination.to} {intl.formatMessage({id: "expense.on"})} {pagination.total} {intl.formatMessage({id: "expense.results"})}
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
                    <i className="pi pi-exclamation-triangle me-2"></i>{intl.formatMessage({id: "expense.confirmDelete"})}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setDeleteModal({ show: false, expenseId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{intl.formatMessage({id: "expense.deleteMessage"})}</p>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>{intl.formatMessage({id: "expense.deleteWarning"})}</strong> {intl.formatMessage({id: "expense.deleteWarningMessage"})}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, expenseId: null })}
                  >
                    {intl.formatMessage({id: "expense.cancel"})}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteExpense(deleteModal.expenseId)}
                  >
                    <i className="pi pi-trash me-1"></i>{intl.formatMessage({id: "expense.delete"})}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, expenseId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default ExpenseScreen;