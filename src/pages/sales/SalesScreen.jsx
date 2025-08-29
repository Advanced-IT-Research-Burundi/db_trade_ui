import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import StatCard from '../../components/Card/StatCard.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useIntl } from 'react-intl';

const SalesScreen = () => {
  const intl = useIntl();
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

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
  const [cancelModal, setCancelModal] = useState({ show: false, saleId: null });
  const [paymentModal, setPaymentModal] = useState({ 
    show: false, 
    saleId: null, 
    dueAmount: 0, 
    paymentAmount: '', 
    paymentMethod: 'cash',
    processing: false 
  });
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
        showToast('success', intl.formatMessage({id: "sales.saleDeleted"}));
        loadSales(pagination.current_page);
        loadStats();
      } else {
        showToast('error', response.error || intl.formatMessage({id: "sales.deleteError"}));
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, saleId: null });
  };

  const handleCancelSale = async (saleId, reason) => {
    try {
      const response = await ApiService.put(`/api/sales/${saleId}/cancel`, { description: reason });
      if (response.success) {
        showToast('success', intl.formatMessage({id: "sales.saleCancelled"}));
        loadSales(pagination.current_page);
        loadStats();
      } else {
        showToast('error', response.error || intl.formatMessage({id: "sales.cancelError"}));
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setCancelModal({ show: false, saleId: null });
  };

  const handlePaymentSubmit = async () => {
    const { saleId, paymentAmount, paymentMethod } = paymentModal;
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showToast('error', intl.formatMessage({id: "sales.validAmountRequired"}));
      return;
    }

    if (parseFloat(paymentAmount) > paymentModal.dueAmount) {
      showToast('error', intl.formatMessage({id: "sales.amountExceedsDue"}));
      return;
    }

    try {
      setPaymentModal(prev => ({ ...prev, processing: true }));
      
      const response = await ApiService.post(`/api/sales/${saleId}/payment`, {
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        payment_date: new Date().toISOString().split('T')[0]
      });

      if (response.success) {
        showToast('success', intl.formatMessage({id: "sales.paymentRegistered"}));
        loadSales(pagination.current_page);
        loadStats();
        setPaymentModal({ 
          show: false, 
          saleId: null, 
          dueAmount: 0, 
          paymentAmount: '', 
          paymentMethod: 'cash',
          processing: false 
        });
      } else {
        showToast('error', response.error || intl.formatMessage({id: "sales.paymentError"}));
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setPaymentModal(prev => ({ ...prev, processing: false }));
    }
  };

  const openPaymentModal = (sale) => {
    setPaymentModal({
      show: true,
      saleId: sale.id,
      dueAmount: sale.due_amount,
      paymentAmount: sale.due_amount.toString(),
      paymentMethod: 'cash',
      processing: false
    });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? intl.formatMessage({id: "sales.error"}) : intl.formatMessage({id: "sales.success"}), 
      detail, 
      life: 3000 
    });
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' F';
  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

  const getStatusBadge = (sale) => {
    if (sale.status === 'cancelled') return <span className="badge bg-secondary"><i className="pi pi-ban me-1"></i>{intl.formatMessage({id: "sales.cancelled"})}</span>;
    if (sale.due_amount == 0) return <span className="badge bg-success"><i className="pi pi-check-circle me-1"></i>{intl.formatMessage({id: "sales.paid"})}</span>;
    if (sale.paid_amount > 0) return <span className="badge bg-warning"><i className="pi pi-clock me-1"></i>{intl.formatMessage({id: "sales.partial"})}</span>;
    return <span className="badge bg-danger"><i className="pi pi-x-circle me-1"></i>{intl.formatMessage({id: "sales.unpaid"})}</span>;
  };

  const canCancelSale = (sale) => {
    return sale.status !== 'cancelled' ;
  };

  const canPaySale = (sale) => {
    return sale.status !== 'cancelled' && sale.due_amount > 0;
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
                <i className="pi pi-cart-check-fill me-2"></i>{intl.formatMessage({id: "sales.title"})}
              </h2>
              <p className="text-muted mb-0">{pagination.total} {intl.formatMessage({id: "sales.totalSales"})}</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary" onClick={() => { loadSales(pagination.current_page); loadStats(); }} disabled={loading}>
                <i className="pi pi-arrow-clockwise me-1"></i>
                {loading ? intl.formatMessage({id: "sales.refreshing"}) : intl.formatMessage({id: "sales.refresh"})}
              </button>
              <button  onClick={()=>navigate('/sales/create')} className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>{intl.formatMessage({id: "sales.newSale"})}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <StatCard icon="money-bill" title={intl.formatMessage({id: "sales.total"})} value={formatCurrency(stats.totalRevenue || 0)} color="primary" loading={statsLoading} />
        <StatCard icon="check-circle" title={intl.formatMessage({id: "sales.paidSales"})} value={stats.paidSales || 0} color="success" loading={statsLoading} />
        <StatCard icon="clock" title={intl.formatMessage({id: "sales.receivables"})} value={formatCurrency(stats.totalDue || 0)} color="warning" loading={statsLoading} />
        <StatCard icon="calendar" title={intl.formatMessage({id: "sales.today"})} value={stats.todaySales || 0} color="info" loading={statsLoading} />
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">{intl.formatMessage({id: "sales.search"})}</label>
              <div className="input-group">
                <span className="input-group-text"><i className="pi pi-search"></i></span>
                <input type="text" className="form-control" placeholder={intl.formatMessage({id: "sales.searchPlaceholder"})} 
                       value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "sales.startDate"})}</label>
              <input type="date" className="form-control" value={filters.date_from} 
                     onChange={(e) => handleFilterChange('date_from', e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "sales.endDate"})}</label>
              <input type="date" className="form-control" value={filters.date_to} 
                     onChange={(e) => handleFilterChange('date_to', e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "sales.status"})}</label>
              <select className="form-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                <option value="">{intl.formatMessage({id: "sales.all"})}</option>
                <option value="paid">{intl.formatMessage({id: "sales.paid"})}</option>
                <option value="partial">{intl.formatMessage({id: "sales.partial"})}</option>
                <option value="unpaid">{intl.formatMessage({id: "sales.unpaid"})}</option>
                <option value="cancelled">{intl.formatMessage({id: "sales.cancelled"})}</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end gap-2">
              <a onClick={()=>navigate('/proforma')} className="btn btn-outline-primary">
                <i className="pi pi-file-earmark-text me-1"></i>{intl.formatMessage({id: "sales.proforma"})}
              </a>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-funnel me-1"></i>{intl.formatMessage({id: "sales.filter"})}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-x-circle me-1"></i>{intl.formatMessage({id: "sales.reset"})}
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
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "sales.saleNumber"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "sales.client"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "sales.date"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "sales.totalAmount"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "sales.paidAmount"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "sales.remaining"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "sales.status"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "sales.invoice"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "sales.actions"})}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{intl.formatMessage({id: "sales.loading"})}</span>
                      </div>
                    </td>
                  </tr>
                 
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>{intl.formatMessage({id: "sales.noSalesFound"})}</h5>
                        <p className="mb-0">{intl.formatMessage({id: "sales.createFirstSale"})}</p>
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
                          <strong>{sale.client?.name || intl.formatMessage({id: "sales.deletedClient"})}</strong>
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
                      <td className="px-4"><strong>{sale.type_facture || intl.formatMessage({id: "sales.standard"})}</strong></td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <Link to={`/sales/${sale.id}`} className="btn btn-sm btn-outline-primary" title={intl.formatMessage({id: "sales.view"})}>
                            <i className="pi pi-eye"></i>
                          </Link>
                          {sale.status !== 'cancelled' && (
                            <a href={`/sales/${sale.id}/edit`} className="btn btn-sm btn-outline-warning" title={intl.formatMessage({id: "sales.edit"})}>
                              <i className="pi pi-pencil"></i>
                            </a>
                          )}
                          {canPaySale(sale) && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-success" 
                              title={intl.formatMessage({id: "sales.pay"})}
                              onClick={() => openPaymentModal(sale)}
                            >
                              <i className="pi pi-credit-card"></i>
                            </button>
                          )}
                          {canCancelSale(sale) && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-secondary" 
                              title={intl.formatMessage({id: "sales.cancel"})}
                              onClick={() => setCancelModal({ show: true, saleId: sale.id })}
                            >
                              <i className="pi pi-ban"></i>
                            </button>
                          )}
                          {sale.status !== 'cancelled' && (
                            <button type="button" className="btn btn-sm btn-outline-danger" title={intl.formatMessage({id: "sales.delete"})}
                                    onClick={() => setDeleteModal({ show: true, saleId: sale.id })}>
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
                {intl.formatMessage({id: "sales.showing"})} {pagination.from} {intl.formatMessage({id: "sales.to"})} {pagination.to} {intl.formatMessage({id: "sales.on"})} {pagination.total} {intl.formatMessage({id: "sales.results"})}
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
                    <i className="pi pi-exclamation-triangle me-2"></i>{intl.formatMessage({id: "sales.confirmDelete"})}
                  </h5>
                  <button type="button" className="btn-close btn-close-white"
                          onClick={() => setDeleteModal({ show: false, saleId: null })}></button>
                </div>
                <div className="modal-body">
                  <p>{intl.formatMessage({id: "sales.deleteMessage"})}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary"
                          onClick={() => setDeleteModal({ show: false, saleId: null })}>
                    {intl.formatMessage({id: "sales.cancel"})}
                  </button>
                  <button type="button" className="btn btn-danger"
                          onClick={() => handleDeleteSale(deleteModal.saleId)}>
                    <i className="pi pi-trash me-1"></i>{intl.formatMessage({id: "sales.delete"})}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={() => setDeleteModal({ show: false, saleId: null })}></div>
        </>
      )}

      {/* Cancel Sale Modal */}
      {cancelModal.show && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className="pi pi-ban me-2"></i>{intl.formatMessage({id: "sales.confirmCancel"})}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setCancelModal({ show: false, saleId: null });
                      setCancelReason(""); 
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{intl.formatMessage({id: "sales.cancelMessage"})}</p>

                  <div className="mb-3">
                    <label htmlFor="cancelReason" className="form-label">
                      {intl.formatMessage({id: "sales.cancelReason"})}
                    </label>
                    <textarea
                      id="cancelReason"
                      className="form-control"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder={intl.formatMessage({id: "sales.cancelReasonPlaceholder"})}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setCancelModal({ show: false, saleId: null });
                      setCancelReason("");
                    }}
                  >
                    {intl.formatMessage({id: "sales.close"})}
                  </button>
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={() => {
                      handleCancelSale(cancelModal.saleId, cancelReason);
                      setCancelReason(""); 
                    }}
                    disabled={!cancelReason.trim()}
                  >
                    <i className="pi pi-ban me-1"></i>{intl.formatMessage({id: "sales.cancelSale"})}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop show"
            onClick={() => {
              setCancelModal({ show: false, saleId: null });
              setCancelReason("");
            }}
          ></div>
        </>
      )}

      {/* Payment Modal */}
      {paymentModal.show && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">
                    <i className="pi pi-credit-card me-2"></i>{intl.formatMessage({id: "sales.registerPayment"})}
                  </h5>
                  <button type="button" className="btn-close btn-close-white"
                          onClick={() => setPaymentModal({ 
                            show: false, 
                            saleId: null, 
                            dueAmount: 0, 
                            paymentAmount: '', 
                            paymentMethod: 'cash',
                            processing: false 
                          })}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">{intl.formatMessage({id: "sales.amountDue"})}</label>
                    <div className="form-control-plaintext fw-bold text-warning">
                      {formatCurrency(paymentModal.dueAmount)}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">{intl.formatMessage({id: "sales.amountToPay"})} <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="pi pi-money-bill-wave"></i>
                      </span>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder={intl.formatMessage({id: "sales.amount"})}
                        value={paymentModal.paymentAmount}
                        onChange={(e) => setPaymentModal(prev => ({ 
                          ...prev, 
                          paymentAmount: e.target.value 
                        }))}
                        min="0"
                        max={paymentModal.dueAmount}
                        step="0.01"
                      />
                      <span className="input-group-text">F</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">{intl.formatMessage({id: "sales.paymentMethod"})}</label>
                    <select 
                      className="form-select"
                      value={paymentModal.paymentMethod}
                      onChange={(e) => setPaymentModal(prev => ({ 
                        ...prev, 
                        paymentMethod: e.target.value 
                      }))}
                    >
                      <option value="cash">{intl.formatMessage({id: "sales.cash"})}</option>
                      <option value="card">{intl.formatMessage({id: "sales.card"})}</option>
                      <option value="transfer">{intl.formatMessage({id: "sales.transfer"})}</option>
                      <option value="mobile">{intl.formatMessage({id: "sales.mobileMoney"})}</option>
                      <option value="check">{intl.formatMessage({id: "sales.check"})}</option>
                    </select>
                  </div>

                  {parseFloat(paymentModal.paymentAmount) === paymentModal.dueAmount && (
                    <div className="alert alert-success">
                      <i className="pi pi-check-circle me-2"></i>
                      {intl.formatMessage({id: "sales.fullyPaidMessage"})}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary"
                          onClick={() => setPaymentModal({ 
                            show: false, 
                            saleId: null, 
                            dueAmount: 0, 
                            paymentAmount: '', 
                            paymentMethod: 'cash',
                            processing: false 
                          })}>
                    {intl.formatMessage({id: "sales.cancel"})}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={handlePaymentSubmit}
                    disabled={paymentModal.processing}
                  >
                    {paymentModal.processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        {intl.formatMessage({id: "sales.processing"})}
                      </>
                    ) : (
                      <>
                        <i className="pi pi-check me-1"></i>{intl.formatMessage({id: "sales.registerPaymentBtn"})}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={() => setPaymentModal({ 
            show: false, 
            saleId: null, 
            dueAmount: 0, 
            paymentAmount: '', 
            paymentMethod: 'cash',
            processing: false 
          })}></div>
        </>
      )}
    </div>
  );
};

export default SalesScreen;