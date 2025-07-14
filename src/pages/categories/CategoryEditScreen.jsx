import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useNavigate, useParams } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';

const CategoryEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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

  const loadData = async (categoryId) => {
    const response = await fetch(`/api/categories/${categoryId}`);
    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.data };
    } else {
      throw new Error(data.message || 'Erreur lors du chargement');
    }
  };

  const handleSubmit = async (values, isEditing, entityId) => {
    const response = await fetch(`/api/categories/${entityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    });

    const data = await response.json();

    if (response.ok) {
      navigate('/categories');
      return { success: true, message: 'Catégorie modifiée avec succès' };
    } else {
      if (response.status === 422) {
        throw { status: 422, errors: data.errors };
      }
      throw new Error(data.message || 'Erreur lors de la modification');
    }
  };

  const form = useForm({
    initialValues,
    validationRules,
    onSubmit: handleSubmit,
    loadData,
    entityId: id
  });

  const cardHeader = (
    <div className="d-flex justify-content-between align-items-center">
      <h4 className="m-0">
        <i className="pi pi-pencil me-2"></i>
        Modifier la catégorie
        {form.values.name && (
          <span className="text-muted ms-2">- {form.values.name}</span>
        )}
      </h4>
      <Button
        icon="pi pi-arrow-left"
        className="p-button-text p-button-secondary"
        tooltip="Retour à la liste"
        onClick={() => navigate('/categories')}
      />
    </div>
  );

  if (form.loading) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <Card header={cardHeader}>
              <div className="text-center py-5">
                <ProgressSpinner />
                <p className="mt-3 text-muted">Chargement des données...</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
                {id}
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

              <div className="d-flex justify-content-between align-items-center mt-4">
                <div>
                  <Button
                    type="button"
                    label="Réinitialiser"
                    icon="pi pi-refresh"
                    className="p-button-warning p-button-outlined"
                    onClick={form.reset}
                    disabled={form.submitting}
                  />
                </div>
                
                <div className="d-flex gap-2">
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
                    label={form.submitting ? 'Modification...' : 'Modifier'}
                    icon={form.submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                    className="p-button-success"
                    disabled={!form.canSubmit}
                    loading={form.submitting}
                  />
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoryEditScreen;