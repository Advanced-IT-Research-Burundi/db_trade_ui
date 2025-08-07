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
    return (
        <div className="print-wrapper">
            <Button variant="primary" onClick={() => print("stock-product-details")}>Imprimer</Button>
            <Button variant="primary" onClick={() => generatePdf("stock-product-details")}>Télécharger PDF</Button>

            <div id="stock-product-details" className=""
                style={{
                    position: 'relative'
                    
                 }}>
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
                            <th>Catégorie</th>
                            <th>Nom du Produit</th>
                            <th style={{ textAlign: 'right' }}>Qté</th>
                            <th style={{ textAlign: 'right' }}>Prix Unit.</th>
                            <th style={{ textAlign: 'right' }}>Stock Val.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.stock_products?.data?.filter((product) => product.quantity > 0)?.map((product, index) => (
                            <tr key={product.id}>
                                <td>{index + 1}</td>
                                <td>{product.product?.code}</td>
                                <td>{product?.product?.category?.name}</td>
                                <td>{product.product_name}</td>
                                <td style={{ textAlign: 'right' }}>{product.quantity}</td>
                                <td style={{ textAlign: 'right' }}>{formatNumber(product.product?.sale_price)} </td>
                                <th style={{ textAlign: 'right' }}>{formatNumber((product.product?.sale_price * product.quantity))}
                                    
                                </th>
                            </tr>
                        ))}
                        <tr>
                            <th colSpan={6}>Total</th>
                            <th style={{ textAlign: 'right' }}>{formatNumber(totalStockValue)}</th>
                            </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StockPrintAll;
