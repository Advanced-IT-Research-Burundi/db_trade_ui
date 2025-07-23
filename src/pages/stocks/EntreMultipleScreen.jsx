import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { useParams, useNavigate } from 'react-router-dom';

const EntreMultipleScreen = () => {
  const { id: stockId } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantities, setQuantities] = useState({});
  const [prices, setPrices] = useState({});
  const toast = useRef(null);

  useEffect(() => {
    if (stockId) {
      loadStock();
      loadCategories();
      loadProducts();
    }
  }, [stockId]);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory]);

  const loadStock = async () => {
    try {
      const response = await ApiService.get(`/api/stocks/${stockId}`);
      if (response.success) {
        setStock(response.data.stock);
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement du stock');
    }
  };

  const loadCategories = async () => {
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
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        stock_id: stockId,
        search,
        category_id: selectedCategory,
        limit: 200
      };
      const response = await ApiService.get('/api/stock-products/for-entry', params);
      
      if (response.success) {
        const productsData = response.data.products;
        setProducts(productsData);
        
        // Initialize quantities and prices
        const newQuantities = {};
        const newPrices = {};
        productsData.forEach(product => {
          newQuantities[product.id] = quantities[product.id] || 0;
          newPrices[product.id] = prices[product.id] || product.product?.sale_price || 0;
        });
        setQuantities(newQuantities);
        setPrices(newPrices);
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement des produits: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, value) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const handlePriceChange = (productId, value) => {
    setPrices(prev => ({
      ...prev,
      [productId]: Math.max(0, parseFloat(value) || 0)
    }));
  };

  const clearQuantity = (productId) => {
    setQuantities(prev => ({ ...prev, [productId]: 0 }));
  };

  const handleSubmit = async () => {
    // Filter only products with quantities > 0
    const validEntries = Object.entries(quantities).filter(([id, qty]) => qty > 0);
    
    if (validEntries.length === 0) {
      showToast('warn', 'Veuillez saisir au moins une quantité');
      return;
    }

    try {
      setSubmitting(true);
      const entries = validEntries.map(([productId, quantity]) => ({
        product_id: parseInt(productId),
        quantity: quantity,
        price: prices[productId] || 0
      }));

      const response = await ApiService.post('/api/stock-products/bulk-entry', {
        stock_id: stockId,
        entries
      });

      if (response.success) {
        showToast('success', response.message);
        // Reset quantities after success
        const resetQuantities = {};
        Object.keys(quantities).forEach(id => {
          resetQuantities[id] = 0;
        });
        setQuantities(resetQuantities);
        // Reload products to get updated quantities
        loadProducts();
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      showToast('error', error.message || 'Erreur lors de l\'entrée multiple');
    } finally {
      setSubmitting(false);
    }
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

  const getTotalEntries = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalValue = () => {
    return Object.entries(quantities).reduce((sum, [productId, qty]) => {
      return sum + (qty * (prices[productId] || 0));
    }, 0);
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
              <i className="pi pi-plus-circle me-2"></i>Entrée Multiple - {stock.name}
            </h4>
            <small className="text-muted">Saisie en lot des quantités et prix</small>
          </div>
          <button 
            onClick={() => navigate(`/stocks`)}
            className="btn btn-outline-secondary"
          >
            <i className="pi pi-arrow-left me-1"></i>Retour
          </button>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-light border-bottom p-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label small">Rechercher un produit</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="pi pi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Code ou nom du produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="col-md-3">
            <label className="form-label small">Catégorie</label>
            <select 
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-md-5">
            <div className="d-flex justify-content-between align-items-center">
              <div className="small text-muted">
                {getTotalEntries() > 0 && (
                  <>
                    <div>Total entrées: <strong>{getTotalEntries()}</strong></div>
                    <div>Valeur totale: <strong>{formatCurrency(getTotalValue())}</strong></div>
                  </>
                )}
              </div>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={submitting || getTotalEntries() === 0}
              >
                {submitting ? (
                  <>
                    <i className="pi pi-spin pi-spinner me-1"></i>
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

      {/* Products Table */}
      <div className="flex-grow-1 overflow-auto">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          <table className="table table-hover table-striped mb-0">
            <thead className="table-light sticky-top">
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Stock Actuel</th>
                <th style={{ width: '120px' }}>Quantité Entrée</th>
                <th>Unité</th>
                <th style={{ width: '120px' }}>Prix Unitaire</th>
                <th style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
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
                  <tr key={product.id} className={quantities[product.id] > 0 ? 'table-success' : ''}>
                    <td>{product.id}</td>
                    <td>
                      <span className="badge bg-info text-white">
                        {product.product?.code}
                      </span>
                    </td>
                    <td>
                      <strong>{product.product?.name}</strong>
                    </td>
                    <td>
                      {product.product?.category?.name ? (
                        <span className="badge bg-secondary">
                          {product.product.category.name}
                        </span>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-primary">
                        {product.quantity}
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
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => clearQuantity(product.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="Réinitialiser"
                        disabled={!quantities[product.id]}
                      >
                        <i className="pi pi-times"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Summary */}
      {getTotalEntries() > 0 && (
        <div className="bg-light border-top p-3">
          <div className="row">
            <div className="col-md-6">
              <strong>Résumé des entrées:</strong>
              <div className="small text-muted">
                {Object.entries(quantities).filter(([id, qty]) => qty > 0).length} produit(s) sélectionné(s)
              </div>
            </div>
            <div className="col-md-6 text-end">
              <div>Total quantité: <strong>{getTotalEntries()}</strong></div>
              <div>Valeur totale: <strong>{formatCurrency(getTotalValue())}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntreMultipleScreen;