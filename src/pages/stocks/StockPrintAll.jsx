import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import ubwiza from '../../assets/logo/ubwiza.png';
import usePrint from '../../hooks/usePrint';
import { Button } from 'react-bootstrap';
import './style/StockPrintAll.css';

function StockPrintAll() {
    const stockId = useParams().id;
    const dispatch = useDispatch();
    const { print, generatePdf } = usePrint();

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
    return (
        <div className="print-wrapper">
            <Button variant="primary" onClick={() => print("stock-product-details")}>Imprimer</Button>
            <Button variant="primary" onClick={() => generatePdf("stock-product-details")}>Télécharger PDF</Button>

            <div id="stock-product-details" className="">
                <div className="header-section">
                    <img src={ubwiza} alt="ubwiza" className="logo" style={{ width: '250px' }} />
                    <h2>{data?.stock?.name}</h2>
                    <h2>{data?.stock?.location}</h2>
                </div>

                <table className="print-table" border={1}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>CODE</th>
                            <th>Catégorie</th>
                            <th>Nom du Produit</th>
                            <th style={{ textAlign: 'right' }}>Qté</th>
                            <th style={{ textAlign: 'right' }}>Prix Unit.</th>
                            <th style={{ textAlign: 'right' }}>Stock Val.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.stock_products?.data?.map((product, index) => (
                            <tr key={product.id}>
                                <td>{index + 1}</td>
                                <td>{product.product?.code}</td>
                                <td>{product?.product?.category?.name}</td>
                                <td>{product.product_name}</td>
                                <td style={{ textAlign: 'right' }}>{product.quantity}</td>
                                <td style={{ textAlign: 'right' }}>{product.product?.sale_price} </td>
                                <td style={{ textAlign: 'right' }}>{(product.product?.sale_price * product.quantity).toFixed(2)}
                                    
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <th colSpan={6}>Total</th>
                            <th style={{ textAlign: 'right' }}>{totalStockValue}</th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StockPrintAll;
