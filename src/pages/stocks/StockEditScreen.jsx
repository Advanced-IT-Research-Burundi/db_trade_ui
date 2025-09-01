import React from 'react';
import { useIntl } from 'react-intl';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';

import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';

const StockEditScreen = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = React.useRef(null);

  const initialValues = {
    name: '',
    location: '',
    description: ''
  };

  const validationRules = {
    name: {
      required: intl.formatMessage({id: "stockEdit.stockNameRequired"}),
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

  const loadData = async (stockId) => {
    const response = await ApiService.get(`/api/stocks/${stockId}`);

    if (response.success) {
      return { success: true, data: response.data.stock };
    } else {
      toast.current.show({
        severity: 'error',
        summary: intl.formatMessage({id: "stockEdit.error"}),
        detail: response.error || intl.formatMessage({id: "stockEdit.loadError"}),
        life: 3000
      });
      throw new Error(response.message || intl.formatMessage({id: "stockEdit.loadError"}));
    }
  };

  const handleSubmit = async (values, isEditing, entityId) => {
    const response = await ApiService.put(`/api/stocks/${entityId}`, values);

    if (response.success) {
      toast.current.show({
        severity: 'success',
        summary: intl.formatMessage({id: "stockEdit.success"}),
        detail: intl.formatMessage({id: "stockEdit.stockUpdated"}),
        life: 3000
      });
      
      setTimeout(() => {
        navigate('/stocks');
      }, 1000);
      
      return { success: true, message: intl.formatMessage({id: "stockEdit.stockUpdated"}) };
    } else {
      toast.current.show({
        severity: 'error',
        summary: intl.formatMessage({id: "stockEdit.error"}),
        detail: response.error || intl.formatMessage({id: "stockEdit.updateError"}),
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
      <Toast ref={toast} />
      
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0">
                  <i className="pi pi-pencil me-2"></i>
                  {intl.formatMessage({id: "stockEdit.title"})}
                  {form.values.name && (
                    <span className="text-muted ms-2">- {form.values.name}</span>
                  )}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  title={intl.formatMessage({id: "stockEdit.backToList"})}
                  onClick={() => navigate('/stocks')}
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
                      label={intl.formatMessage({id: "stockEdit.stockName"})}
                      placeholder={intl.formatMessage({id: "stockEdit.stockNamePlaceholder"})}
                      icon="pi pi-box"
                      required
                      helperText={intl.formatMessage({id: "stockEdit.stockNameHelper"})}
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="location"
                      form={form}
                      type="text"
                      label={intl.formatMessage({id: "stockEdit.location"})}
                      placeholder={intl.formatMessage({id: "stockEdit.locationPlaceholder"})}
                      icon="pi pi-map-marker"
                      helperText={intl.formatMessage({id: "stockEdit.locationHelper"})}
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="description"
                      form={form}
                      type="textarea"
                      label={intl.formatMessage({id: "stockEdit.description"})}
                      placeholder={intl.formatMessage({id: "stockEdit.descriptionPlaceholder"})}
                      icon="pi pi-align-left"
                      helperText={intl.formatMessage({id: "stockEdit.descriptionHelper"})}
                      rows={4}
                      disabled={form.loading}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <button
                      type="button"
                      className="btn btn-outline-warning"
                      onClick={form.reset}
                      disabled={form.submitting || form.loading}
                    >
                      <i className="pi pi-refresh me-2"></i>
                      {intl.formatMessage({id: "stockEdit.reset"})}
                    </button>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/stocks')}
                      disabled={form.submitting || form.loading}
                    >
                      <i className="pi pi-times me-2"></i>
                      {intl.formatMessage({id: "stockEdit.cancel"})}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={!form.canSubmit || form.loading}
                    >
                      <i className={`${form.submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'} me-2`}></i>
                      {form.submitting ? intl.formatMessage({id: "stockEdit.updating"}) : intl.formatMessage({id: "stockEdit.update"})}
                    </button>
                  </div>
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