import React, { useEffect, useState } from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';

const CashRegisterEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = React.useRef(null);
  
  // États pour les options des selects
  const [userOptions, setUserOptions] = useState([]);
  const [stockOptions, setStockOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Options pour le status
  const statusOptions = [
    { value: 'open', label: 'Ouvert' },
    { value: 'closed', label: 'Fermé' },
    { value: 'suspended', label: 'Suspendu' }
  ];

  const initialValues = {
    user_id: '',
    stock_id: '',
    opening_balance: 0, 
    closing_balance: '',
    status: 'open',
    opened_at: '',
    closed_at: '',
    description: ''
  };

  const validationRules = {
    user_id: {
      required: 'L\'utilisateur est requis'
    },
    stock_id: {
      // Nullable, pas de validation required
    },
    opening_balance: {
    },
    closing_balance: {
    },
    status: {
      required: 'Le statut est requis'
    },
    opened_at: {
      required: 'La date d\'ouverture est requise'
    },
    closed_at: {
      // Nullable, pas de validation required
    },
    description: {
      maxLength: 255
    }
  };

  // Charger les options pour les selects
   useEffect(() => {
      const loadOptions = async () => {
        try {
          setLoadingOptions(true);
          
          // Charger les utilisateurs
          const usersResponse = await ApiService.get('/api/users');
          if (usersResponse.success) {
  
            const usersFormatted = usersResponse.data.users.data.map(user => ({
              value: user.id,
              label: `${user.first_name} ${user.last_name}` || user.name || user.email
            }));
            setUserOptions(usersFormatted);
          }
  
          // Charger les stocks
          const stocksResponse = await ApiService.get('/api/stocks');
          if (stocksResponse.success) {
            console.log(stocksResponse.data);
            const stocksFormatted = stocksResponse.data.stocks.data.map(stock => ({
              value: stock.id,
              label: stock.name
            }));
            setStockOptions(stocksFormatted);
          }
          
        } catch (error) {
          toast.current.show({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message || 'Erreur lors du chargement des données',
            life: 3000
          });
        } finally {
          setLoadingOptions(false);
        }
      };
  
      loadOptions();
    }, []);

  const loadData = async (cashRegisterId) => {
    const response = await ApiService.get(`/api/cash-registers/${cashRegisterId}`);

    if (response.success) {
      // Formatage des dates pour datetime-local input
      const data = { ...response.data };
      
      if (data.opened_at) {
        const openedDate = new Date(data.opened_at);
        data.opened_at = openedDate.toISOString().slice(0, 16);
      }
      
      if (data.closed_at) {
        const closedDate = new Date(data.closed_at);
        data.closed_at = closedDate.toISOString().slice(0, 16);
      }
      
      return { success: true, data };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors du chargement',
        life: 3000
      });
      throw new Error(response.message || 'Erreur lors du chargement');
    }
  };

  const handleSubmit = async (values, isEditing, entityId) => {
    const response = await ApiService.put(`/api/cash-registers/${entityId}`, values);

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Caisse modifiée avec succès',
        life: 3000
      });
      
      // Attendre un peu avant de naviguer pour que l'utilisateur voie le toast
      setTimeout(() => {
        navigate('/cash-registers');
      }, 1000);
      
      return { success: true, message: 'Caisse modifiée avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la modification de la caisse',
        life: 3000
      });
      
      if (response.status === 422) {
        throw { status: 422, errors: response.errors };
      }
    }
  };

  const form = useForm({
    initialValues,
    validationRules,
    onSubmit: handleSubmit,
    loadData,
    entityId: id
  });

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  };

  return (
    <div className="container-fluid py-4">
      {/* Ajout du composant Toast */}
      <Toast ref={toast} />
      
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0">
                  <i className="pi pi-pencil me-2"></i>
                  Modifier la caisse
                  {form.values.status && (
                    <span className={`badge ms-2 ${
                      form.values.status === 'open' ? 'bg-success' :
                      form.values.status === 'closed' ? 'bg-danger' : 'bg-warning'
                    }`}>
                      {getStatusLabel(form.values.status)}
                    </span>
                  )}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  title="Retour à la liste"
                  onClick={() => navigate('/cash-registers')}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              {loadingOptions && (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="mt-2 text-muted">Chargement des données...</p>
                </div>
              )}
              
              {!loadingOptions && (
                <form onSubmit={form.handleSubmit}>
                  <div className="row">
                    {/* Utilisateur et Stock */}
                    <div className="col-md-6">
                      <FormField
                        name="user_id"
                        form={form}
                        type="select"
                        label="Utilisateur"
                        placeholder="Sélectionnez un utilisateur"
                        icon="pi pi-user"
                        required
                        helperText="Utilisateur responsable de la caisse"
                        options={userOptions}
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="stock_id"
                        form={form}
                        type="select"
                        label="Stock"
                        placeholder="Sélectionnez un stock (optionnel)"
                        icon="pi pi-box"
                        helperText="Stock associé à cette caisse"
                        options={stockOptions}
                        disabled={form.loading}
                      />
                    </div>

                    {/* Soldes */}
                    <div className="col-md-6">
                      <FormField
                        name="opening_balance"
                        form={form}
                        type="number"
                        label="Solde d'ouverture"
                        placeholder="0.00"
                        icon="pi pi-wallet"
                        required
                        helperText="Montant initial dans la caisse"
                        step="0.01"
                        min="0"
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="closing_balance"
                        form={form}
                        type="number"
                        label="Solde de fermeture"
                        placeholder="0.00"
                        icon="pi pi-money-bill"
                        required
                        helperText="Montant final prévu dans la caisse"
                        step="0.01"
                        min="0"
                        disabled={form.loading}
                      />
                    </div>

                    {/* Statut */}
                    <div className="col-md-6">
                      <FormField
                        name="status"
                        form={form}
                        type="select"
                        label="Statut"
                        placeholder="Sélectionnez un statut"
                        icon="pi pi-info-circle"
                        required
                        helperText="Statut actuel de la caisse"
                        options={statusOptions}
                        disabled={form.loading}
                      />
                    </div>

                    {/* Dates */}
                    <div className="col-md-6">
                      <FormField
                        name="opened_at"
                        form={form}
                        type="datetime-local"
                        label="Date et heure d'ouverture"
                        icon="pi pi-calendar"
                        required
                        helperText="Moment d'ouverture de la caisse"
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="closed_at"
                        form={form}
                        type="datetime-local"
                        label="Date et heure de fermeture"
                        icon="pi pi-calendar-times"
                        helperText="Moment de fermeture de la caisse (optionnel)"
                        disabled={form.loading}
                      />
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <FormField
                        name="description"
                        form={form}
                        type="text"
                        label="Description"
                        placeholder="Description ou remarques (optionnel)"
                        icon="pi pi-align-left"
                        helperText="Notes ou commentaires sur cette caisse (maximum 255 caractères)"
                        disabled={form.loading}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      <button
                        type="button"
                        className="btn btn-outline-warning"
                        onClick={form.reset}
                        disabled={form.submitting || form.loading || loadingOptions}
                      >
                        <i className="pi pi-refresh me-2"></i>
                        Réinitialiser
                      </button>
                    </div>
                    
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/cash-registers')}
                        disabled={form.submitting || form.loading}
                      >
                        <i className="pi pi-times me-2"></i>
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={!form.canSubmit || form.loading || loadingOptions}
                      >
                        <i className={`${form.submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'} me-2`}></i>
                        {form.submitting ? 'Modification...' : 'Modifier'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashRegisterEditScreen;