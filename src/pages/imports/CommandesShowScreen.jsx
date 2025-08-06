import React from 'react'
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { API_CONFIG } from '../../services/config.js';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useSelector } from 'react-redux';
import logo from '../../assets/logo/ubwiza.png';
import ImportHeader from './ImportHeader.jsx';
import usePrint from '../../hooks/usePrint.js';
import './styles/boncommande.css';
import useFormat from '../../hooks/useFormat.js';

const thStyle = {
    border: '1px solid #000',
    padding: '8px',
    backgroundColor: '#f2f2f2',
    textAlign: 'center',
  };
  
  const tdStyle = {
    border: '1px solid #000',
    padding: '1px',
    textAlign: 'right',
};
  
const textLeft = {
    ...tdStyle,
    textAlign: 'left',
}

const textCenter = {
    ...tdStyle,
    textAlign: 'center',
}
  

function CommandesShowScreen() {
    const { id } = useParams();
    const itemKey = 'commande'+id;

    const dispatch = useDispatch();
    const { data } = useSelector(state => ({
        data: state.apiData?.data[itemKey]
    }));
    

    useEffect(() => {
        dispatch(fetchApiData({
            url: `${API_CONFIG.ENDPOINTS.COMMANDES}/${id}`,
            itemKey: itemKey,
            params: { id }
        }));
    }, [id, dispatch, itemKey])
    const {print} = usePrint();


    const totalWeight = data?.details?.reduce((total, item) => total + item?.total_weight, 0);
    const {formatNumber} = useFormat();
  
  return (
      <div>
         
          <ImportHeader />
          <div>
              <button onClick={() => print('commande')}>Imprimer</button>
          </div>
          <div id='commande'>
              <div className="header" style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div className="img"> 
                      <img src={logo} alt="" style={{width: '300px'}} />
                  </div>
                  <div>
                      <h6>{data?.created_at}</h6>
                  </div>
              </div>

              <div>
                  <h4 style={{textAlign: 'center'}}>Commande N° {data?.id} du {data?.created_at}</h4>
                  <p>Numero de Vehicule : {data?.matricule}</p>
                  <p>Poids (KGS) : {data?.poids}</p>
              </div>

              <div>
                  <table style={{
                      width: '100%', 
                      borderCollapse: 'collapse',
                      border: '1px solid #000',
                      
                  }}>
                      <thead>
                          <tr style={thStyle}>
                              <th style={thStyle}>Code</th>
                              <th style={thStyle}>Libelé</th>
                              <th style={thStyle}>Quantité</th>
                              <th style={thStyle}>Poids (KGS)</th>
                              <th style={thStyle}> Poids  (KGS)Total</th>
                          </tr>
                      </thead>

                      <tbody>
                          {data?.details?.map((item, index) => (
                              <tr key={index}>
                                  <td  style={textLeft}>{item?.company_code}</td>
                                  <td  style={textLeft}>{item?.item_name}</td>
                                  <td  style={textCenter}>{item?.quantity}</td>
                                  <td  style={textCenter}>{item?.weight_kg}</td>
                                  <td  style={{... tdStyle, textAlign: 'right', paddingRight: '20px'}}>{    formatNumber(item?.total_weight)}</td>
                              </tr>
                          ))}
                          <tr>
                              <th colSpan={4} style={{... thStyle, textAlign: 'left'}}>Total</th>
                              <th style={{... thStyle, textAlign: 'right', paddingRight: '20px'}}>{formatNumber(totalWeight)}</th>
                          </tr>
                      </tbody>
                  </table>
              </div>
              
          </div>
    </div>
  )
}

export default CommandesShowScreen