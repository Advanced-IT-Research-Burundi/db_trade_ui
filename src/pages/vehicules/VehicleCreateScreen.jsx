import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const VehiculeCreateScreen = () => {
  const navigate = useNavigate();
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

  const handleSubmit = async (values) => {
    // Nettoyer les valeurs vides (convertir en null pour les champs nullable)
    const cleanedValues = {};
    Object.keys(values).forEach(key => {
      if (values[key] === '' || values[key] === null) {
        cleanedValues[key] = null;
      } else {
        cleanedValues[key] = values[key];
      }
    });

    const response = await ApiService.post('/api/vehicules', cleanedValues);

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Véhicule créé avec succès',
        life: 3000
      });
      
      setTimeout(() => {
        navigate('/vehicles');
      }, 1000);
      
      return { success: true, message: 'Véhicule créé avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la création du véhicule',
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
                  Nouveau véhicule
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title="Retour à la liste"
                  onClick={() => navigate('/vehicles')}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>

            {/* Body de la card */}
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
                    />
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/vehicles')}
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

export default VehiculeCreateScreen;