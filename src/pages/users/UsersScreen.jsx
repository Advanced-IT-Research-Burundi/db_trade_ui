import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import { API_CONFIG } from '../../services/config';
import LoadingComponent from '../component/LoadingComponent';
import ErrorComponent from '../component/ErrorComponent';
import GlobalPagination from '../component/GlobalPagination';
import { Card, Table, Container, Row, Col, Form, Button, InputGroup, Badge, Image, ButtonGroup } from 'react-bootstrap';
import { FaEdit, FaEye, FaTrash, FaSearch, FaSync, FaPlus, FaUser, FaBuilding, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';

const UserScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  
  // Local state
  const [filters, setFilters] = useState({
    search: '',
    company_id: '',
    agency_id: '',
    role: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null });
  
  // Get data from Redux store
  const { data, loading } = useSelector((state) => ({
    data: state.apiData?.data?.users,
    loading: state.apiData.loading,
  }));
  
  // Extract data from API response
  const users = data?.users?.data || [];
  const companies = data?.companies || [];
  const agencies = data?.agencies || [];
  const roles = data?.roles || [];
  const statuses = data?.statuses || [];
  
  const pagination = data?.users ? {
    current_page: data.users.current_page,
    last_page: data.users.last_page,
    total: data.users.total,
    from: data.users.from,
    to: data.users.to
  } : { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };

  // Fetch users with filters
  const loadUsers = (page = 1, searchFilters = filters) => {
    const params = { page, ...searchFilters };
    dispatch(fetchApiData({
      url: API_CONFIG.ENDPOINTS.USERS,
      itemKey: 'users',
      params
    }));
  };

  // Initial load
  useEffect(() => {
    loadUsers();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadUsers(1, newFilters);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers(1, filters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = { search: '', company_id: '', agency_id: '', role: '', status: '' };
    setFilters(resetFilters);
    setCurrentPage(1);
    loadUsers(1, resetFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadUsers(page, filters);
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    try {
      // Implement delete logic here
      // After successful deletion, reload users
      loadUsers(currentPage);
      showToast('success', 'Utilisateur supprimé avec succès');
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, userId: null });
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

  const getFullName = (user) => {
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'N/A';
  };

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `/storage/${imagePath}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Actif</Badge>;
      case 'inactive':
        return <Badge bg="secondary">Inactif</Badge>;
      case 'suspended':
        return <Badge bg="danger">Suspendu</Badge>;
      default:
        return <Badge bg="secondary">Inconnu</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      'admin': 'danger',
      'manager': 'warning',
      'employee': 'info',
      'user': 'primary'
    };
    const color = roleColors[role?.toLowerCase()] || 'secondary';
    return <Badge bg={color}>{role ? role.charAt(0).toUpperCase() + role.slice(1) : 'N/A'}</Badge>;
  };

  const getLastLoginText = (lastLogin) => {
    if (!lastLogin) return 'Jamais connecté';
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffTime = Math.abs(now - loginDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return formatDate(lastLogin);
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
                <span><FaUser className="me-2" />Gestion des Utilisateurs</span>
                <div>
                  <Button 
                    variant="primary" 
                    className="me-2"
                    onClick={() => navigate('/users/create')}
                  >
                    <FaPlus className="me-1" /> Nouvel Utilisateur
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => loadUsers(currentPage, filters)}
                    disabled={loading}
                    title="Rafraîchir"
                  >
                    <FaSync className={loading ? 'fa-spin' : ''} />
                  </Button>
                </div>
              </Card.Title>
              <p className="card-category">{pagination.total} utilisateur(s) au total</p>
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
                          placeholder="Nom, email, téléphone..."
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
                      <Form.Label>Société</Form.Label>
                      <Form.Select
                        value={filters.company_id}
                        onChange={(e) => handleFilterChange('company_id', e.target.value)}
                      >
                        <option value="">Toutes les sociétés</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
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
                      <Form.Label>Rôle</Form.Label>
                      <Form.Select
                        value={filters.role}
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                      >
                        <option value="">Tous les rôles</option>
                        {roles.map(role => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Statut</Form.Label>
                      <Form.Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <option value="">Tous les statuts</option>
                        {statuses.map(status => (
                          <option key={status} value={status}>
                            {status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'Suspendu'}
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

      {/* Users Table */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-items-center">
                  <thead className="text-primary">
                    <tr>
                      <th>Utilisateur</th>
                      <th>Contact</th>
                      <th>Société/Agence</th>
                      <th>Rôle</th>
                      <th>Dernière connexion</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm me-3">
                                {user.profile_photo_path ? (
                                  <Image 
                                    src={getProfileImageUrl(user.profile_photo_path)} 
                                    alt={getFullName(user)}
                                    roundedCircle 
                                    className="avatar"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="avatar-title bg-light rounded-circle">
                                    <FaUser />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h6 className="mb-0">{getFullName(user)}</h6>
                                <small className="text-muted">{user.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="mb-1">
                              <FaEnvelope className="text-muted me-1" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div>
                                <FaPhone className="text-muted me-1" />
                                {user.phone}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="mb-1">
                              <FaBuilding className="text-muted me-1" />
                              {user.company?.name || 'N/A'}
                            </div>
                            <small className="text-muted">
                              {user.agency?.name || 'Aucune agence'}
                            </small>
                          </td>
                          <td>{getRoleBadge(user.role)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaCalendarAlt className="text-muted me-1" />
                              {getLastLoginText(user.last_login_at)}
                            </div>
                          </td>
                          <td>{getStatusBadge(user.status)}</td>
                          <td>
                            <ButtonGroup size="sm">
                              <Button 
                                variant="primary" 
                                title="Voir"
                                onClick={() => navigate(`/users/${user.id}`)}
                              >
                                <FaEye />
                              </Button>
                              <Button 
                                variant="warning" 
                                title="Modifier"
                                onClick={() => navigate(`/users/${user.id}/edit`)}
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                variant="danger" 
                                title="Supprimer"
                                onClick={() => setDeleteModal({ show: true, userId: user.id })}
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
                            <FaUser className="display-6 d-block mx-auto mb-2" />
                            <h5>Aucun utilisateur trouvé</h5>
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
                  onClick={() => setDeleteModal({ show: false, userId: null })}
                ></button>
              </div>
              <div className="modal-body">
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
                <div className="alert alert-warning mt-3 mb-0">
                  <strong>Attention :</strong> La suppression d'un utilisateur peut affecter les données associées.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteModal({ show: false, userId: null })}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteUser(deleteModal.userId)}
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

export default UserScreen;