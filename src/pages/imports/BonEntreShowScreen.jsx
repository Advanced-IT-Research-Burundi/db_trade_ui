import React from 'react'
import ImportHeader from './ImportHeader.jsx';
import logo from '../../assets/logo/ubwiza.png';
import usePrint from '../../hooks/usePrint.js';
import useFormat from '../../hooks/useFormat.js';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { API_CONFIG } from '../../services/config.js';
import { useEffect } from 'react';


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



function BonEntreShowScreen() {
    const { id } = useParams();
    const itemKey = 'commande'+id;
    
    const dispatch = useDispatch();
    const { data } = useSelector(state => ({
        data: state.apiData?.data[itemKey]
    }));
    
    const {print} = usePrint();
    const { formatNumber, formatDate } = useFormat();
    
    useEffect(() => {
        dispatch(fetchApiData({
            url: `${API_CONFIG.ENDPOINTS.COMMANDES}/${id}`,
            itemKey: itemKey,
            params: { id }
        }));
    }, [id, dispatch, itemKey])
    
    
    
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
        <h6>{formatDate(data?.created_at)}</h6>
        </div>
        </div>
        
        <div>
        <h4 style={{textAlign: 'center'}}>
            BON D'ENTREE N° { (data?.id + "").padStart(4, "0")}/{data?.created_at.split('T')[0].split('-')[0]}</h4>
                </div>
                
                <div>
                    <table style={{width: '100%', borderCollapse: 'collapse', border: '1px solid #000'}}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Code</th>
                                <th style={thStyle}>Libellé</th>
                                <th style={thStyle}>P.A</th>
                                <th style={thStyle}>Taux de Change</th>
                                <th style={thStyle}>Qté</th>
                                <th style={thStyle}>P.V</th>
                                <th style={thStyle}> Total P.A</th>
                                <th style={thStyle}> Total P.V</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                
                            </tr>
                           {data?.details?.map((item, index) => (
                               <tr key={index}>
                                   <td style={textLeft}>{item?.product_code}</td>
                                   <td style={textLeft}>{item?.item_name}</td>
                                   <td style={textCenter}>{item?.pu}</td>
                                   <td style={textCenter}>{item?.taux_change}</td>
                                   <td style={textCenter}>{item?.quantity}</td>
                                   <td style={textCenter}>{item?.price}</td>
                                   <td style={textCenter}>{item?.total_price}</td>
                                   <td style={textCenter}>{item?.total_price_v}</td>
                               </tr>
                           ))}
                          
                        </tbody>
                    </table>
                </div>
        </div>
        
        </div>
    )
}

export default BonEntreShowScreen