import React from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';

const UsersEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = React.useRef(null);

  const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
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

  const loadData = async (userId) => {
    const response = await ApiService.get(`/api/users/${userId}`);

    if (response.success) {
      // Formater la date de naissance pour l'input date
      const userData = { ...response.data };
      if (userData.date_of_birth) {
        userData.date_of_birth = new Date(userData.date_of_birth).toISOString().split('T')[0];
      }
      return { success: true, data: userData };
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
    const response = await ApiService.put(`/api/users/${entityId}`, values);

    if (response.success) {
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Utilisateur modifié avec succès',
        life: 3000
      });
      
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

  // Formater le nom complet
  const getFullName = () => {
    const parts = [];
    if (form.values.first_name) parts.push(form.values.first_name);
    if (form.values.last_name) parts.push(form.values.last_name);
    return parts.join(' ') || 'Utilisateur';
  };

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      <div className="row justify-content-center">
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-user-edit me-2"></i>
                  Modifier l'utilisateur
                  {!form.loading && form.values.first_name && (
                    <span className="text-muted ms-2">- {getFullName()}</span>
                  )}
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
              {form.loading ? (
                <div className="text-center py-5">
                  <i className="pi pi-spin pi-spinner me-2"></i>
                  Chargement des données...
                </div>
              ) : (
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
                        disabled={form.loading}
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
                        disabled={form.loading}
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
                        disabled={form.loading}
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
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="date_of_birth"
                        form={form}
                        type="date"
                        label="Date de naissance"
                        icon="pi pi-calendar"
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="gender"
                        form={form}
                        type="select"
                        label="Genre"
                        icon="pi pi-users"
                        disabled={form.loading}
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
                        disabled={form.loading}
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
                        disabled={form.loading}
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
                        disabled={form.loading}
                        options={[
                          { value: 'active', label: 'Actif' },
                          { value: 'inactive', label: 'Inactif' },
                          { value: 'suspended', label: 'Suspendu' }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersEditScreen;