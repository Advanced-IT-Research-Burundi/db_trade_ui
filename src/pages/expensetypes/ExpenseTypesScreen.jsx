import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import { API_CONFIG } from '../../services/config';
import LoadingComponent from '../component/LoadingComponent';
import ErrorComponent from '../component/ErrorComponent';
import GlobalPagination from '../component/GlobalPagination';
import { Card, Table, Container, Row, Col, Form, Button, InputGroup, Badge, ButtonGroup } from 'react-bootstrap';
import { FaSearch, FaSync, FaTrash, FaEdit, FaEye, FaPlus, FaTags } from 'react-icons/fa';

const ExpenseTypeScreen = () => {
  const dispatch = useDispatch();
  const toast = useRef(null);
  
  // Local state
  const [filters, setFilters] = useState({
    search: '',
    agency_id: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, expenseTypeId: null });
  
  // Get data from Redux store
  const { data, loading, error } = useSelector((state) => ({
    data: state.apiData?.data?.expenseTypes,
    loading: state.apiData.loading,
    error: state.apiData.error
  }));
  
  // Extract data from API response
  const expenseTypes = data?.expense_types?.data || [];
  const agencies = data?.agencies || [];
  
  const pagination = data?.expenseTypes ? {
    current_page: data.expenseTypes.current_page,
    last_page: data.expenseTypes.last_page,
    total: data.expenseTypes.total,
    from: data.expenseTypes.from,
    to: data.expenseTypes.to
  } : { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  // Load expense types with filters
  const loadExpenseTypes = (page = 1, searchFilters = filters) => {
    const params = { page, ...searchFilters };
    dispatch(fetchApiData({
      url: API_CONFIG.ENDPOINTS.EXPENSE_TYPES,
      itemKey: 'expenseTypes',
      params
    }));
  };

  // Initial load
  useEffect(() => {
    loadExpenseTypes();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadExpenseTypes(1, newFilters);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadExpenseTypes(1, filters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = { search: '', agency_id: '' };
    setFilters(resetFilters);
    setCurrentPage(1);
    loadExpenseTypes(1, resetFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadExpenseTypes(page, filters);
  };

  // Handle delete expense type
  const handleDeleteExpenseType = async (expenseTypeId) => {
    try {
      // TODO: Implémenter la suppression avec ApiService
      // Après la suppression, recharger les types de dépenses
      loadExpenseTypes(currentPage);
      showToast('success', 'Type de dépense supprimé avec succès');
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, expenseTypeId: null });
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
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'Actif', variant: 'success' },
      inactive: { label: 'Inactif', variant: 'secondary' }
    };
    
    const statusInfo = statusMap[status] || { label: 'Inconnu', variant: 'secondary' };
    return <Badge bg={statusInfo.variant}>{statusInfo.label}</Badge>;
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
                <span>Types de Dépenses </span>
          
                <div>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => loadExpenseTypes(currentPage, filters)}
                    disabled={loading}
                    title="Rafraîchir"
                    className="me-2"
                  >
                    <FaSync className={loading ? 'fa-spin' : ''} />
                  </Button>
                  <Button variant="primary" href="/expense-types/create">
                    <FaPlus className="me-1" /> Nouveau Type
                  </Button>
                </div>
              </Card.Title>
              <p className="card-category">{pagination.total} type(s) de dépense(s) au total</p>
            </Card.Header>
            
            {/* Filters */}
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row className="g-3">
                  <Col md={6}>
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
                  <Col md={4}>
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
                  <Col md={2} className="d-flex align-items-end">
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

      {/* Expense Types Table */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              
              <div className="table-responsive">
                <Table hover className="align-items-center">
                  <thead className="text-primary">
                    <tr>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Statut</th>
                      <th>Date de création</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseTypes.length > 0 ? (
                      expenseTypes.map((type) => (
                        <tr key={type.id}>
                          <td>
                            <strong>{type.name}</strong>
                            <div className="text-muted small">
                              {type.code || 'Aucun code'}
                            </div>
                          </td>
                          <td>{type.description || 'Aucune description'}</td>
                          <td>{getStatusBadge(type.status)}</td>
                          <td>{formatDate(type.created_at)}</td>
                          <td>
                            <ButtonGroup size="sm">
                              <Button 
                                variant="info" 
                                title="Voir"
                                className="text-white"
                                href={`/expense-types/${type.id}`}
                              >
                                <FaEye />
                              </Button>
                              <Button 
                                variant="warning" 
                                title="Modifier"
                                href={`/expense-types/${type.id}/edit`}
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                variant="danger" 
                                title="Supprimer"
                                onClick={() => setDeleteModal({ show: true, expenseTypeId: type.id })}
                                disabled={type.is_system === 1}
                              >
                                <FaTrash />
                              </Button>
                            </ButtonGroup>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <div className="text-muted">
                            <FaTags className="display-6 d-block mx-auto mb-2" />
                            <h5>Aucun type de dépense trouvé</h5>
                            <p className="mb-0">Essayez de modifier vos critères de recherche</p>
                          </div>
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
                  onClick={() => setDeleteModal({ show: false, expenseTypeId: null })}
                ></button>
              </div>
              <div className="modal-body">
                Êtes-vous sûr de vouloir supprimer ce type de dépense ? Cette action est irréversible.
                <div className="alert alert-warning mt-3 mb-0">
                  <strong>Attention :</strong> La suppression d'un type de dépense peut affecter les dépenses existantes.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteModal({ show: false, expenseTypeId: null })}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteExpenseType(deleteModal.expenseTypeId)}
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

export default ExpenseTypeScreen;