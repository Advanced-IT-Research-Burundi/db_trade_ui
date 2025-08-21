import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const CashRegisterCreateScreen = () => {
  const navigate = useNavigate();
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
    status: 'open', // Valeur par défaut
    opened_at: '',
    closed_at: '',
    description: ''
  };

  const validationRules = {
    user_id: {
      required: 'L\'utilisateur est requis'
    },
    stock_id: {
      
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

  const handleSubmit = async (values) => {
    const response = await ApiService.post('/api/cash-registers', values);

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Caisse créée avec succès',
        life: 3000
      });
      
      // Attendre un peu avant de naviguer pour que l'utilisateur voie le toast
      setTimeout(() => {
        navigate('/cash-registers');
      }, 1000);
      
      return { success: true, message: 'Caisse créée avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la création de la caisse',
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
    onSubmit: handleSubmit
  });

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          {/* Card avec Bootstrap */}
          <div className="card shadow-sm">
            {/* Header de la card */}
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-plus me-2"></i>
                  Nouvelle caisse
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title="Retour à la liste"
                  onClick={() => navigate('/cash-registers')}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>

            {/* Body de la card */}
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
                        disabled
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
                        disabled
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
                      />
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/cash-registers')}
                      disabled={form.submitting}
                    >
                      <i className="pi pi-times me-2"></i>
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={!form.canSubmit}
                    >
                      <i className={`${form.submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'} me-2`}></i>
                      {form.submitting ? 'Création...' : 'Créer'}
                    </button>
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

export default CashRegisterCreateScreen;