import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const AddProductScreen = () => {
  const { id: stockId } = useParams();
  const [stock, setStock] = useState(null);
  const [products, setProducts] = useState([]);
  const [stockProducts, setStockProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockProductsLoading, setStockProductsLoading] = useState(false);
  const [stockProductSearch, setStockProductSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const navigate = useNavigate();
  
  const [productPagination, setProductPagination] = useState({
    current_page: 1, last_page: 1, total: 0
  });
  
  const [stockPagination, setStockPagination] = useState({
    current_page: 1, last_page: 1, total: 0
  });
  
  const toast = useRef(null);

  useEffect(() => {
    if (stockId) {
      loadStock();
      loadProducts();
      loadStockProducts();
    }
  }, [stockId]);


  const loadStock = async () => {
    try {
      const response = await ApiService.get(`/api/stocks/${stockId}`);
      if (response.success) setStock(response.data.stock);
    } catch (error) {
      showToast('error', 'Erreur lors du chargement du stock :' + error.message);
    }
  };

  const loadProducts = async (page = 1, search = productSearch) => {
    try {
      setLoading(true);
      const response = await ApiService.get('/api/stock-products/available', {
        stock_id: stockId, search, page, per_page: 10
      });
      if (response.success) {
        setProducts(response.data.products || []);
        setProductPagination(response.data.products);
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement des produits: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStockProducts = async (page = 1, search = stockProductSearch) => {
    try {
      setStockProductsLoading(true);
      const response = await ApiService.get('/api/stock-products', {
        page, search, stock_id: stockId, per_page: 10
      });
      if (response.success) {
        setStockProducts(response.data.stock_products.data || []);
        setStockPagination(response.data.stock_products);
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement des produits du stock :' + error.message);
    } finally {
      setStockProductsLoading(false);
    }
  };

  const setItemLoading = (id, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [id]: isLoading }));
  };

  const addProduct = async (productId) => {
    try {
      setItemLoading(`add-${productId}`, true);
      const response = await ApiService.post('/api/stock-products', {
        stock_id: stockId, product_id: productId
      });
      
      if (response.success) {
        showToast('success', 'Produit ajouté au stock');
        loadProducts();
        loadStockProducts();
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      showToast('error', 'Erreur lors de l\'ajout du produit : ' + error.message);
    } finally {
      setItemLoading(`add-${productId}`, false);
    }
  };

  const addSelectedProducts = async () => {
    if (selectedProducts.length === 0) {
      showToast('warn', 'Veuillez sélectionner au moins un produit');
      return;
    }

    try {
      setItemLoading('bulk-add', true);
      const response = await ApiService.post('/api/stock-products/bulk', {
        stock_id: stockId, product_ids: selectedProducts
      });
      
      if (response.success) {
        showToast('success', `${selectedProducts.length} produit(s) ajouté(s)`);
        setSelectedProducts([]);
        loadProducts();
        loadStockProducts();
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      showToast('error', 'Erreur lors de l\'ajout des produits : ' + error.message);
    } finally {
      setItemLoading('bulk-add', false);
    }
  };

  const removeProduct = async (stockProductId) => {
    try {
      setItemLoading(`remove-${stockProductId}`, true);
      const response = await ApiService.delete(`/api/stock-products/${stockProductId}`);
      
      if (response.success) {
        showToast('success', 'Produit retiré du stock');
        loadProducts();
        loadStockProducts();
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      showToast('error', 'Erreur lors de la suppression');
    } finally {
      setItemLoading(`remove-${stockProductId}`, false);
    }
  };

  const handleProductSelection = (productId, isSelected) => {
    setSelectedProducts(prev => 
      isSelected ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  const handleSelectAll = (isSelected) => {
    setSelectedProducts(isSelected ? products.map(p => p.id) : []);
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? 'Erreur' : severity === 'warn' ? 'Attention' : 'Succès', 
      detail, 
      life: 3000 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FBU';
  };

  const Pagination = ({ pagination, onPageChange }) => {
    if (pagination.last_page <= 1) return null;
    return (
      <div className="d-flex justify-content-center align-items-center gap-2">
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={() => onPageChange(pagination.current_page - 1)} 
          disabled={pagination.current_page === 1}
        >
          <i className="pi pi-chevron-left"></i>
        </button>
        <span className="small text-muted">
          {pagination.current_page} / {pagination.last_page}
        </span>
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={() => onPageChange(pagination.current_page + 1)} 
          disabled={pagination.current_page === pagination.last_page}
        >
          <i className="pi pi-chevron-right"></i>
        </button>
      </div>
    );
  };

  if (!stock) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ height: '100vh' }}>
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="bg-white border-bottom p-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="text-primary mb-1">
              <i className="pi pi-box me-2"></i>Stock {stock.name}
            </h4>
            <small className="text-muted">Gestion des produits en stock</small>
          </div>
            <div className="d-flex gap-2">
             <a onClick={() => navigate('/stocks')} className="btn btn-secondary">
                <i className="pi pi-arrow-left me-1"></i>Retour
            </a>
            <a  onClick={() => navigate(`/stocks/entre-multiple/${stockId}`)} className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>Entrée Multiple 
            </a>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex overflow-hidden">
        {/* Left Column - Available Products */}
        <div className="w-50 border-end d-flex flex-column ">
          <div className="bg-light py-2 px-3 border-bottom">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-3 flex-grow-1">
                
                <h6 className="mb-0">
                  <i className="pi pi-shopping-cart me-2"></i>Produits disponibles
                </h6>
                <div className="input-group" style={{maxWidth: '300px'}}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Rechercher..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && loadProducts(1, productSearch)}
                  />
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    onClick={() => loadProducts(1, productSearch)}
                  >
                    <i className="pi pi-search"></i>
                  </button>
                </div>
              </div>
              <span className="badge bg-secondary">{productPagination.total}</span>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="p-3 bg-info bg-opacity-10 border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <small>{selectedProducts.length} sélectionné(s)</small>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={addSelectedProducts}
                  disabled={loadingStates['bulk-add']}
                >
                  {loadingStates['bulk-add'] ? (
                    <><i className="pi pi-spin pi-spinner me-1"></i>Ajout...</>
                  ) : (
                    <><i className="pi pi-plus me-1"></i>Ajouter</>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex-grow-1 overflow-auto p-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="pi pi-inbox display-4 d-block mb-3"></i>
                <p>Aucun produit disponible</p>
              </div>
            ) : (
              <>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAll"
                    checked={products.length > 0 && selectedProducts.length === products.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <label className="form-check-label fw-bold">
                    Tout sélectionner ({products.length})
                  </label>
                </div>

                {products.map((product) => (
                  <div key={product.id} className="border rounded p-2 mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="form-check flex-grow-1">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => handleProductSelection(product.id, e.target.checked)}
                        />
                        <label className="form-check-label ms-2">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 p-2 rounded me-2">
                              <i className="pi pi-box text-primary"></i>
                            </div>
                            <div>
                              <strong className="text-primary">{product.code}</strong>
                              <div className="text-muted small">
                                {product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                      <button 
                        onClick={() => addProduct(product.id)}
                        className="btn btn-outline-primary btn-sm"
                        disabled={loadingStates[`add-${product.id}`]}
                      >
                        {loadingStates[`add-${product.id}`] ? (
                          <i className="pi pi-spin pi-spinner"></i>
                        ) : (
                          <i className="pi pi-plus"></i>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="p-3 border-top">
            <Pagination 
              pagination={productPagination} 
              onPageChange={(page) => loadProducts(page)} 
            />
          </div>
        </div>

        {/* Right Column - Stock Products */}
        <div className="w-50 d-flex flex-column">
          <div className="bg-light py-2 px-3  border-bottom">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-3 flex-grow-1">                
                <h6 className="mb-0">
                  <i className="pi pi-list me-2"></i>Produits du stock
                </h6>
                <div className="input-group" style={{maxWidth: '300px'}}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Rechercher dans le stock..."
                    value={stockProductSearch}
                    onChange={(e) => setStockProductSearch(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && loadStockProducts(1, stockProductSearch)}
                  />
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    onClick={() => loadStockProducts(1, stockProductSearch)}
                  >
                    <i className="pi pi-search"></i>
                  </button>
                </div>
              </div>
              <div className="d-flex gap-2 align-items-center">
                <span className="badge bg-primary">{stockPagination.total}</span>
                <button 
                  onClick={() => window.open(`/api/stocks/${stockId}/export/excel`)}
                  className="btn btn-success btn-sm"
                >
                  <i className="pi pi-file-excel"></i>
                </button>
                <button 
                  onClick={() => window.open(`/api/stocks/${stockId}/export/pdf`)}
                  className="btn btn-danger btn-sm"
                >
                  <i className="pi pi-file-pdf"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-grow-1 overflow-auto p-3">
            {stockProductsLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : stockProducts.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="pi pi-inbox display-4 d-block mb-3"></i>
                <h6>Aucun produit dans ce stock</h6>
                <p className="small">Ajoutez des produits depuis la liste de gauche</p>
              </div>
            ) : (
              stockProducts.map((stockProduct) => (
                <div key={stockProduct.id} className="border rounded p-2 mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center flex-grow-1">
                      <div className="bg-success bg-opacity-10 p-2 rounded me-2">
                        <i className="pi pi-check text-success"></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong className="text-success">{stockProduct.product?.code}</strong>
                            <div className="text-muted small">
                              {stockProduct.product?.name && stockProduct.product.name.length > 25 
                                ? stockProduct.product.name.substring(0, 25) + '...' 
                                : stockProduct.product?.name}
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="badge bg-primary">{stockProduct.quantity}</span>
                            <div className="small text-success fw-bold">
                              {formatCurrency(stockProduct.sale_price_ttc)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="btn-group ms-2">
                      <a 
                        href={`/stocks/movement/${stockProduct.id}`}
                        className="btn btn-outline-info btn-sm"
                      >
                        <i className="pi pi-eye"></i>
                      </a>
                      <button 
                        onClick={() => removeProduct(stockProduct.id)}
                        className="btn btn-outline-danger btn-sm"
                        disabled={loadingStates[`remove-${stockProduct.id}`]}
                      >
                        {loadingStates[`remove-${stockProduct.id}`] ? (
                          <i className="pi pi-spin pi-spinner"></i>
                        ) : (
                          <i className="pi pi-trash"></i>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-top">
            <Pagination 
              pagination={stockPagination} 
              onPageChange={(page) => loadStockProducts(page)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductScreen;