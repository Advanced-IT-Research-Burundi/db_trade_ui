import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import { API_CONFIG } from '../../services/config';
import LoadingComponent from '../component/LoadingComponent';
import ErrorComponent from '../component/ErrorComponent';
import GlobalPagination from '../component/GlobalPagination';
import { Card, Table, Container, Row, Col, Form, Button, InputGroup, Badge, ButtonGroup } from 'react-bootstrap';
import { FaSearch, FaSync, FaTrash, FaEdit, FaEye, FaPlus, FaMoneyBillWave } from 'react-icons/fa';

const ExpenseScreen = () => {
  const dispatch = useDispatch();
  const toast = useRef(null);
  
  // Local state
  const [filters, setFilters] = useState({
    search: '',
    expense_type_id: '',
    agency_id: '',
    user_id: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, expenseId: null });
  
  // Get data from Redux store
  const { data, loading, error } = useSelector((state) => ({
    data: state.apiData?.data?.expenses,
    loading: state.apiData.loading,
    error: state.apiData.error
  }));


  
  // Extract data from API response
  const expenses = data?.expenses?.data || [];

  //console.log("Expenses",expenses);
  const expenseTypes = data?.expenseTypes || [];
  const agencies = data?.agencies || [];
  const users = data?.users || [];
  
  const pagination = data?.expenses ? {
    current_page: data.expenses.current_page,
    last_page: data.expenses.last_page,
    total: data.expenses.total,
    from: data.expenses.from,
    to: data.expenses.to
  } : { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  // Load expenses with filters
  const loadExpenses = (page = 1, searchFilters = filters) => {
    const params = { page, ...searchFilters };
    dispatch(fetchApiData({
      url: API_CONFIG.ENDPOINTS.EXPENSES,
      itemKey: 'expenses',
      params
    }));
  };

  // Initial load
  useEffect(() => {
    loadExpenses();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadExpenses(1, newFilters);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadExpenses(1, filters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = { 
      search: '', 
      expense_type_id: '', 
      agency_id: '', 
      user_id: '' 
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    loadExpenses(1, resetFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadExpenses(page, filters);
  };

  // Handle delete expense
  const handleDeleteExpense = async (expenseId) => {
    try {
      // TODO: Implémenter la suppression avec ApiService
      // Après la suppression, recharger les dépenses
      loadExpenses(currentPage);
      showToast('success', 'Dépense supprimée avec succès');
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, expenseId: null });
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
  const formatTime = (date) => date ? new Date(date).toLocaleTimeString('fr-FR') : 'N/A';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0) + ' FBU';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { label: 'Payé', variant: 'success' },
      pending: { label: 'En attente', variant: 'warning' },
      cancelled: { label: 'Annulé', variant: 'danger' },
      refunded: { label: 'Remboursé', variant: 'info' }
    };
    
    const statusInfo = statusMap[status] || { label: 'Inconnu', variant: 'secondary' };
    return <Badge bg={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading && !data) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} />;

  return (
    <Container fluid>
      <Toast ref={toast} />
      
      {/* Header */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="card-plain">
            <Card.Header>
              <Card.Title as="h4" className="d-flex justify-content-between align-items-center">
                <span>Gestion des Dépenses</span>
                <div>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => loadExpenses(currentPage, filters)}
                    disabled={loading}
                    title="Rafraîchir"
                    className="me-2"
                  >
                    <FaSync className={loading ? 'fa-spin' : ''} />
                  </Button>
                  <Button variant="primary" href="/expenses/create">
                    <FaPlus className="me-1" /> Nouvelle Dépense
                  </Button>
                </div>
              </Card.Title>
              <p className="card-category">{pagination.total} dépense(s) au total</p>
            </Card.Header>
            
            {/* Filters */}
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Rechercher</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Référence, description..."
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
                      <Form.Label>Type de Dépense</Form.Label>
                      <Form.Select
                        value={filters.expense_type_id}
                        onChange={(e) => handleFilterChange('expense_type_id', e.target.value)}
                      >
                        <option value="">Tous les types</option>
                        {expenseTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </Form.Select>
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

      {/* Expenses Table */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-items-center">
                  <thead className="text-primary">
                    <tr>
                      <th>Référence</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Créé par</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length > 0 ? (
                      expenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>
                            <strong>{expense.reference}</strong>
                            <div className="text-muted small">
                              {/*truncateText(expense.description, 30)*/}
                            </div>
                          </td>
                          <td>
                            <div>{formatDate(expense.expense_date)}</div>
                            <div className="text-muted small">{formatTime(expense.expense_date)}</div>
                          </td>
                          <td>{expense.expense_type?.name || 'N/A'}</td>
                          <td>{formatCurrency(expense.amount)}</td>
                          <td>{getStatusBadge(expense.status)}</td>
                          <td>{expense.user?.name || 'N/A'}</td>
                          <td>
                            <ButtonGroup size="sm">
                              <Button 
                                variant="info" 
                                title="Voir"
                                className="text-white"
                                href={`/expenses/${expense.id}`}
                              >
                                <FaEye />
                              </Button>
                              <Button 
                                variant="warning" 
                                title="Modifier"
                                href={`/expenses/${expense.id}/edit`}
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                variant="danger" 
                                title="Supprimer"
                                onClick={() => setDeleteModal({ show: true, expenseId: expense.id })}
                              >
                                <FaTrash />
                              </Button>
                            </ButtonGroup>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <div className="text-muted">
                            <FaMoneyBillWave className="display-6 d-block mx-auto mb-2" />
                            <h5>Aucune dépense trouvée</h5>
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
                  onClick={() => setDeleteModal({ show: false, expenseId: null })}
                ></button>
              </div>
              <div className="modal-body">
                Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.
                <div className="alert alert-warning mt-3 mb-0">
                  <strong>Attention :</strong> La suppression d'une dépense peut affecter votre comptabilité.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteModal({ show: false, expenseId: null })}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteExpense(deleteModal.expenseId)}
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

export default ExpenseScreen;