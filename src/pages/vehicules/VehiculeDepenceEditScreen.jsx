import React from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';

const VehiculeDepenceEditScreen = () => {
  const navigate = useNavigate();
  const { vehiculeId, depenseId } = useParams();
  const toast = React.useRef(null);

  const initialValues = {
    vehicule_id: vehiculeId,
    amount: '',
    date: '',
    currency: 'BIF',
    exchange_rate: '',
    description: ''
  };

  const validationRules = {
    amount: {
      required: 'Le montant est requis',
      min: 0.01
    },
    date: {
      required: 'La date est requise'
    },
    currency: {
      required: 'La devise est requise'
    },
    exchange_rate: {
      min: 0.01
    },
    description: {
      maxLength: 1000
    }
  };

  // Options pour les devises
  const currencyOptions = [
    { value: 'BIF', label: 'BIF - Franc Burundais' },
    { value: 'USD', label: 'USD - Dollar Américain' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'TSH', label: 'TSH - Shilling Tanzanien' }
  ];

  const loadData = async (depenseId) => {
    const response = await ApiService.get(`/api/vehicule-depenses/${depenseId}`);

    if (response.success) {
      const data = { ...response.data };
      
      // Formatage de la date pour datetime-local input
      if (data.date) {
        const date = new Date(data.date);
        data.date = date.toISOString().slice(0, 16);
      }
      
      // Convertir les valeurs null en chaînes vides
      Object.keys(data).forEach(key => {
        if (data[key] === null) {
          data[key] = '';
        }
      });
      
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
    const response = await ApiService.put(`/api/vehicule-depenses/${entityId}`, values);

    if (response.success) {
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Dépense modifiée avec succès',
        life: 3000
      });
    
      setTimeout(() => {
        navigate(`/vehicles/${vehiculeId}/expenses`);
      }, 1000);
      
      return { success: true, message: 'Dépense modifiée avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.error || 'Erreur lors de la modification de la dépense',
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
    entityId: depenseId
  });

  return (
    <div className="container-fluid py-4">
      {/* Ajout du composant Toast */}
      <Toast ref={toast} />
      
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  
                  <h4 className="m-0">
                    <i className="pi pi-pencil me-2"></i>
                    Modifier la dépense
                    {form.values.amount && (
                      <span className="text-muted ms-2">- {form.values.amount} {form.values.currency}</span>
                    )}
                  </h4>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  title="Retour à la liste"
                  onClick={() => navigate(`/vehicles/${vehiculeId}/expenses`)}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={form.handleSubmit}>
                <div className="row">
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
                      name="currency"
                      form={form}
                      type="select"
                      label="Devise"
                      placeholder="Sélectionnez une devise"
                      icon="pi pi-money-bill"
                      required
                      helperText="Devise de la dépense"
                      options={currencyOptions}
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="date"
                      form={form}
                      type="datetime-local"
                      label="Date et heure"
                      icon="pi pi-calendar"
                      required
                      helperText="Date et heure de la dépense"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="exchange_rate"
                      form={form}
                      type="number"
                      label="Taux de change"
                      placeholder="1.00"
                      icon="pi pi-percentage"
                      helperText="Taux de change vers BIF (optionnel)"
                      step="0.0001"
                      min="0.0001"
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
                      helperText="Description de la dépense (optionnel)"
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
                      disabled={form.submitting || form.loading}
                    >
                      <i className="pi pi-refresh me-2"></i>
                      Réinitialiser
                    </button>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate(`/vehicles/${vehiculeId}/expenses`)}
                      disabled={form.submitting || form.loading}
                    >
                      <i className="pi pi-times me-2"></i>
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={!form.canSubmit || form.loading}
                    >
                      <i className={`${form.submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'} me-2`}></i>
                      {form.submitting ? 'Modification...' : 'Modifier'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiculeDepenceEditScreen;