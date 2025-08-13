import React, { useEffect, useState } from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';

const ExpenseEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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

  // Charger les options pour les selects
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

  const loadData = async (expenseId) => {
    const response = await ApiService.get(`/api/expenses/${expenseId}`);

    if (response.success) {        
      const data = { ...response.data };
      if (data.expense_date) {        
        const date = new Date(data.expense_date);
        data.expense_date = date.toISOString().slice(0, 16);
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
    const response = await ApiService.put(`/api/expenses/${entityId}`, values);

    if (response.success) {
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Dépense modifiée avec succès',
        life: 3000
      });
      
      setTimeout(() => {
        navigate('/expenses');
      }, 1000);
      
      return { success: true, message: 'Dépense modifiée avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la modification de la dépense',
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

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0">
                  <i className="pi pi-pencil me-2"></i>
                  Modifier la dépense
                  {form.values.amount && (
                    <span className="text-muted ms-2">- {form.values.amount} Fbu</span>
                  )}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  title="Retour à la liste"
                  onClick={() => navigate('/expenses')}
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
                        disabled={form.loading}
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
                        disabled={form.loading}
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
                        disabled={form.loading}
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
                        disabled={form.loading}
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
                        onClick={() => navigate('/expenses')}
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

export default ExpenseEditScreen;