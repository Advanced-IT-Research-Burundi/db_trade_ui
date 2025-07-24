import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const StockEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = React.useRef(null);
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState(null);

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

  const handleSubmit = async (values) => {
    const response = await ApiService.put(`/api/stocks/${id}`, values);

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Stock modifié avec succès',
        life: 3000
      });
      
      // Attendre un peu avant de naviguer pour que l'utilisateur voie le toast
      setTimeout(() => {
        navigate('/stocks');
      }, 1000);
      
      return { success: true, message: 'Stock modifié avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la modification du stock',
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

  // Charger les données du stock
  useEffect(() => {
    const loadStock = async () => {
      try {
        setLoading(true);
        const response = await ApiService.get(`/api/stocks/${id}`);
        
        if (response.success) {
          const stock = response.data.stock;
          console.log('Response from API:', response.data.stock);
          setStockData(stock);
          
          // Mettre à jour les valeurs du formulaire
          // form.setValues({
          //   name: stock.name || '',
          //   location: stock.location || '',
          //   description: stock.description || ''
          // });
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger les données du stock',
            life: 3000
          });
          navigate('/stocks');
        }
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement du stock',
          life: 3000
        });
        navigate('/stocks');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadStock();
    }
  }, [id, navigate]);



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
                  <i className="pi pi-pencil me-2"></i>
                  Modifier le stock
                  {stockData && (
                    <small className="text-muted ms-2">#{stockData.id}</small>
                  )}
                  {loading && (
                    <span className="ms-2">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </span>
                  )}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title="Retour à la liste"
                  onClick={() => navigate('/stocks')}
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
                      label="Nom du stock"
                      placeholder="Saisissez le nom du stock"
                      icon="pi pi-box"
                      required
                      disabled={loading}
                      helperText="Le nom doit contenir entre 3 et 255 caractères"
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
                      disabled={loading}
                      helperText="Localisation géographique ou adresse du stock (optionnel)"
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
                      disabled={loading}
                      helperText="Description détaillée du stock (maximum 1000 caractères)"
                      rows={4}
                    />
                  </div>
                </div>

                {loading && !stockData && (
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="alert alert-info d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm text-info me-2" role="status">
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                        <span>Chargement des données du stock...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/stocks')}
                    disabled={form.submitting || loading}
                  >
                    <i className="pi pi-times me-2"></i>
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!form.canSubmit || loading}
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

export default StockEditScreen;