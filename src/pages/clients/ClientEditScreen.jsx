import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const ClientEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = React.useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const initialValues = {
    patient_type: 'physique',
    nif: '',
    societe: '',
    name: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    balance: 0
  };

  const getValidationRules = (values) => {
    const baseRules = {
      patient_type: {
        required: 'Le type de client est requis'
      },
      name: {
        required: 'Le nom est requis',
        minLength: 2,
        maxLength: 255
      },
      phone: {
        pattern: /^[0-9+\-\s()]+$/,
        minLength: 8,
        maxLength: 20
      },
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        maxLength: 255
      },
      address: {
        maxLength: 1000
      },
      balance: {
        min: 0
      }
    };

    if (values.patient_type === 'morale') {
      return {
        ...baseRules,
        nif: {
          required: 'Le NIF est requis pour une personne morale',
          minLength: 3,
          maxLength: 50
        },
        societe: {
          required: 'Le nom de la société est requis',
          minLength: 2,
          maxLength: 255
        }
      };
    } else {
      return {
        ...baseRules,
        first_name: {
          required: 'Le prénom est requis pour une personne physique',
          minLength: 2,
          maxLength: 255
        },
        last_name: {
          required: 'Le nom de famille est requis pour une personne physique',
          minLength: 2,
          maxLength: 255
        }
      };
    }
  };

  const handleSubmit = async (values) => {
    try {
      const response = await ApiService.put(`/api/clients/${id}`, values);

      if (response.success) {
        toast.current.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Client mis à jour avec succès',
          life: 3000
        });
        
        setTimeout(() => {
          navigate('/clients');
        }, 1000);
        
        return { success: true, message: 'Client mis à jour avec succès' };
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: response.message || 'Erreur lors de la mise à jour du client',
          life: 3000
        });
        
        if (response.status === 422) {
          throw { status: 422, errors: response.errors };
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la mise à jour du client',
        life: 3000
      });
      throw error;
    }
  };

  
  const form = useForm({
      initialValues,
      validate: (values) => getValidationRules(values)(values),
      onSubmit: handleSubmit,
      entityId: id,
      loadData: async (entityId) => {
        const response = await ApiService.get(`/api/clients/${entityId}`);

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
      }
  });

  // Charger les données du client
  useEffect(() => {
    const loadClientData = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.get(`/api/clients/${id}`);
        
        if (response.success) {
            return { success: true, data: response.data };
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger les données du client',
            life: 3000
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des données',
          life: 3000
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadClientData();
    }
  }, [id]);

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <i className="pi pi-spin pi-spinner text-primary" style={{ fontSize: '2rem' }}></i>
                <div className="mt-3">
                  <h5>Chargement des données du client...</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-pencil me-2"></i>
                  Modifier le client
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title="Retour à la liste"
                  onClick={() => navigate('/clients')}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={form.handleSubmit}>
                {/* Type de client */}
                <div className="row mb-3">
                  <div className="col-12">
                    <FormField
                      name="patient_type"
                      form={form}
                      type="select"
                      label="Type de client"
                      icon="pi pi-user"
                      required
                      disabled={isLoading}
                      options={[
                        { value: 'physique', label: 'Personne physique' },
                        { value: 'morale', label: 'Personne morale' }
                      ]}
                    />
                  </div>
                </div>

                {/* Champs conditionnels selon le type */}
                {form.values.patient_type === 'morale' ? (
                  <>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <FormField
                          name="nif"
                          form={form}
                          type="text"
                          label="NIF"
                          placeholder="Numéro d'Identification Fiscale"
                          icon="pi pi-id-card"
                          required
                          disabled={isLoading}
                          helperText="Numéro d'Identification Fiscale de la société"
                        />
                      </div>
                      <div className="col-md-6">
                        <FormField
                          name="societe"
                          form={form}
                          type="text"
                          label="Nom de la société"
                          placeholder="Nom de la société"
                          icon="pi pi-building"
                          required
                          disabled={isLoading}
                          helperText="Raison sociale de l'entreprise"
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12">
                        <FormField
                          name="name"
                          form={form}
                          type="text"
                          label="Nom du contact"
                          placeholder="Nom du contact"
                          icon="pi pi-user"
                          required
                          disabled={isLoading}
                          helperText="Nom de la personne de contact"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <FormField
                        name="name"
                        form={form}
                        type="text"
                        label="Nom"
                        placeholder="Nom"
                        icon="pi pi-user"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="col-md-4">
                      <FormField
                        name="first_name"
                        form={form}
                        type="text"
                        label="Prénom"
                        placeholder="Prénom"
                        icon="pi pi-user"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="col-md-4">
                      <FormField
                        name="last_name"
                        form={form}
                        type="text"
                        label="Nom de famille"
                        placeholder="Nom de famille"
                        icon="pi pi-user"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {/* Informations de contact */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <FormField
                      name="phone"
                      form={form}
                      type="text"
                      label="Téléphone"
                      placeholder="Numéro de téléphone"
                      icon="pi pi-phone"
                      disabled={isLoading}
                      helperText="Numéro de téléphone (optionnel)"
                    />
                  </div>
                  <div className="col-md-6">
                    <FormField
                      name="email"
                      form={form}
                      type="email"
                      label="Email"
                      placeholder="Adresse email"
                      icon="pi pi-envelope"
                      disabled={isLoading}
                      helperText="Adresse email (optionnel)"
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div className="row mb-3">
                  <div className="col-12">
                    <FormField
                      name="address"
                      form={form}
                      type="textarea"
                      label="Adresse"
                      placeholder="Adresse complète"
                      icon="pi pi-map-marker"
                      disabled={isLoading}
                      helperText="Adresse complète (optionnel)"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Solde initial */}
                {/* <div className="row mb-3">
                  <div className="col-md-6">
                    <FormField
                      name="balance"
                      form={form}
                      type="number"
                      label="Solde"
                      placeholder="0"
                      icon="pi pi-dollar"
                      disabled={isLoading}
                      helperText="Solde du compte client"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div> */}

                {/* Boutons d'action */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/clients')}
                    disabled={form.submitting || isLoading}
                  >
                    <i className="pi pi-times me-2"></i>
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={!form.canSubmit || isLoading}
                  >
                    <i className={`${form.submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'} me-2`}></i>
                    {form.submitting ? 'Modification...' : 'Modifier'}
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

export default ClientEditScreen;