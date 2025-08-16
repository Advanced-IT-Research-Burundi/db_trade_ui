import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { useCart } from "../../contexts/cartReducer.jsx";
import ApiService from "../../services/api.js";
import { Link, useNavigate, useParams } from "react-router-dom";

const ProformaEditScreen = () => {
  const {
    items,
    totals,
    stockProformaErrors,
    addItem,
    removeItem,
    updateQuantity,
    updatePrice,
    updateDiscountFBU,
    clearCart,
    loadCart,
  } = useCart();

  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);
  const clientSearchRef = useRef(null);
  const productSearchRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [clientLoading, setClientLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [discountGlobal, setDiscountGlobal] = useState(null);

  const [selectedStock, setSelectedStock] = useState("");
  const [stocks, setStocks] = useState([]);
  const [invoiceType, setInvoiceType] = useState("PROFORMA");

  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState("");
  const [profoma, setProfoma] = useState(null);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (selectedStock) {
      loadCategories();
    }
  }, [selectedStock]);

  const initializeData = async () => {
    try {
      setDataLoading(true);
      await Promise.all([loadInitialData(), loadProfoma()]);
    } catch (error) {
      showToast("error", "Erreur lors du chargement des données");
    } finally {
      setDataLoading(false);
    }
  };

  const initializeProformaData = async (proformaData) => {
  try {
    const proformaItems = JSON.parse(proformaData.proforma_items || '[]');
    const clientData = JSON.parse(proformaData.client || '{}');

    setSelectedStock(proformaData.stock_id);
    setInvoiceType(proformaData.invoice_type || "PROFORMA");
    setSaleDate(proformaData.sale_date ? new Date(proformaData.sale_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
    setNote(proformaData.note || "");
    setPaidAmount(parseFloat(proformaData.paid_amount) || 0);

    if (clientData.id) {
      setSelectedClient(clientData);
      setClientSearch(clientData.name || clientData.societe || "");
    }

    // Utiliser Promise.all pour récupérer toutes les infos produit
    const cartItems = await Promise.all(
      proformaItems.map(async (item) => {
        try {
          console.log("proforma stock id: "+proformaData.stock_id);
          const response = await ApiService.get(`/api/proformas/products/${item.product_id}/stock?stock_id=${proformaData.stock_id}`);
          const result =  response.data;
          if (!response.success) {
            throw new Error(result.message || 'Erreur API');

          }

          const { product, available_stock } = result;

          return {
            product_id: product.id,
            name: product.name || `Produit ${product.id}`,
            code: product.code || `PROD${product.id}`,
            quantity: parseFloat(item.quantity) || 1,
            sale_price: parseFloat(item.sale_price) || 0,
            discount: 0,
            discount_fbu: parseFloat(item.discount) || 0,
            unit: product.unit || "pcs",
            available_stock: available_stock || 0,
            image: product.image || null
          };
        } catch (err) {
          console.error(`Erreur pour le produit ID ${item.product_id}:`, err);
          // fallback
          return {
            product_id: item.product_id,
            name: `Produit ${item.product_id}`,
            code: `PROD${item.product_id}`,
            quantity: parseFloat(item.quantity) || 1,
            sale_price: parseFloat(item.sale_price) || 0,
            discount: 0,
            discount_fbu: parseFloat(item.discount) || 0,
            unit: "pcs",
            available_stock: 0,
            image: null
          };
        }
      })
    );

    loadCart(cartItems);
    showToast("success", "Données chargées avec succès");

  } catch (error) {
    showToast("error", "Erreur lors du chargement des données: " + error.message);
  }
};


  const loadProfoma = async () => {
    try {
      const response = await ApiService.get(`/api/proformas/${id}`);
      if (response.success) {
        setProfoma(response.data.proforma);
        await initializeProformaData(response.data.proforma);
      }
    } catch (error) {
      showToast("error", "Erreur lors du chargement de la proforma");
    }
  };

  const loadInitialData = async () => {
    try {
      const response = await ApiService.get("/api/proformas/create-data");
      if (response.success) {
        setStocks(response.data.stocks || []);
      }
    } catch (error) {
      showToast("error", "Erreur lors du chargement des données initiales");
    }
  };

  const loadCategories = async () => {
    if (!selectedStock) return;

    try {
      setCategoriesLoading(true);
      const response = await ApiService.get(`/api/proformas/categories/${selectedStock}`);
      if (response.success) {
        setCategories(response.data.categories || {});
      }
    } catch (error) {
      showToast("error", "Erreur lors du chargement des catégories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const searchClients = async (search) => {
    if (search.length < 2) {
      setClients([]);
      setShowClientDropdown(false);
      return;
    }

    try {
      setClientLoading(true);
      const response = await ApiService.get("/api/proformas/clients/search", { search });

      if (response.success) {
        setClients(response.data.clients || []);
        setShowClientDropdown(true);
      }
    } catch (error) {
      showToast("error", "Erreur lors de la recherche de clients");
    } finally {
      setClientLoading(false);
    }
  };

  const searchProducts = async () => {
    if (!selectedStock) {
      showToast("warn", "Veuillez sélectionner un stock");
      return;
    }

    try {
      setProductLoading(true);
      const params = {
        stock_id: selectedStock,
        search: productSearch,
        category_id: selectedCategory,
      };

      const response = await ApiService.get("/api/proformas/products/search", params);

      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      showToast("error", "Erreur lors de la recherche de produits");
    } finally {
      setProductLoading(false);
    }
  };

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
    setClientSearch("");
    setShowClientDropdown(false);
  };

  const handleAddProduct = (product) => {
    addItem(product);
    showToast("success", "Produit ajouté au panier");
    setProducts(products.filter((p) => p.id !== product.id));
  };

  const handleRemoveItem = (productId) => {
    removeItem(productId);
    showToast("info", "Produit retiré du panier");

    if (showProductSearch) {
      searchProducts();
    }
  };

  const handleUpdate = async () => {
    if (!selectedClient) {
      showToast("error", "Veuillez sélectionner un client");
      return;
    }

    if (items.length === 0) {
      showToast("error", "Veuillez ajouter au moins un produit");
      return;
    }

    if (stockProformaErrors.length > 0) {
      showToast("error", "Veuillez corriger les quantités supérieures au stock");
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        client_id: selectedClient.id, 
        stock_id: selectedStock,
        sale_date: saleDate,
        paid_amount: parseFloat(paidAmount) || 0,
        total_amount: totals.totalAmount || 0,
        note: note,
        invoice_type: invoiceType,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          sale_price: item.sale_price,
          discount: item.discount_fbu || 0,
        })),
      };

      const response = await ApiService.put(`/api/proformas/${id}`, updateData);

      if (response.success) {
        showToast("success", "Proforma mise à jour avec succès");
        setTimeout(() => navigate("/proforma"), 1000);
      } else {
        showToast("error", response.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      showToast("error", error.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDiscountGlobal = () => {
    items.forEach((item) => {
      updateDiscountFBU(item.product_id, parseFloat(discountGlobal) || 0);
    });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({
      severity,
      summary: severity === "error" ? "Erreur" : severity === "warn" ? "Attention" : "Succès",
      detail,
      life: 3000,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0) + " FBU";
  };

  const getDueAmount = () => totals.totalAmount - (parseFloat(paidAmount) || 0);

  const getPaymentStatus = () => {
    const due = getDueAmount();
    if (due < 0) {
      return {
        type: "info",
        message: `Monnaie à rendre : ${formatCurrency(Math.abs(due))}`,
      };
    } else if (due === 0) {
      return {
        type: "success",
        message: "Paiement complet",
      };
    } else {
      return {
        type: "warning",
        message: `Reste à payer : ${formatCurrency(due)}`,
      };
    }
  };

  const setQuickAmount = (amount) => setPaidAmount(amount);
  const paymentStatus = getPaymentStatus();

  if (dataLoading) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <h5>Chargement de la proforma...</h5>
                <p className="text-muted">Veuillez patienter pendant le chargement des données.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Toast ref={toast} />

      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary mb-1">
                <i className="pi pi-edit me-2"></i>Modifier Proforma
              </h2>
              <p className="text-muted mb-0">
                Modification de la proforma #{profoma?.id}
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/proforma" className="btn btn-outline-secondary">
                <i className="pi pi-arrow-left me-1"></i>Retour
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 mb-2">
            <div className="card-header p-1 px-2 bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Informations de vente</h6>
                <button
                  onClick={() => navigate("/clients/create")}
                  className="btn btn-outline-light btn-sm"
                >
                  <i className="pi pi-plus me-1"></i>Nouveau client
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                    disabled={dataLoading}
                  >
                    <option value="">Sélectionner un stock</option>
                    {stocks.map((stock) => (
                      <option key={stock.id} value={stock.id}>
                        {stock.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value)}
                  >
                    <option value="PROFORMA">PROFORMA</option>
                  </select>
                </div>
                <div className="col-md-4">
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

                    {showClientDropdown && clients.length > 0 && (
                      <div className="dropdown-menu show w-100 shadow-lg" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {clients.map((client) => (
                          <button
                            key={client.id}
                            className="dropdown-item d-flex align-items-center"
                            onClick={() => handleSelectClient(client)}
                          >
                            <div className="bg-primary bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                              <i className="pi pi-user text-primary"></i>
                            </div>
                            <div>
                              <div className="fw-semibold">{client.name}</div>
                              {client.phone && (
                                <small className="text-muted">
                                  <i className="pi pi-phone me-1"></i>
                                  {client.phone}
                                </small>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedClient && (
                <div className="alert alert-info mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="bg-info bg-opacity-20 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                        <i className="pi pi-user"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">{selectedClient.name || selectedClient.societe}</h6>
                        <div className="d-flex gap-3">
                          {selectedClient.phone && (
                            <small className="text-muted">
                              <i className="pi pi-phone me-1"></i>
                              {selectedClient.phone}
                            </small>
                          )}
                          {selectedClient.email && (
                            <small className="text-muted">
                              <i className="pi pi-envelope me-1"></i>
                              {selectedClient.email}
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
                  {showProductSearch ? "Fermer" : "Rechercher"}
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
                      disabled={categoriesLoading}
                    >
                      <option value="">
                        {categoriesLoading ? "Chargement..." : "Toutes les catégories"}
                      </option>
                      {Object.entries(categories).map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
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

                {products.length > 0 && (
                  <div className="row g-2" style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {products.map((product) => (
                      <div key={product.id} className="col-md-6">
                        <div
                          className="card h-100 product-card border-0 shadow-sm"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleAddProduct(product)}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex align-items-start">
                              {product.image ? (
                                <img
                                  src={`/storage/${product.image}`}
                                  alt={product.name}
                                  className="rounded me-3"
                                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                />
                              ) : (
                                <div className="bg-primary bg-opacity-10 rounded me-3 d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px" }}>
                                  <i className="pi pi-box text-primary"></i>
                                </div>
                              )}
                              <div className="flex-grow-1">
                                <h6 className="card-title mb-1 fw-semibold">
                                  {product.name}
                                </h6>
                                <p className="mb-1 text-muted small">
                                  {formatCurrency(product.sale_price_ttc)}
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className={`badge ${product.quantity_disponible <= 2 ? "bg-warning" : "bg-success"}`}>
                                    {product.code} - Stock: {product.quantity_disponible}
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

        <div className="col-lg-6">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-info text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="pi pi-shopping-cart me-2"></i>
                  Panier{" "}
                  {items.length > 0 && (
                    <span className="badge bg-light text-info ms-2">
                      {items.length}
                    </span>
                  )}
                </h6>
                {items.length > 0 && (
                  <div className="d-flex gap-2">
                    <input
                      type="number"
                      className="form-control form-control-sm text-center"
                      value={discountGlobal || ""}
                      onChange={(e) => setDiscountGlobal(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="1"
                      style={{ width: "90px" }}
                      placeholder="0"
                      title="Remise en FBU pour tous les produits"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm text-black"
                      onClick={handleSetDiscountGlobal}
                    >
                      <i className="pi pi-check me-1"></i>Valider
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm"
                      onClick={clearCart}
                      disabled={saving}
                    >
                      <i className="pi pi-trash me-1"></i>Vider
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="card-body p-0">
              {items.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="pi pi-shopping-cart display-4 text-muted opacity-25"></i>
                  </div>
                  <h6 className="mb-2">Panier vide</h6>
                  <p className="mb-0 small text-muted">
                    Ajoutez des produits pour commencer
                  </p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "40px" }}></th>
                          <th>Produit</th>
                          <th className="text-center" style={{ width: "100px" }}>Quantité</th>
                          <th className="text-center" style={{ width: "100px" }}>Prix</th>
                          <th className="text-center" style={{ width: "100px" }}>Remise (FBU)</th>
                          <th className="text-center" style={{ width: "120px" }}>Total</th>
                          <th style={{ width: "40px" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => {
                          const quantity = parseFloat(item.quantity) || 0;
                          const price = parseFloat(item.sale_price) || 0;
                          const discountFBUPerUnit = parseFloat(item.discount_fbu) || 0;
                          const subtotal = quantity * price;
                          const fbuDiscountTotal = discountFBUPerUnit * quantity;
                          const finalAmount = Math.max(0, subtotal - fbuDiscountTotal);
                          const fbuDiscountPercentage = subtotal > 0 ? (fbuDiscountTotal * 100) / subtotal : 0;
                          const availableStock = item.available_stock || 0;
                          const isOverStock = quantity > availableStock;
                          const isDiscountTooHigh = fbuDiscountTotal > subtotal;

                          return (
                            <tr key={item.product_id} className={isOverStock ? "table-danger" : ""}>
                              <td className="text-center">
                                {item.image ? (
                                  <img
                                    src={`/storage/${item.image}`}
                                    alt="Product"
                                    className="rounded"
                                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                  />
                                ) : (
                                  <div className="bg-primary bg-opacity-10 rounded d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                    <i className="pi pi-box text-primary"></i>
                                  </div>
                                )}
                              </td>
                              <td>
                                <div>
                                  <div className="fw-semibold">{item.name}</div>
                                  <div className="d-flex gap-1 mt-1">
                                    <span className={`badge badge-sm ${availableStock <= 2 ? "bg-warning" : "bg-success"}`}>
                                      Stock: {availableStock}
                                    </span>
                                    <small className="text-muted mx-2">#{item.code}</small>
                                    {isOverStock && (
                                      <span className="badge bg-danger badge-sm">
                                        <i className="pi pi-exclamation-triangle me-1"></i>Dépassé
                                      </span>
                                    )}
                                    {isDiscountTooHigh && (
                                      <span className="badge bg-warning badge-sm">
                                        <i className="pi pi-exclamation-triangle me-1"></i>Remise élevée
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="text-center">
                                <input
                                  type="number"
                                  className={`form-control form-control-sm text-center ${isOverStock ? "is-invalid" : ""}`}
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.product_id, parseFloat(e.target.value) || 0)}
                                  min="0.01"
                                  step="0.01"
                                  style={{ width: "80px" }}
                                />
                              </td>
                              <td className="text-center">
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-center"
                                  value={item.sale_price}
                                  onChange={(e) => updatePrice(item.product_id, parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  style={{ width: "90px" }}
                                />
                              </td>
                              <td className="text-center">
                                <input
                                  type="number"
                                  className={`form-control form-control-sm text-center ${isDiscountTooHigh ? "is-invalid" : ""}`}
                                  value={item.discount_fbu || 0}
                                  onChange={(e) => updateDiscountFBU(item.product_id, parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="1"
                                  style={{ width: "90px" }}
                                  placeholder="0"
                                />
                                {discountFBUPerUnit > 0 && (
                                  <div className="text-center">
                                    <small className="text-info d-block">
                                      {fbuDiscountPercentage.toFixed(1)}%
                                    </small>
                                  </div>
                                )}
                              </td>
                              <td className="text-center">
                                <div className="d-flex flex-column align-items-center">
                                  <span className={`fw-bold ${isOverStock ? "text-danger" : isDiscountTooHigh ? "text-warning" : "text-success"}`}>
                                    {formatCurrency(finalAmount)}
                                  </span>
                                  {discountFBUPerUnit > 0 && (
                                    <small className="text-muted text-decoration-line-through d-block">
                                      {formatCurrency(subtotal)}
                                    </small>
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleRemoveItem(item.product_id)}
                                  title="Supprimer"
                                >
                                  <i className="pi pi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 border-top bg-light">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="small">Sous-total:</span>
                      <span className="fw-semibold">{formatCurrency(totals.subtotal)}</span>
                    </div>
                    {totals.totalDiscount > 0 && (
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small">Remise:</span>
                        <span className="fw-semibold text-warning">-{formatCurrency(totals.totalDiscount)}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between">
                      <span className="fw-bold">Total:</span>
                      <span className="fw-bold text-success">{formatCurrency(totals.totalAmount)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-warning text-white">
              <h6 className="mb-0">
                <i className="pi pi-credit-card me-2"></i>Paiement
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Montant payé <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                  <span className="input-group-text">FBU</span>
                </div>
              </div>

              {totals.totalAmount > 0 && (
                <div className={`alert alert-${paymentStatus.type === "success" ? "success" : paymentStatus.type === "info" ? "info" : "warning"} border-0`}>
                  <div className="d-flex align-items-center">
                    <i className={`pi ${paymentStatus.type === "success" ? "pi-check-circle" : paymentStatus.type === "info" ? "pi-info-circle" : "pi-exclamation-triangle"} me-2`}></i>
                    <small>{paymentStatus.message}</small>
                  </div>
                </div>
              )}

              {totals.totalAmount > 0 && (
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Montant rapide:</label>
                  <div className="d-flex flex-wrap gap-2">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setQuickAmount(totals.totalAmount)}>
                      Exact
                    </button>
                    {[
                      Math.ceil(totals.totalAmount / 1000) * 1000,
                      Math.ceil(totals.totalAmount / 5000) * 5000,
                      Math.ceil(totals.totalAmount / 10000) * 10000,
                    ]
                      .filter((amount, index, arr) => amount > totals.totalAmount && arr.indexOf(amount) === index)
                      .slice(0, 3)
                      .map((amount, index) => (
                        <button key={index} type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setQuickAmount(amount)}>
                          {formatCurrency(amount)}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold">Note (optionnel)</label>
                <textarea
                  className="form-control"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                  placeholder="Commentaires sur cette vente..."
                />
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-success btn-lg"
                  onClick={handleUpdate}
                  disabled={saving || !selectedClient || items.length === 0 || stockProformaErrors.length > 0}
                >
                  {saving ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <i className="pi pi-save me-2"></i>
                      {stockProformaErrors.length > 0 ? "Corriger les stocks avant de sauvegarder" : "Mettre à jour la proforma"}
                    </>
                  )}
                </button>

                <div className="row g-2">
                  <div className="col-6">
                    <Link to="/proforma" className="btn btn-outline-secondary w-100">
                      <i className="pi pi-arrow-left me-1"></i>Retour
                    </Link>
                  </div>
                  <div className="col-6">
                    <button
                      type="button"
                      className="btn btn-outline-warning w-100"
                      onClick={clearCart}
                      disabled={items.length === 0 || saving}
                    >
                      <i className="pi pi-trash me-1"></i>Vider
                    </button>
                  </div>
                </div>
              </div>

              {(!selectedClient || items.length === 0 || stockProformaErrors.length > 0) && (
                <div className="alert alert-warning mt-3 border-0">
                  <small>
                    <i className="pi pi-info-circle me-1"></i>
                    {!selectedClient && items.length === 0 && "Sélectionnez un client et ajoutez des produits pour continuer"}
                    {!selectedClient && items.length > 0 && "Sélectionnez un client pour continuer"}
                    {selectedClient && items.length === 0 && "Ajoutez des produits pour continuer"}
                    {stockProformaErrors.length > 0 && "Corrigez les quantités supérieures au stock disponible avant de continuer"}
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProformaEditScreen;