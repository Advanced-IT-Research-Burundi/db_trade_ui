import React, { useState } from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';

const UserEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = React.useRef(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    profile_photo: null,
    status: 'active',
    role: 'salesperson',
    permissions: ''
  };

  const validationRules = {
    first_name: {
      maxLength: 255
    },
    last_name: {
      maxLength: 255
    },
    email: {
      required: 'L\'email est requis',
      email: true,
      maxLength: 255
    },
    password: {
      minLength: 8
    },
    password_confirmation: {
      matchField: 'password'
    },
    phone: {
      maxLength: 20
    },
    address: {
      maxLength: 1000
    },
    gender: {
      maxLength: 50
    },
    status: {
      required: 'Le statut est requis'
    },
    role: {
      required: 'Le rôle est requis'
    }
  };

  // Options pour les champs select
  const statusOptions = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'suspended', label: 'Suspendu' },
    { value: 'pending', label: 'En attente' }
  ];

  const roleOptions = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'manager', label: 'Manager' },
    { value: 'salesperson', label: 'Commercial' },
    { value: 'accountant', label: 'Comptable' },
    { value: 'user', label: 'Utilisateur' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Homme' },
    { value: 'female', label: 'Femme' },
    { value: 'other', label: 'Autre' }
  ];

  const loadData = async (userId) => {
    const response = await ApiService.get(`/api/users/${userId}`);

    if (response.success) {
      const data = { ...response.data };
      
      // Stocker la photo actuelle si elle existe
      if (data.profile_photo) {
        setCurrentPhoto(data.profile_photo);
      }
      
      // Formater les permissions JSON
      if (data.permissions && typeof data.permissions === 'object') {
        data.permissions = JSON.stringify(data.permissions, null, 2);
      }
      
      // Ne pas inclure le mot de passe dans les valeurs du formulaire
      delete data.password;
      delete data.profile_photo;
      
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
    // Créer un FormData pour gérer le fichier photo
    const formData = new FormData();
    
    // Ajouter tous les champs au FormData
    Object.keys(values).forEach(key => {
      if (key === 'profile_photo' && values[key]) {
        // Pour les fichiers, ajouter le premier fichier seulement si un nouveau fichier est sélectionné
        formData.append(key, values[key][0]);
      } else if (key === 'permissions' && values[key]) {
        // Traiter les permissions JSON
        try {
          // Vérifier si c'est du JSON valide
          JSON.parse(values[key]);
          formData.append(key, values[key]);
        } catch (e) {
          // Si ce n'est pas du JSON valide, on l'ignore
          console.warn('Permissions JSON non valide:', values[key]);
        }
      } else if (key === 'password' && values[key]) {
        // N'envoyer le mot de passe que s'il est rempli
        formData.append(key, values[key]);
      } else if (key !== 'password_confirmation' && key !== 'password' && key !== 'profile_photo' && values[key] !== null && values[key] !== '') {
        formData.append(key, values[key]);
      }
    });

    const response = await ApiService.put(`/api/users/${entityId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Utilisateur modifié avec succès',
        life: 3000
      });
      
      // Attendre un peu avant de naviguer pour que l'utilisateur voie le toast
      setTimeout(() => {
        navigate('/users');
      }, 1000);
      
      return { success: true, message: 'Utilisateur modifié avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la modification de l\'utilisateur',
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
                  Modifier l'utilisateur
                  {(form.values.first_name || form.values.last_name) && (
                    <span className="text-muted ms-2">
                      - {form.values.first_name} {form.values.last_name}
                    </span>
                  )}
                  {!form.values.first_name && !form.values.last_name && form.values.email && (
                    <span className="text-muted ms-2">- {form.values.email}</span>
                  )}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  title="Retour à la liste"
                  onClick={() => navigate('/users')}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={form.handleSubmit}>
                <div className="row">
                  {/* Informations personnelles */}
                  <div className="col-md-6">
                    <FormField
                      name="first_name"
                      form={form}
                      type="text"
                      label="Prénom"
                      placeholder="Prénom de l'utilisateur"
                      icon="pi pi-user"
                      helperText="Prénom de l'utilisateur (optionnel)"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="last_name"
                      form={form}
                      type="text"
                      label="Nom"
                      placeholder="Nom de famille"
                      icon="pi pi-user"
                      helperText="Nom de famille de l'utilisateur (optionnel)"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="email"
                      form={form}
                      type="email"
                      label="Email"
                      placeholder="email@exemple.com"
                      icon="pi pi-envelope"
                      required
                      helperText="Adresse email unique de l'utilisateur"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="phone"
                      form={form}
                      type="tel"
                      label="Téléphone"
                      placeholder="+1234567890"
                      icon="pi pi-phone"
                      helperText="Numéro de téléphone (optionnel)"
                      disabled={form.loading}
                    />
                  </div>

                  {/* Mot de passe */}
                  <div className="col-md-6">
                    <FormField
                      name="password"
                      form={form}
                      type="password"
                      label="Nouveau mot de passe"
                      placeholder="Laisser vide pour conserver l'actuel"
                      icon="pi pi-lock"
                      helperText="Nouveau mot de passe (optionnel, minimum 8 caractères)"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="password_confirmation"
                      form={form}
                      type="password"
                      label="Confirmer le nouveau mot de passe"
                      placeholder="Confirmer le nouveau mot de passe"
                      icon="pi pi-lock"
                      helperText="Confirmation du nouveau mot de passe"
                      disabled={form.loading}
                    />
                  </div>

                  {/* Informations complémentaires */}
                  <div className="col-md-6">
                    <FormField
                      name="date_of_birth"
                      form={form}
                      type="date"
                      label="Date de naissance"
                      icon="pi pi-calendar"
                      helperText="Date de naissance (optionnel)"
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="gender"
                      form={form}
                      type="select"
                      label="Genre"
                      placeholder="Sélectionnez le genre"
                      icon="pi pi-users"
                      helperText="Genre de l'utilisateur"
                      options={genderOptions}
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="address"
                      form={form}
                      type="textarea"
                      label="Adresse"
                      placeholder="Adresse complète de l'utilisateur"
                      icon="pi pi-map-marker"
                      helperText="Adresse complète (optionnel)"
                      rows={3}
                      disabled={form.loading}
                    />
                  </div>

                  {/* Rôle et statut */}
                  <div className="col-md-6">
                    <FormField
                      name="role"
                      form={form}
                      type="select"
                      label="Rôle"
                      placeholder="Sélectionnez un rôle"
                      icon="pi pi-shield"
                      required
                      helperText="Rôle de l'utilisateur dans le système"
                      options={roleOptions}
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
                      helperText="Statut actuel de l'utilisateur"
                      options={statusOptions}
                      disabled={form.loading}
                    />
                  </div>

                  {/* Photo et permissions */}
                  <div className="col-md-6">
                    <FormField
                      name="profile_photo"
                      form={form}
                      type="file"
                      label="Photo de profil"
                      icon="pi pi-image"
                      helperText="Nouvelle photo de profil (optionnel)"
                      accept="image/*"
                      disabled={form.loading}
                    />
                    
                    {/* Affichage de la photo actuelle */}
                    {currentPhoto && (
                      <div className="mt-2">
                        <small className="text-muted">Photo actuelle :</small>
                        <div className="mt-1">
                          <img 
                            src={currentPhoto} 
                            alt="Photo de profil actuelle" 
                            className="img-thumbnail rounded-circle"
                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="permissions"
                      form={form}
                      type="textarea"
                      label="Permissions (JSON)"
                      placeholder='{"read": true, "write": false}'
                      icon="pi pi-cog"
                      helperText="Permissions spécifiques au format JSON (optionnel)"
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
                      onClick={() => navigate('/users')}
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

export default UserEditScreen;