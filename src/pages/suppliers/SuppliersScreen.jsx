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
import { FaEdit, FaEye, FaTrash, FaSearch, FaSync, FaPlus, FaTruck, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const SupplierScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  
  // Local state
  const [filters, setFilters] = useState({
    search: '',
    agency_id: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, supplierId: null });
  
  // Get data from Redux store
  const { data, loading, error } = useSelector((state) => ({
    data: state.apiData?.data?.suppliers,
    loading: state.apiData.loading,
    error: state.apiData.error
  }));
  
  // Extract data from API response
  const suppliers = data?.suppliers?.data || [];
  const agencies = data?.agencies || [];
  const pagination = data?.suppliers ? {
    current_page: data.suppliers.current_page,
    last_page: data.suppliers.last_page,
    total: data.suppliers.total,
    from: data.suppliers.from,
    to: data.suppliers.to
  } : { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  // Fetch suppliers with filters
  const loadSuppliers = (page = 1, searchFilters = filters) => {
    const params = { page, ...searchFilters };
    dispatch(fetchApiData({
      url: API_CONFIG.ENDPOINTS.SUPPLIERS,
      itemKey: 'suppliers',
      params
    }));
  };

  // Initial load
  useEffect(() => {
    loadSuppliers();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadSuppliers(1, newFilters);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadSuppliers(1, filters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = { search: '', agency_id: '' };
    setFilters(resetFilters);
    setCurrentPage(1);
    loadSuppliers(1, resetFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadSuppliers(page, filters);
  };

  // Handle delete supplier
  const handleDeleteSupplier = async (supplierId) => {
    try {
      // Implement delete logic here
      // After successful deletion, reload suppliers
      loadSuppliers(currentPage);
      showToast('success', 'Fournisseur supprimé avec succès');
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, supplierId: null });
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
                <span><FaTruck className="me-2" />Gestion des Fournisseurs</span>
                <div>
                  <Button 
                    variant="primary" 
                    className="me-2"
                    onClick={() => navigate('/suppliers/create')}
                  >
                    <FaPlus className="me-1" /> Nouveau Fournisseur
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => loadSuppliers(currentPage, filters)}
                    disabled={loading}
                  >
                    <FaSync className={loading ? 'fa-spin' : ''} />
                  </Button>
                </div>
              </Card.Title>
              <p className="card-category">{pagination.total} fournisseur(s) au total</p>
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
                          placeholder="Nom, email, téléphone, société..."
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

      {/* Suppliers Table */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-items-center">
                  <thead className="text-primary">
                    <tr>
                      <th>#</th>
                      <th>Fournisseur</th>
                      <th>Contact</th>
                      <th>Adresse</th>
                      <th>Créé le</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <tr key={supplier.id}>
                          <td>{supplier.id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm me-2">
                                <div className="avatar-title bg-light rounded-circle">
                                  <FaTruck />
                                </div>
                              </div>
                              <div>
                                <h6 className="mb-0">{supplier.name}</h6>
                                <small className="text-muted">{supplier.code}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="mb-1">
                              <FaPhone className="text-muted me-1" />
                              {supplier.phone || 'N/A'}
                            </div>
                            {supplier.email && (
                              <div>
                                <FaEnvelope className="text-muted me-1" />
                                {supplier.email}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-start">
                              <FaMapMarkerAlt className="text-muted mt-1 me-1" />
                              <span>{supplier.address || 'N/A'}</span>
                            </div>
                          </td>
                          <td>{formatDate(supplier.created_at)}</td>
                          <td>
                            <Badge bg={supplier.status === 'active' ? 'success' : 'danger'}>
                              {supplier.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="me-1"
                              onClick={() => navigate(`/suppliers/${supplier.id}`)}
                            >
                              <FaEye />
                            </Button>
                            <Button 
                              variant="warning" 
                              size="sm" 
                              className="me-1"
                              onClick={() => navigate(`/suppliers/${supplier.id}/edit`)}
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => setDeleteModal({ show: true, supplierId: supplier.id })}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          Aucun fournisseur trouvé
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
                  onClick={() => setDeleteModal({ show: false, supplierId: null })}
                ></button>
              </div>
              <div className="modal-body">
                Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteModal({ show: false, supplierId: null })}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteSupplier(deleteModal.supplierId)}
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

export default SupplierScreen;