import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import { API_CONFIG } from '../../services/config';
import LoadingComponent from '../component/LoadingComponent';
import GlobalPagination from '../component/GlobalPagination';
import { Card, Table, Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { FaEdit, FaEye, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';

const StockScreen = () => {
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
 
    const stocksData = useSelector((state) => state.apiData?.data?.stocks?.stocks);
    const stocks = stocksData?.data || [];
    const pagination = stocksData ? {
        currentPage: stocksData.current_page,
        lastPage: stocksData.last_page,
        total: stocksData.total,
        from: stocksData.from,
        to: stocksData.to
    } : null;

    const fetchStocks = (page = 1, search = '') => {
        let url = `${API_CONFIG.ENDPOINTS.STOCKS}?page=${page}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        dispatch(fetchApiData({ 
            url,
            itemKey: 'stocks' 
        }));
    };

    useEffect(() => {
        fetchStocks(currentPage, searchTerm);
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Clear previous timeout
        if (searchTimeout) clearTimeout(searchTimeout);
        
        // Set a new timeout
        setSearchTimeout(
            setTimeout(() => {
                setCurrentPage(1); // Reset to first page on new search
                fetchStocks(1, value);
            }, 500) // 500ms delay before searching
        );
    };

    const clearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchStocks(1, '');
    };


   
    return (
        <Container fluid>
            <Row>
                <Col md={12}>
                    <Card className="card-plain">
                        <Card.Header>
                            <Card.Title as="h4" className="d-flex justify-content-between align-items-center">
                                <span>Liste des Stocks</span>

                                <LoadingComponent />
                                <div className="search-wrapper">
                                    <InputGroup style={{ maxWidth: '300px' }}>
                                        <Form.Control
                                            type="text"
                                            placeholder="Rechercher un stock..."
                                            value={searchTerm}
                                            onChange={handleSearch}
                                        />
                                        <Button 
                                            variant="outline-secondary" 
                                            onClick={clearSearch}
                                            disabled={!searchTerm}
                                        >
                                            <FaTimes />
                                        </Button>
                                        <Button variant="primary">
                                            <FaSearch />
                                        </Button>
                                    </InputGroup>
                                </div>
                            </Card.Title>
                            <p className="card-category">
                                Gestion des stocks de l'entreprise
                            </p>
                        </Card.Header>
                        <Card.Body>
                            <Table className="tablesorter" responsive>
                                <thead className="text-primary">
                                    <tr>
                                        <th>ID</th>
                                        <th>Nom</th>
                                        <th>Localisation</th>
                                        <th>Agence</th>
                                        <th>Créé par</th>
                                        <th>Date de création</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stocks.length > 0 ? (
                                        stocks.map((stock) => (
                                            <tr key={stock.id}>
                                                <td>{stock.id}</td>
                                                <td>{stock.name}</td>
                                                <td>{stock.location}</td>
                                                <td>{stock.agency?.name || 'N/A'}</td>
                                                <td>{stock.created_by?.name || 'N/A'}</td>
                                                <td>{new Date(stock.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <Button variant="primary" size="sm">
                                                        <FaEdit />
                                                     </Button>
                                                    <Button variant="warning" size="sm">
                                                        <FaEye />
                                                     </Button>
                                                    <Button variant="danger" size="sm">
                                                        <FaTrash />
                                                     </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">
                                                Aucun stock trouvé
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            
                            {pagination && pagination.lastPage > 1 && (
                                <div className="mt-4">
                                    <GlobalPagination
                                        currentPage={pagination.currentPage}
                                        lastPage={pagination.lastPage}
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
        </Container>
    );
};

export default StockScreen;