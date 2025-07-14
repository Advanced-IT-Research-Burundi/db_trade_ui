import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import  ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const CategoryCreateScreen = () => {
  const navigate = useNavigate();
  const toast = React.useRef(null);

  const initialValues = {
    name: '',
    description: ''
  };

  const validationRules = {
    name: {
      required: 'Le nom est requis',
      minLength: 3,
      maxLength: 255
    },
    description: {
      maxLength: 1000
    }
  };

  const handleSubmit = async (values) => {
  const response = await ApiService.post('/api/categories',values);

    // const data = await response.json();

    if (response.success) {
      navigate('/categories');
      return { success: true, message: 'Catégorie créée avec succès' };
    } else {
        toast.current.show({
      severity: 'error',
      summary: 'Erreur',
      detail: response.message || 'Erreur lors de la création de la catégorie',
      life: 3000
    });
      if (response.status === 422) {
        throw { status: 422, errors: response.errors };
      }
      toast.current.show({
      severity: 'error',
      summary: 'Erreur',
      detail: response.message || 'Erreur lors de la création de la catégorie',
      life: 3000
    });
      // throw new Error(response.message || 'Erreur lors de la création');
    }
  };

  const form = useForm({
    initialValues,
    validationRules,
    onSubmit: handleSubmit
  });

  const cardHeader = (
    <div className="d-flex justify-content-between align-items-center">
      <h4 className="m-0">
        <i className="pi pi-plus me-2"></i>
        Nouvelle catégorie
      </h4>
      <Button
        icon="pi pi-arrow-left"
        className="p-button-text p-button-secondary"
        tooltip="Retour à la liste"
        onClick={() => navigate('/categories')}
      />
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <Card header={cardHeader}>
            <form onSubmit={form.handleSubmit}>
              <div className="row">
                <div className="col-12">
                  <FormField
                    name="name"
                    form={form}
                    type="text"
                    label="Nom de la catégorie"
                    placeholder="Saisissez le nom de la catégorie"
                    icon="pi pi-tag"
                    required
                    helperText="Le nom doit contenir entre 3 et 255 caractères"
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
                    helperText="Description optionnelle (maximum 1000 caractères)"
                    rows={4}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  type="button"
                  label="Annuler"
                  icon="pi pi-times"
                  className="p-button-secondary"
                  onClick={() => navigate('/categories')}
                  disabled={form.submitting}
                />
                <Button
                  type="submit"
                  label={form.submitting ? 'Création...' : 'Créer'}
                  icon={form.submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                  className="p-button-success"
                  disabled={!form.canSubmit}
                  loading={form.submitting}
                />
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoryCreateScreen;
