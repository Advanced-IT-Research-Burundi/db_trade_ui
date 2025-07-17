import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const UsersCreateScreen = () => {
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
    role: 'salesperson',
    status: 'active'
  };

  const validationRules = {
    first_name: {
      required: 'Le prénom est requis',
      minLength: 2,
      maxLength: 255
    },
    last_name: {
      required: 'Le nom est requis',
      minLength: 2,
      maxLength: 255
    },
    email: {
      required: 'L\'email est requis',
      email: 'Format email invalide'
    },
    password: {
      required: 'Le mot de passe est requis',
      minLength: 8,
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      }
    },
    password_confirmation: {
      required: 'La confirmation du mot de passe est requise',
      match: {
        field: 'password',
        message: 'Les mots de passe ne correspondent pas'
      }
    },
    phone: {
      pattern: {
        value: /^[0-9+\-\s()]*$/,
        message: 'Format de téléphone invalide'
      }
    },
    role: {
      required: 'Le rôle est requis'
    },
    status: {
      required: 'Le statut est requis'
    }
  };

  const handleSubmit = async (values) => {
    const response = await ApiService.post('/api/users', values);

    if (response.success) {
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Utilisateur créé avec succès',
        life: 3000
      });
      
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
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-user-plus me-2"></i>
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

            <div className="card-body">
              <form onSubmit={form.handleSubmit}>
                <div className="row">
                  {/* Informations personnelles */}
                  <div className="col-12">
                    <h5 className="text-secondary mb-3">
                      <i className="pi pi-user me-2"></i>
                      Informations personnelles
                    </h5>
                  </div>
                  
                  <div className="col-md-6">
                    <FormField
                      name="first_name"
                      form={form}
                      type="text"
                      label="Prénom"
                      placeholder="Saisissez le prénom"
                      icon="pi pi-user"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="last_name"
                      form={form}
                      type="text"
                      label="Nom"
                      placeholder="Saisissez le nom"
                      icon="pi pi-user"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="email"
                      form={form}
                      type="email"
                      label="Email"
                      placeholder="exemple@email.com"
                      icon="pi pi-envelope"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="phone"
                      form={form}
                      type="tel"
                      label="Téléphone"
                      placeholder="+257 XX XX XX XX"
                      icon="pi pi-phone"
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="date_of_birth"
                      form={form}
                      type="date"
                      label="Date de naissance"
                      icon="pi pi-calendar"
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="gender"
                      form={form}
                      type="select"
                      label="Genre"
                      icon="pi pi-users"
                      options={[
                        { value: '', label: 'Sélectionnez un genre' },
                        { value: 'male', label: 'Homme' },
                        { value: 'female', label: 'Femme' },
                        { value: 'other', label: 'Autre' }
                      ]}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="address"
                      form={form}
                      type="textarea"
                      label="Adresse"
                      placeholder="Adresse complète"
                      icon="pi pi-map-marker"
                      rows={3}
                    />
                  </div>

                  {/* Sécurité */}
                  <div className="col-12 mt-4">
                    <h5 className="text-secondary mb-3">
                      <i className="pi pi-shield me-2"></i>
                      Sécurité
                    </h5>
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="password"
                      form={form}
                      type="password"
                      label="Mot de passe"
                      placeholder="Mot de passe sécurisé"
                      icon="pi pi-lock"
                      required
                      helperText="Au moins 8 caractères avec majuscule, minuscule et chiffre"
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="password_confirmation"
                      form={form}
                      type="password"
                      label="Confirmer le mot de passe"
                      placeholder="Confirmez le mot de passe"
                      icon="pi pi-lock"
                      required
                    />
                  </div>

                  {/* Configuration du compte */}
                  <div className="col-12 mt-4">
                    <h5 className="text-secondary mb-3">
                      <i className="pi pi-cog me-2"></i>
                      Configuration du compte
                    </h5>
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="role"
                      form={form}
                      type="select"
                      label="Rôle"
                      icon="pi pi-users"
                      required
                      options={[
                        { value: 'salesperson', label: 'Vendeur' },
                        { value: 'manager', label: 'Manager' },
                        { value: 'admin', label: 'Administrateur' }
                      ]}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormField
                      name="status"
                      form={form}
                      type="select"
                      label="Statut"
                      icon="pi pi-check-circle"
                      required
                      options={[
                        { value: 'active', label: 'Actif' },
                        { value: 'inactive', label: 'Inactif' },
                        { value: 'suspended', label: 'Suspendu' }
                      ]}
                    />
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
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
                    {form.submitting ? 'Création...' : 'Créer l\'utilisateur'}
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

export default UsersCreateScreen;