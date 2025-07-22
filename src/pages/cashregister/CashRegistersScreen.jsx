import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import { API_CONFIG } from '../../services/config';
import LoadingComponent from '../component/LoadingComponent';
import ErrorComponent from '../component/ErrorComponent';
import GlobalPagination from '../component/GlobalPagination';
import { Card, Table, Container, Row, Col, Form, Button, InputGroup, Badge, ButtonGroup } from 'react-bootstrap';
import { FaSearch, FaSync, FaPlus, FaLock, FaLockOpen, FaPause, FaEye, FaTrash, FaEdit } from 'react-icons/fa';

const CashRegistersScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  
  // Local state
  const [filters, setFilters] = useState({
    search: '',
    agency_id: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, cashRegisterId: null });
  const [closeModal, setCloseModal] = useState({ show: false, cashRegisterId: null });
  
  // Get data from Redux store
  const { data, loading, error } = useSelector((state) => ({
    data: state.apiData?.data?.cashRegisters,
    loading: state.apiData.loading,
    error: state.apiData.error
  }));
  
  // Extract data from API response
  const cashRegisters = data?.cash_registers?.data || [];
  const agencies = data?.agencies || [];
  const users = data?.users || [];
  
  const pagination = data?.cash_registers ? {
    current_page: data.cash_registers.current_page,
    last_page: data.cash_registers.last_page,
    total: data.cash_registers.total,
    from: data.cash_registers.from,
    to: data.cash_registers.to
  } : { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  // Fetch cash registers with filters
  const loadCashRegisters = (page = 1, searchFilters = filters) => {
    const params = { page, ...searchFilters };
    dispatch(fetchApiData({
      url: API_CONFIG.ENDPOINTS.CASH_REGISTERS,
      itemKey: 'cashRegisters',
      params
    }));
  };

  // Initial load
  useEffect(() => {
    loadCashRegisters();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadCashRegisters(1, newFilters);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCashRegisters(1, filters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = { search: '', agency_id: '', status: '' };
    setFilters(resetFilters);
    setCurrentPage(1);
    loadCashRegisters(1, resetFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadCashRegisters(page, filters);
  };

  // Handle delete cash register
  const handleDeleteCashRegister = async (cashRegisterId) => {
    try {
      // Implement delete logic here using ApiService
      // After successful deletion, reload cash registers
      loadCashRegisters(currentPage);
      showToast('success', 'Caisse supprimée avec succès');
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, cashRegisterId: null });
  };

  // Handle close cash register
  const handleCloseCashRegister = async (cashRegisterId) => {
    try {
      // Implement close logic here using ApiService
      // After successful close, reload cash registers
      loadCashRegisters(currentPage);
      showToast('success', 'Caisse fermée avec succès');
    } catch (error) {
      showToast('error', error.message);
    }
    setCloseModal({ show: false, cashRegisterId: null });
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
  const formatDateTime = (date) => date ? new Date(date).toLocaleString('fr-FR') : 'N/A';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0) + ' FBU';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge bg="success"><FaLockOpen className="me-1" /> Ouverte</Badge>;
      case 'closed':
        return <Badge bg="danger"><FaLock className="me-1" /> Fermée</Badge>;
      case 'suspended':
        return <Badge bg="warning"><FaPause className="me-1" /> Suspendue</Badge>;
      default:
        return <Badge bg="secondary">Inconnu</Badge>;
    }
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
                <span>Gestion des Caisses</span>
                <div>
                  <Button 
                    variant="primary" 
                    className="me-2"
                    onClick={() => navigate('/cash-registers/create')}
                  >
                    <FaPlus className="me-1" /> Nouvelle Caisse
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => loadCashRegisters(currentPage, filters)}
                    disabled={loading}
                    title="Rafraîchir"
                  >
                    <FaSync className={loading ? 'fa-spin' : ''} />
                  </Button>
                </div>
              </Card.Title>
              <p className="card-category">{pagination.total} caisse(s) au total</p>
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
                          placeholder="Rechercher..."
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
                      <Form.Label>Statut</Form.Label>
                      <Form.Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <option value="">Tous les statuts</option>
                        <option value="open">Ouverte</option>
                        <option value="closed">Fermée</option>
                        <option value="suspended">Suspendue</option>
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

      {/* Cash Registers Table */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-items-center">
                  <thead className="text-primary">
                    <tr>
                      <th>Référence</th>
                      <th>Utilisateur</th>
                      <th>Agence</th>
                      <th>Solde</th>
                      <th>Statut</th>
                      <th>Ouverte le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashRegisters.length > 0 ? (
                      cashRegisters.map((cashRegister) => (
                        <tr key={cashRegister.id}>
                          <td>
                            <strong>{cashRegister.reference || 'N/A'}</strong>
                            {cashRegister.description && (
                              <div className="text-muted small">{cashRegister.description}</div>
                            )}
                          </td>
                          <td>{cashRegister.user?.name || 'N/A'}</td>
                          <td>{cashRegister.agency?.name || 'N/A'}</td>
                          <td className="fw-bold">{formatCurrency(cashRegister.balance)}</td>
                          <td>{getStatusBadge(cashRegister.status)}</td>
                          <td>{formatDateTime(cashRegister.opened_at)}</td>
                          <td>
                            <ButtonGroup size="sm">
                              <Button 
                                variant="primary" 
                                title="Voir"
                                onClick={() => navigate(`/cash-registers/${cashRegister.id}`)}
                              >
                                <FaEye />
                              </Button>
                              <Button 
                                variant="info" 
                                title="Modifier"
                                onClick={() => navigate(`/cash-registers/${cashRegister.id}/edit`)}
                                className="text-white"
                              >
                                <FaEdit />
                              </Button>
                              {cashRegister.status === 'open' && (
                                <Button 
                                  variant="warning" 
                                  title="Fermer la caisse"
                                  onClick={() => setCloseModal({ show: true, cashRegisterId: cashRegister.id })}
                                >
                                  <FaLock />
                                </Button>
                              )}
                              <Button 
                                variant="danger" 
                                title="Supprimer"
                                onClick={() => setDeleteModal({ show: true, cashRegisterId: cashRegister.id })}
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
                            <FaLock className="display-6 d-block mx-auto mb-2" />
                            <h5>Aucune caisse trouvée</h5>
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
                  onClick={() => setDeleteModal({ show: false, cashRegisterId: null })}
                ></button>
              </div>
              <div className="modal-body">
                Êtes-vous sûr de vouloir supprimer cette caisse ? Cette action est irréversible.
                <div className="alert alert-warning mt-3 mb-0">
                  <strong>Attention :</strong> La suppression d'une caisse peut affecter les données associées.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteModal({ show: false, cashRegisterId: null })}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteCashRegister(deleteModal.cashRegisterId)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Cash Register Confirmation Modal */}
      {closeModal.show && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmer la fermeture</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setCloseModal({ show: false, cashRegisterId: null })}
                ></button>
              </div>
              <div className="modal-body">
                Êtes-vous sûr de vouloir fermer cette caisse ? Cette action est irréversible.
                <div className="alert alert-warning mt-3 mb-0">
                  <strong>Attention :</strong> Une fois fermée, la caisse ne pourra plus être utilisée pour de nouvelles transactions.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setCloseModal({ show: false, cashRegisterId: null })}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning" 
                  onClick={() => handleCloseCashRegister(closeModal.cashRegisterId)}
                >
                  Fermer la caisse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default CashRegistersScreen;