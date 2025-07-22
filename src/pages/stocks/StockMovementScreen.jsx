import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';

const StockMovementScreen = ({ stockProductId }) => {
  // États du composant
  const [stockProduct, setStockProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [movementTypes, setMovementTypes] = useState({});
  const [formData, setFormData] = useState({
    item_movement_type: '',
    item_purchase_or_sale_price: 0,
    item_purchase_or_sale_currency: 'BIF',
    item_quantity: 1,
    item_movement_date: new Date().toISOString().slice(0, 16),
    item_movement_note: ''
  });

  const toast = useRef(null);

  // Constantes
  const CURRENCIES = [
    { value: 'BIF', label: 'BIF - Franc Burundais' },
    { value: 'USD', label: 'USD - Dollar Américain' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'RWF', label: 'RWF - Franc Rwandais' },
    { value: 'CDF', label: 'CDF - Franc Congolais' }
  ];

  // Effets
  useEffect(() => {
    loadData();
  }, [stockProductId]);

  // Fonctions utilitaires
  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? 'Erreur' : 'Succès', 
      detail, 
      life: 3000 
    });
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
  };

  const getMovementBadge = (type) => {
    const isEntry = ['EN', 'ER', 'EI', 'EAJ', 'ET', 'EAU'].includes(type);
    return (
      <span className={`badge ${isEntry ? 'bg-success' : 'bg-danger'}`}>
        <i className={`pi pi-arrow-${isEntry ? 'down' : 'up'} me-1`}></i>
        {movementTypes[type] || type}
      </span>
    );
  };

  // Fonctions de gestion des données
  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      const response = await ApiService.get(`/api/stock-movements/${stockProductId}?page=${page}`);
      
      if (response.success) {
        setStockProduct(response.data.stock_product);
        setMovements(response.data.movements.data || []);
        setMovementTypes(response.data.movement_types || {});
        setPagination({
          current_page: response.data.movements.current_page,
          last_page: response.data.movements.last_page,
          total: response.data.movements.total,
          from: response.data.movements.from,
          to: response.data.movements.to
        });
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const response = await ApiService.post(`/api/stock-movements/${stockProductId}`, formData);
      
      if (response.success) {
        showToast('success', 'Mouvement enregistré avec succès');
        resetForm();
        loadData();
      } else {
        showToast('error', response.message);
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Gestionnaires d'événements du formulaire
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Composant Pagination
  const Pagination = () => {
    if (pagination.last_page <= 1) return null;

    const getVisiblePages = () => {
      const current = pagination.current_page;
      const last = pagination.last_page;
      const pages = [];

      if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
      }

      pages.push(1);
      if (current > 4) pages.push('...');
      
      const start = Math.max(2, current - 1);
      const end = Math.min(last - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < last - 3) pages.push('...');
      pages.push(last);
      
      return pages;
    };

    return (
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadData(pagination.current_page - 1)} 
              disabled={pagination.current_page === 1}
            >
              <i className="pi pi-chevron-left"></i>
            </button>
          </li>
          
          {getVisiblePages().map((page, index) => (
            <li 
              key={index} 
              className={`page-item ${page === pagination.current_page ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
            >
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button 
                  className="page-link" 
                  onClick={() => loadData(page)}
                >
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadData(pagination.current_page + 1)} 
              disabled={pagination.current_page === pagination.last_page}
            >
              <i className="pi pi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  // Composant de chargement
  const LoadingSpinner = () => (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Chargement...</span>
      </div>
    </div>
  );

  // Composant formulaire
  const MovementForm = () => (
    <div className="card-body">
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* Type de mouvement */}
          <div className="col-md-3">
            <label className="form-label">Type de Mouvement</label>
            <select 
              className="form-select" 
              value={formData.item_movement_type}
              onChange={(e) => handleFormChange('item_movement_type', e.target.value)}
              required
            >
              <option value="">Sélectionner le type de mouvement</option>
              {Object.entries(movementTypes).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          {/* Date du mouvement */}
          <div className="col-md-3">
            <label className="form-label">Date du Mouvement</label>
            <input 
              type="datetime-local" 
              className="form-control" 
              value={formData.item_movement_date}
              onChange={(e) => handleFormChange('item_movement_date', e.target.value)}
              required
            />
          </div>
          
          {/* Prix */}
          <div className="col-md-3">
            <label className="form-label">Prix</label>
            <div className="input-group">
              <span className="input-group-text">{formData.item_purchase_or_sale_currency}</span>
              <input 
                type="number" 
                className="form-control" 
                value={formData.item_purchase_or_sale_price}
                onChange={(e) => handleFormChange('item_purchase_or_sale_price', parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* Devise */}
          <div className="col-md-3">
            <label className="form-label">Devise</label>
            <select 
              className="form-select" 
              value={formData.item_purchase_or_sale_currency}
              onChange={(e) => handleFormChange('item_purchase_or_sale_currency', e.target.value)}
            >
              {CURRENCIES.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Quantité */}
        <div className="mb-3 mt-3">
          <label className="form-label">Quantité</label>
          <div className="input-group">
            <input 
              type="number" 
              className="form-control" 
              value={formData.item_quantity}
              onChange={(e) => handleFormChange('item_quantity', parseFloat(e.target.value) || 1)}
              step="0.01"
              min="0.01"
              required
            />
            <span className="input-group-text">
              {stockProduct?.measurement_unit || 'pcs'}
            </span>
          </div>
        </div>
        
        {/* Notes */}
        <div className="mb-4">
          <label className="form-label">Notes</label>
          <textarea 
            className="form-control" 
            value={formData.item_movement_note}
            onChange={(e) => handleFormChange('item_movement_note', e.target.value)}
            rows="3"
            placeholder="Informations supplémentaires sur ce mouvement..."
          />
        </div>
        
        {/* Bouton de soumission */}
        <div className="d-grid">
          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            disabled={submitting}
          >
            <i className="pi pi-save me-2"></i>
            {submitting ? 'Enregistrement...' : 'Enregistrer le Mouvement'}
          </button>
        </div>
      </form>
    </div>
  );

  // Composant tableau des mouvements
  const MovementsTable = () => (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-light">
        <h6 className="mb-0">
          <i className="pi pi-history me-2"></i>
          Historique des Mouvements
        </h6>
      </div>
      
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light">
              <tr>
                <th className="border-0 px-4 py-3">Date</th>
                <th className="border-0 px-4 py-3">Type</th>
                <th className="border-0 px-4 py-3">Quantité</th>
                <th className="border-0 px-4 py-3">Prix</th>
                <th className="border-0 px-4 py-3">Notes</th>
                <th className="border-0 px-4 py-3">Utilisateur</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td className="px-4">
                    {new Date(movement.item_movement_date).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4">
                    {getMovementBadge(movement.item_movement_type)}
                  </td>
                  <td className="px-4">
                    <span className="badge bg-info">
                      {movement.item_quantity} {movement.item_measurement_unit}
                    </span>
                  </td>
                  <td className="px-4">
                    {movement.item_purchase_or_sale_price > 0 ? (
                      <span className="text-success">
                        {new Intl.NumberFormat('fr-FR').format(movement.item_purchase_or_sale_price)} {movement.item_purchase_or_sale_currency}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4">
                    {movement.item_movement_note || '-'}
                  </td>
                  <td className="px-4">
                    <i className="pi pi-user me-1"></i>
                    {movement.user?.name || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer avec pagination */}
      {pagination.last_page > 1 && (
        <div className="card-footer bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">
              Affichage de {pagination.from} à {pagination.to} sur {pagination.total} résultats
            </div>
            <Pagination />
          </div>
        </div>
      )}
    </div>
  );

  // Rendu conditionnel pour le chargement
  if (loading) {
    return <LoadingSpinner />;
  }

  // Rendu principal
  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      
      {/* En-tête avec informations du produit */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            Mouvement de Stock [{stockProduct?.stock_name}] : {stockProduct?.product_name}
          </h5>
          <small className="text-white">
            Quantité actuelle : {stockProduct?.quantity} {stockProduct?.measurement_unit}
          </small>
        </div>
        
        <MovementForm />
      </div>

      {/* Historique des mouvements */}
      {movements.length > 0 && <MovementsTable />}
    </div>
  );
};

export default StockMovementScreen;