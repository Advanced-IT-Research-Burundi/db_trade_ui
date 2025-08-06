import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { API_CONFIG } from '../../services/config.js';
import ApiService from '../../services/api.js';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import ImportHeader from './ImportHeader.jsx';
import { Table, Pagination, Container, Card, Badge } from 'react-bootstrap';
import useFormat from '../../hooks/useFormat.js';
import { Link } from 'react-router-dom';


function CommandesListsScreen() {
    const [currentPage, setCurrentPage] = useState(1);
    const { data, loading } = useSelector(state => ({
        data: state.apiData.data?.commandes,
        loading: state.apiData.loading
    }));
    
    const dispatch = useDispatch();

    useEffect(() => {
        loadCommandes(currentPage);
    }, [currentPage]);

    function loadCommandes(page = 1, per_page = 10) {
        dispatch(fetchApiData({
            url: `${API_CONFIG.ENDPOINTS.COMMANDES}?page=${page}&per_page=${per_page}`,
            itemKey: 'commandes',
            params: { page, per_page }
        }));
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatDate = useFormat().formatDate;

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

        // Previous button
        items.push(
            <Pagination.First 
                key="first" 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1} 
            />
        );
        items.push(
            <Pagination.Prev 
                key="prev" 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1} 
            />
        );

        // Page numbers
        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <Pagination.Item 
                    key={page} 
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                >
                    {page}
                </Pagination.Item>
            );
        }

        // Next button
        items.push(
            <Pagination.Next 
                key="next" 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages} 
            />
        );
        items.push(
            <Pagination.Last 
                key="last" 
                onClick={() => handlePageChange(totalPages)} 
                disabled={currentPage === totalPages} 
            />
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
                    <div className="d-flex justify-content-between align-items-center">
                        <span>Commandes enregistrées</span>
                        <Badge bg="light" text="primary">
                            {data?.total || 0} commande(s) au total
                        </Badge>
                    </div>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="mt-2">Chargement des commandes...</p>
                        </div>
                    ) : !data?.data || data.data.length === 0 ? (
                        <div className="text-center py-5">
                            <p>Aucune commande trouvée</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <Table striped bordered hover className="align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>#</th>
                                            <th>Date de création</th>
                                            <th>Véhicule</th>
                                            <th>Immatriculation</th>
                                            <th>Poids (kg)</th>
                                            <th>Commentaire</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.data.map((commande, index) => (
                                            <tr key={commande.id}>
                                                <td>{data.from + index}</td>
                                                <td>{formatDate(commande.created_at)}</td>
                                                <td>{commande.matricule}</td>
                                                <td>
                                                    <Badge bg="info">
                                                        {commande.matricule}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={commande.poids > 1000 ? 'danger' : 'success'}>
                                                        {commande.poids} kg
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {commande.commentaire || 'Aucun commentaire'}
                                                </td>
                                                <td>
                                                    <Link to={`/commandes/${commande.id}`}>
                                                        <i className="bi bi-eye"></i>
                                                        Afficher 
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