import React, { useEffect, useState } from 'react';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';

const ProductEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = React.useRef(null);
  
  // États pour les options des selects
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [currentImage, setCurrentImage] = useState(null);

  const initialValues = {
    code: '',
    name: '',
    description: '',
    category_id: '',
    purchase_price: '',
    sale_price_ht: '',
    sale_price_ttc: '',
    unit: '',
    alert_quantity: '',
    image: null
  };

  const validationRules = {
    code: {
      required: 'Le code est requis',
      minLength: 2,
      maxLength: 50
    },
    name: {
      required: 'Le nom est requis',
      minLength: 2,
      maxLength: 255
    },
    description: {
      maxLength: 1000
    },
    category_id: {
      required: 'La catégorie est requise'
    },
    purchase_price: {
      required: 'Le prix d\'achat est requis',
      min: 0
    },
    sale_price_ht: {
      min: 0
    },
    sale_price_ttc: {
      required: 'Le prix de vente TTC est requis',
      min: 0
    },
    unit: {
      required: 'L\'unité est requise',
      maxLength: 50
    },
    alert_quantity: {
      required: 'La quantité d\'alerte est requise',
      min: 0
    }
  };

  // Charger les options pour les selects
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        
        // Charger les catégories
        const categoriesResponse = await ApiService.get('/api/categories');
        if (categoriesResponse.success) {
          const categoriesFormatted = categoriesResponse.data.categories.data.map(category => ({
            value: category.id,
            label: category.name
          }));
          setCategoryOptions(categoriesFormatted);
        }
        
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des données',
          life: 3000
        });
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const loadData = async (productId) => {
    const response = await ApiService.get(`/api/products/${productId}`);

    if (response.success) {
      const data = { ...response.data };
      
      // Stocker l'image actuelle si elle existe
      if (data.image) {
        setCurrentImage(data.image);
      }
      
      // Ne pas inclure l'image dans les valeurs du formulaire
      // (le champ file sera vide par défaut)
      delete data.image;
      
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
    // Créer un FormData pour gérer le fichier image
    const formData = new FormData();
    
    // Ajouter tous les champs au FormData
    Object.keys(values).forEach(key => {
      if (key === 'image' && values[key] && values[key].length > 0) {
        // Pour les fichiers, ajouter le premier fichier seulement si un nouveau fichier est sélectionné
        formData.append(key, values[key][0]);
      } else if (key !== 'image') {
        // Ajouter tous les autres champs, même s'ils sont vides
        formData.append(key, values[key] || '');
      }
    });

    // Debug FormData
    console.log('Form values:', values);
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await ApiService.put(`/api/products/${entityId}`, values, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Produit modifié avec succès',
        life: 3000
      });
      
      // Attendre un peu avant de naviguer pour que l'utilisateur voie le toast
      setTimeout(() => {
        navigate('/products');
      }, 1000);
      
      return { success: true, message: 'Produit modifié avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la modification du produit',
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
                  Modifier le produit
                  {form.values.name && (
                    <span className="text-muted ms-2">- {form.values.name}</span>
                  )}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  title="Retour à la liste"
                  onClick={() => navigate('/products')}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>
            <div className="card-body">
              {loadingOptions && (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="mt-2 text-muted">Chargement des données...</p>
                </div>
              )}
              
              {!loadingOptions && (
                <form onSubmit={form.handleSubmit}>
                  <div className="row">
                    {/* Informations de base */}
                    <div className="col-md-6">
                      <FormField
                        name="code"
                        form={form}
                        type="text"
                        label="Code produit"
                        placeholder="Ex: PROD-001"
                        icon="pi pi-barcode"
                        required
                        helperText="Code unique du produit (2-50 caractères)"
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="name"
                        form={form}
                        type="text"
                        label="Nom du produit"
                        placeholder="Nom du produit"
                        icon="pi pi-tag"
                        required
                        helperText="Nom du produit (2-255 caractères)"
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-12">
                      <FormField
                        name="description"
                        form={form}
                        type="textarea"
                        label="Description"
                        placeholder="Description du produit (optionnel)"
                        icon="pi pi-align-left"
                        helperText="Description détaillée du produit (maximum 1000 caractères)"
                        rows={3}
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="category_id"
                        form={form}
                        type="select"
                        label="Catégorie"
                        placeholder="Sélectionnez une catégorie"
                        icon="pi pi-list"
                        required
                        helperText="Catégorie du produit"
                        options={categoryOptions}
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="unit"
                        form={form}
                        type="text"
                        label="Unité"
                        placeholder="Ex: pièce, kg, litre"
                        icon="pi pi-calculator"
                        required
                        helperText="Unité de mesure du produit"
                        disabled={form.loading}
                      />
                    </div>

                    {/* Prix */}
                    <div className="col-md-4">
                      <FormField
                        name="purchase_price"
                        form={form}
                        type="number"
                        label="Prix d'achat"
                        placeholder="0.00"
                        icon="pi pi-shopping-cart"
                        required
                        helperText="Prix d'achat HT"
                        step="0.01"
                        min="0"
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-4">
                      <FormField
                        name="sale_price_ht"
                        form={form}
                        type="number"
                        label="Prix de vente HT"
                        placeholder="0.00 (optionnel)"
                        icon="pi pi-money-bill"
                        helperText="Prix de vente hors taxes"
                        step="0.01"
                        min="0"
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-4">
                      <FormField
                        name="sale_price_ttc"
                        form={form}
                        type="number"
                        label="Prix de vente TTC"
                        placeholder="0.00"
                        icon="pi pi-dollar"
                        required
                        helperText="Prix de vente toutes taxes comprises"
                        step="0.01"
                        min="0"
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="alert_quantity"
                        form={form}
                        type="number"
                        label="Quantité d'alerte"
                        placeholder="0"
                        icon="pi pi-exclamation-triangle"
                        required
                        helperText="Seuil d'alerte pour le stock"
                        step="0.1"
                        min="0"
                        disabled={form.loading}
                      />
                    </div>

                    <div className="col-md-6">
                      <FormField
                        name="image"
                        form={form}
                        type="file"
                        label="Image du produit"
                        icon="pi pi-image"
                        helperText="Nouvelle image du produit (optionnel)"
                        accept="image/*"
                        disabled={form.loading}
                      />
                      
                      {/* Affichage de l'image actuelle */}
                      {currentImage && (
                        <div className="mt-2">
                          <small className="text-muted">Image actuelle :</small>
                          <div className="mt-1">
                            <img 
                              src={currentImage} 
                              alt="Image actuelle" 
                              className="img-thumbnail"
                              style={{ maxWidth: '150px', maxHeight: '150px' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      <button
                        type="button"
                        className="btn btn-outline-warning"
                        onClick={form.reset}
                        disabled={form.submitting || form.loading || loadingOptions}
                      >
                        <i className="pi pi-refresh me-2"></i>
                        Réinitialiser
                      </button>
                    </div>
                    
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/products')}
                        disabled={form.submitting || form.loading}
                      >
                        <i className="pi pi-times me-2"></i>
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={!form.canSubmit || form.loading || loadingOptions}
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

export default ProductEditScreen;