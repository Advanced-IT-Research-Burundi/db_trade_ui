import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

import ApiService from '../../services/api.js';

const CategoryScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });
  const [filters, setFilters] = useState({
    search: '',
    sort: 'name',
    order: 'asc'
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [pagination.current_page, pagination.per_page, filters]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...filters
      });

      const response = await ApiService.get(`/api/categories?${params}`);
      
      if (response.success) {
        const data = response.data;
        setCategories(data.data || []);
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

  const confirmDeleteCategory = (category) => {
    setSelectedCategory(category);
    setDeleteDialog(true);
  };

  const deleteCategory = async () => {
    try {
      const response = await ApiService.delete(`/api/categories/${selectedCategory.id}`);
      
      if (response.success) {
        loadCategories();
        toast.current.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Catégorie supprimée avec succès',
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
      setSelectedCategory(null);
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
                  <i className="pi pi-list me-2"></i>
                  Liste des catégories
                  <span className="badge bg-primary ms-2">{pagination.total}</span>
                </h4>
                <div className="d-flex gap-2">
                  <Button
                    label="Nouvelle"
                    icon="pi pi-plus"
                    className="p-button-success p-button-sm"
                    onClick={() => navigate('/categories/create')}
                  />
                  <Button
                    label="Actualiser"
                    icon="pi pi-refresh"
                    className="p-button-info p-button-sm"
                    onClick={loadCategories}
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
                      placeholder="Rechercher par nom ou description..."
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
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
                          ID <i className={getSortIcon('id')}></i>
                        </button>
                      </th>
                      <th>
                        <button 
                          className="btn btn-sm btn-link text-dark p-0"
                          onClick={() => handleSort('name')}
                        >
                          Nom <i className={getSortIcon('name')}></i>
                        </button>
                      </th>
                      <th>Description</th>
                      <th style={{ width: '100px' }}>
                        <button 
                          className="btn btn-sm btn-link text-dark p-0"
                          onClick={() => handleSort('created_at')}
                        >
                          Créé le <i className={getSortIcon('created_at')}></i>
                        </button>
                      </th>
                      <th style={{ width: '130px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                          </div>
                        </td>
                      </tr>
                    ) : categories.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          <i className="pi pi-inbox me-2"></i>
                          Aucune catégorie trouvée
                        </td>
                      </tr>
                    ) : (
                      categories.map(category => (
                        <tr key={category.id}>
                          <td className="fw-bold text-primary">{category.id}</td>
                          <td>
                            <div className="fw-bold">{category.name}</div>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '300px' }}>
                              {category.description || (
                                <em className="text-muted">Aucune description</em>
                              )}
                            </div>
                          </td>
                          <td>
                            <small className="text-muted">
                              {category.created_at ? new Date(category.created_at).toLocaleDateString('fr-FR') : '-'}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-info btn-sm"
                                title="Voir"
                                onClick={() => navigate(`/categories/${category.id}`)}
                              >
                                <i className="pi pi-eye"></i>
                              </button>
                              <button
                                className="btn btn-success btn-sm"
                                title="Modifier"
                                onClick={() => navigate(`/categories/${category.id}/edit`)}
                              >
                                <i className="pi pi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                title="Supprimer"
                                onClick={() => confirmDeleteCategory(category)}
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
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} sur {pagination.total} catégories
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
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${selectedCategory?.name}" ?`}
        header="Confirmer la suppression"
        icon="pi pi-exclamation-triangle"
        accept={deleteCategory}
        reject={() => setDeleteDialog(false)}
        acceptLabel="Oui, supprimer"
        rejectLabel="Annuler"
        acceptClassName="p-button-danger"
      />
    </div>
  );
};

export default CategoryScreen;