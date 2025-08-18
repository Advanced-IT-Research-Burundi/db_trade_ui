import React from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';

const VehiculeEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = React.useRef(null);

  const initialValues = {
    name: '',
    model: '',
    immatriculation: '',
    brand: '',
    year: '',
    color: '',
    poids: '',
    price: '',
    status: 'disponible',
    description: ''
  };

  const validationRules = {
    name: {
      maxLength: 255
    },
    model: {
      maxLength: 255
    },
    immatriculation: {
      maxLength: 255
    },
    brand: {
      maxLength: 255
    },
    year: {
      min: 1900,
      max: new Date().getFullYear() + 2
    },
    color: {
      maxLength: 255
    },
    poids: {
      min: 0
    },
    price: {
      min: 0
    },
    status: {
      required: 'Le statut est requis'
    },
    description: {
      maxLength: 1000
    }
  };

  // Options pour le statut
  const statusOptions = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'en_location', label: 'En location' },
    { value: 'en_reparation', label: 'En réparation' },
    // { value: 'hors_service', label: 'Hors service' },
    // { value: 'reserve', label: 'Réservé' }
  ];

  const loadData = async (vehiculeId) => {
    const response = await ApiService.get(`/api/vehicules/${vehiculeId}`);

    if (response.success) {
      const data = { ...response.data };
      
      // Convertir les valeurs null en chaînes vides pour les inputs
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
    // Nettoyer les valeurs vides (convertir en null pour les champs nullable)
    const cleanedValues = {};
    Object.keys(values).forEach(key => {
      if (values[key] === '' || values[key] === null) {
        cleanedValues[key] = null;
      } else {
        cleanedValues[key] = values[key];
      }
    });

    const response = await ApiService.put(`/api/vehicules/${entityId}`, cleanedValues);

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Véhicule modifié avec succès',
        life: 3000
      });
      
      // Attendre un peu avant de naviguer pour que l'utilisateur voie le toast
      setTimeout(() => {
        navigate('/vehicles');
      }, 1000);
      
      return { success: true, message: 'Véhicule modifié avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la modification du véhicule',
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
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0">
                  <i className="pi pi-pencil me-2"></i>
                  Modifier le véhicule
                  {form.values.name && (
                    <span className="text-muted ms-2">- {form.values.name}</span>
                  )}
                  {!form.values.name && form.values.immatriculation && (
                    <span className="text-muted ms-2">- {form.values.immatriculation}</span>
                  )}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  title="Retour à la liste"
                  onClick={() => navigate('/vehicles')}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={form.handleSubmit}>
                <div className="row">
                  {/* Informations générales */}
                  <div className="col-md-6">
                    <FormField
                      name="name"
                      form={form}
                      type="text"
                      label="Nom du véhicule"
                      placeholder="Ex: Véhicule de service 1"
                      icon="pi pi-car"
                      helperText="Nom ou désignation du véhicule (optionnel)"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="brand"
                      form={form}
                      type="text"
                      label="Marque"
                      placeholder="Ex: Toyota, Renault, Ford"
                      icon="pi pi-bookmark"
                      helperText="Marque du véhicule (optionnel)"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="model"
                      form={form}
                      type="text"
                      label="Modèle"
                      placeholder="Ex: Hilux, Clio, Transit"
                      icon="pi pi-cog"
                      helperText="Modèle du véhicule (optionnel)"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="immatriculation"
                      form={form}
                      type="text"
                      label="Immatriculation"
                      placeholder="Ex: AB-123-CD"
                      icon="pi pi-id-card"
                      helperText="Numéro d'immatriculation (optionnel)"
                      disabled={form.loading}
                    />
                  </div>

                  {/* Caractéristiques */}
                  <div className="col-md-4">
                    <FormField
                      name="year"
                      form={form}
                      type="number"
                      label="Année"
                      placeholder="Ex: 2020"
                      icon="pi pi-calendar"
                      helperText="Année de fabrication"
                      min="1900"
                      max={new Date().getFullYear() + 2}
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-4">
                    <FormField
                      name="color"
                      form={form}
                      type="text"
                      label="Couleur"
                      placeholder="Ex: Blanc, Noir, Rouge"
                      icon="pi pi-palette"
                      helperText="Couleur du véhicule"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-4">
                    <FormField
                      name="poids"
                      form={form}
                      type="number"
                      label="Poids (kg)"
                      placeholder="0.00"
                      icon="pi pi-clone"
                      helperText="Poids du véhicule en kilogrammes"
                      step="0.1"
                      min="0"
                      disabled={form.loading}
                    />
                  </div>

                  {/* Prix et statut */}
                  <div className="col-md-6">
                    <FormField
                      name="price"
                      form={form}
                      type="number"
                      label="Prix"
                      placeholder="0.00"
                      icon="pi pi-dollar"
                      helperText="Prix d'achat ou valeur du véhicule"
                      step="0.01"
                      min="0"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="status"
                      form={form}
                      type="select"
                      label="Statut"
                      placeholder="Sélectionnez un statut"
                      icon="pi pi-flag"
                      required
                      helperText="Statut actuel du véhicule"
                      options={statusOptions}
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="description"
                      form={form}
                      type="textarea"
                      label="Description"
                      placeholder="Description ou remarques sur le véhicule (optionnel)"
                      icon="pi pi-align-left"
                      helperText="Description détaillée du véhicule (maximum 1000 caractères)"
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
                      onClick={() => navigate('/vehicles')}
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

export default VehiculeEditScreen;