import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import { API_CONFIG } from '../../services/config';
import usePrint from '../../hooks/usePrint.js';
import useFormat from '../../hooks/useFormat.js';
import ImportHeader from './ImportHeader.jsx';

function CommandesEditScreen() {

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
   


  return (
    <div>
        <ImportHeader />
    </div>
  )
}

export default CommandesEditScreen