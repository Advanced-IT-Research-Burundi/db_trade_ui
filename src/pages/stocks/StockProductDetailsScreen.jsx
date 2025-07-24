import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchApiData } from "../../stores/slicer/apiDataSlicer";
import { useParams } from "react-router-dom";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TextField, Button, Box, Typography, TablePagination, IconButton,
  Tooltip
} from "@mui/material";
import { Download as DownloadIcon, PictureAsPdf as PdfIcon } from "@mui/icons-material";
import * as XLSX from 'xlsx';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function StockProductDetailsScreen() {
    const stockId = useParams().id;
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const dispatch = useDispatch();
    const { data, loading } = useSelector((state) => ({
        data: state.apiData?.data?.STOCK_PRODUCTS,
        loading: state.apiData?.loading
    }));
    
    useEffect(() => {
        loadData();
    }, [stockId, search, page + 1, rowsPerPage]);

    function loadData() {
        dispatch(fetchApiData({ 
            url: `/api/stock-products`,
            itemKey: "STOCK_PRODUCTS",
            params: { 
                stock_id: stockId,
                per_page: rowsPerPage,
                page: page + 1,
                search: search 
            }
        }));
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data?.stock_products?.data || []);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stock Products");
        XLSX.writeFile(wb, `stock_products_${new Date().toISOString().split('T')[0]}.xlsx`);
    };


    const exportToPdf = () => {
        try {
            const doc = new jsPDF();        
            doc.text("Hello world!", 10, 10);    
            doc.save(`stock_products_${new Date().toISOString().split('T')[0]}.pdf`);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };
   
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">Détails du Stock</Typography>
                
                <Box>
                    <Tooltip title="Exporter en Excel">
                        <IconButton onClick={exportToExcel} color="primary">
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Exporter en PDF">
                        <IconButton onClick={exportToPdf} color="error">
                            <PdfIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            
            <TextField
                label="Rechercher un produit"
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
                fullWidth
            />
          

            <TableContainer component={Paper}>
                <Table  sx={{ minWidth: 650 }} size="small" aria-label="a dense table" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>ID</StyledTableCell>
                            <StyledTableCell>CODE</StyledTableCell>
                            <StyledTableCell>Catégorie</StyledTableCell>
                            <StyledTableCell>Product Name</StyledTableCell>
                            <StyledTableCell align="right">Quantity</StyledTableCell>
                            <StyledTableCell align="right">Montant (TTC)</StyledTableCell>
                            <StyledTableCell align="right">Valeur du Stock</StyledTableCell>
                            <StyledTableCell>Dernière mise à jour</StyledTableCell>
                            <StyledTableCell>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.stock_products?.data?.map((item) => (
                            <TableRow key={item.id}>
                                <StyledTableCell >{item.id}</StyledTableCell>
                                <StyledTableCell>{item.product?.code || '-'}</StyledTableCell>
                                <StyledTableCell>{item.category?.name || '-'}</StyledTableCell>
                                <StyledTableCell>{item.product_name}</StyledTableCell>
                                <StyledTableCell align="right">{item.quantity}</StyledTableCell>
                                <StyledTableCell align="right">{item.sale_price_ttc?.toLocaleString() || '0'}</StyledTableCell>
                                <StyledTableCell align="right">
                                    {((item.quantity || 0) * (item.sale_price_ttc || 0)).toLocaleString()}
                                </StyledTableCell>
                                <StyledTableCell>{new Date(item.updated_at).toLocaleDateString()}</StyledTableCell>
                                <StyledTableCell>
                                    {/* Add action buttons here */}
                                    <Button size="small" color="primary">
                                        Détails
                                    </Button>
                                </StyledTableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50, 100 , 200,300,500,1000]}
                component="div"
                count={data?.total || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} sur ${count !== -1 ? count : `plus que ${to}`}`
                }
            />
        </Box>
    );
}