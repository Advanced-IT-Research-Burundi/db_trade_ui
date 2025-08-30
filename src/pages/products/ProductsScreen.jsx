import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { API_CONFIG } from '../../services/config.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useNavigate } from 'react-router-dom';

const ProductScreen = () => {
  const intl = useIntl();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    agency_id: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, productId: null });
  const toast = useRef(null);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { data , loading} = useSelector(state => state.apiData);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (data.products) {
      setProducts(data.products.products.data || []);
      setCategories(data.products.categories || []);
      setAgencies(data.products.agencies || []);
      setPagination({
        current_page: data.products.products.current_page,
        last_page: data.products.products.last_page,
        total: data.products.products.total,
        from: data.products.products.from,
        to: data.products.products.to
      });
    }
  }, [data]);

  async function loadProducts(page = 1) {
    try {
      const params = { page, ...filters };
      dispatch(fetchApiData({ url: API_CONFIG.ENDPOINTS.PRODUCTS, itemKey: 'products', params }));
     
    } catch (error) {
      showToast('error', error.message);
    } 
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(1);
  };

  const handleReset = () => {
    setFilters({ search: '', category_id: '', agency_id: '' });
    setTimeout(() => loadProducts(1), 0);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await ApiService.delete(`/api/products/${productId}`);
      if (response.success) {
        showToast('success', intl.formatMessage({id: "product.productDeleted"}));
        loadProducts(pagination.current_page);
      } else {
        showToast('error', response.message || intl.formatMessage({id: "product.deleteError"}));
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, productId: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? intl.formatMessage({id: "product.error"}) : intl.formatMessage({id: "product.success"}), 
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

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `/storage/${imagePath}`;
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
              onClick={() => loadProducts(pagination.current_page - 1)} 
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
                <button className="page-link" onClick={() => loadProducts(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadProducts(pagination.current_page + 1)} 
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
                <i className="pi pi-box me-2"></i>{intl.formatMessage({id: "product.title"})}
              </h2>
              <p className="text-muted mb-0">{pagination.total} {intl.formatMessage({id: "product.totalProducts"})}</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => loadProducts(pagination.current_page)} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? intl.formatMessage({id: "product.refreshing"}) : intl.formatMessage({id: "product.refresh"})}
              </button>
              <a onClick={()=> navigate('/products/create')} className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>{intl.formatMessage({id: "product.newProduct"})}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-filter me-2"></i>{intl.formatMessage({id: "product.searchFilters"})}
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-4">
              <label className="form-label">{intl.formatMessage({id: "product.search"})}</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={intl.formatMessage({id: "product.searchPlaceholder"})}
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">{intl.formatMessage({id: "product.category"})}</label>
              <select 
                className="form-select" 
                value={filters.category_id} 
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "product.all"})}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">{intl.formatMessage({id: "product.agency"})}</label>
              <select 
                className="form-select" 
                value={filters.agency_id} 
                onChange={(e) => handleFilterChange('agency_id', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "product.all"})}</option>
                {agencies.map(agency => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-search me-1"></i>{intl.formatMessage({id: "product.searchBtn"})}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-refresh me-1"></i>{intl.formatMessage({id: "product.reset"})}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Products Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>{intl.formatMessage({id: "product.productsList"})}
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "product.image"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "product.code"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "product.name"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "product.category"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "product.purchasePrice"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "product.salePrice"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "product.unit"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "product.alertThreshold"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "product.agency"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "product.createdBy"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "product.createdOn"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "product.actions"})}</th>
                </tr>
              </thead>
              <tbody>
                { products.length === 0 && loading ? (
                  <tr>
                    <td colSpan="12" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{intl.formatMessage({id: "product.loading"})}</span>
                      </div>
                    </td>
                  </tr>
                ) : data.products == undefined && products.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>{intl.formatMessage({id: "product.noProductsFound"})}</h5>
                        <p className="mb-0">{intl.formatMessage({id: "product.tryModifyingCriteria"})}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4">
                        {getImageUrl(product.image) ? (
                          <img 
                            src={getImageUrl(product.image)} 
                            alt={product.name}
                            className="rounded"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="bg-light rounded d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '40px', 
                            height: '40px',
                            display: getImageUrl(product.image) ? 'none' : 'flex'
                          }}
                        >
                          <i className="pi pi-image text-muted"></i>
                        </div>
                      </td>
                      <td className="px-4">
                        <span className="badge bg-info text-white">{product.code}</span>
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="pi pi-box text-primary"></i>
                          </div>
                          <div>
                            <strong className="text-primary">{product.name}</strong>
                            {product.description && (
                              <>
                                <br />
                                <small className="text-muted" title={product.description}>
                                  {truncateText(product.description, 30)}
                                </small>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        {product.category ? (
                          <span className="badge bg-secondary">{product.category.name}</span>
                        ) : (
                          <span className="text-muted">{intl.formatMessage({id: "product.uncategorized"})}</span>
                        )}
                      </td>
                      <td className="px-4">
                        <span className="text-success fw-bold">
                          {formatCurrency(product.purchase_price)}
                        </span>
                      </td>
                      <td className="px-4">
                        <span className="text-primary fw-bold">
                          {formatCurrency(product.sale_price)}
                        </span>
                      </td>
                      <td className="px-4">
                        <span className="badge bg-info text-white">{product.unit}</span>
                      </td>
                      <td className="px-4">
                        <span className="badge bg-warning text-dark">{product.alert_quantity}</span>
                      </td>
                      <td className="px-4">
                        {product.agency ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-building text-info me-2"></i>
                            {product.agency.name}
                          </div>
                        ) : (
                          <span className="text-muted">{intl.formatMessage({id: "product.notAssigned"})}</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <i className="pi pi-user-check text-success me-2"></i>
                          {product.created_by?.last_name || product.created_by?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4">
                        <div>
                          <strong>{formatDate(product.created_at)}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(product.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </small>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <a 
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                            className="btn btn-sm btn-outline-warning" 
                            title={intl.formatMessage({id: "product.edit"})}
                          >
                            <i className="pi pi-pencil"></i>
                          </a>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger" 
                            title={intl.formatMessage({id: "product.delete"})}
                            onClick={() => setDeleteModal({ show: true, productId: product.id })}
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
                {intl.formatMessage({id: "product.showing"})} {pagination.from} {intl.formatMessage({id: "product.to"})} {pagination.to} {intl.formatMessage({id: "product.on"})} {pagination.total} {intl.formatMessage({id: "product.results"})}
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
                    <i className="pi pi-exclamation-triangle me-2"></i>{intl.formatMessage({id: "product.confirmDelete"})}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setDeleteModal({ show: false, productId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{intl.formatMessage({id: "product.deleteMessage"})}</p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, productId: null })}
                  >
                    {intl.formatMessage({id: "product.cancel"})}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteProduct(deleteModal.productId)}
                  >
                    <i className="pi pi-trash me-1"></i>{intl.formatMessage({id: "product.delete"})}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, productId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default ProductScreen;