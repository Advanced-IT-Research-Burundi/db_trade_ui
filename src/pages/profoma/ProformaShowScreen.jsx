import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useEffect, useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import QRCode from "react-qr-code";
import usePrint from '../../hooks/usePrint';
import logo from '../../assets/logo/ubwiza.png';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';
import useFormat from '../../hooks/useFormat.js';

const thStyle = {
  border: '1px solid #000',
  padding: '8px',
  backgroundColor: '#f2f2f2',
  textAlign: 'left',
};

const tdStyle = {
  border: '1px solid #000',
  padding: '1px',
  textAlign: 'left',
};

function ProformaShowScreen() {
  const { id } = useParams();
  const itemKey = 'PROFORMATS_' + id;
  const [loading, setLoading] = useState(true);
  const [validateLoading, setValidateLoading] = useState(false);
  const [proformaData, setProformaData] = useState(null);
  const [items, setItems] = useState([]);
  const [client, setClient] = useState(null);
  const [company, setCompany] = useState(null);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { data } = useSelector((state) => ({
    data: state.apiData?.data[itemKey]
  }));
  
  const { print, generatePdf } = usePrint();

  useEffect(() => {
    if (data) {
      setProformaData(data.proforma);
      setItems(data.items || JSON.parse(data.proforma.proforma_items || '[]'));
      setClient(data.client || JSON.parse(data.proforma.client || '{}'));
      setCompany(data.company);
      setLoading(false);
    }
  }, [data]);
 
  useEffect(() => {
    dispatch(fetchApiData({ url: `/api/proformas/${id}`, itemKey: itemKey, method: 'GET' }));
  }, [id, dispatch, itemKey]);

  if (loading || !proformaData) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }
  const validateProforma = async (proformaId) => {
    try {
        setValidateLoading(true);

        const response = await ApiService.post(`/api/proformas/${proformaId}/validate`);
        console.log("Réponse de la validation:", response);
        if (response.success) {
          navigate(`/sales/${proformaId}`);
        }
        setValidateLoading(false);

    } catch (error) {
        setValidateLoading(false);
        
    }
  };

  const { formatNumber, formatDate } = useFormat();

  return (
    <div style={{ padding: '20px' }}>
      <div className="d-flex justify-content-end mb-3">
        <Button variant="secondary" onClick={() => navigate('/proforma')} className="me-2">
          Retour
        </Button>
        {/* <Button variant="warning" onClick={() => {
          validateProforma(proformaData.id);
        }} className="me-2" disabled={validateLoading}>
          {validateLoading ? 'Validation...' : 'Valider Proforma'}
        </Button> */}
        <Button variant="success" onClick={() => generatePdf('proforma')} className="me-2">
          Télécharger PDF
        </Button>
        <Button variant="primary" onClick={() => print('proforma')}>
          Imprimer
        </Button>
      </div>

      <div
        id="proforma"
        style={{
          padding: '30px',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#ffffff',
          color: '#000',
          minHeight: '1100px',
        }}
      >
        {/* Logo et en-tête */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src={logo} alt="Logo" style={{ width: '200px', height: 'auto' }} />
          <h2 style={{ marginTop: '10px', color: '#2c3e50' }}>{company?.tp_name}</h2>
          <p style={{ marginBottom: '5px' }}>{company?.tp_address}</p>
          <p style={{ marginBottom: '5px' }}>Tél: {company?.tp_phone_number}</p>
          <p>Email: {company?.tp_email}</p>
        </div>

        <hr style={{ borderTop: '2px solid #2c3e50', margin: '20px 0' }} />

        {/* Titre */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#2c3e50', fontSize: '24px', fontWeight: 'bold' }}>PROFORMA N° {proformaData.id}</h1>
          <p style={{ fontSize: '16px', marginTop: '10px' }}>
            Date: {formatDate(proformaData.sale_date || proformaData.created_at)}
          </p>
        </div>

        {/* Informations client */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Client</h3>
          <div style={{ marginTop: '10px' }}>
            <p><strong>Nom:</strong> {client?.name}</p>
            <p><strong>Téléphone:</strong> {client?.phone}</p>
            <p><strong>Email:</strong> {client?.email || 'Non spécifié'}</p>
            <p><strong>Adresse:</strong> {client?.address || 'Non spécifiée'}</p>
          </div>
        </div>

        {/* Détails de la proforma */}
        <div style={{ marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '10%' }}>#</th>
                <th style={{ ...thStyle, width: '40%' }}>Désignation</th>
                <th style={{ ...thStyle, textAlign: 'right', width: '15%' }}>Prix Unitaire</th>
                <th style={{ ...thStyle, textAlign: 'center', width: '15%' }}>Quantité</th>
                <th style={{ ...thStyle, textAlign: 'right', width: '20%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '0.9em', color: '#666' }}> {item.product_name}</div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {formatNumber(item.sale_price)} FBu
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold' }}>
                    {formatNumber(item.subtotal)} FBu
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div style={{ marginTop: '30px', textAlign: 'right' }}>
          <div style={{ display: 'inline-block', minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>Total HT:</span>
              <span>
                {new Intl.NumberFormat('fr-BI', { maximumFractionDigits: 0 }).format(
                  items.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0)
                )} FBu
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>TVA (18%):</span>
              <span>
                {new Intl.NumberFormat('fr-BI', { maximumFractionDigits: 0 }).format(
                  items.reduce((sum, item) => sum + (item.sale_price * item.quantity * 0.18), 0)
                )} FBu
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '1.1em', borderTop: '1px solid #000', paddingTop: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>Total TTC:</span>
              <span style={{ fontWeight: 'bold' }}>
                {new Intl.NumberFormat('fr-BI', { maximumFractionDigits: 0 }).format(proformaData.total_amount)} FBu
              </span>
            </div>
            {proformaData.due_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#e74c3c', fontWeight: 'bold' }}>
                <span>Reste à payer:</span>
                <span>
                  {new Intl.NumberFormat('fr-BI', { maximumFractionDigits: 0 }).format(proformaData.due_amount)} FBu
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notes et signature */}
        <div style={{ marginTop: '50px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>Notes:</h4>
            <div style={{ minHeight: '50px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
              {proformaData.note || 'Aucune note spécifiée.'}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
            <div style={{ textAlign: 'center', width: '250px' }}>
              <div style={{ height: '1px', backgroundColor: '#000', margin: '10px 0' }}></div>
              <p>Signature du client</p>
            </div>
            <div style={{ textAlign: 'center', width: '250px' }}>
              <div style={{ height: '1px', backgroundColor: '#000', margin: '10px 0' }}></div>
              <p>Signature du responsable</p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div style={{ marginTop: '50px', textAlign: 'center' }}>
          <QRCode
            value={`Proforma N°: ${proformaData.id} | Client: ${client?.name} | Montant: ${proformaData.total_amount} FBu | Date: ${formatDate(proformaData.sale_date || proformaData.created_at)}`}
            size={100}
            level="H"
            includeMargin={true}
          />
          <p style={{ fontSize: '0.8em', marginTop: '10px', color: '#666' }}>
            Scannez ce code pour vérifier cette proforma
          </p>
        </div>

        {/* Pied de page */}
        <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '0.9em', color: '#666', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <p>{company?.tp_name} - {company?.tp_address}</p>
          <p>Tél: {company?.tp_phone_number} | Email: {company?.tp_email}</p>
          <p>N° TIN: {company?.tp_TIN} | RC: {company?.tp_trade_number}</p>
          <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
            Ceci est un document proforma, ne constitue pas une facture et n'a aucune valeur comptable.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProformaShowScreen;