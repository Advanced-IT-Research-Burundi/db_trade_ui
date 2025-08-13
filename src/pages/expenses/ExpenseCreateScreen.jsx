import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const ExpenseCreateScreen = () => {
  const navigate = useNavigate();
  const toast = React.useRef(null);
  
  const [stockOptions, setStockOptions] = useState([]);
  const [expenseTypeOptions, setExpenseTypeOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const initialValues = {
    stock_id: '',
    expense_type_id: '',
    amount: '',
    description: '',
    expense_date: ''
  };

  const validationRules = {
    stock_id: {
      required: 'Le stock est requis'
    },
    expense_type_id: {
      required: 'Le type de dépense est requis'
    },
    amount: {
      required: 'Le montant est requis',
      min: 0.01
    },
    description: {
      required: 'La description est requise',
      maxLength: 1000
    },
    expense_date: {
      required: 'La date de dépense est requise'
    }
  };

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        
        
        const stocksResponse = await ApiService.get('/api/stocks');
        if (stocksResponse.success) {            
          const stocksFormatted = stocksResponse.data.stocks.data.map(stock => ({
            value: stock.id,
            label: stock.name
          }));
          setStockOptions(stocksFormatted);
        }

        
        const expenseTypesResponse = await ApiService.get('/api/expense-types');
        if (expenseTypesResponse.success) {
          const expenseTypesFormatted = expenseTypesResponse.data.expense_types.data.map(type => ({
            value: type.id,
            label: type.name
          }));
          setExpenseTypeOptions(expenseTypesFormatted);
        }
        
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des données: ' + (error.message || 'Erreur inconnue'),
          life: 3000
        });
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const handleSubmit = async (values) => {
    const response = await ApiService.post('/api/expenses', values);

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Dépense créée avec succès',
        life: 3000
      });
      
      // Attendre un peu avant de naviguer pour que l'utilisateur voie le toast
      setTimeout(() => {
        navigate('/expenses');
      }, 1000);
      
      return { success: true, message: 'Dépense créée avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la création de la dépense',
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
                  Nouvelle dépense
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title="Retour à la liste"
                  onClick={() => navigate('/expenses')}
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
                    <div className="col-md-6">
                      <FormField
                        name="stock_id"
                        form={form}
                        type="select"
                        label="Stock"
                        placeholder="Sélectionnez un stock"
                        icon="pi pi-box"
                        required
                        helperText="Choisissez le stock concerné par cette dépense"
                        options={stockOptions}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="expense_type_id"
                        form={form}
                        type="select"
                        label="Type de dépense"
                        placeholder="Sélectionnez un type de dépense"
                        icon="pi pi-wallet"
                        required
                        helperText="Choisissez le type de dépense"
                        options={expenseTypeOptions}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="amount"
                        form={form}
                        type="number"
                        label="Montant"
                        placeholder="0.00"
                        icon="pi pi-dollar"
                        required
                        helperText="Montant de la dépense (minimum 0.01)"
                        step="0.01"
                        min="0.01"
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="expense_date"
                        form={form}
                        type="datetime-local"
                        label="Date et heure de la dépense"
                        icon="pi pi-calendar"
                        required
                        helperText="Date et heure où la dépense a été effectuée"
                      />
                    </div>

                    <div className="col-12">
                      <FormField
                        name="description"
                        form={form}
                        type="textarea"
                        label="Description"
                        placeholder="Décrivez la dépense..."
                        icon="pi pi-align-left"
                        required
                        helperText="Description détaillée de la dépense (maximum 1000 caractères)"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/expenses')}
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

export default ExpenseCreateScreen;