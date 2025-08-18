import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { API_CONFIG } from '../../services/config.js';
import ApiService from '../../services/api.js';
import { useNavigate, Link, useParams } from 'react-router-dom';
import ImportHeader from './ImportHeader.jsx';

const EditCommandeScreen = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderDetails, setOrderDetails] = useState({ commentaire: '', numCommande: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Loading states for targeted elements
  const [loadingStates, setLoadingStates] = useState({
    searchingOrders: false,
    loadingOrderDetails: false,
    loadingVehicles: false,
    searchingProducts: false,
    updatingOrder: false
  });
  
  const { data, loading } = useSelector(state => state.apiData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  const { id } = useParams();

  // Computed values
  const totalWeight = cart.reduce((sum, item) => sum + (item.weight_kg * item.quantity), 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.pu * item.quantity), 0);
  const isWeightExceeded = selectedVehicle && totalWeight > selectedVehicle.poids;
  const canUpdateOrder = selectedVehicle && cart.length > 0 && !isWeightExceeded && selectedOrder;

  useEffect(() => {
    loadVehicles();
    if (id) {
      loadOrderById(id);
    }
  }, [id]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const debounceTimer = setTimeout(() => searchOrders(), 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

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
      const cartProductIds = cart.map(item => item.product_id || item.id);
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

  const updateLoadingState = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  const loadVehicles = async () => {
    updateLoadingState('loadingVehicles', true);
    try {
      dispatch(fetchApiData({
        url: API_CONFIG.ENDPOINTS.VEHICLES,
        itemKey: 'vehicles',
        params: { page: 1, per_page: 100 }
      }));
    } finally {
      updateLoadingState('loadingVehicles', false);
    }
  };

  const searchOrders = async () => {
    updateLoadingState('searchingOrders', true);
    try {
      const response = await ApiService.get(API_CONFIG.ENDPOINTS.COMMANDES, {
        search: searchTerm,
        page: 1,
        per_page: 10
      });
      setSearchResults(response.data?.data || []);
    } catch (error) {
      showToast('error', 'Erreur lors de la recherche des commandes');
      setSearchResults([]);
    } finally {
      updateLoadingState('searchingOrders', false);
    }
  };

  const loadOrderById = async (orderId) => {
    updateLoadingState('loadingOrderDetails', true);
    try {
      const response = await ApiService.get(`${API_CONFIG.ENDPOINTS.COMMANDES}/${orderId}`);
      const order = response.data;
      
      setSelectedOrder(order);
      setOrderDetails({
        commentaire: order.commentaire || '',
        numCommande: order.numCommande || ''
      });
      
      // Set cart with order details (products)
      if (order.details) {
        setCart(order.details.map(detail => ({
          id: detail.id,
          product_code: detail.product_code,
          item_name: detail.item_name,
          company_code: detail.company_code,
          weight_kg: detail.weight_kg,
          quantity: detail.quantity || 1,
          pu: detail.pu || 0,
          remise: detail.remise || 0
        })));
      }
      
      // Set the vehicle from order data
      if (order.vehicule) {
        setSelectedVehicle(order.vehicule);
      } else if (order.vehicule_id && vehicles.length > 0) {
        const vehicle = vehicles.find(v => v.id === order.vehicule_id);
        setSelectedVehicle(vehicle);
      }
      
    } catch (error) {
      showToast('error', 'Erreur lors du chargement de la commande');
      navigate('/commandes-lists');
    } finally {
      updateLoadingState('loadingOrderDetails', false);
    }
  };

  const selectOrder = async (order) => {
    setSelectedOrder(order);
    setSearchTerm(`${order.numCommande || ''} - ${order.matricule || ''}`);
    setSearchResults([]);
    await loadOrderById(order.id);
  };

  const loadProducts = async () => {
    updateLoadingState('searchingProducts', true);
    try {
      dispatch(fetchApiData({
        url: API_CONFIG.ENDPOINTS.PRODUCTSCOMPANY,
        itemKey: 'productCompanyNames',
        params: { page: 1, per_page: 15, search: productSearch }
      }));
    } finally {
      updateLoadingState('searchingProducts', false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      // Check if product already exists using product_id for new additions
      const existing = prev.find(p => p.product_id === product.id || p.id === product.id);
      if (existing) {
        return prev.map(p => {
          const match = p.product_id === product.id || p.id === product.id;
          return match ? { ...p, quantity: p.quantity + 1 } : p;
        });
      }
      return [...prev, { 
        id: product.id,
        product_id: product.id, // Keep reference to original product ID
        product_code: product.product_code,
        item_name: product.item_name,
        company_code: product.company_code,
        weight_kg: product.weight_kg,
        quantity: 1, 
        pu: product.pu || 0,
        remise: 0
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

  const updateOrder = async () => {
    if (!canUpdateOrder) return;

    updateLoadingState('updatingOrder', true);
    try {
      const orderData = {
        vehicule_id: selectedVehicle.id,
        matricule: selectedVehicle.immatriculation,
        poids: totalWeight,
        details: cart.map(item => ({
          product_code: item.product_code,
          item_name: item.item_name,
          company_code: item.company_code,
          quantity: item.quantity,
          weight_kg: item.weight_kg,
          pu: item.pu,
          remise: item.remise || 0
        })),
        commentaire: orderDetails.commentaire,
        numCommande: orderDetails.numCommande
      };

      await ApiService.put(`${API_CONFIG.ENDPOINTS.COMMANDES}/${selectedOrder.id}`, orderData);
      
      showToast('success', 'Commande modifiée avec succès !');
      
      setTimeout(() => navigate('/commandes-lists'), 1500);
    } catch (error) {
      showToast('error', error.message || 'Erreur lors de la modification de la commande');
    } finally {
      updateLoadingState('updatingOrder', false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount) + ' FBU';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                <i className="pi pi-pencil me-2"></i>Modification de commande
              </h2>
              <p className="text-muted mb-0">Rechercher et modifier une commande existante</p>
            </div>
            <Link to="/commandes-lists" className="btn btn-outline-secondary">
              <i className="pi pi-arrow-left me-2"></i>Retour à la liste
            </Link>
          </div>
          {isWeightExceeded && (
            <div className="alert alert-danger mt-3">
              <i className="pi pi-exclamation-triangle me-2"></i>
              Poids dépassé : {totalWeight}kg / {selectedVehicle.poids}kg
            </div>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Order Search */}
        <div className="col-lg-12 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="pi pi-search me-2"></i>1. Recherche de commande
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par numéro de commande, matricule..."
                  disabled={loadingStates.loadingOrderDetails}
                />
                {loadingStates.searchingOrders && (
                  <span className="input-group-text">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Recherche...</span>
                    </div>
                  </span>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>N° Commande</th>
                        <th>Matricule</th>
                        <th>Poids</th>
                        <th>Date création</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map(order => (
                        <tr key={order.id}>
                          <td>
                            <span className="badge bg-primary">{order.numCommande || `CMD-${order.id}`}</span>
                          </td>
                          <td>{order.matricule}</td>
                          <td>{order.poids} kg</td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>
                            <span className={`badge ${order.status === 'Confirmé' ? 'bg-success' : order.status === 'En attente' ? 'bg-warning' : 'bg-secondary'}`}>
                              {order.status || 'En attente'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => selectOrder(order)}
                              disabled={loadingStates.loadingOrderDetails}
                            >
                              <i className="pi pi-pencil me-1"></i>Modifier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loadingStates.searchingOrders && searchTerm && searchResults.length === 0 && (
                <div className="alert alert-warning">
                  <i className="pi pi-exclamation-triangle me-2"></i>
                  Aucune commande trouvée
                </div>
              )}

              {!searchTerm && !selectedOrder && (
                <div className="alert alert-info">
                  <i className="pi pi-info-circle me-2"></i>
                  Entrez un terme de recherche pour trouver une commande à modifier
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedOrder && (
          <>
            {/* Vehicle Selection & Order Details */}
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="pi pi-car me-2"></i>2. Véhicule et détails
                  </h5>
                  {loadingStates.loadingOrderDetails && (
                    <div className="float-end">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  {loadingStates.loadingVehicles ? (
                    <div className="text-center py-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement des véhicules...</span>
                      </div>
                    </div>
                  ) : vehicles.length === 0 ? (
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
                          disabled={loadingStates.loadingOrderDetails}
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
                      disabled={loadingStates.loadingOrderDetails}
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
                      disabled={loadingStates.loadingOrderDetails}
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
                        onClick={updateOrder}
                        disabled={!canUpdateOrder || loadingStates.updatingOrder}
                      >
                        {loadingStates.updatingOrder ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Mise à jour...</span>
                            </div>
                            Mise à jour...
                          </>
                        ) : (
                          <>
                            <i className="pi pi-check-circle me-2"></i>
                            Mettre à jour la commande
                          </>
                        )}
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
                    <i className="pi pi-search me-2"></i>3. Ajouter des produits
                  </h5>
                  {loadingStates.searchingProducts && (
                    <div className="float-end">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Recherche...</span>
                      </div>
                    </div>
                  )}
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
                      placeholder="Rechercher un produit à ajouter..."
                      disabled={loadingStates.loadingOrderDetails}
                    />
                  </div>

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
                      Entrez un terme de recherche pour ajouter des produits
                    </div>
                  )}
                </div>
              </div>

              {/* Cart */}
              <div className="card shadow-sm border-0">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="pi pi-shopping-cart me-2"></i>4. Produits de la commande ({cart.length} produit{cart.length > 1 ? 's' : ''})
                  </h5>
                </div>
                <div className="card-body">
                  {loadingStates.loadingOrderDetails ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement des produits...</span>
                      </div>
                      <p className="mt-2 text-muted">Chargement des produits de la commande...</p>
                    </div>
                  ) : cart.length === 0 ? (
                    <div className="alert alert-info">
                      <i className="pi pi-shopping-cart me-2"></i>
                      Aucun produit dans cette commande
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
                            <tr key={`${item.id}-${index}`}>
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
          </>
        )}
      </div>
    </div>
  );
};

export default EditCommandeScreen;