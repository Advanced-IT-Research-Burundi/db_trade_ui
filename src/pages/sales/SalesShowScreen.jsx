import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { Button } from 'react-bootstrap';
import QRCode from "react-qr-code";
import logo from '../../assets/logo/ubwiza.png';
import usePrint from '../../hooks/usePrint.js';
// import background from '../../assets/images/invoice-bg.png'; // optionnel

const thStyle = {
  border: '1px solid #000',
  padding: '8px',
  backgroundColor: '#f2f2f2',
  textAlign: 'left',
};

const tdStyle = {
  border: '1px solid #000',
  padding: '8px',
  textAlign: 'left',
};

const SalesShowScreen = () => {
  const { id } = useParams();
  const itemKey = 'sales_show' + id;

  const dispatch = useDispatch();
  const { data } = useSelector((state) => ({
    data: state.apiData?.data[itemKey],
  }));
  const { generatePdf, print } = usePrint();

  useEffect(() => {
    dispatch(fetchApiData({ url: `/api/sales/${id}`, itemKey: itemKey, method: 'GET' }));
  }, [id, itemKey]);

  

  return (
    <div style={{ padding: '20px' }}>
      <div className="d-flex justify-content-end mb-3">
              <Button variant="success" onClick={() => generatePdf('invoice')}>Télécharger PDF</Button>
              <Button variant="primary" onClick={() => print('invoice')}>Imprimer</Button>
      </div>

      <div
        id="invoice"
        style={{
          padding: '30px',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#ffffff',
          // backgroundImage: `url(${background})`, // si image de fond
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          color: '#000',
          minHeight: '1100px',
        }}
      >
      {JSON.stringify(data)}
        {data && data.sale && (
          <>
            {/* Logo */}
            <div style={{ textAlign: 'center' }}>
              <img src={logo} alt="Logo" style={{ width: '300px', height: 'auto' }} />
              <h2 style={{ marginTop: '10px' }}>{data.company?.tp_name}</h2>
              <p>
                {data.company?.tp_address}<br />
                Tel: {data.company?.tp_phone_number}<br />
                Email: {data.company?.tp_email}
              </p>
            </div>
            <hr />

            {/* Infos Facture & Client */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <strong>Facture N°:</strong> {data.sale.id}<br />
                <strong>Date:</strong> {new Date(data.sale.sale_date).toLocaleDateString()}
              </div>
              <div>
                <strong>Client:</strong> {data.sale.client?.name}<br />
                <strong>Téléphone:</strong> {data.sale.client?.phone}<br />
                <strong>Adresse:</strong> {data.sale.client?.address}
              </div>
            </div>

            {/* Articles */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Produit</th>
                  <th style={thStyle}>Qté</th>
                  <th style={thStyle}>Prix Unitaire</th>
                  <th style={thStyle}>Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {data.sale.sale_items.map((item, index) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>{item.product?.name}</td>
                    <td style={tdStyle}>{item.quantity}</td>
                    <td style={tdStyle}>{item.sale_price.toLocaleString()} FBu</td>
                    <td style={tdStyle}>{item.subtotal.toLocaleString()} FBu</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totaux */}
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <p><strong>Total:</strong> {data.sale.total_amount.toLocaleString()} FBu</p>
              <p><strong>Payé:</strong> {data.sale.paid_amount.toLocaleString()} FBu</p>
              <p><strong>Reste à payer:</strong> {data.sale.due_amount.toLocaleString()} FBu</p>
            </div>

            <hr />

            {/* QR Code & Signature */}
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
              {/* QR Code */}
              <div>
                <p><strong>Validation:</strong></p>
                <QRCode
                  value={`Facture ID: ${data.sale.id} - Client: ${data.sale.client?.name} - Montant: ${data.sale.total_amount} FBu`}
                  size={100}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Signature / Cachet */}
              <div style={{ textAlign: 'center' }}>
                <p><strong>Signature et Cachet</strong></p>
                <div style={{
                  width: '200px',
                  height: '80px',
                  border: '1px dashed #000',
                  marginTop: '20px',
                }}></div>
              </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: '40px' }}>
              Merci pour votre achat chez {data.company?.tp_name}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesShowScreen;
