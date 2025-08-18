import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const VehiculeDepenceCreateScreen = () => {
  const navigate = useNavigate();
  const { id: vehiculeId } = useParams();
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

  const handleSubmit = async (values) => {
    const response = await ApiService.post('/api/vehicule-depenses', values);

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
        navigate(`/vehicles/${vehiculeId}/expenses`);
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
        <div className="col-12 col-md-8 col-lg-6">
          {/* Card avec Bootstrap */}
          <div className="card shadow-sm">
            {/* Header de la card */}
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="m-0 text-primary">
                    <i className="pi pi-plus me-2"></i>
                    Nouvelle dépense véhicule
                  </h4>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title="Retour à la liste"
                  onClick={() => navigate(`/vehicles/${vehiculeId}/expenses`)}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>

            {/* Body de la card */}
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
                    />
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(`/vehicles/${vehiculeId}/expenses`)}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiculeDepenceCreateScreen;