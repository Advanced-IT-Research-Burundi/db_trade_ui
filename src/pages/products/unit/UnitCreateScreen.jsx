import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../../hooks/useForm';
import FormField from '../../../components/input/FormField';
import ApiService from '../../../services/api.js';
import { Toast } from 'primereact/toast';

const UnitCreateScreen = () => {
  const navigate = useNavigate();
  const toast = React.useRef(null);

  const initialValues = {
    name: '',
    abbreviation: '',
    description: ''
  };

  const validationRules = {
    name: {
      required: 'Le nom est requis',
      minLength: 2,
      maxLength: 255
    },
    abbreviation: {
      maxLength: 20
    },
    description: {
      maxLength: 1000
    }
  };

  const handleSubmit = async (values) => {
    const response = await ApiService.post('/api/units', values);

    if (response.success) {
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Unité créée avec succès',
        life: 3000
      });
      
      setTimeout(() => {
        navigate('/products/units');
      }, 1000);

      console.log("response : " +response);

    //   return { success: true, message: 'Unité créée avec succès' };
    } else {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: response.error || 'Erreur lors de la création de l\'unité',
        life: 3000
      });
      
    //   if (response.status === 422) {
    //     throw { status: 422, errors: response.errors };
    //   }
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
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-plus me-2"></i>
                  Nouvelle unité de mesure
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title="Retour à la liste"
                  onClick={() => navigate('/units')}
                >
                  <i className="pi pi-arrow-left"></i>
                </button>
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={form.handleSubmit}>
                <div className="row">
                  <div className="col-12">
                    <FormField
                      name="name"
                      form={form}
                      type="text"
                      label="Nom de l'unité"
                      placeholder="Ex: Kilogramme, Mètre, Litre..."
                      icon="pi pi-calculator"
                      required
                      helperText="Le nom doit contenir au moins 2 caractères"
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="abbreviation"
                      form={form}
                      type="text"
                      label="Abréviation"
                      placeholder="Ex: kg, m, l..."
                      icon="pi pi-tag"
                      helperText="Abréviation courte de l'unité (optionnel, max 20 caractères)"
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="description"
                      form={form}
                      type="textarea"
                      label="Description"
                      placeholder="Description détaillée de l'unité de mesure (optionnel)"
                      icon="pi pi-align-left"
                      helperText="Description optionnelle (maximum 1000 caractères)"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/units')}
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

export default UnitCreateScreen;