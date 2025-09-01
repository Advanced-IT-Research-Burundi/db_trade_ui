import React from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import FormField from '../../components/input/FormField';
import ApiService from '../../services/api.js';
import { Toast } from 'primereact/toast';

const StockCreateScreen = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const toast = React.useRef(null);

  const initialValues = {
    name: '',
    location: '',
    description: ''
  };

  const validationRules = {
    name: {
      required: intl.formatMessage({id: "stockCreate.stockNameRequired"}),
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
    const response = await ApiService.post('/api/stocks', values);

    if (response.success) {
      // Afficher un toast de succès
      toast.current.show({
        severity: 'success',
        summary: intl.formatMessage({id: "stockCreate.success"}),
        detail: intl.formatMessage({id: "stockCreate.stockCreated"}),
        life: 3000
      });
      
      // Attendre un peu avant de naviguer pour que l'utilisateur voie le toast
      setTimeout(() => {
        navigate('/stocks');
      }, 1000);
      
      return { success: true, message: intl.formatMessage({id: "stockCreate.stockCreated"}) };
    } else {
      toast.current.show({
        severity: 'error',
        summary: intl.formatMessage({id: "stockCreate.error"}),
        detail: response.message || intl.formatMessage({id: "stockCreate.createError"}),
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
        <div className="col-12 col-md-8 col-lg-6">
          {/* Card avec Bootstrap */}
          <div className="card shadow-sm">
            {/* Header de la card */}
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-plus me-2"></i>
                  {intl.formatMessage({id: "stockCreate.title"})}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title={intl.formatMessage({id: "stockCreate.backToList"})}
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
                      label={intl.formatMessage({id: "stockCreate.stockName"})}
                      placeholder={intl.formatMessage({id: "stockCreate.stockNamePlaceholder"})}
                      icon="pi pi-box"
                      required
                      helperText={intl.formatMessage({id: "stockCreate.stockNameHelper"})}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="location"
                      form={form}
                      type="text"
                      label={intl.formatMessage({id: "stockCreate.location"})}
                      placeholder={intl.formatMessage({id: "stockCreate.locationPlaceholder"})}
                      icon="pi pi-map-marker"
                      helperText={intl.formatMessage({id: "stockCreate.locationHelper"})}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="description"
                      form={form}
                      type="textarea"
                      label={intl.formatMessage({id: "stockCreate.description"})}
                      placeholder={intl.formatMessage({id: "stockCreate.descriptionPlaceholder"})}
                      icon="pi pi-align-left"
                      helperText={intl.formatMessage({id: "stockCreate.descriptionHelper"})}
                      rows={4}
                    />
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/stocks')}
                    disabled={form.submitting}
                  >
                    <i className="pi pi-times me-2"></i>
                    {intl.formatMessage({id: "stockCreate.cancel"})}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={!form.canSubmit}
                  >
                    <i className={`${form.submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'} me-2`}></i>
                    {form.submitting ? intl.formatMessage({id: "stockCreate.creating"}) : intl.formatMessage({id: "stockCreate.create"})}
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

export default StockCreateScreen;