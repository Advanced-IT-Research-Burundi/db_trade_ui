import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { useParams, useNavigate } from 'react-router-dom';

const EntreMultipleScreen = () => {
  const { id: stockId } = useParams();
  const navigate = useNavigate();
  
  // État principal
  const [stock, setStock] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [prices, setPrices] = useState({});
  
  // États de chargement ciblés
  const [loadingStates, setLoadingStates] = useState({
    stock: false,
    categories: false,
    products: false,
    submitting: false
  });
  
  // Filtres
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const toast = useRef(null);

  // Fonction utilitaire pour gérer les états de chargement
  const setLoading = useCallback((key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  // Chargement du stock
  const loadStock = useCallback(async () => {
    setLoading('stock', true);
    try {
      const response = await ApiService.get(`/api/stocks/${stockId}`);
      if (response.success) {
        setStock(response.data.stock);
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement du stock');
    } finally {
      setLoading('stock', false);
    }
  }, [stockId]);

  // Chargement des catégories
  const loadCategories = useCallback(async () => {
    setLoading('categories', true);
    try {
      const response = await ApiService.get(`/api/stocks/${stockId}/categories`);
      if (response.success) {
        setCategories([
          { id: '', name: 'Toutes les catégories' },
          ...response.data.categories
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error.message);
    } finally {
      setLoading('categories', false);
    }
  }, [stockId]);

  // Chargement des produits avec debounce intégré
  const loadProducts = useCallback(async () => {
    setLoading('products', true);
    try {
      const params = {
        stock_id: stockId,
        search: search.trim(),
        category_id: selectedCategory,
        limit: 200
      };
      
      const response = await ApiService.get('/api/stock-products/for-entry', params);
      
      if (response.success) {
        const productsData = response.data.products;
        setProducts(productsData);
        
        // Préserver les quantités et prix existants, initialiser les nouveaux
        setQuantities(prev => {
          const newQuantities = {};
          productsData.forEach(product => {
            newQuantities[product.id] = prev[product.id] || 0;
          });
          return newQuantities;
        });
        
        setPrices(prev => {
          const newPrices = {};
          productsData.forEach(product => {
            newPrices[product.id] = prev[product.id] || product.product?.sale_price || 0;
          });
          return newPrices;
        });
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement des produits: ' + error.message);
    } finally {
      setLoading('products', false);
    }
  }, [stockId, search, selectedCategory]);

  // Debounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (stockId) loadProducts();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory, loadProducts]);

  // Chargement initial
  useEffect(() => {
    if (stockId) {
      loadStock();
      loadCategories();
      loadProducts();
    }
  }, [stockId, loadStock, loadCategories, loadProducts]);

  // Gestionnaires d'événements optimisés
  const handleQuantityChange = useCallback((productId, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setQuantities(prev => ({ ...prev, [productId]: numValue }));
  }, []);

  const handlePriceChange = useCallback((productId, value) => {
    const numValue = Math.max(0, parseFloat(value) || 0);
    setPrices(prev => ({ ...prev, [productId]: numValue }));
  }, []);

  const clearQuantity = useCallback((productId) => {
    setQuantities(prev => ({ ...prev, [productId]: 0 }));
  }, []);

  // Réinitialiser toutes les quantités
  const resetAllQuantities = useCallback(() => {
    const resetQuantities = {};
    Object.keys(quantities).forEach(id => {
      resetQuantities[id] = 0;
    });
    setQuantities(resetQuantities);
  }, [quantities]);

  // Soumission optimisée
  const handleSubmit = useCallback(async () => {
    const validEntries = Object.entries(quantities)
      .filter(([id, qty]) => qty > 0)
      .map(([productId, quantity]) => ({
        product_id: parseInt(productId),
        quantity: quantity,
        price: prices[productId] || 0
      }));
    
    if (validEntries.length === 0) {
      showToast('warn', 'Veuillez saisir au moins une quantité');
      return;
    }

    setLoading('submitting', true);
    try {
      const response = await ApiService.post('/api/stock-products/bulk-entry', {
        stock_id: stockId,
        entries: validEntries
      });

      if (response.success) {
        showToast('success', response.message);
        resetAllQuantities(); // Réinitialise toutes les quantités
        await loadProducts(); // Recharge les produits pour mettre à jour les stocks
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      showToast('error', error.message || 'Erreur lors de l\'entrée multiple');
    } finally {
      setLoading('submitting', false);
    }
  }, [quantities, prices, stockId, resetAllQuantities, loadProducts]);

  // Fonction toast
  const showToast = useCallback((severity, detail) => {
    toast.current?.show({
      severity,
      summary: severity === 'error' ? 'Erreur' : severity === 'warn' ? 'Attention' : 'Succès',
      detail,
      life: 3000
    });
  }, []);

  // Calculs mémorisés
  const { totalEntries, totalValue, selectedProductsCount } = useMemo(() => {
    const entries = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    const value = Object.entries(quantities).reduce((sum, [productId, qty]) => {
      return sum + (qty * (prices[productId] || 0));
    }, 0);
    const count = Object.entries(quantities).filter(([id, qty]) => qty > 0).length;
    
    return {
      totalEntries: entries,
      totalValue: value,
      selectedProductsCount: count
    };
  }, [quantities, prices]);

  // Formatage de devise
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FBU';
  }, []);

  // Loading du stock principal
  if (loadingStates.stock) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!stock) {
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
      
      {/* Header */}
      <div className="bg-white border-bottom p-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="text-primary mb-1">
              <i className="pi pi-plus-circle me-2"></i>
              Entrée Multiple - {stock.name}
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

      {/* Filtres et Actions */}
      <div className="bg-light border-bottom p-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label small">Rechercher un produit</label>
            <div className="input-group">
              <span className="input-group-text">
                {loadingStates.products ? (
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                ) : (
                  <i className="pi pi-search"></i>
                )}
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Code ou nom du produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loadingStates.products}
              />
            </div>
          </div>
          
          <div className="col-md-3">
            <label className="form-label small">Catégorie</label>
            <select 
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loadingStates.categories || loadingStates.products}
            >
              {loadingStates.categories ? (
                <option>Chargement...</option>
              ) : (
                categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div className="col-md-5">
            <div className="d-flex justify-content-between align-items-center">
              <div className="small text-muted">
                {totalEntries > 0 && (
                  <>
                    <div>Total entrées: <strong>{totalEntries}</strong></div>
                    <div>Valeur totale: <strong>{formatCurrency(totalValue)}</strong></div>
                  </>
                )}
              </div>
              <div className="btn-group">
                {totalEntries > 0 && (
                  <button
                    onClick={resetAllQuantities}
                    className="btn btn-outline-warning btn-sm"
                    disabled={loadingStates.submitting}
                    type="button"
                  >
                    <i className="pi pi-refresh me-1"></i>
                    Réinitialiser
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={loadingStates.submitting || totalEntries === 0}
                  type="button"
                >
                  {loadingStates.submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
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

      {/* Table des Produits */}
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
            {loadingStates.products ? (
              <tr>
                <td colSpan="9" className="text-center py-5">
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="spinner-border text-primary me-2" role="status"></div>
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
                    <p className="small">Modifiez vos critères de recherche</p>
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
                      disabled={loadingStates.submitting}
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
                      disabled={loadingStates.submitting}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => clearQuantity(product.id)}
                      className="btn btn-sm btn-outline-danger"
                      title="Réinitialiser cette ligne"
                      disabled={!quantities[product.id] || loadingStates.submitting}
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

      {/* Footer Summary */}
      {totalEntries > 0 && (
        <div className="bg-light border-top p-3">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="fw-bold mb-1">Résumé des entrées:</div>
              <div className="small text-muted">
                {selectedProductsCount} produit(s) sélectionné(s)
              </div>
            </div>
            <div className="col-md-6 text-end">
              <div className="mb-1">
                <span className="me-3">
                  Total quantité: <strong className="text-primary">{totalEntries}</strong>
                </span>
              </div>
              <div>
                Valeur totale: <strong className="text-success">{formatCurrency(totalValue)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntreMultipleScreen;