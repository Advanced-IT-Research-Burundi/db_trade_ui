import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import { API_CONFIG } from '../../services/config';
import LoadingComponent from '../component/LoadingComponent';
import ErrorComponent from '../component/ErrorComponent';
import GlobalPagination from '../component/GlobalPagination';
import { Card, Table, Container, Row, Col, Form, Button, InputGroup, Badge } from 'react-bootstrap';
import { FaEdit, FaEye, FaTrash, FaSearch, FaSync, FaPlus } from 'react-icons/fa';

const ProductScreen = () => {
  const dispatch = useDispatch();
  const toast = useRef(null);
  
  // Local state
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    agency_id: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, productId: null });
  
  // Get data from Redux store
  const { data, loading    } = useSelector((state) => ({
    data: state.apiData?.data?.products,
    loading: state.apiData.loading,
  }))
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  // Extract data from API response

  // Fetch products with filters
  const loadProducts = (page = 1, searchFilters = filters) => {
    const params = { page, ...searchFilters };
    dispatch(fetchApiData({
      url: API_CONFIG.ENDPOINTS.PRODUCTS,
      itemKey: 'products',
      params
    }));

   

  };

  // Initial load
  useEffect(() => {
    loadProducts();
  }, []);
  useEffect(() => {
   
    if(data){
      setProducts(data?.products?.data || []);
      setCategories(data?.categories || []);
      setAgencies(data?.agencies || []);
      setPagination({
        current_page: data?.products?.current_page,
        last_page: data?.products?.last_page,
        total: data?.products?.total,
        from: data?.products?.from,
        to: data?.products?.to
      });
    }
  }, [data]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadProducts(1, newFilters);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts(1, filters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = { search: '', category_id: '', agency_id: '' };
    setFilters(resetFilters);
    setCurrentPage(1);
    loadProducts(1, resetFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadProducts(page, filters);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId) => {
    try {
      // Implement delete logic here
      // After successful deletion, reload products
      loadProducts(currentPage);
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, productId: null });
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FBU';
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `/storage/${imagePath}`;
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
                <span>Gestion des Produits</span>
                <div>
                  <Button variant="primary" className="me-2">
                    <FaPlus className="me-1" /> Nouveau Produit
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => loadProducts(currentPage, filters)}
                    disabled={loading}
                  >
                    <FaSync className={loading ? 'fa-spin' : ''} />
                  </Button>
                </div>
              </Card.Title>
              <p className="card-category">{pagination.total} produit(s) au total</p>
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
                          placeholder="Nom, référence..."
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
                      <Form.Label>Catégorie</Form.Label>
                      <Form.Select
                        value={filters.category_id}
                        onChange={(e) => handleFilterChange('category_id', e.target.value)}
                      >
                        <option value="">Toutes les catégories</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
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
                    >
                      Réinitialiser
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Products Table */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-items-center">
                  <thead className="text-primary">
                    <tr>
                      <th>Image</th>
                      <th>Référence</th>
                      <th>Désignation</th>
                      <th>Catégorie</th>
                      <th>Prix</th>
                      <th>Stock</th>
                      <th>Statut</th>
                      <th>Date création</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            {product.image && (
                              <img 
                                src={getImageUrl(product.image)} 
                                alt={product.name}
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                className="rounded"
                              />
                            )}
                          </td>
                          <td>{product.code}</td>
                          <td>{truncateText(product.name, 30)}</td>
                          <td>{product.category?.name || 'N/A'}</td>
                          <td>{formatCurrency(product.price || 0)}</td>
                          <td>{product.stock_quantity || 0}</td>
                          <td>
                            <Badge bg={product.status === 'active' ? 'success' : 'danger'}>
                              {product.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td>{formatDate(product.created_at)}</td>
                          <td>
                            <Button variant="primary" size="sm" className="me-1">
                              <FaEye />
                            </Button>
                            <Button variant="warning" size="sm" className="me-1">
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => setDeleteModal({ show: true, productId: product.id })}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center">
                          Aucun produit trouvé
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
                  onClick={() => setDeleteModal({ show: false, productId: null })}
                ></button>
              </div>
              <div className="modal-body">
                Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteModal({ show: false, productId: null })}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteProduct(deleteModal.productId)}
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

export default ProductScreen;