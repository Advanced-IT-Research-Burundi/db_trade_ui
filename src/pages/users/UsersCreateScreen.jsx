import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const UserCreateScreen = () => {
  const navigate = useNavigate();
  const toast = React.useRef(null);

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
      required: 'Le mot de passe est requis',
      minLength: 8
    },
    password_confirmation: {
      required: 'La confirmation du mot de passe est requise',
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

  const handleSubmit = async (values) => {
    // Créer un FormData pour gérer le fichier photo
    const formData = new FormData();
    
    // Ajouter tous les champs au FormData
    Object.keys(values).forEach(key => {
      if (key === 'profile_photo' && values[key]) {
        // Pour les fichiers, ajouter le premier fichier
        formData.append(key, values[key][0]);
      } else if (key === 'permissions' && values[key]) {
        // Traiter les permissions JSON
        try {
          // Vérifier si c'est du JSON valide
          JSON.parse(values[key]);
          formData.append(key, values[key]);
        } catch (e) {
          // Si ce n'est pas du JSON valide, on l'ignore ou on envoie une chaîne vide
          console.warn('Permissions JSON non valide:', values[key]);
        }
      } else if (key !== 'password_confirmation' && values[key] !== null && values[key] !== '') {
        formData.append(key, values[key]);
      }
    });

    const response = await ApiService.post('/api/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Utilisateur créé avec succès',
        life: 3000
      });
      
      // Attendre un peu avant de naviguer pour que l'utilisateur voie le toast
      setTimeout(() => {
        navigate('/users');
      }, 1000);
      
      return { success: true, message: 'Utilisateur créé avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la création de l\'utilisateur',
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
                  Nouvel utilisateur
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title="Retour à la liste"
                  onClick={() => navigate('/users')}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>

            {/* Body de la card */}
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
                    />
                  </div>

                  {/* Mot de passe */}
                  <div className="col-md-6">
                    <FormField
                      name="password"
                      form={form}
                      type="password"
                      label="Mot de passe"
                      placeholder="Mot de passe"
                      icon="pi pi-lock"
                      required
                      helperText="Mot de passe (minimum 8 caractères)"
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="password_confirmation"
                      form={form}
                      type="password"
                      label="Confirmer le mot de passe"
                      placeholder="Confirmer le mot de passe"
                      icon="pi pi-lock"
                      required
                      helperText="Confirmation du mot de passe"
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
                      helperText="Photo de profil de l'utilisateur (optionnel)"
                      accept="image/*"
                    />
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
                    />
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/users')}
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

export default UserCreateScreen;