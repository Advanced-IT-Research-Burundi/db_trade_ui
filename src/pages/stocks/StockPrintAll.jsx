import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import ubwiza from '../../assets/logo/ubwiza.png';
import logoUbwiza from '../../assets/logo/logo.png';
import usePrint from '../../hooks/usePrint';
import { Button } from 'react-bootstrap';
import './style/StockPrintAll.css';
import useFormat from '../../hooks/useFormat';

const printStyles = `
        @media print {
            .no-print {
                display: none !important;
            }
            
            .card {
                box-shadow: none !important;
                border: none !important;
            }
            
            body {
                margin: 0;
                padding: 0;
            }
            
            #rapport-annuel {
                margin: 0;
                padding: 0;
            }
            
            .print-table {
                page-break-inside: auto;
            }
            
            .print-table tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            
            .print-table thead {
                display: table-header-group;
            }
            
            .print-table tbody {
                display: table-row-group;
            }
        }
        
        .print-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #333;
            font-size: 12px;
        }
        
        .print-table th,
        .print-table td {
            border: 1px solid #666;
            padding: 8px;
            text-align: left;
            vertical-align: middle;
        }
        
        .print-table th {
            background-color: #4a5568;
            color: white;
            font-weight: bold;
            text-align: center;
        }
        
        .print-table tbody tr:nth-child(odd) {
            background-color: #f7fafc;
        }
        
        .print-table tbody tr:nth-child(even) {
            background-color: #edf2f7;
        }
        
        .print-table tbody tr:hover {
            background-color: #e2e8f0;
        }
        
        .total-row {
            background-color: #2d3748 !important;
            color: white !important;
            font-weight: bold;
        }
        
        .total-row td {
            border-top: 3px solid #333;
        }
        
        .print-buttons {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
        }
        
        .print-buttons button {
            margin-right: 10px;
        }
        
        @media print {
            .print-table tbody tr:nth-child(odd) {
                background-color: #f0f0f0 !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .print-table tbody tr:nth-child(even) {
                background-color: #ffffff !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .print-table th {
                background-color: #333333 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .total-row {
                background-color: #333333 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
    `;

function StockPrintAll() {
    const stockId = useParams().id;
    const dispatch = useDispatch();
    const { print, generatePdf } = usePrint();
    const { formatNumber } = useFormat();

    const { data } = useSelector((state) => ({
        data: state.apiData?.data?.STOCK_PRODUCTS_PRINT,
    }));

    useEffect(() => {
        loadData();
    }, [stockId]);

    function loadData() {
        dispatch(fetchApiData({
            url: `/api/stock-products`,
            itemKey: "STOCK_PRODUCTS_PRINT",
            params: {
                stock_id: stockId,
                per_page: 2000,
            }
        }));
    }

    const totalStockValue = data?.stock_products?.data?.reduce((total, product) => total + (product.product?.sale_price * product.quantity), 0);

    // Groupe Data by categories

    const groupedData = data?.stock_products?.data?.reduce((acc, product) => {
        if (!acc[product?.product?.category?.name]) {
            acc[product?.product?.category?.name] = [];
        }
        acc[product?.product?.category?.name].push(product);
        return acc;
    }, {});
    
    let counterLine = 1;
    return (
        <div className="print-wrapper">
            <Button variant="primary" onClick={() => print("stock-product-details")}>Imprimer</Button>
            <Button variant="primary" onClick={() => generatePdf("stock-product-details")}>Télécharger PDF</Button>

            <div id="stock-product-details" className=""
                style={{
                    position: 'relative'
                }}>
                
                <style>
                    {printStyles}
                </style>
                <div className="header-section">
                    <div>
                    <img src={ubwiza} alt="ubwiza" className="logo" style={{ width: '400px' }} />
                    </div>
                    <div>
                        <h2>STOCK : {data?.stock?.name}</h2>
                        <p>{data?.stock?.location}</p>
                    </div>
                </div>

                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${logoUbwiza})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'repeat',
                    backgroundPosition: 'center',
                    opacity: 0.15,
                    zIndex: 1
                }}>

                </div>
               

                <table className="print-table" border={1}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>CODE</th>
                            {/* <th>Catégorie</th> */}
                            <th>Nom du Produit</th>
                            <th style={{ textAlign: 'right' }}>Qté</th>
                            <th style={{ textAlign: 'right' }}>Prix Unit.</th>
                            <th style={{ textAlign: 'right' }}>Stock Val.</th>
                        </tr>
                    </thead>
                    <tbody>

                        {
                            groupedData != null &&
                            Object.entries(groupedData)?.map((category, index) => (
                               <>
                                 <tr key={index}>
                                    <td colSpan={5} style={{ textAlign: 'left' }}> <b> {category[0]}</b> </td>
                                </tr>

                                {category[1].map((product) => (
                                <tr key={product.id}>
                                <td>{counterLine++}</td>
                                <td>{product.product?.code}</td>
                               {/*  <td>{product?.product?.category?.name}</td> */}
                                <td>{product.product_name}</td>
                                <td style={{ textAlign: 'right' }}>{product.quantity}</td>
                                <td style={{ textAlign: 'right' }}>{formatNumber(product.product?.sale_price)} </td>
                                <th style={{ textAlign: 'right' }}>{formatNumber((product.product?.sale_price * product.quantity))}
                                    
                                    </th>
                                    </tr>))}
                                    <tr>
                                    <th colSpan={5}>Total</th>
                                    <th style={{ textAlign: 'right' }}>{formatNumber(category[1].reduce((total, product) => total + (product.product?.sale_price * product.quantity), 0))}</th>
                                    </tr>
                               </>

                            ))
                        }
                        

                        
                        <tr>
                            <th colSpan={5}>Total Général</th>
                            <th style={{ textAlign: 'right' }}>{formatNumber(totalStockValue)}</th>
                            </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StockPrintAll;
