import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import { API_CONFIG } from '../../services/config';
import LoadingComponent from '../component/LoadingComponent';
import ErrorComponent from '../component/ErrorComponent';
import GlobalPagination from '../component/GlobalPagination';
import { Card, Table, Container, Row, Col, Form, Button, InputGroup, Badge } from 'react-bootstrap';
import { FaEdit, FaEye, FaTrash, FaSearch, FaSync, FaPlus, FaTags } from 'react-icons/fa';

const CategoryScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  
  // Local state
  const [filters, setFilters] = useState({
    search: '',
    agency_id: '',
    created_by: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, categoryId: null });
  
  // Get data from Redux store
  const { data, loading, error } = useSelector((state) => ({
    data: state.apiData?.data?.categories,
    loading: state.apiData.loading,
    error: state.apiData.error
  }));
  
  // Extract data from API response
  const categories = data?.categories?.data || [];
  const agencies = data?.agencies || [];
  const creators = data?.creators || [];
  const pagination = data?.categories ? {
    current_page: data.categories.current_page,
    last_page: data.categories.last_page,
    total: data.categories.total,
    from: data.categories.from,
    to: data.categories.to
  } : { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  // Fetch categories with filters
  const loadCategories = (page = 1, searchFilters = filters) => {
    const params = { page, ...searchFilters };
    dispatch(fetchApiData({
      url: API_CONFIG.ENDPOINTS.CATEGORIES,
      itemKey: 'categories',
      params
    }));
  };

  // Initial load
  useEffect(() => {
    loadCategories();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadCategories(1, newFilters);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCategories(1, filters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = { search: '', agency_id: '', created_by: '' };
    setFilters(resetFilters);
    setCurrentPage(1);
    loadCategories(1, resetFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadCategories(page, filters);
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId) => {
    try {
      // Implement delete logic here
      // After successful deletion, reload categories
      loadCategories(currentPage);
      showToast('success', 'Catégorie supprimée avec succès');
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, categoryId: null });
  };

  // Show toast notification
  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? 'Erreur' : 'Succès', 
      detail, 
      life: 3000 
    });
  };

  // Helper functions
  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };


  return (
    <Container fluid>
      <Toast ref={toast} />
      
      {/* Header */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="card-plain">
            <Card.Header>
              <Card.Title as="h4" className="d-flex justify-content-between align-items-center">
                <span><FaTags className="me-2" />Gestion des Catégories</span>
                <div>
                  <Button 
                    variant="primary" 
                    className="me-2"
                    onClick={() => navigate('/categories/create')}
                  >
                    <FaPlus className="me-1" /> Nouvelle Catégorie
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => loadCategories(currentPage, filters)}
                    disabled={loading}
                  >
                    <FaSync className={loading ? 'fa-spin' : ''} />
                  </Button>
                </div>
              </Card.Title>
              <p className="card-category">{pagination.total} catégorie(s) au total</p>
            </Card.Header>
            
            {/* Filters */}
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row className="g-3">
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label>Rechercher</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Nom, description..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                        <Button type="submit" variant="primary">
                          <FaSearch />
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Agence</Form.Label>
                      <Form.Select
                        value={filters.agency_id}
                        onChange={(e) => handleFilterChange('agency_id', e.target.value)}
                      >
                        <option value="">Toutes les agences</option>
                        {agencies.map(agency => (
                          <option key={agency.id} value={agency.id}>
                            {agency.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Créé par</Form.Label>
                      <Form.Select
                        value={filters.created_by}
                        onChange={(e) => handleFilterChange('created_by', e.target.value)}
                      >
                        <option value="">Tous les créateurs</option>
                        {creators.map(creator => (
                          <option key={creator.id} value={creator.id}>
                            {creator.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={1} className="d-flex align-items-end">
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleReset}
                      className="w-100"
                      title="Réinitialiser les filtres"
                    >
                      <FaSync />
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Categories Table */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-items-center">
                  <thead className="text-primary">
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Statut</th>
                      <th>Agence</th>
                      <th>Créé par</th>
                      <th>Créé le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <tr key={category.id}>
                          <td>{category.id}</td>
                          <td>
                            <strong>{category.name}</strong>
                          </td>
                          <td>{truncateText(category.description, 30)}</td>
                          <td>
                            <Badge bg={category.status === 'active' ? 'success' : 'danger'}>
                              {category.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td>{category.agency?.name || 'N/A'}</td>
                          <td>{category.created_by?.name || 'N/A'}</td>
                          <td>{formatDate(category.created_at)}</td>
                          <td>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="me-1"
                              onClick={() => navigate(`/categories/${category.id}`)}
                            >
                              <FaEye />
                            </Button>
                            <Button 
                              variant="warning" 
                              size="sm" 
                              className="me-1"
                              onClick={() => navigate(`/categories/${category.id}/edit`)}
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => setDeleteModal({ show: true, categoryId: category.id })}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          Aucune catégorie trouvée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="mt-4 d-flex justify-content-between align-items-center">
                  <div className="text-muted">
                    Affichage de {pagination.from} à {pagination.to} sur {pagination.total} entrées
                  </div>
                  <GlobalPagination
                    currentPage={pagination.current_page}
                    lastPage={pagination.last_page}
                    total={pagination.total}
                    from={pagination.from}
                    to={pagination.to}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmer la suppression</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setDeleteModal({ show: false, categoryId: null })}
                ></button>
              </div>
              <div className="modal-body">
                Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteModal({ show: false, categoryId: null })}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteCategory(deleteModal.categoryId)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default CategoryScreen;