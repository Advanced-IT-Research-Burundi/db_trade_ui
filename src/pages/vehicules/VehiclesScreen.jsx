import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import { API_CONFIG } from '../../services/config';
import LoadingComponent from '../component/LoadingComponent';
import ErrorComponent from '../component/ErrorComponent';
import GlobalPagination from '../component/GlobalPagination';
import { Card, Table, Container, Row, Col, Form, Button, InputGroup, Badge, ButtonGroup } from 'react-bootstrap';
import { FaSearch, FaSync, FaTrash, FaEdit, FaEye, FaPlus, FaCar } from 'react-icons/fa';

const VehicleScreen = () => {
  const dispatch = useDispatch();
  const toast = useRef(null);
  
  // Local state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    brand: '',
    year: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ 
    show: false, 
    vehicleId: null, 
    vehicleInfo: null 
  });
  
  // Get data from Redux store
  const { data, loading, error } = useSelector((state) => ({
    data: state.apiData?.data?.vehicles,
    loading: state.apiData.loading,
    error: state.apiData.error
  }));
  
  // Extract data from API response
  const vehicles = data?.vehicules?.data || [];
 
  const brands = data?.brands || [];

  const years = Array.from({length: 30}, (_, i) => new Date().getFullYear() - i);
  
  const pagination = data?.vehicles ? {
    current_page: data.vehicles.current_page,
    last_page: data.vehicles.last_page,
    total: data.vehicles.total,
    from: data.vehicles.from,
    to: data.vehicles.to
  } : { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  // Load vehicles with filters
  const loadVehicles = (page = 1, searchFilters = filters) => {
    const params = { page, ...searchFilters };
    dispatch(fetchApiData({
      url: API_CONFIG.ENDPOINTS.VEHICLES,
      itemKey: 'vehicles',
      params
    }));
  };

  // Initial load
  useEffect(() => {
    loadVehicles();
    // Load additional data if needed (brands, etc.)
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadVehicles(1, newFilters);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadVehicles(1, filters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = { 
      search: '', 
      status: '', 
      brand: '', 
      year: '' 
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    loadVehicles(1, resetFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadVehicles(page, filters);
  };

  // Handle delete vehicle
  const handleDeleteVehicle = async (vehicleId) => {
    try {
      // TODO: Implémenter la suppression avec ApiService
      // Après la suppression, recharger les véhicules
      loadVehicles(currentPage);
      showToast('success', 'Véhicule supprimé avec succès');
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, vehicleId: null, vehicleInfo: null });
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
      available: { label: 'Disponible', variant: 'success' },
      rented: { label: 'Loué', variant: 'warning' },
      maintenance: { label: 'En maintenance', variant: 'danger' },
      reserved: { label: 'Réservé', variant: 'info' }
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
                <span>Gestion des Véhicules</span>
                <div>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => loadVehicles(currentPage, filters)}
                    disabled={loading}
                    title="Rafraîchir"
                    className="me-2"
                  >
                    <FaSync className={loading ? 'fa-spin' : ''} />
                  </Button>
                  <Button variant="primary" href="/vehicles/create">
                    <FaPlus className="me-1" /> Nouveau Véhicule
                  </Button>
                </div>
              </Card.Title>
              <p className="card-category">{pagination.total} véhicule(s) au total</p>
            </Card.Header>
            
            {/* Filters */}
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Rechercher</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Modèle, immatriculation..."
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
                      <Form.Label>Marque</Form.Label>
                      <Form.Select
                        value={filters.brand}
                        onChange={(e) => handleFilterChange('brand', e.target.value)}
                      >
                        <option value="">Toutes</option>
                        {brands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Année</Form.Label>
                      <Form.Select
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                      >
                        <option value="">Toutes</option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
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
                        <option value="available">Disponible</option>
                        <option value="rented">Loué</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="reserved">Réservé</option>
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

      {/* Vehicles Table */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-items-center">
                  <thead className="text-primary">
                    <tr>
                      <th>Véhicule</th>
                      <th>Détails</th>
                      <th>Statut</th>
                      <th>Prix/jour</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.length > 0 ? (
                      vehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <FaCar className="text-primary" size={30} />
                              </div>
                              <div>
                                <h6 className="mb-0">{vehicle.brand} {vehicle.model}</h6>
                                <small className="text-muted">
                                  {vehicle.registration_number}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="small text-muted">
                              <div>Année: {vehicle.year}</div>
                              <div>Type: {vehicle.type}</div>
                            </div>
                          </td>
                          <td>{getStatusBadge(vehicle.status)}</td>
                          <td>
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(vehicle.daily_rate || 0)}
                          </td>
                          <td>
                            <ButtonGroup size="sm">
                              <Button 
                                variant="info" 
                                title="Voir"
                                className="text-white"
                                href={`/vehicles/${vehicle.id}`}
                              >
                                <FaEye />
                              </Button>
                              <Button 
                                variant="warning" 
                                title="Modifier"
                                href={`/vehicles/${vehicle.id}/edit`}
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                variant="danger" 
                                title="Supprimer"
                                onClick={() => setDeleteModal({ 
                                  show: true, 
                                  vehicleId: vehicle.id, 
                                  vehicleInfo: `${vehicle.brand} ${vehicle.model} (${vehicle.registration_number})` 
                                })}
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
                            <FaCar className="display-6 d-block mx-auto mb-2" />
                            <h5>Aucun véhicule trouvé</h5>
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
                  onClick={() => setDeleteModal({ show: false, vehicleId: null, vehicleInfo: null })}
                ></button>
              </div>
              <div className="modal-body">
                Êtes-vous sûr de vouloir supprimer le véhicule <strong>{deleteModal.vehicleInfo}</strong> ?
                <div className="alert alert-warning mt-3 mb-0">
                  <strong>Attention :</strong> Cette action est irréversible et supprimera toutes les données associées à ce véhicule.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteModal({ show: false, vehicleId: null, vehicleInfo: null })}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteVehicle(deleteModal.vehicleId)}
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

export default VehicleScreen;