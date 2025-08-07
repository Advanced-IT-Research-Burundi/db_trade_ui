import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { API_CONFIG } from '../../services/config.js';
import ApiService from '../../services/api.js';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import ImportHeader from './ImportHeader.jsx';
import { Table, Pagination, Container, Card, Badge, Form } from 'react-bootstrap';
import useFormat from '../../hooks/useFormat.js';
import { Link } from 'react-router-dom';

function CommandesListsScreen() {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const { data } = useSelector(state => ({
        data: state.apiData.data?.commandes
    }));
    
    const dispatch = useDispatch();
    const formatDate = useFormat().formatDate;

    useEffect(() => {
        loadCommandes(currentPage);
    }, [currentPage]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            loadCommandes(1); // reset to page 1 on search
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    function loadCommandes(page = 1, per_page = 10) {
        dispatch(fetchApiData({
            url: `${API_CONFIG.ENDPOINTS.COMMANDES}?page=${page}&per_page=${per_page}`,
            itemKey: 'commandes',
            params: { page, per_page, search }
        }));
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
            <div className="d-flex justify-content-center mt-4">
                <Pagination>{items}</Pagination>
            </div>
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
