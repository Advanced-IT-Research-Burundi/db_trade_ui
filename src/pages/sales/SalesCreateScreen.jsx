import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { useCart } from './CartContext';
import ApiService from '../../services/api.js';

const SalesCreateScreen = () => {
  const { 
    items, 
    totals, 
    stockErrors, 
    addItem, 
    removeItem, 
    updateQuantity, 
    updatePrice, 
    updateDiscount, 
    clearCart 
  } = useCart();

  // État principal
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Client
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);

  // Produits
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  // Stock et données
  const [selectedStock, setSelectedStock] = useState('');
  const [stocks, setStocks] = useState([]);
  const [invoiceType, setInvoiceType] = useState('FACTURE');

  // Vente
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 16));
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState('');

  const toast = useRef(null);
  const clientSearchRef = useRef(null);
  const productSearchRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedStock) {
      loadCategories();
    }
  }, [selectedStock]);

  // Chargement des données initiales
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/api/sales/create-data');
      
      if (response.success) {
        setStocks(response.data.stocks || []);
        if (response.data.stocks?.length > 0) {
          setSelectedStock(response.data.stocks[0].id);
        }
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Chargement des catégories
  const loadCategories = async () => {
    if (!selectedStock) return;
    
    try {
      const response = await ApiService.get(`/api/sales/categories/${selectedStock}`);
      if (response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  // Recherche de clients
  const searchClients = async (search) => {
    if (search.length < 2) {
      setClients([]);
      setShowClientDropdown(false);
      return;
    }

    try {
      setClientLoading(true);
      const response = await ApiService.get('/api/sales/clients/search', { search });
      
      if (response.success) {
        setClients(response.data.clients || []);
        setShowClientDropdown(true);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de clients:', error);
    } finally {
      setClientLoading(false);
    }
  };

  // Recherche de produits
  const searchProducts = async () => {
    if (!selectedStock) {
      showToast('warn', 'Veuillez sélectionner un stock');
      return;
    }

    try {
      setProductLoading(true);
      const params = {
        stock_id: selectedStock,
        search: productSearch,
        category_id: selectedCategory
      };
      
      const response = await ApiService.get('/api/sales/products/search', params);
      
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de produits:', error);
    } finally {
      setProductLoading(false);
    }
  };

  // Gestionnaires d'événements
  const handleClientSearch = (value) => {
    setClientSearch(value);
    searchClients(value);
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  const handleClearClient = () => {
    setSelectedClient(null);
    setClientSearch('');
    setShowClientDropdown(false);
  };

  const handleAddProduct = (product) => {
    // Vérifier le stock
    if (product.quantity_disponible <= 0) {
      showToast('warn', 'Stock insuffisant pour ce produit');
      return;
    }

    // Vérifier si le produit est déjà dans le panier
    const existingItem = items.find(item => item.product_id === product.id);
    if (existingItem && existingItem.quantity >= product.quantity_disponible) {
      showToast('warn', 'Stock insuffisant pour cette quantité');
      return;
    }

    addItem(product);
    showToast('success', 'Produit ajouté au panier');

    // Retirer le produit de la liste
    setProducts(products.filter(p => p.id !== product.id));
  };

  const handleRemoveItem = (productId) => {
    removeItem(productId);
    showToast('info', 'Produit retiré du panier');
    
    // Recharger les produits si nécessaire
    if (showProductSearch) {
      searchProducts();
    }
  };

  const handleSave = async () => {
    // Validation
    if (!selectedClient) {
      showToast('error', 'Veuillez sélectionner un client');
      return;
    }

    if (items.length === 0) {
      showToast('error', 'Veuillez ajouter au moins un produit');
      return;
    }

    if (stockErrors.length > 0) {
      showToast('error', 'Veuillez corriger les quantités supérieures au stock');
      return;
    }

    try {
      setSaving(true);
      const saleData = {
        client_id: selectedClient.id,
        stock_id: selectedStock,
        sale_date: saleDate,
        paid_amount: parseFloat(paidAmount) || 0,
        note: note,
        invoice_type: invoiceType,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          sale_price: item.sale_price,
          discount: item.discount || 0
        }))
      };

      const response = await ApiService.post('/api/sales', saleData);
      
      if (response.success) {
        showToast('success', 'Vente enregistrée avec succès');
        clearCart();
        
        // Redirection ou reset du formulaire
        setTimeout(() => {
          window.location.href = '/sales';
        }, 2000);
      } else {
        showToast('error', response.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      showToast('error', error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
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
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0) + ' FBU';
  };

  const getDueAmount = () => {
    return totals.totalAmount - (parseFloat(paidAmount) || 0);
  };

  const getPaymentStatus = () => {
    const due = getDueAmount();
    if (due < 0) {
      return {
        type: 'info',
        message: `Monnaie à rendre : ${formatCurrency(Math.abs(due))}`
      };
    } else if (due === 0) {
      return {
        type: 'success',
        message: 'Paiement complet'
      };
    } else {
      return {
        type: 'warning',
        message: `Reste à payer : ${formatCurrency(due)}`
      };
    }
  };

  const setQuickAmount = (amount) => {
    setPaidAmount(amount);
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
                <i className="pi pi-shopping-cart me-2"></i>Nouvelle Vente
              </h2>
              <p className="text-muted mb-0">Créer une nouvelle vente</p>
            </div>
            <div className="d-flex gap-2">
              <a href="/sales" className="btn btn-outline-secondary">
                <i className="pi pi-arrow-left me-1"></i>Retour
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Colonne gauche */}
        <div className="col-lg-6">
          {/* Sélection Stock et Type */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Stock</label>
                  <select 
                    className="form-select" 
                    value={selectedStock} 
                    onChange={(e) => setSelectedStock(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Sélectionner un stock</option>
                    {stocks.map(stock => (
                      <option key={stock.id} value={stock.id}>
                        {stock.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Type de facture</label>
                  <select 
                    className="form-select" 
                    value={invoiceType} 
                    onChange={(e) => setInvoiceType(e.target.value)}
                  >
                    <option value="FACTURE">FACTURE</option>
                    <option value="PROFORMA">PROFORMA</option>
                    <option value="BON">BON</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section Client */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="pi pi-user me-2"></i>Client
                </h6>
                <a href="/clients/create" className="btn btn-outline-light btn-sm">
                  <i className="pi pi-plus me-1"></i>Nouveau
                </a>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">
                    Rechercher un client <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      ref={clientSearchRef}
                      type="text"
                      className="form-control"
                      value={clientSearch}
                      onChange={(e) => handleClientSearch(e.target.value)}
                      placeholder="Nom, téléphone ou email..."
                      autoComplete="off"
                    />
                    {clientLoading && (
                      <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                      </div>
                    )}
                    
                    {/* Dropdown clients */}
                    {showClientDropdown && clients.length > 0 && (
                      <div className="dropdown-menu show w-100 shadow-lg" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {clients.map(client => (
                          <a
                            key={client.id}
                            href="#"
                            className="dropdown-item d-flex align-items-center"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSelectClient(client);
                            }}
                          >
                            <div className="bg-primary bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                              <i className="pi pi-user text-primary"></i>
                            </div>
                            <div>
                              <div className="fw-semibold">{client.name}</div>
                              {client.phone && (
                                <small className="text-muted">
                                  <i className="pi pi-phone me-1"></i>{client.phone}
                                </small>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Date de vente <span className="text-danger">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Client sélectionné */}
              {selectedClient && (
                <div className="alert alert-info mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="bg-info bg-opacity-20 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                        <i className="pi pi-user"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">{selectedClient.name}</h6>
                        <div className="d-flex gap-3">
                          {selectedClient.phone && (
                            <small className="text-muted">
                              <i className="pi pi-phone me-1"></i>{selectedClient.phone}
                            </small>
                          )}
                          {selectedClient.email && (
                            <small className="text-muted">
                              <i className="pi pi-envelope me-1"></i>{selectedClient.email}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleClearClient}
                    >
                      <i className="pi pi-times"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Recherche de Produits */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="pi pi-search me-2"></i>Rechercher des Produits
                </h6>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm"
                  onClick={() => {
                    setShowProductSearch(!showProductSearch);
                    if (!showProductSearch) {
                      setTimeout(() => productSearchRef.current?.focus(), 100);
                    }
                  }}
                >
                  <i className="pi pi-search me-1"></i>
                  {showProductSearch ? 'Fermer' : 'Rechercher'}
                </button>
              </div>
            </div>
            
            {showProductSearch && (
              <div className="card-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <input
                      ref={productSearchRef}
                      type="text"
                      className="form-control"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Rechercher un produit..."
                      autoComplete="off"
                    />
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">Toutes les catégories</option>
                      {Object.entries(categories).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={searchProducts}
                      disabled={productLoading}
                    >
                      {productLoading ? (
                        <div className="spinner-border spinner-border-sm" role="status"></div>
                      ) : (
                        <i className="pi pi-search"></i>
                      )}
                    </button>
                  </div>
                </div>

                {/* Liste des produits */}
                {products.length > 0 && (
                  <div className="row g-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {products.map(product => (
                      <div key={product.id} className="col-md-6">
                        <div 
                          className="card h-100 product-card" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleAddProduct(product)}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex align-items-start">
                              {product.image ? (
                                <img 
                                  src={`/storage/${product.image}`} 
                                  alt={product.name}
                                  className="rounded me-3"
                                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="bg-primary bg-opacity-10 rounded me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                  <i className="pi pi-box text-primary"></i>
                                </div>
                              )}
                              <div className="flex-grow-1">
                                <h6 className="card-title mb-1">{product.name}</h6>
                                <p className="mb-1 text-muted small">
                                  {formatCurrency(product.sale_price_ttc)}
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className={`badge ${product.quantity_disponible <= 2 ? 'bg-warning' : 'bg-success'}`}>
                                    Stock: {product.quantity_disponible}
                                  </span>
                                  <i className="pi pi-plus-circle text-primary"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {products.length === 0 && !productLoading && (productSearch || selectedCategory) && (
                  <div className="text-center py-4">
                    <i className="pi pi-inbox display-4 text-muted mb-3"></i>
                    <p className="text-muted">Aucun produit trouvé</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite - Panier */}
        <div className="col-lg-6">
          {/* Panier */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-info text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="pi pi-shopping-cart me-2"></i>
                  Panier {items.length > 0 && <span className="badge bg-light text-info ms-2">{items.length}</span>}
                </h6>
                {items.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={clearCart}
                  >
                    <i className="pi pi-trash me-1"></i>Vider
                  </button>
                )}
              </div>
            </div>
            
            <div className="card-body p-0">
              {items.length === 0 ? (
                <div className="text-center py-5"></div>