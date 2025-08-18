import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';

const VehiculeDepenceScreen = () => {
  const navigate = useNavigate();
  const { id: vehiculeId } = useParams();
  const toast = React.useRef(null);
  
  const [depenses, setDepenses] = useState([]);
  const [vehicule, setVehicule] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

   const dispatch = useDispatch();
   const { data , loading} = useSelector(state => state.apiData);
  
   useEffect(() => {
       if (data) {
        
         setVehicule(data[`vehicule${vehiculeId}`] || []);
         setDepenses(data[`depenses${vehiculeId}`]?.data || []);
         const total = data[`depenses${vehiculeId}`]?.data.reduce((sum, depense) => sum + depense.amount, 0);
         setTotalAmount(total);
       }
     }, [data]);

  useEffect(() => {
    const loadData = async () => {
      try {
        
        dispatch(fetchApiData({ url: `/api/vehicules/${vehiculeId}`, itemKey: `vehicule${vehiculeId}` }));
        dispatch(fetchApiData({ url: `/api/vehicule-depenses?vehicule_id=${vehiculeId}`, itemKey: `depenses${vehiculeId}` }));
                
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des données'+error.message,
          life: 3000
        });
      } 
    };

    if (vehiculeId) {
      loadData();
    }
  }, [vehiculeId]);

  const handleDelete = async (depenseId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      try {
        const response = await ApiService.delete(`/api/vehicule-depenses/${depenseId}`);
        
        if (response.success) {
          toast.current.show({
            severity: 'success',
            summary: 'Succès',
            detail: 'Dépense supprimée avec succès',
            life: 3000
          });
          
          // Recharger les données
          setDepenses(depenses.filter(d => d.id !== depenseId));
          const newTotal = depenses.filter(d => d.id !== depenseId).reduce((sum, depense) => sum + depense.amount, 0);
          setTotalAmount(newTotal);
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message || 'Erreur lors de la suppression',
            life: 3000
          });
        }
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la suppression',
          life: 3000
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'FBU'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2 text-muted">Chargement des dépenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      {/* Header avec informations du véhicule */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="m-0 text-primary">
                    <i className="pi pi-car me-2"></i>
                    Dépenses du véhicule
                  </h4>
                  {vehicule && (
                    <p className="mb-0 text-muted">
                      {vehicule.name || vehicule.immatriculation || 'Véhicule'} 
                      {vehicule.brand && ` - ${vehicule.brand}`}
                      {vehicule.model && ` ${vehicule.model}`}
                    </p>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => navigate(`/vehicles/${vehiculeId}/expenses/create`)}
                  >
                    <i className="pi pi-plus me-2"></i>
                    Nouvelle dépense
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/vehicles')}
                  >
                    <i className="pi pi-arrow-left me-2"></i>
                    Retour aux véhicules
                  </button>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="bg-light p-3 rounded">
                    <h6 className="text-muted mb-1">Nombre de dépenses</h6>
                    <h4 className="text-primary mb-0">{depenses.length}</h4>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="bg-light p-3 rounded">
                    <h6 className="text-muted mb-1">Total des dépenses</h6>
                    <h4 className="text-danger mb-0">{formatAmount(totalAmount)}</h4>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="bg-light p-3 rounded">
                    <h6 className="text-muted mb-1">Moyenne par dépense</h6>
                    <h4 className="text-info mb-0">
                      {depenses.length > 0 ? formatAmount(totalAmount / depenses.length) : formatAmount(0)}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des dépenses */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="m-0">
                <i className="pi pi-list me-2"></i>
                Liste des dépenses
              </h5>
            </div>
            <div className="card-body p-0">
              {depenses.length === 0 ? (
                <div className="text-center py-5">
                  <i className="pi pi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="text-muted mt-3">Aucune dépense enregistrée</h5>
                  <p className="text-muted">Cliquez sur "Nouvelle dépense" pour ajouter la première dépense.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Description</th>
                        <th width="120">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depenses.map((depense) => (
                        <tr key={depense.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className="pi pi-calendar text-muted me-2"></i>
                              {formatDate(depense.date)}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-danger fs-6">
                              {formatAmount(depense.amount)}
                            </span>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '300px' }}>
                              {depense.description || (
                                <em className="text-muted">Aucune description</em>
                              )}
                            </div>
                          </td>
                          <td>
                           <div className="d-flex gap-1">                            
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                title="Modifier"
                                onClick={() => navigate(`/vehicles/${vehiculeId}/expenses/${depense.id}/edit`)}
                              >
                                <i className="pi pi-pencil"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                title="Supprimer"
                                onClick={() => handleDelete(depense.id)}
                              >
                                <i className="pi pi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiculeDepenceScreen;
