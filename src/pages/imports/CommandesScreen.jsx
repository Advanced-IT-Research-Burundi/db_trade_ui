import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { API_CONFIG } from '../../services/config.js';
import ApiService from '../../services/api.js';
import { useNavigate, Link } from 'react-router-dom';
import ImportHeader from './ImportHeader.jsx';



const CommandesScreen = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderDetails, setOrderDetails] = useState({ commentaire: '', numCommande: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data, loading } = useSelector(state => state.apiData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);

  // Computed values
  const totalWeight = cart.reduce((sum, item) => sum + (item.weight_kg * item.quantity), 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.pu * item.quantity), 0);
  const isWeightExceeded = selectedVehicle && totalWeight > selectedVehicle.poids;
  const canConfirmOrder = selectedVehicle && cart.length > 0 && !isWeightExceeded;

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (productSearch.trim()) {
      const debounceTimer = setTimeout(() => loadProducts(), 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setProducts([]);
    }
  }, [productSearch]);

  useEffect(() => {
    if (data?.productCompanyNames?.data) {
      const cartProductIds = cart.map(item => item.id);
      const filteredProducts = data.productCompanyNames.data.filter(
        product => !cartProductIds.includes(product.id)
      );
      setProducts(filteredProducts);
    }
  }, [data?.productCompanyNames, cart]);

  useEffect(() => {
    if (data?.vehicles?.vehicules?.data) {
      const availableVehicles = data.vehicles.vehicules.data.filter(
        v => v.status === 'disponible' && v.poids
      );
      setVehicles(availableVehicles);
    }
  }, [data?.vehicles]);

  const loadVehicles = () => {
    dispatch(fetchApiData({
      url: API_CONFIG.ENDPOINTS.VEHICLES,
      itemKey: 'vehicles',
      params: { page: 1, per_page: 100 }
    }));
  };

  const loadProducts = () => {
    dispatch(fetchApiData({
      url: API_CONFIG.ENDPOINTS.PRODUCTSCOMPANY,
      itemKey: 'productCompanyNames',
      params: { page: 1, per_page: 15, search: productSearch }
    }));
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { 
        ...product, 
        quantity: 1, 
        pu: product.pu || 0 
      }];
    });
    showToast('success', `${product.item_name} ajouté au panier`);
  };

  const removeFromCart = (id, productName) => {
    setCart(prev => prev.filter(p => p.id !== id));
    showToast('info', `${productName} retiré du panier`);
  };

  const updateCartItem = (id, field, value) => {
    setCart(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: parseFloat(value) || 0 } : p
    ));
  };

  const handleOrderDetailsChange = (field, value) => {
    setOrderDetails(prev => ({ ...prev, [field]: value }));
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? 'Erreur' : severity === 'success' ? 'Succès' : 'Info', 
      detail, 
      life: 3000 
    });
  };

  const confirmOrder = async () => {
    if (!canConfirmOrder) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        vehicule_id: selectedVehicle.id,
        matricule: selectedVehicle.immatriculation,
        poids: totalWeight,
        products: cart,
        commentaire: orderDetails.commentaire,
        numCommande: orderDetails.numCommande
      };

      await ApiService.post(API_CONFIG.ENDPOINTS.COMMANDES, orderData);
      
      showToast('success', 'Commande créée avec succès !');
      
      // Reset form
      setCart([]);
      setSelectedVehicle(null);
      setOrderDetails({ commentaire: '', numCommande: '' });
      
      setTimeout(() => navigate('/commandes-lists'), 1500);
    } catch (error) {
      showToast('error', error.message || 'Erreur lors de la création de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount) + ' FBU';
  };

  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      <ImportHeader />
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary mb-1">
                <i className="pi pi-shopping-cart me-2"></i>Préparation de commande
              </h2>
              <p className="text-muted mb-0">Créer une nouvelle commande de produits</p>
            </div>
            {isWeightExceeded && (
              <div className="alert alert-danger mb-0">
                <i className="pi pi-exclamation-triangle me-2"></i>
                Poids dépassé : {totalWeight}kg / {selectedVehicle.poids}kg
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Vehicle Selection */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="pi pi-car me-2"></i>1. Sélection du véhicule
              </h5>
            </div>
            <div className="card-body">
              {vehicles.length === 0 ? (
                <div className="alert alert-warning">
                  <i className="pi pi-exclamation-triangle me-2"></i>
                  Aucun véhicule disponible
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label">Véhicule</label>
                    <select 
                      className="form-select" 
                      value={selectedVehicle?.id || ""} 
                      onChange={(e) => setSelectedVehicle(vehicles.find(v => v.id === parseInt(e.target.value)))}
                    >
                      <option value="">Sélectionnez un véhicule</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.brand} {v.model} - {v.immatriculation} ({v.poids}kg)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedVehicle && (
                    <div className="alert alert-info">
                      <strong>{selectedVehicle.brand} {selectedVehicle.model}</strong><br/>
                      <small>
                        <i className="pi pi-car me-1"></i>{selectedVehicle.immatriculation} 
                        <i className="pi pi-weight-hanging ms-3 me-1"></i>{selectedVehicle.poids} kg
                      </small>
                    </div>
                  )}
                </>
              )}

              <div className="mb-3">
                <label className="form-label">Numéro de commande</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={orderDetails.numCommande}
                  onChange={(e) => handleOrderDetailsChange('numCommande', e.target.value)}
                  placeholder="Optionnel"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Commentaire</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  value={orderDetails.commentaire}
                  onChange={(e) => handleOrderDetailsChange('commentaire', e.target.value)}
                  placeholder="Commentaire optionnel..."
                />
              </div>

              {cart.length > 0 && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Poids total:</span>
                    <strong className={isWeightExceeded ? 'text-danger' : 'text-success'}>
                      {totalWeight.toFixed(2)} kg
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Montant total:</span>
                    <strong className="text-primary">{formatCurrency(totalAmount)}</strong>
                  </div>
                  <button 
                    className="btn btn-success w-100" 
                    onClick={confirmOrder}
                    disabled={!canConfirmOrder || isSubmitting}
                  >
                    <i className="pi pi-check-circle me-2"></i>
                    {isSubmitting ? 'Création...' : 'Confirmer la commande'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Search & Cart */}
        <div className="col-lg-8">
          {/* Product Search */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="pi pi-search me-2"></i>2. Recherche de produits
              </h5>
            </div>
            <div className="card-body">
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  className="form-control" 
                  type="text" 
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Rechercher un produit..."
                />
              </div>

              {loading && productSearch.trim() && (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Recherche...</span>
                  </div>
                </div>
              )}

              {!loading && products.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Company</th>
                        <th>Produit</th>
                        <th>Code</th>
                        <th>Poids (kg)</th>
                        <th>PU</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id}>
                          <td><span className="badge bg-info">{product.company_code}</span></td>
                          <td>{product.item_name}</td>
                          <td><span className="badge bg-secondary">{product.product_code}</span></td>
                          <td>{product.weight_kg}</td>
                          <td className="text-primary fw-bold">{formatCurrency(product.pu || 0)}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => addToCart(product)}
                            >
                              <i className="pi pi-plus me-1"></i>Ajouter
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && productSearch && products.length === 0 && (
                <div className="alert alert-warning">
                  <i className="pi pi-exclamation-triangle me-2"></i>
                  Aucun produit trouvé
                </div>
              )}

              {!productSearch && (
                <div className="alert alert-info">
                  <i className="pi pi-info-circle me-2"></i>
                  Entrez un terme de recherche pour voir les produits
                </div>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="pi pi-shopping-cart me-2"></i>3. Panier ({cart.length} produit{cart.length > 1 ? 's' : ''})
              </h5>
            </div>
            <div className="card-body">
              {cart.length === 0 ? (
                <div className="alert alert-info">
                  <i className="pi pi-shopping-cart me-2"></i>
                  Votre panier est vide
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Company</th>
                        <th>Produit</th>
                        <th>Code</th>
                        <th>Poids Unit.</th>
                        <th>Quantité</th>
                        <th>Poids Total</th>
                        <th>PU</th>
                        <th>Montant</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <tr key={item.id}>
                          <td><span className="badge bg-info">{item.company_code}</span></td>
                          <td>{item.item_name}</td>
                          <td><span className="badge bg-secondary">{item.product_code}</span></td>
                          <td>{item.weight_kg} kg</td>
                          <td>
                            <input 
                              type="number" 
                              className="form-control form-control-sm" 
                              value={item.quantity}
                              min="0.01"
                              step="0.01"
                              onChange={(e) => updateCartItem(item.id, 'quantity', e.target.value)}
                              style={{ width: '80px' }}
                            />
                          </td>
                          <td className="fw-bold">{(item.weight_kg * item.quantity).toFixed(2)} kg</td>
                          <td>
                            <input 
                              type="number" 
                              className="form-control form-control-sm" 
                              value={item.pu}
                              min="0"
                              step="0.01"
                              onChange={(e) => updateCartItem(item.id, 'pu', e.target.value)}
                              style={{ width: '80px' }}
                            />
                          </td>
                          <td className="text-primary fw-bold">
                            {formatCurrency(item.pu * item.quantity)}
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFromCart(item.id, item.item_name)}
                            >
                              <i className="pi pi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandesScreen;