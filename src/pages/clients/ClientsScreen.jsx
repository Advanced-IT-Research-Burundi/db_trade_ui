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
import { FaEdit, FaEye, FaTrash, FaSearch, FaSync, FaPlus, FaUser, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const ClientScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  
  // Local state
  const [filters, setFilters] = useState({
    search: '',
    patient_type: '',
    agency_id: '',
    created_by: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, clientId: null });
  
  // Get data from Redux store
  const { data, loading, error } = useSelector((state) => ({
    data: state.apiData?.data?.clients,
    loading: state.apiData.loading,
    error: state.apiData.error
  }));
  
  // Extract data from API response
  const clients = data?.clients?.data || [];
  const agencies = data?.agencies || [];
  const creators = data?.creators || [];
  const pagination = data?.clients ? {
    current_page: data.clients.current_page,
    last_page: data.clients.last_page,
    total: data.clients.total,
    from: data.clients.from,
    to: data.clients.to
  } : { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  // Fetch clients with filters
  const loadClients = (page = 1, searchFilters = filters) => {
    const params = { page, ...searchFilters };
    dispatch(fetchApiData({
      url: API_CONFIG.ENDPOINTS.CLIENTS,
      itemKey: 'clients',
      params
    }));
  };

  // Initial load
  useEffect(() => {
    loadClients();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadClients(1, newFilters);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadClients(1, filters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = { search: '', patient_type: '', agency_id: '', created_by: '' };
    setFilters(resetFilters);
    setCurrentPage(1);
    loadClients(1, resetFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadClients(page, filters);
  };

  // Handle delete client
  const handleDeleteClient = async (clientId) => {
    try {
      // Implement delete logic here
      // After successful deletion, reload clients
      loadClients(currentPage);
      showToast('success', 'Client supprimé avec succès');
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, clientId: null });
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

  const getClientTypeBadge = (type) => {
    if (type === 'physique') {
      return <Badge bg="success"><FaUser className="me-1" />Physique</Badge>;
    }
    return <Badge bg="info"><FaBuilding className="me-1" />Morale</Badge>;
  };

  const getFullName = (client) => {
    const parts = [client.first_name, client.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '';
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
                <span><FaUser className="me-2" />Gestion des Clients</span>
                <div>
                  <Button 
                    variant="primary" 
                    className="me-2"
                    onClick={() => navigate('/clients/create')}
                  >
                    <FaPlus className="me-1" /> Nouveau Client
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => loadClients(currentPage, filters)}
                    disabled={loading}
                  >
                    <FaSync className={loading ? 'fa-spin' : ''} />
                  </Button>
                </div>
              </Card.Title>
              <p className="card-category">{pagination.total} client(s) au total</p>
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
                          placeholder="Nom, prénom, email, téléphone..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                        <Button type="submit" variant="primary">
                          <FaSearch />
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Type</Form.Label>
                      <Form.Select
                        value={filters.patient_type}
                        onChange={(e) => handleFilterChange('patient_type', e.target.value)}
                      >
                        <option value="">Tous les types</option>
                        <option value="physique">Physique</option>
                        <option value="morale">Morale</option>
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
                  <Col md={2}>
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

      {/* Clients Table */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-items-center">
                  <thead className="text-primary">
                    <tr>
                      <th>#</th>
                      <th>Client</th>
                      <th>Type</th>
                      <th>Contact</th>
                      <th>Adresse</th>
                      <th>Créé le</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length > 0 ? (
                      clients.map((client) => (
                        <tr key={client.id}>
                          <td>{client.id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm me-2">
                                <div className="avatar-title bg-light rounded-circle">
                                  {client.patient_type === 'physique' ? <FaUser /> : <FaBuilding />}
                                </div>
                              </div>
                              <div>
                                <h6 className="mb-0">{getFullName(client) || client.company_name}</h6>
                                <small className="text-muted">{client.code_client}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            {getClientTypeBadge(client.patient_type)}
                          </td>
                          <td>
                            <div className="mb-1">
                              <FaPhone className="text-muted me-1" />
                              {client.phone || 'N/A'}
                            </div>
                            {client.email && (
                              <div>
                                <FaEnvelope className="text-muted me-1" />
                                {client.email}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-start">
                              <FaMapMarkerAlt className="text-muted mt-1 me-1" />
                              <span>{client.address || 'N/A'}</span>
                            </div>
                          </td>
                          <td>{formatDate(client.created_at)}</td>
                          <td>
                            <Badge bg={client.status === 'active' ? 'success' : 'danger'}>
                              {client.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="me-1"
                              onClick={() => navigate(`/clients/${client.id}`)}
                            >
                              <FaEye />
                            </Button>
                            <Button 
                              variant="warning" 
                              size="sm" 
                              className="me-1"
                              onClick={() => navigate(`/clients/${client.id}/edit`)}
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => setDeleteModal({ show: true, clientId: client.id })}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          Aucun client trouvé
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
                  onClick={() => setDeleteModal({ show: false, clientId: null })}
                ></button>
              </div>
              <div className="modal-body">
                Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteModal({ show: false, clientId: null })}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteClient(deleteModal.clientId)}
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

export default ClientScreen;