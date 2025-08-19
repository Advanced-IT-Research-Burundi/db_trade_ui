import React, { useEffect, useState } from 'react';
import ImportHeader from './ImportHeader.jsx';
import { useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import { API_CONFIG } from '../../services/config';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
  Stack,
  Chip,
  Container,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import useFormat from '../../hooks/useFormat.js';
import FilterListIcon from '@mui/icons-material/FilterList';

function BonEntreScreen() {
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    
    const { data } = useSelector((state) => ({
        data: state.apiData?.data?.bonEntre
    }));
    
    const dispatch = useDispatch();
    const { formatDate } = useFormat();
    const navigate = useNavigate();
    
    useEffect(() => {
        loadBonEntre(currentPage);
    }, [currentPage, startDate, endDate]);
    
    function loadBonEntre(page = 1) {
        setLoading(true);
        setError(null);
        
        let url = `${API_CONFIG.ENDPOINTS.BON_ENTRE}?page=${page}`;
        
        if (startDate) {
            url += `&start_date=${formatDate(startDate, 'yyyy-MM-dd')}`;
        }
        
        if (endDate) {
            url += `&end_date=${formatDate(endDate, 'yyyy-MM-dd')}`;
        }
        
        dispatch(fetchApiData({
            url,
            itemKey: 'bonEntre'
        }))
        .unwrap()
        .catch(err => {
            setError('Erreur lors du chargement des données');
            console.error('Error loading data:', err);
        })
        .finally(() => setLoading(false));
    }

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handleResetFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setCurrentPage(1);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <ImportHeader />
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h1">
                        Historique des bons d'entrée
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filtres
                    </Button>
                </Box>
                
                {showFilters && (
                    <Card sx={{ mb: 3, p: 2 }}>
                        <Box display="flex" gap={2} flexWrap="wrap">
                            <DatePicker
                                label="Date de début"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} size="small" />
                                )}
                            />
                            <DatePicker
                                label="Date de fin"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} size="small" />
                                )}
                            />
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleResetFilters}
                                sx={{ ml: 'auto' }}
                            >
                                Réinitialiser
                            </Button>
                        </Box>
                    </Card>
                )}
                
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}
                
                <Card elevation={3}>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer component={Paper} elevation={0}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Véhicule</TableCell>
                                        <TableCell>Poids</TableCell>
                                        <TableCell>Statut</TableCell>
                                        <TableCell>Date de création</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                                <CircularProgress />
                                            </TableCell>
                                        </TableRow>
                                    ) : data?.data?.length > 0 ? (
                                        data.data.map((item) => (
                                            <TableRow key={item.id} hover>
                                                <TableCell>{item.id}</TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Box>{item.matricule}</Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{item.poids} kg</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={item.status === 'approved' ? 'Approuvé' : item.status}
                                                        color={item.status === 'approved' ? 'success' : 'warning'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(new Date(item.created_at))}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => navigate(`/bon-entree/${item.id}`)}
                                                    >
                                                        Voir
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                <Typography color="textSecondary">
                                                    Aucune donnée disponible
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        
                        {data?.data?.length > 0 && (
                            <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
                                <Typography variant="body2" color="textSecondary">
                                    Total: {data?.total || 0} entrées
                                </Typography>
                                <Stack spacing={2}>
                                    <Pagination
                                        count={data?.last_page || 1}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                        color="primary"
                                        showFirstButton
                                        showLastButton
                                    />
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </LocalizationProvider>
    );
}

export default BonEntreScreen;