import React from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '../../../hooks/useForm';
import FormField from '../../../components/input/FormField';
import ApiService from '../../../services/api.js';

const UnitEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = React.useRef(null);

  const initialValues = {
    name: '',
    abbreviation: '',
    description: ''
  };

  const validationRules = {
    name: {
      required: 'Le nom est requis',
      minLength: 2,
      maxLength: 255
    },
    abbreviation: {
      maxLength: 20
    },
    description: {
      maxLength: 1000
    }
  };

  const loadData = async (unitId) => {
    const response = await ApiService.get(`/api/units/${unitId}`);

    if (response.success) {
      return { success: true, data: response.data };
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
    const response = await ApiService.put(`/api/units/${entityId}`, values);

    if (response.success) {
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Unité modifiée avec succès',
        life: 3000
      });
      
      setTimeout(() => {
        navigate('/products/units');
      }, 1000);
      
      return { success: true, message: 'Unité modifiée avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la modification de l\'unité',
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
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-pencil me-2"></i>
                  Modifier l'unité
                  {form.values.name && (
                    <span className="text-muted ms-2">- {form.values.name}</span>
                  )}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title="Retour à la liste"
                  onClick={() => navigate('/units')}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={form.handleSubmit}>
                <div className="row">
                  <div className="col-12">
                    <FormField
                      name="name"
                      form={form}
                      type="text"
                      label="Nom de l'unité"
                      placeholder="Ex: Kilogramme, Mètre, Litre..."
                      icon="pi pi-calculator"
                      required
                      helperText="Le nom doit contenir au moins 2 caractères"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="abbreviation"
                      form={form}
                      type="text"
                      label="Abréviation"
                      placeholder="Ex: kg, m, l..."
                      icon="pi pi-tag"
                      helperText="Abréviation courte de l'unité (optionnel, max 20 caractères)"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="description"
                      form={form}
                      type="textarea"
                      label="Description"
                      placeholder="Description détaillée de l'unité de mesure (optionnel)"
                      icon="pi pi-align-left"
                      helperText="Description optionnelle (maximum 1000 caractères)"
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
                      onClick={() => navigate('/units')}
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

export default UnitEditScreen;