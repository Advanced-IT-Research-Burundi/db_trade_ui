import React from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';

const SuppliersEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = React.useRef(null);

  const initialValues = {
    name: '',
    phone: '',
    email: '',
    address: ''
  };

  const validationRules = {
    name: {
      required: 'Le nom est requis',
      minLength: 2,
      maxLength: 255
    },
    phone: {
      maxLength: 20,
    },
    email: {
      maxLength: 255,
    },
    address: {
      maxLength: 500
    }
  };

  const loadData = async (supplierId) => {
    const response = await ApiService.get(`/api/suppliers/${supplierId}`);

    if (response.success) {
      return { success: true, data: response.data };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors du chargement du fournisseur',
        life: 3000
      });
      throw new Error(response.message || 'Erreur lors du chargement du fournisseur');
    }
  };

  const handleSubmit = async (values, isEditing, entityId) => {
    // Nettoyer les valeurs vides
    const cleanValues = Object.keys(values).reduce((acc, key) => {
      if (values[key] && values[key].trim() !== '') {
        acc[key] = values[key].trim();
      } else {
        acc[key] = null; // Envoyer null pour les champs vides
      }
      return acc;
    }, {});

    const response = await ApiService.put(`/api/suppliers/${entityId}`, cleanValues);

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Fournisseur modifié avec succès',
        life: 3000
      });
      
      // Attendre un peu avant de naviguer pour que l'utilisateur voie le toast
      setTimeout(() => {
        navigate('/suppliers');
      }, 1000);
      
      return { success: true, message: 'Fournisseur modifié avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la modification du fournisseur',
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
      {/* Ajout du composant Toast */}
      <Toast ref={toast} />
      
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-pencil me-2"></i>
                  Modifier le fournisseur
                  {form.values.name && (
                    <span className="text-muted ms-2">- {form.values.name}</span>
                  )}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title="Retour à la liste"
                  onClick={() => navigate('/suppliers')}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {form.loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={form.handleSubmit}>
                  <div className="row">
                    <div className="col-12">
                      <FormField
                        name="name"
                        form={form}
                        type="text"
                        label="Nom du fournisseur"
                        placeholder="Saisissez le nom du fournisseur"
                        icon="pi pi-building"
                        required
                        helperText="Le nom doit contenir au moins 2 caractères"
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="phone"
                        form={form}
                        type="tel"
                        label="Téléphone"
                        placeholder="Saisissez le numéro de téléphone"
                        icon="pi pi-phone"
                        helperText="Numéro de téléphone (optionnel)"
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="email"
                        form={form}
                        type="email"
                        label="Email"
                        placeholder="Saisissez l'adresse email"
                        icon="pi pi-envelope"
                        helperText="Adresse email (optionnel)"
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-12">
                      <FormField
                        name="address"
                        form={form}
                        type="textarea"
                        label="Adresse"
                        placeholder="Saisissez l'adresse complète"
                        icon="pi pi-map-marker"
                        helperText="Adresse complète (optionnel)"
                        rows={3}
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
                        onClick={() => navigate('/suppliers')}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersEditScreen;