import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';

const SuppliersScreen = () => {
  const navigate = useNavigate();
  const toast = useRef(null);
  
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const loadSuppliers = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        per_page: itemsPerPage,
        search: currentFilters.search,
        sort_by: currentFilters.sortBy,
        sort_order: currentFilters.sortOrder
      };

      const response = await ApiService.get('/api/suppliers', { params });
      
      if (response.success) {
        setSuppliers(response.data.data || []);
        setTotalItems(response.data.total || 0);
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: response.message || 'Erreur lors du chargement des fournisseurs',
          life: 3000
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors du chargement des fournisseurs: ' + error.message,
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un fournisseur
  const handleDelete = async (supplierId, supplierName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur "${supplierName}" ?`)) {
      try {
        const response = await ApiService.delete(`/api/suppliers/${supplierId}`);
        
        if (response.success) {
          toast.current.show({
            severity: 'success',
            summary: 'Succès',
            detail: 'Fournisseur supprimé avec succès',
            life: 3000
          });
          
          // Recharger les données
          loadSuppliers(currentPage, filters);
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
          summary: 'Erreur',
          detail: 'Erreur lors de la suppression: ' + error.message,
          life: 3000
        });
      }
    }
  };

  // Gérer les changements de filtre
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadSuppliers(1, newFilters);
  };

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadSuppliers(page, filters);
  };

  // Charger les données au montage
  useEffect(() => {
    loadSuppliers();
  }, []);

  // Générer les numéros de pages
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-building me-2"></i>
                  Gestion des fournisseurs
                </h4>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => navigate('/suppliers/create')}
                >
                  <i className="pi pi-plus me-2"></i>
                  Nouveau fournisseur
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Rechercher</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="pi pi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nom, email, téléphone..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Trier par</label>
                  <select
                    className="form-select"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="name">Nom</option>
                    <option value="email">Email</option>
                    <option value="phone">Téléphone</option>
                    <option value="created_at">Date de création</option>
                  </select>
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Ordre</label>
                  <select
                    className="form-select"
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  >
                    <option value="asc">Croissant</option>
                    <option value="desc">Décroissant</option>
                  </select>
                </div>
                
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setFilters({ search: '', sortBy: 'name', sortOrder: 'asc' });
                      loadSuppliers(1, { search: '', sortBy: 'name', sortOrder: 'asc' });
                    }}
                  >
                    <i className="pi pi-refresh me-2"></i>
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des fournisseurs */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : suppliers.length === 0 ? (
                <div className="text-center py-5">
                  <i className="pi pi-building text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">Aucun fournisseur trouvé</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Nom</th>
                          <th>Email</th>
                          <th>Téléphone</th>
                          <th>Adresse</th>
                          <th width="200">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suppliers.map((supplier) => (
                          <tr key={supplier.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="pi pi-building text-primary me-2"></i>
                                <strong>{supplier.name}</strong>
                              </div>
                            </td>
                            <td>
                              {supplier.email ? (
                                <a href={`mailto:${supplier.email}`} className="text-decoration-none">
                                  <i className="pi pi-envelope me-1"></i>
                                  {supplier.email}
                                </a>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {supplier.phone ? (
                                <a href={`tel:${supplier.phone}`} className="text-decoration-none">
                                  <i className="pi pi-phone me-1"></i>
                                  {supplier.phone}
                                </a>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {supplier.address ? (
                                <span title={supplier.address}>
                                  <i className="pi pi-map-marker me-1"></i>
                                  {supplier.address.length > 30 
                                    ? supplier.address.substring(0, 30) + '...' 
                                    : supplier.address}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => navigate(`/suppliers/${supplier.id}`)}
                                  title="Voir les détails"
                                >
                                  <i className="pi pi-eye"></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-warning"
                                  onClick={() => navigate(`/suppliers/${supplier.id}/edit`)}
                                  title="Modifier"
                                >
                                  <i className="pi pi-pencil"></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(supplier.id, supplier.name)}
                                  title="Supprimer"
                                >
                                  <i className="pi pi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <div className="text-muted">
                        Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} fournisseurs
                      </div>
                      
                      <nav>
                        <ul className="pagination mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              <i className="pi pi-chevron-left"></i>
                            </button>
                          </li>
                          
                          {getPageNumbers().map(page => (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            </li>
                          ))}
                          
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              <i className="pi pi-chevron-right"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersScreen;