import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { API_CONFIG } from '../../services/config.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useNavigate, Link } from 'react-router-dom';
import ImportHeader  from './ImportHeader.jsx';
import useFormat from '../../hooks/useFormat.js';



const CommandesListsScreen = () => {
  const [commandes, setCommandes] = useState([]);
  const [filters, setFilters] = useState({
    search: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, commandeId: null });
  const toast = useRef(null);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { data, loading } = useSelector(state => state.apiData);
  const formatDate = useFormat().formatDate;

  useEffect(() => {
    loadCommandes();
  }, []);

  useEffect(() => {
    if (data.commandes) {
      setCommandes(data.commandes.data || []);
      setPagination({
        current_page: data.commandes.current_page,
        last_page: data.commandes.last_page,
        total: data.commandes.total,
        from: data.commandes.from,
        to: data.commandes.to
      });
    }
  }, [data]);

  // Debounced search effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (filters.search !== '') {
        loadCommandes(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [filters.search]);

  async function loadCommandes(page = 1, per_page = 10) {
    try {
      const params = { page, per_page, ...filters };
      dispatch(fetchApiData({ 
        url: API_CONFIG.ENDPOINTS.COMMANDES, 
        itemKey: 'commandes', 
        params 
      }));
    } catch (error) {
      showToast('error', error.message);
    }

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPagination = () => {
        if (!data || !data.data || data.data.length === 0) return null;

        const items = [];
        const totalPages = data.last_page || 1;
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        items.push(
            <Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
        );
        items.push(
            <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
        );

        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                    {page}
                </Pagination.Item>
            );
        }

        items.push(
            <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        );
        items.push(
            <Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
        );

    return (
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadCommandes(pagination.current_page - 1)} 
              disabled={pagination.current_page === 1}
            >
              <i className="pi pi-chevron-left"></i>
            </button>
          </li>
          
          {getVisiblePages().map((page, index) => (
            <li key={index} className={`page-item ${page === pagination.current_page ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button className="page-link" onClick={() => loadCommandes(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadCommandes(pagination.current_page + 1)} 
              disabled={pagination.current_page === pagination.last_page}
            >
              <i className="pi pi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

    return (
        <Container fluid className="py-4">
            <ImportHeader />
            <h2 className="mb-4">Liste des Commandes</h2>
            
            <Card>
                <Card.Header className="bg-primary text-white">
                    <div className="d-flex justify-content-between flex-wrap gap-2 align-items-center">
                        <span className="fw-bold fs-5">Commandes enregistrées</span>
                        <Badge bg="light" text="primary">
                            {data?.total || 0} commande(s)
                        </Badge>
                    </div>
                    <Form className="mt-3">
                        <Form.Control
                            type="search"
                            placeholder="🔍 Rechercher une commande (matricule, poids...)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Form>
                </Card.Header>

                <Card.Body>
                    { !data?.data || data.data.length === 0 ? (
                        <div className="text-center py-5">
                            <p>Aucune commande trouvée</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <Table responsive striped bordered hover className="align-middle shadow-sm">
                                    <thead className="table-dark text-center">
                                        <tr>
                                            <th>#</th>
                                            <th>Date</th>
                                            <th>Véhicule</th>
                                            <th>Immatriculation</th>
                                            <th>Poids</th>
                                            <th>Commentaire</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-center">
                                        {data.data.map((commande) => (
                                            <tr key={commande.id}>
                                                <td>{commande.id}</td>
                                                <td>{formatDate(commande.created_at)}</td>
                                                <td>{commande.vehicule || 'N/A'}</td>
                                                <td>
                                                    <Badge bg="secondary">{commande.matricule}</Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={commande.poids > 1000 ? 'danger' : 'success'}>
                                                        {commande.poids} kg
                                                    </Badge>
                                                </td>
                                                <td>{commande.commentaire || <em>Aucun</em>}</td>
                                                <td></td>
                                                <td>
                                                    <Link to={`/commandes/${commande.id}`} className="btn btn-outline-primary btn-sm">
                                                        <i className="bi bi-eye me-1"></i>Afficher
                                                    </Link>
                                                    <Link to={`/depenses/${commande.id}`} className="btn btn-outline-primary btn-sm">
                                                        Depenses
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                    Affichage de <strong>{data.from}</strong> à <strong>{data.to}</strong> sur <strong>{data.total}</strong> commandes
                                </div>
                                {renderPagination()}
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default CommandesListsScreen;