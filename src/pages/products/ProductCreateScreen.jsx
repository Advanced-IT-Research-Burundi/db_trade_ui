import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const ProductCreateScreen = () => {
  const navigate = useNavigate();
  const toast = React.useRef(null);
  
  // États pour les options des selects
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const initialValues = {
    code: '',
    name: '',
    description: '',
    category_id: '',
    purchase_price: '',
    sale_price_ht: '',
    tva: '18', // TVA par défaut à 18%
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
      required: 'Le prix de vente HT est requis',
      min: 0
    },
    tva: {
      required: 'Le taux de TVA est requis',
      min: 0,
      max: 100
    },
    sale_price_ttc: {
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

  const tvaOptions = [
    { value: '0', label: '0%' },
    { value: '4', label: '4%' },
    { value: '10', label: '10%' },
    { value: '18', label: '18%' }
  ];

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const categoriesResponse = await ApiService.get('/api/categories');
        if (categoriesResponse.success) {
          const categoriesFormatted = categoriesResponse.data.categories.data.map(category => ({
            value: category.id,
            label: category.name 
          }));
          setCategoryOptions(categoriesFormatted);
        }
        const unitsResponse = await ApiService.get('/api/units');
        
        if (unitsResponse.success) {
          const unitsFormatted = unitsResponse.data.data.map(unit => ({
            value: unit.id,
            label: unit.name + ' ( ' + unit.abbreviation + ' )'
          }));
          setUnitOptions(unitsFormatted);
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

  // Fonction pour calculer le prix TTC
  const calculateTTC = (priceHT, tva) => {
    const ht = parseFloat(priceHT) || 0;
    const tvaTaux = parseFloat(tva) || 0;
    return (ht * (1 + tvaTaux / 100)).toFixed(2);
  };

  const handleSubmit = async (values) => {
    
    const formData = new FormData();
    
    
    const calculatedTTC = calculateTTC(values.sale_price_ht, values.tva);
    const finalValues = {
      ...values,
      sale_price_ttc: calculatedTTC
    };
    
    Object.keys(finalValues).forEach(key => {
      if (key === 'image' && finalValues[key] && finalValues[key].length > 0) {
        formData.append(key, finalValues[key][0]);
      } else if (key !== 'image') {
        formData.append(key, finalValues[key] || '');
      }
    });

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await ApiService.post('/api/products', finalValues, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Produit créé avec succès',
        life: 3000
      });
      
      setTimeout(() => {
        navigate('/products');
      }, 1000);
      
      return { success: true, message: 'Produit créé avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.message || 'Erreur lors de la création du produit',
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

  
  const [calculatedTTC, setCalculatedTTC] = useState('');

  useEffect(() => {
    if (form.values.sale_price_ht && form.values.tva) {
      const ttc = calculateTTC(form.values.sale_price_ht, form.values.tva);
      setCalculatedTTC(ttc);
      if (form.values.sale_price_ttc !== ttc) {
        form.values.sale_price_ttc = ttc;
      }
    }
  }, [form.values.sale_price_ht, form.values.tva]);

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-plus me-2"></i>
                  Nouveau produit
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title="Retour à la liste"
                  onClick={() => navigate('/products')}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>

            {/* Body de la card */}
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
                      />
                    </div>

                    <div className="col-md-4">
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
                      />
                    </div>

                    <div className="col-md-4">
                      <FormField
                        name="unit"
                        form={form}
                        type="select"
                        label="Unité"
                        placeholder="Sélectionnez une unité"
                        icon="pi pi-calculator"
                        required
                        helperText="Unité de mesure du produit"
                        options={unitOptions}
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
                      />
                    </div>

                    <div className="col-md-4">
                      <FormField
                        name="sale_price_ht"
                        form={form}
                        type="number"
                        label="Prix de vente HT"
                        placeholder="0.00"
                        icon="pi pi-money-bill"
                        required
                        helperText="Prix de vente hors taxes"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="col-md-4">
                      <FormField
                        name="tva"
                        form={form}
                        type="select"
                        label="TVA (%)"
                        placeholder="Taux de TVA"
                        icon="pi pi-percentage"
                        required
                        helperText="Taux de TVA applicable"
                        options={tvaOptions}
                      />
                    </div>

                    <div className="col-md-4">
                      <FormField
                        name="sale_price_ttc"
                        form={form}
                        type="number"
                        label="Prix de vente TTC"
                        placeholder="Calculé automatiquement"
                        icon="pi pi-dollar"
                        helperText="Prix calculé automatiquement (HT + TVA)"
                        step="0.01"
                        min="0"
                        value={calculatedTTC || form.values.sale_price_ttc}
                        readOnly
                        disabled
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
                      />
                    </div>

                    <div className="col-6">
                      <FormField
                        name="image"
                        form={form}
                        type="file"
                        label="Image du produit"
                        icon="pi pi-image"
                        helperText="Image du produit (optionnel)"
                        accept="image/*"
                      />
                    </div>
                  </div>
                  {/* Boutons d'action */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/products')}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCreateScreen;