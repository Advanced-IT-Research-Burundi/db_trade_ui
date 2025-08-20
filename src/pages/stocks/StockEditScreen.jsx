import React from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';

const StockEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = React.useRef(null);

  const initialValues = {
    name: '',
    location: '',
    description: ''
  };

  const validationRules = {
    name: {
      required: 'Le nom du stock est requis',
      minLength: 3,
      maxLength: 255
    },
    location: {
      maxLength: 255
    },
    description: {
      maxLength: 1000
    }
  };

  const loadData = async (stockId) => {
    const response = await ApiService.get(`/api/stocks/${stockId}`);

    if (response.success) {
      return { success: true, data: response.data.stock };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.error || 'Erreur lors du chargement',
        life: 3000
      });
      throw new Error(response.message || 'Erreur lors du chargement');
    }
  };

  const handleSubmit = async (values, isEditing, entityId) => {
    const response = await ApiService.put(`/api/stocks/${entityId}`, values);

    if (response.success) {
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Stock modifié avec succès',
        life: 3000
      });
      
      setTimeout(() => {
        navigate('/stocks');
      }, 1000);
      
      return { success: true, message: 'Stock modifié avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.error || 'Erreur lors de la modification du stock',
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
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0">
                  <i className="pi pi-pencil me-2"></i>
                  Modifier le stock
                  {form.values.name && (
                    <span className="text-muted ms-2">- {form.values.name}</span>
                  )}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  title="Retour à la liste"
                  onClick={() => navigate('/stocks')}
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
                      label="Nom du stock"
                      placeholder="Saisissez le nom du stock"
                      icon="pi pi-box"
                      required
                      helperText="Le nom doit contenir entre 3 et 255 caractères"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="location"
                      form={form}
                      type="text"
                      label="Localisation"
                      placeholder="Saisissez la localisation du stock (optionnel)"
                      icon="pi pi-map-marker"
                      helperText="Localisation géographique ou adresse du stock (optionnel)"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="description"
                      form={form}
                      type="textarea"
                      label="Description"
                      placeholder="Saisissez une description (optionnel)"
                      icon="pi pi-align-left"
                      helperText="Description détaillée du stock (maximum 1000 caractères)"
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
                      onClick={() => navigate('/stocks')}
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

export default StockEditScreen;