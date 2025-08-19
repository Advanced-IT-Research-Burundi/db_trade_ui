import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { useParams, useNavigate } from 'react-router-dom';

const StockMovementScreen = () => {
  const { id: stockProductId } = useParams();
  const navigate = useNavigate();
  const [stockProduct, setStockProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    item_movement_type: '',
    item_purchase_or_sale_price: 0,
    item_purchase_or_sale_currency: 'BIF',
    item_quantity: 1,
    item_movement_date: new Date().toISOString().slice(0, 16),
    item_movement_note: ''
  });

  const [errors, setErrors] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });

  const toast = useRef(null);

  // Types de mouvement
  const MOUVEMENT_TYPES = {
    'EN': 'Entrée Normale',
    'ER': 'Entrée par Retour',
    'EI': 'Entrée par Inventaire',
    'EAJ': 'Entrée par Ajustement',
    'ET': 'Entrée par Transfert',
    'EAU': 'Entrée Autre',
    'SN': 'Sortie Normale',
    'SP': 'Sortie par Perte',
    'SV': 'Sortie par Vente',
    'SD': 'Sortie par Détérioration',
    'SC': 'Sortie par Consommation',
    'SAJ': 'Sortie par Ajustement',
    'ST': 'Sortie par Transfert',
    'SAU': 'Sortie Autre'
  };

  const CURRENCIES = [
    { value: 'BIF', label: 'BIF - Franc Burundais' },
    { value: 'USD', label: 'USD - Dollar Américain' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'RWF', label: 'RWF - Franc Rwandais' },
    { value: 'CDF', label: 'CDF - Franc Congolais' }
  ];

  useEffect(() => {
    if (stockProductId) {
      loadStockProduct();
      loadMovements();
    }
  }, [stockProductId]);

  const loadStockProduct = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get(`/api/stock-products/${stockProductId}`);
      if (response.success) {
        setStockProduct(response.data.stock_product);
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement du produit: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async (page = 1) => {
    try {
      setMovementsLoading(true);
      const response = await ApiService.get(`/api/stock-movements`, {
        stock_product_id: stockProductId,
        page,
        per_page: 10
      });
      
      if (response.success) {
        setMovements(response.data.movements.data || []);
        setPagination({
          current_page: response.data.movements.current_page,
          last_page: response.data.movements.last_page,
          total: response.data.movements.total,
          from: response.data.movements.from,
          to: response.data.movements.to
        });
      }
    } catch (error) {
      showToast('error', 'Erreur lors du chargement des mouvements: ' + error.message);
    } finally {
      setMovementsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.item_movement_type) {
      newErrors.item_movement_type = 'Le type de mouvement est requis';
    }

    if (!formData.item_purchase_or_sale_price || formData.item_purchase_or_sale_price < 0) {
      newErrors.item_purchase_or_sale_price = 'Le prix doit être supérieur ou égal à 0';
    }

    if (!formData.item_quantity || formData.item_quantity <= 0) {
      newErrors.item_quantity = 'La quantité doit être supérieure à 0';
    }

    if (!formData.item_movement_date) {
      newErrors.item_movement_date = 'La date du mouvement est requise';
    }

    if (formData.item_movement_note && formData.item_movement_note.length > 1000) {
      newErrors.item_movement_note = 'Les notes ne peuvent pas dépasser 1000 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('error', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      setSaving(true);
      const response = await ApiService.post('/api/stock-movements', {
        stock_product_id: stockProductId,
        ...formData
      });

      if (response.success) {
        showToast('success', 'Mouvement de stock enregistré avec succès');
        resetForm();
        loadStockProduct(); // Reload to get updated quantity
        loadMovements(); // Reload movements
      } else {
        showToast('error', response.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      showToast('error', error.message || 'Erreur lors de l\'enregistrement du mouvement');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      item_movement_type: '',
      item_purchase_or_sale_price: 0,
      item_purchase_or_sale_currency: 'BIF',
      item_quantity: 1,
      item_movement_date: new Date().toISOString().slice(0, 16),
      item_movement_note: ''
    });
    setErrors({});
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? 'Erreur' : 'Succès', 
      detail, 
      life: 3000 
    });
  };

  const formatCurrency = (amount, currency = 'BIF') => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' ' + currency;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR');
  };

  const isEntryMovement = (type) => {
    return ['EN', 'ER', 'EI', 'EAJ', 'ET', 'EAU'].includes(type);
  };

  const getMovementTypeBadge = (type) => {
    const isEntry = isEntryMovement(type);
    return (
      <span className={`badge ${isEntry ? 'bg-success' : 'bg-danger'}`}>
        <i className={`pi ${isEntry ? 'pi-arrow-down' : 'pi-arrow-up'} me-1`}></i>
        {MOUVEMENT_TYPES[type] || type}
      </span>
    );
  };

  const handleGoBack = () => {
    navigate(-1); // Retour à la page précédente
  };

  const Pagination = () => {
    if (pagination.last_page <= 1) return null;

    return (
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadMovements(pagination.current_page - 1)} 
              disabled={pagination.current_page === 1 || movementsLoading}
            >
              <i className="pi pi-chevron-left"></i>
            </button>
          </li>
          <li className="page-item active">
            <span className="page-link">
              {pagination.current_page} / {pagination.last_page}
            </span>
          </li>
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadMovements(pagination.current_page + 1)} 
              disabled={pagination.current_page === pagination.last_page || movementsLoading}
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
      
      {/* Header avec bouton de retour */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <button 
                    className="btn btn-outline-light btn-sm me-3"
                    onClick={handleGoBack}
                    title="Retour"
                  >
                    <i className="pi pi-arrow-left"></i>
                  </button>
                  <div>
                    {loading || !stockProduct ? (
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm text-white me-2" role="status">
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                        <h5 className="mb-0">Chargement du produit...</h5>
                      </div>
                    ) : (
                      <>
                        <h5 className="mb-0">
                          <i className="pi pi-arrows-v me-2"></i>
                          Mouvement de Stock [{stockProduct.stock?.name}] : {stockProduct.product_name}
                        </h5>
                        <small className="text-white">
                          Quantité actuelle : <strong>{stockProduct.quantity}</strong> {stockProduct.measurement_unit || 'pcs'}
                        </small>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-end">
                  {!loading && stockProduct && (
                    <div className="text-white">
                      <small>Code: <strong>{stockProduct.product?.code}</strong></small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Left Column - Movement Form (col-4) */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <i className="pi pi-plus me-2"></i>Nouveau Mouvement
              </h6>
            </div>
            <div className="card-body">
              {loading || !stockProduct ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Movement Type and Date */}
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label">Type de Mouvement</label>
                      <select
                        className={`form-select form-select-sm ${errors.item_movement_type ? 'is-invalid' : ''}`}
                        value={formData.item_movement_type}
                        onChange={(e) => handleInputChange('item_movement_type', e.target.value)}
                        required
                      >
                        <option value="">Sélectionner</option>
                        <optgroup label="Entrées">
                          {Object.entries(MOUVEMENT_TYPES)
                            .filter(([key]) => isEntryMovement(key))
                            .map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Sorties">
                          {Object.entries(MOUVEMENT_TYPES)
                            .filter(([key]) => !isEntryMovement(key))
                            .map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                        </optgroup>
                      </select>
                      {errors.item_movement_type && (
                        <div className="invalid-feedback">{errors.item_movement_type}</div>
                      )}
                    </div>

                    <div className="col-6">
                      <label className="form-label">Date</label>
                      <input
                        type="datetime-local"
                        className={`form-control form-control-sm ${errors.item_movement_date ? 'is-invalid' : ''}`}
                        value={formData.item_movement_date}
                        onChange={(e) => handleInputChange('item_movement_date', e.target.value)}
                        required
                      />
                      {errors.item_movement_date && (
                        <div className="invalid-feedback">{errors.item_movement_date}</div>
                      )}
                    </div>
                  </div>

                  {/* Price and Currency */}
                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label">Prix</label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">{formData.item_purchase_or_sale_currency}</span>
                        <input
                          type="number"
                          className={`form-control ${errors.item_purchase_or_sale_price ? 'is-invalid' : ''}`}
                          value={formData.item_purchase_or_sale_price}
                          onChange={(e) => handleInputChange('item_purchase_or_sale_price', (e.target.value))}
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                        {errors.item_purchase_or_sale_price && (
                          <div className="invalid-feedback">{errors.item_purchase_or_sale_price}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-6">
                      <label className="form-label">Devise</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.item_purchase_or_sale_currency}
                        onChange={(e) => handleInputChange('item_purchase_or_sale_currency', e.target.value)}
                      >
                        {CURRENCIES.map(currency => (
                          <option key={currency.value} value={currency.value}>
                            {currency.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quantity and Unit */}
                  <div className="row mb-3">
                    <div className="col-12">
                      <label className="form-label">Quantité</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="number"
                          className={`form-control ${errors.item_quantity ? 'is-invalid' : ''}`}
                          value={formData.item_quantity}
                          onChange={(e) => handleInputChange('item_quantity', (e.target.value))}
                          step="0.01"
                          min="0"
                          required
                        />
                        <span className="input-group-text">{stockProduct.measurement_unit || 'pcs'}</span>
                        {errors.item_quantity && (
                          <div className="invalid-feedback">{errors.item_quantity}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className={`form-control form-control-sm ${errors.item_movement_note ? 'is-invalid' : ''}`}
                      rows="2"
                      value={formData.item_movement_note}
                      onChange={(e) => handleInputChange('item_movement_note', e.target.value)}
                      placeholder="Informations supplémentaires..."
                      maxLength="1000"
                    ></textarea>
                    {errors.item_movement_note && (
                      <div className="invalid-feedback">{errors.item_movement_note}</div>
                    )}
                    <div className="form-text small">
                      {formData.item_movement_note.length}/1000
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm flex-grow-1"
                      disabled={saving}
                    >
                      {saving ? (
                        <><i className="pi pi-spin pi-spinner me-1"></i>En cours...</>
                      ) : (
                        <><i className="pi pi-save me-1"></i>Enregistrer</>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={resetForm}
                    >
                      <i className="pi pi-refresh"></i>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Movements History (col-8) */}
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="pi pi-history me-2"></i>Historique des Mouvements
              </h6>
              <span className="badge bg-secondary">{pagination.total}</span>
            </div>
            <div className="card-body position-relative">
              {/* Loading overlay pour le tableau uniquement */}
              {movementsLoading && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style={{ zIndex: 10 }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              )}

              {movements.length === 0 && !movementsLoading ? (
                <div className="text-center py-4 text-muted">
                  <i className="pi pi-inbox display-4 d-block mb-3"></i>
                  <p className="mb-0">Aucun mouvement enregistré</p>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table className="table table-sm table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Type</th>
                          <th>Quantité</th>
                          <th>Prix</th>
                          <th>Total</th>
                          <th>Date</th>
                          <th>Utilisateur</th>
                          <th>Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movements.map((movement) => (
                          <tr key={movement.id}>
                            <td>
                              {getMovementTypeBadge(movement.item_movement_type)}
                            </td>
                            <td>
                              <span className={`badge ${isEntryMovement(movement.item_movement_type) ? 'bg-success' : 'bg-danger'}`}>
                                {isEntryMovement(movement.item_movement_type) ? '+' : '-'}{movement.item_quantity} {movement.item_measurement_unit}
                              </span>
                            </td>
                            <td className="text-primary fw-bold">
                              {formatCurrency(movement.item_purchase_or_sale_price, movement.item_purchase_or_sale_currency)}
                            </td>
                            <td className="text-success fw-bold">
                              {formatCurrency(movement.item_quantity * movement.item_purchase_or_sale_price, movement.item_purchase_or_sale_currency)}
                            </td>
                            <td>
                              <small>
                                <i className="pi pi-calendar me-1"></i>
                                {new Date(movement.item_movement_date).toLocaleDateString('fr-FR')}
                                <br />
                                <span className="text-muted">
                                  {new Date(movement.item_movement_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </small>
                            </td>
                            <td>
                              <small>
                                <i className="pi pi-user me-1"></i>
                                {movement.user?.name?.split(' ')[0] || 'N/A'}
                              </small>
                            </td>
                            <td>
                              {movement.item_movement_note && (
                                <small className="text-muted" title={movement.item_movement_note}>
                                  {movement.item_movement_note.length > 30 ? 
                                    movement.item_movement_note.substring(0, 30) + '...' : 
                                    movement.item_movement_note
                                  }
                                </small>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      {pagination.from} - {pagination.to} sur {pagination.total}
                    </small>
                    <Pagination />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMovementScreen;