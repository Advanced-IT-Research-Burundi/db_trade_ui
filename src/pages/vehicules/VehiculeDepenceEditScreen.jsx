import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const VehiculeDepenseEditScreen = () => {
  const navigate = useNavigate();
  const { vehiculeId, depenseId } = useParams();
  const toast = React.useRef(null);
  const [vehicule, setVehicule] = useState(null);
  const [depense, setDepense] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialValues = {
    vehicule_id: vehiculeId,
    amount: '',
    date: '',
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
    description: {
      maxLength: 1000
    }
  };

  // Charger les informations du véhicule et de la dépense
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [vehiculeResponse, depenseResponse] = await Promise.all([
          ApiService.get(`/api/vehicules/${vehiculeId}`),
          ApiService.get(`/api/vehicule-depenses/${depenseId}`)
        ]);

        if (vehiculeResponse.success) {
          setVehicule(vehiculeResponse.data);
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Véhicule non trouvé',
            life: 3000
          });
          navigate('/vehicules');
          return;
        }


        if (depenseResponse.success) {
            const depenseData = depenseResponse.data;
            setDepense(depenseData);
            console.log(depenseData)
            form.setValues({
                vehicule_id: vehiculeId,
                amount: depenseData.amount || '',
                date: depenseData.date || '',
                description: depenseData.description || ''
            });
            console.log(depenseData)
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Dépense non trouvée',
            life: 3000
          });
          navigate(`/vehicules/${vehiculeId}/depenses`);
          return;
        }

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des données',
          life: 3000
        });
        navigate(`/vehicules/${vehiculeId}/depenses`);
      } finally {
        setLoading(false);
      }
    };

    if (vehiculeId && depenseId) {
      loadData();
    }
  }, [vehiculeId, depenseId, navigate]);

  const handleSubmit = async (values) => {
    try {
      const response = await ApiService.put(`/api/vehicule-depenses/${depenseId}`, values);

      if (response.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Dépense modifiée avec succès',
          life: 3000
        });
        
        setTimeout(() => {
          navigate(`/vehicules/${vehiculeId}/depenses`);
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
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      if (error.status !== 422) {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la modification de la dépense',
          life: 3000
        });
      }
      throw error;
    }
  };

  const form = useForm({
    initialValues,
    validationRules,
    onSubmit: handleSubmit
  });

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2 text-muted">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="m-0 text-primary">
                    <i className="pi pi-pencil me-2"></i>
                    Modifier la dépense
                  </h4>
                  {vehicule && (
                    <p className="mb-0 text-muted">
                      Pour : {vehicule.name || vehicule.immatriculation || 'Véhicule'}
                      {vehicule.brand && ` - ${vehicule.brand}`}
                      {vehicule.model && ` ${vehicule.model}`}
                    </p>
                  )}
                  {depense && depense.created_at && (
                    <p className="mb-0 text-muted small">
                      Créée le : {new Date(depense.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
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
                      name="date"
                      form={form}
                      type="datetime-local"
                      label="Date et heure"
                      icon="pi pi-calendar"
                      required
                      helperText="Date et heure de la dépense"
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="description"
                      form={form}
                      type="textarea"
                      label="Description"
                      placeholder="Description de la dépense (optionnel)"
                      icon="pi pi-align-left"
                      helperText="Description détaillée de la dépense (maximum 1000 caractères)"
                      rows={4}
                    />
                  </div>
                </div>

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
                    className="btn btn-primary"
                    disabled={!form.canSubmit}
                  >
                    <i className={`${form.submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'} me-2`}></i>
                    {form.submitting ? 'Modification...' : 'Modifier'}
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

export default VehiculeDepenseEditScreen;