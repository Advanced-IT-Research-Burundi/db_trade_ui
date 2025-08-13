import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { useParams, useNavigate } from 'react-router-dom';

const EntreMultipleScreen = () => {
  const { id: stockId } = useParams();
  const navigate = useNavigate();
  
  const [stock, setStock] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState({
    initial: false,
    products: false,
    submitting: false
  });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const toast = useRef(null);
  const inputTimeouts = useRef({});

  const showToast = useCallback((severity, detail) => {
    toast.current?.show({
      severity,
      summary: severity === 'error' ? 'Erreur' : severity === 'warn' ? 'Attention' : 'Succès',
      detail,
      life: 3000
    });
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(prev => ({ ...prev, initial: true }));
    try {
      const [stockResponse, categoriesResponse] = await Promise.all([
        ApiService.get(`/api/stocks/${stockId}`),
        ApiService.get(`/api/stocks/${stockId}/categories`)
      ]);

      if (stockResponse.success) {
        setStock(stockResponse.data.stock);
      }
      
      if (categoriesResponse.success) {
        setCategories([
          { id: '', name: 'Toutes les catégories' },
          ...categoriesResponse.data.categories
        ]);
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement initial');
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  }, [stockId, showToast]);

  const loadProducts = useCallback(async (searchTerm = '', categoryId = '') => {
    if (loading.initial) return;
    
    setLoading(prev => ({ ...prev, products: true }));
    try {
      const response = await ApiService.get('/api/stock-products/for-entry', {
        stock_id: stockId,
        search: searchTerm.trim(),
        category_id: categoryId,
        limit: 200
      });
      
      if (response.success) {
        const productsData = response.data.products;
        setProducts(productsData);
        
        // Préserver les quantités existantes, initialiser les nouvelles à 0
        setQuantities(prev => {
          const newQuantities = { ...prev };
          productsData.forEach(product => {
            if (!(product.id in newQuantities)) {
              newQuantities[product.id] = 0;
            }
          });
          return newQuantities;
        });
        
        // Préserver les prix existants, initialiser les nouveaux
        setPrices(prev => {
          const newPrices = { ...prev };
          productsData.forEach(product => {
            if (!(product.id in newPrices)) {
              newPrices[product.id] = product.product?.sale_price || 0;
            }
          });
          return newPrices;
        });
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement des produits');
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  }, [stockId, loading.initial, showToast]);

  useEffect(() => {
    if (stockId) {
      loadInitialData().then(() => loadProducts());
    }
  }, [stockId, loadInitialData]);

  const handleSearch = useCallback(() => {
    loadProducts(search, selectedCategory);
  }, [loadProducts, search, selectedCategory]);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleQuantityChange = useCallback((productId, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    
    if (inputTimeouts.current[productId]) {
      clearTimeout(inputTimeouts.current[productId]);
    }

    setQuantities(prev => ({ ...prev, [productId]: numValue }));

  }, []);

  const handlePriceChange = useCallback((productId, value) => {
    const numValue = Math.max(0, parseFloat(value) || 0);
    
    if (inputTimeouts.current[productId]) {
      clearTimeout(inputTimeouts.current[productId]);
    }

    setPrices(prev => ({ ...prev, [productId]: numValue }));
  }, []);

  const resetQuantities = useCallback(() => {
    setQuantities(prev => {
      const reset = {};
      Object.keys(prev).forEach(id => reset[id] = 0);
      return reset;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const validEntries = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({
        product_id: parseInt(productId),
        quantity,
        price: prices[productId] || 0
      }));
    
    if (validEntries.length === 0) {
      showToast('warn', 'Veuillez saisir au moins une quantité');
      return;
    }

    setLoading(prev => ({ ...prev, submitting: true }));
    try {
      const response = await ApiService.post('/api/stock-products/bulk-entry', {
        stock_id: stockId,
        entries: validEntries
      });

      if (response.success) {
        showToast('success', response.message);
        resetQuantities();
        loadProducts(search, selectedCategory);
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      showToast('error', error.message || 'Erreur lors de l\'entrée multiple');
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  }, [quantities, prices, stockId, resetQuantities, showToast, search, selectedCategory, loadProducts]);

  const stats = useMemo(() => {
    const totalEntries = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    const totalValue = Object.entries(quantities).reduce((sum, [productId, qty]) => {
      return sum + (qty * (prices[productId] || 0));
    }, 0);
    const selectedCount = Object.entries(quantities).filter(([, qty]) => qty > 0).length;
    
    return { totalEntries, totalValue, selectedCount };
  }, [quantities, prices]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FBU';
  }, []);

  useEffect(() => {
    return () => {
      Object.values(inputTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

 

  if (!loading.initial && !stock) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <i className="pi pi-exclamation-triangle display-1 text-warning"></i>
          <h5 className="mt-3">Stock non trouvé</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ height: '100vh' }}>
      <Toast ref={toast} />
      
      <div className="bg-white border-bottom p-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="text-primary mb-1">
              <i className="pi pi-plus-circle me-2"></i>
              Entrée Multiple - {loading.initial ? <div className="spinner-border spinner-border-sm"></div> : stock.name}
            </h4>
            <small className="text-muted">Saisie en lot des quantités et prix</small>
          </div>
          <button 
            onClick={() => navigate('/stocks')}
            className="btn btn-outline-secondary"
            type="button"
          >
            <i className="pi pi-arrow-left me-1"></i>Retour
          </button>
        </div>
      </div>

      <div className="bg-light border-bottom p-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label small">Rechercher un produit</label>
            <input
              type="text"
              className="form-control"
              placeholder="Code ou nom du produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              disabled={loading.products}
            />
          </div>
          
          <div className="col-md-2">
            <label className="form-label small">Catégorie</label>
            <select 
              className="form-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={loading.products}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-md-1">
            <button
              onClick={handleSearch}
              className="btn btn-primary w-100"
              disabled={loading.products}
              type="button"
            >
              {loading.products ? (
                <div className="spinner-border spinner-border-sm"></div>
              ) : (
                <i className="pi pi-search"></i>
              )}
            </button>
          </div>
          
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center">
              <div className="small text-muted">
                {stats.totalEntries > 0 && (
                  <>
                    <div>Total entrées: <strong>{stats.totalEntries}</strong></div>
                    <div>Valeur totale: <strong>{formatCurrency(stats.totalValue)}</strong></div>
                  </>
                )}
              </div>
              <div className="btn-group">
                {stats.totalEntries > 0 && (
                  <button
                    onClick={resetQuantities}
                    className="btn btn-outline-warning btn-sm"
                    disabled={loading.submitting}
                    type="button"
                  >
                    <i className="pi pi-refresh me-1"></i>
                    Réinitialiser
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={loading.submitting || stats.totalEntries === 0}
                  type="button"
                >
                  {loading.submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <i className="pi pi-check me-1"></i>
                      Valider les entrées
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto">
        <table className="table table-hover table-striped mb-0">
          <thead className="table-light sticky-top">
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th style={{ width: '120px' }}>Code</th>
              <th>Produit</th>
              <th style={{ width: '150px' }}>Catégorie</th>
              <th style={{ width: '120px' }}>Stock Actuel</th>
              <th style={{ width: '120px' }}>Qté Entrée</th>
              <th style={{ width: '80px' }}>Unité</th>
              <th style={{ width: '120px' }}>Prix Unit.</th>
              <th style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading.products ? (
              <tr>
                <td colSpan="9" className="text-center py-5">
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="spinner-border text-primary me-2"></div>
                    <span>Chargement des produits...</span>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-5">
                  <div className="text-muted">
                    <i className="pi pi-inbox display-4 d-block mb-3"></i>
                    <h6>Aucun produit trouvé</h6>
                    <p className="small">Cliquez sur le bouton de recherche pour charger les produits</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr 
                  key={product.id} 
                  className={quantities[product.id] > 0 ? 'table-success' : ''}
                >
                  <td>
                    <span className="small text-muted">{product.id}</span>
                  </td>
                  <td>
                    <span className="badge bg-info text-white small">
                      {product.product?.code || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className="fw-bold">{product.product?.name || 'Sans nom'}</div>
                  </td>
                  <td>
                    {product.product?.category?.name ? (
                      <span className="badge bg-secondary small">
                        {product.product.category.name}
                      </span>
                    ) : (
                      <span className="text-muted small">N/A</span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-primary">
                      {product.quantity || 0}
                    </span>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={quantities[product.id] || ''}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                      disabled={loading.submitting}
                    />
                  </td>
                  <td>
                    <span className="small text-muted">
                      {product.product?.unit || 'pcs'}
                    </span>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={prices[product.id] || ''}
                      onChange={(e) => handlePriceChange(product.id, e.target.value)}
                      disabled={loading.submitting}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => setQuantities(prev => ({ ...prev, [product.id]: 0 }))}
                      className="btn btn-sm btn-outline-danger"
                      title="Réinitialiser cette ligne"
                      disabled={!quantities[product.id] || loading.submitting}
                      type="button"
                    >
                      <i className="pi pi-times"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {stats.totalEntries > 0 && (
        <div className="bg-light border-top p-3">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="fw-bold mb-1">Résumé des entrées:</div>
              <div className="small text-muted">
                {stats.selectedCount} produit(s) sélectionné(s)
              </div>
            </div>
            <div className="col-md-6 text-end">
              <div className="mb-1">
                <span className="me-3">
                  Total quantité: <strong className="text-primary">{stats.totalEntries}</strong>
                </span>
              </div>
              <div>
                Valeur totale: <strong className="text-success">{formatCurrency(stats.totalValue)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntreMultipleScreen;