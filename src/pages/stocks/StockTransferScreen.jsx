import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { useNavigate } from 'react-router-dom';

const StockTransferScreen = () => {
  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    stockSource: '',
    destinationStockId: '',
    selectedCategory: '',
    search: ''
  });

  const toast = useRef(null);

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      const response = await ApiService.get('/api/stock-transfers/stocks');
      if (response.success) {
        setStocks(response.data.stocks || []);
      } else {
        showToast('error', 'Erreur lors du chargement des stocks');
      }
    } catch (error) {
      showToast('error', error.message);
    }
  };

  const updateStockSource = async (stockId) => {
    if (!stockId) {
      setCategories([]);
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.get(`/api/stock-transfers/stocks/${stockId}/categories`);
      if (response.success) {
        setCategories(response.data.categories || []);
        if (response.data.categories && response.data.categories.length > 0) {
          const firstCategory = response.data.categories[0];
          setFormData(prev => ({ ...prev, selectedCategory: firstCategory.id }));
          updateProductList(firstCategory.id, stockId);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement des catégories: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProductList = async (categoryId = null, stockId = null) => {
    const sourceStock = stockId || formData.stockSource;
    if (!sourceStock) return;

    try {
      setLoading(true);
      const params = {
        stock_id: sourceStock,
        category_id: categoryId,
        search: formData.search,
        exclude_products: selectedProducts.map(p => p.id)
      };

      const response = await ApiService.get('/api/stock-transfers/stocks/products', params);
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement des produits: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'stockSource') {
      updateStockSource(value);
      setSelectedProducts([]);
      setQuantities({});
    } else if (field === 'selectedCategory') {
      updateProductList(value);
    } else if (field === 'search') {
      const timeoutId = setTimeout(() => {
        updateProductList(formData.selectedCategory);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  };

  const addToTransfer = (product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      const newProduct = { ...product };
      setSelectedProducts(prev => [...prev, newProduct]);
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
      
      // Mettre à jour la liste des produits pour exclure le produit ajouté
      updateProductList(formData.selectedCategory);
    }
  };

  const removeFromTransfer = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
    
    // Mettre à jour la liste des produits
    updateProductList(formData.selectedCategory);
  };

  const clearSelection = () => {
    setSelectedProducts([]);
    setQuantities({});
    updateProductList(formData.selectedCategory);
  };

  const updateQuantity = (productId, quantity) => {
    const product = selectedProducts.find(p => p.id === productId);
    const maxQty = product?.stock_quantity || 0;
    const validQuantity = Math.min(Math.max(1, parseInt(quantity) || 1), maxQty);
    
    setQuantities(prev => ({ ...prev, [productId]: validQuantity }));
  };

  const handleTransfer = async () => {
    if (!formData.stockSource || !formData.destinationStockId) {
      showToast('error', 'Veuillez sélectionner les stocks source et destination');
      return;
    }

    if (formData.stockSource === formData.destinationStockId) {
      showToast('error', 'Le stock source et destination ne peuvent pas être identiques');
      return;
    }

    if (selectedProducts.length === 0) {
      showToast('error', 'Veuillez sélectionner au moins un produit');
      return;
    }

    try {
      setTransferLoading(true);
      
      const transferData = {
        from_stock_id: formData.stockSource,
        to_stock_id: formData.destinationStockId,
        products: selectedProducts.map(product => ({
          product_id: product.id,
          quantity: quantities[product.id] || 1,
          product_name: product.name,
          product_code: product.code
        }))
      };

      const response = await ApiService.post('/api/stock-transfers/stocks/transfer', transferData);

      if (response.success) {
        showToast('success', 'Transfert effectué avec succès !');
        
        // Réinitialiser les sélections
        setSelectedProducts([]);
        setQuantities({});
        
        // Recharger la liste des produits
        updateProductList(formData.selectedCategory);
      } else {
        showToast('error', response.message || 'Erreur lors du transfert');
      }
    } catch (error) {
      showToast('error', error.message || 'Erreur lors du transfert');
    } finally {
      setTransferLoading(false);
    }
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? 'Erreur' : 'Succès', 
      detail, 
      life: 3000 
    });
  };

  const getStockName = (stockId) => {
    const stock = stocks.find(s => s.id === parseInt(stockId));
    return stock ? stock.name : '';
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
                <i className="pi pi-sync me-2"></i>Transfert de Stock
              </h2>
              <p className="text-muted mb-0">Transférer des produits entre stocks</p>
            </div>
            <div>
              <a onClick={() => navigate('/stocks')} className="btn btn-outline-primary">
                <i className="pi pi-arrow-left me-1"></i>Retour
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Selection */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-building me-2"></i>Sélection des stocks
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Stock source</label>
              <select 
                className="form-select" 
                value={formData.stockSource}
                onChange={(e) => handleFormChange('stockSource', e.target.value)}
              >
                <option value="">Sélectionner un stock source</option>
                {stocks.map(stock => (
                  <option key={stock.id} value={stock.id}>
                    {stock.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Stock destination</label>
              <select 
                className="form-select" 
                value={formData.destinationStockId}
                onChange={(e) => handleFormChange('destinationStockId', e.target.value)}
              >
                <option value="">Sélectionner un stock destination</option>
                {stocks.filter(s => s.id !== parseInt(formData.stockSource)).map(stock => (
                  <option key={stock.id} value={stock.id}>
                    {stock.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-4">
          <div className="d-flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                className={`btn ${
                  category.id === parseInt(formData.selectedCategory) 
                    ? 'btn-success' 
                    : 'btn-outline-primary'
                }`}
                onClick={() => handleFormChange('selectedCategory', category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="row">
        {/* Products List */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="pi pi-box me-2"></i>Produits disponibles
              </h6>
              {loading && (
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              )}
            </div>
            <div className="card-body p-0">
              {/* Search */}
              <div className="p-3 border-bottom">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Rechercher un produit..."
                  value={formData.search}
                  onChange={(e) => handleFormChange('search', e.target.value)}
                />
              </div>
              
              {/* Products Table */}
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="table table-hover table-sm mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Produit</th>
                      <th>Code</th>
                      <th>Catégorie</th>
                      <th>Quantité</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          {loading ? 'Chargement...' : 'Aucun produit disponible'}
                        </td>
                      </tr>
                    ) : (
                      products.map(product => (
                        <tr key={product.id}>
                          <td>
                            <div>
                              <strong>{product.name}</strong>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info">{product.code}</span>
                          </td>
                          <td>{product.category?.name}</td>
                          <td>
                            <span className="badge bg-success">
                              {product.stock_quantity || 0}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => addToTransfer(product)}
                              disabled={product.stock_quantity <= 0}
                            >
                              <i className="pi pi-plus"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Products */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="pi pi-shopping-cart me-2"></i>
                Produits sélectionnés
                <span className="badge bg-white text-primary ms-2">
                  {selectedProducts.length}
                </span>
              </h6>
              {selectedProducts.length > 0 && (
                <button
                  className="btn btn-sm btn-light"
                  onClick={clearSelection}
                  title="Vider la sélection"
                >
                  <i className="pi pi-trash"></i>
                </button>
              )}
            </div>

            {selectedProducts.length > 0 ? (
              <>
                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="table table-hover table-sm mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>Produit</th>
                        <th className="text-center">Quantité</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducts.map(product => {
                        const maxQty = product.stock_quantity || 0;
                        const currentQty = quantities[product.id] || 1;
                        
                        return (
                          <tr key={product.id}>
                            <td>
                              <div>
                                <strong>{product.name}</strong>
                                <br />
                                <small className="text-muted">{product.code}</small>
                              </div>
                            </td>
                            <td className="text-center" style={{ width: '120px' }}>
                              <input
                                type="number"
                                className="form-control form-control-sm text-center"
                                style={{ width: '70px', display: 'inline-block' }}
                                min="1"
                                max={maxQty}
                                value={currentQty}
                                onChange={(e) => updateQuantity(product.id, e.target.value)}
                              />
                              <small className="text-muted d-block">Max: {maxQty}</small>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeFromTransfer(product.id)}
                                title="Retirer"
                              >
                                <i className="pi pi-times"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="card-footer bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Total:</strong> {selectedProducts.length} produit(s)
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={handleTransfer}
                      disabled={transferLoading || selectedProducts.length === 0}
                    >
                      {transferLoading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Chargement...</span>
                          </div>
                          Transfert en cours...
                        </>
                      ) : (
                        <>
                          <i className="pi pi-sync me-2"></i>
                          Transférer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-body text-center py-5">
                <div className="text-muted mb-3">
                  <i className="pi pi-shopping-cart" style={{ fontSize: '2rem' }}></i>
                </div>
                <p className="text-muted mb-0">Aucun produit sélectionné</p>
                <small className="text-muted">
                  Cliquez sur le bouton "+" pour ajouter des produits
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Summary */}
      {formData.stockSource && formData.destinationStockId && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-info">
              <i className="pi pi-info-circle me-2"></i>
              <strong>Résumé du transfert:</strong> De "{getStockName(formData.stockSource)}" vers "{getStockName(formData.destinationStockId)}"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTransferScreen;