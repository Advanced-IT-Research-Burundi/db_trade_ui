import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from 'react-router-dom';

import ApiService from '../../services/api.js';
import { formatCurrency } from '../../utils/helpers.js';

const ProductScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    sort: 'name',
    order: 'asc'
  });
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [pagination.current_page, pagination.per_page, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...filters
      });

      const response = await ApiService.get(`/api/products?${params}`);
      
      if (response.success) {
        const data = response.data;
        setProducts(data.data || []);
        setPagination({
          current_page: data.current_page,
          per_page: data.per_page,
          total: data.total,
          last_page: data.last_page
        });
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: response.message || 'Erreur lors du chargement',
          life: 3000
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur de connexion',
        detail: error.message,
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await ApiService.get('/api/categories');
      if (response.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.log('Erreur lors du chargement des catégories');
    }
  };

  const handleSearch = (value) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value }));
      setPagination(prev => ({ ...prev, current_page: 1 }));
    }, 500);
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sort: field,
      order: prev.sort === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const handlePerPageChange = (perPage) => {
    setPagination(prev => ({ ...prev, per_page: perPage, current_page: 1 }));
  };

  const confirmDeleteProduct = (product) => {
    setSelectedProduct(product);
    setDeleteDialog(true);
  };

  const deleteProduct = async () => {
    try {
      const response = await ApiService.delete(`/api/products/${selectedProduct.id}`);
      
      if (response.success) {
        loadProducts();
        toast.current.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Produit supprimé avec succès',
          life: 3000
        });
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: response.message || 'Erreur lors de la suppression',
          life: 3000
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur de connexion',
        detail: error.message,
        life: 3000
      });
    } finally {
      setDeleteDialog(false);
      setSelectedProduct(null);
    }
  };

  const getSortIcon = (field) => {
    if (filters.sort !== field) return 'pi pi-sort';
    return filters.order === 'asc' ? 'pi pi-sort-up' : 'pi pi-sort-down';
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.current_page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.last_page, startPage + maxVisiblePages - 1);

    // Bouton précédent
    pages.push(
      <li key="prev" className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => handlePageChange(pagination.current_page - 1)}
          disabled={pagination.current_page === 1}
        >
          <i className="pi pi-chevron-left"></i>
        </button>
      </li>
    );

    // Pages numérotées
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${i === pagination.current_page ? 'active' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        </li>
      );
    }

    // Bouton suivant
    pages.push(
      <li key="next" className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
        <button 
          className="page-link" 
          onClick={() => handlePageChange(pagination.current_page + 1)}
          disabled={pagination.current_page === pagination.last_page}
        >
          <i className="pi pi-chevron-right"></i>
        </button>
      </li>
    );

    return (
      <nav>
        <ul className="pagination justify-content-center mb-0">
          {pages}
        </ul>
      </nav>
    );
  };

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <i className="pi pi-box me-2"></i>
                  Liste des produits
                  <span className="badge bg-primary ms-2">{pagination.total}</span>
                </h4>
                <div className="d-flex gap-2">
                  <Button
                    label="Nouveau"
                    icon="pi pi-plus"
                    className="p-button-success p-button-sm"
                    onClick={() => navigate('/products/create')}
                  />
                  <Button
                    label="Actualiser"
                    icon="pi pi-refresh"
                    className="p-button-info p-button-sm"
                    onClick={loadProducts}
                  />
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Filtres */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="pi pi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher par nom ou code..."
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filters.category_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={pagination.per_page}
                    onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                  >
                    <option value="5">5 par page</option>
                    <option value="10">10 par page</option>
                    <option value="25">25 par page</option>
                    <option value="50">50 par page</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-primary">
                    <tr>
                      <th style={{ width: '60px' }}>
                        <button 
                          className="btn btn-sm btn-link text-dark p-0"
                          onClick={() => handleSort('id')}
                        >
                          Code<i className={getSortIcon('id')}></i>
                        </button>
                      </th>
                      <th style={{ width: '70px' }}>Image</th>
                      <th>
                        <button 
                          className="btn btn-sm btn-link text-dark p-0"
                          onClick={() => handleSort('name')}
                        >
                          Nom <i className={getSortIcon('name')}></i>
                        </button>
                      </th>
                      <th style={{ width: '120px' }}>Catégorie</th>
                      <th style={{ width: '80px' }}>
                        <button 
                          className="btn btn-sm btn-link text-dark p-0"
                          onClick={() => handleSort('unit')}
                        >
                          Unité <i className={getSortIcon('unit')}></i>
                        </button>
                      </th>
                      <th style={{ width: '120px' }}>
                        <button 
                          className="btn btn-sm btn-link text-dark p-0"
                          onClick={() => handleSort('sale_price_ttc')}
                        >
                          Prix <i className={getSortIcon('sale_price_ttc')}></i>
                        </button>
                      </th>
                      <th style={{ width: '100px' }}>Stock</th>
                      <th style={{ width: '130px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                          </div>
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-muted">
                          <i className="pi pi-inbox me-2"></i>
                          Aucun produit trouvé
                        </td>
                      </tr>
                    ) : (
                      products.map(product => (
                        <tr key={product.id}>
                          <td className="fw-bold text-primary">{product.code}</td>
                          <td className="text-center">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="rounded"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div 
                                className="bg-light rounded d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px' }}
                              >
                                <i className="pi pi-image text-muted"></i>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="fw-bold">{product.name}</div>
                            {product.code && (
                              <small className="text-muted">Code: {product.code}</small>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {product.category?.name || 'Non classé'}
                            </span>
                          </td>
                          <td>{product.unit}</td>
                          <td>
                            <div className="fw-bold text-success">
                              {formatCurrency(product.sale_price_ttc || 0)}
                            </div>
                            {product.purchase_price && (
                              <small className="text-muted">
                                Achat: {formatCurrency(product.purchase_price)}
                              </small>
                            )}
                          </td>
                          <td className="text-center">
                            {(() => {
                              const stock = product.current_stock || product.stock || 0;
                              const alert = product.alert_quantity || 0;
                              const isAlert = stock <= alert;
                              
                              return (
                                <div>
                                  <span className={`badge ${isAlert ? 'bg-danger' : 'bg-success'}`}>
                                    {stock}
                                  </span>
                                  {isAlert && (
                                    <div className="text-danger mt-1">
                                      <small>
                                        <i className="pi pi-exclamation-triangle me-1"></i>
                                        Alerte: {alert}
                                      </small>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-info btn-sm"
                                title="Voir"
                                onClick={() => navigate(`/products/${product.id}`)}
                              >
                                <i className="pi pi-eye"></i>
                              </button>
                              <button
                                className="btn btn-success btn-sm"
                                title="Modifier"
                                onClick={() => navigate(`/products/${product.id}/edit`)}
                              >
                                <i className="pi pi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                title="Supprimer"
                                onClick={() => confirmDeleteProduct(product)}
                              >
                                <i className="pi pi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loading && pagination.total > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted">
                    Affichage de {((pagination.current_page - 1) * pagination.per_page) + 1} à {' '}
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} sur {pagination.total} produits
                  </div>
                  {renderPagination()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        visible={deleteDialog}
        onHide={() => setDeleteDialog(false)}
        message={`Êtes-vous sûr de vouloir supprimer le produit "${selectedProduct?.name}" ?`}
        header="Confirmer la suppression"
        icon="pi pi-exclamation-triangle"
        accept={deleteProduct}
        reject={() => setDeleteDialog(false)}
        acceptLabel="Oui, supprimer"
        rejectLabel="Annuler"
        acceptClassName="p-button-danger"
      />
    </div>
  );
};

export default ProductScreen;