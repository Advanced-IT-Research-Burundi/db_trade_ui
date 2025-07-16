import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const SuppliersCreateScreen = () => {
  const navigate = useNavigate();
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

  const handleSubmit = async (values) => {
    // Nettoyer les valeurs vides
    const cleanValues = Object.keys(values).reduce((acc, key) => {
      if (values[key] && values[key].trim() !== '') {
        acc[key] = values[key].trim();
      }
      return acc;
    }, {});

    const response = await ApiService.post('/api/suppliers', cleanValues);

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Fournisseur créé avec succès',
        life: 3000
      });
      
      // Attendre un peu avant de naviguer pour que l'utilisateur voie le toast
      setTimeout(() => {
        navigate('/suppliers');
      }, 1000);
      
      return { success: true, message: 'Fournisseur créé avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la création du fournisseur',
        life: 3000
      });
      
      if (response.status === 422) {
        toast.current.show(
          {
            severity: 'error',
            summary: 'Validation échouée',
            detail: response.errors || 'Veuillez corriger les erreurs du formulaire',
            life: 3000
          }
        );
        // throw { status: 422, errors: response.errors };
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
                <h4 className="m-0 text-primary">
                  <i className="pi pi-plus me-2"></i>
                  Nouveau fournisseur
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

            {/* Body de la card */}
            <div className="card-body">
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
                    />
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/suppliers')}
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

export default SuppliersCreateScreen;