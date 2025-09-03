import React from 'react';
import { useIntl } from 'react-intl';
import { Toast } from 'primereact/toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '../../../hooks/useForm';
import FormField from '../../../components/input/FormField';
import ApiService from '../../../services/api.js';

const UnitEditScreen = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = React.useRef(null);

  const initialValues = {
    name: '',
    abbreviation: '',
    description: ''
  };

  const validationRules = {
    name: {
      required: intl.formatMessage({id: "unitEdit.validations.nameRequired"}),
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

  const loadData = async (unitId) => {
    const response = await ApiService.get(`/api/units/${unitId}`);

    if (response.success) {
      return { success: true, data: response.data };
    } else {
      toast.current.show({
        severity: 'error',
        summary: intl.formatMessage({id: "unitEdit.error"}),
        detail: response.message || intl.formatMessage({id: "unitEdit.loadingError"}),
        life: 3000
      });
      throw new Error(response.message || intl.formatMessage({id: "unitEdit.loadingError"}));
    }
  };

  const handleSubmit = async (values, isEditing, entityId) => {
    const response = await ApiService.put(`/api/units/${entityId}`, values);

    if (response.success) {
      toast.current.show({
        severity: 'success',
        summary: intl.formatMessage({id: "unitEdit.success"}),
        detail: intl.formatMessage({id: "unitEdit.unitUpdated"}),
        life: 3000
      });
      
      setTimeout(() => {
        navigate('/products/units');
      }, 1000);
      
      return { success: true, message: intl.formatMessage({id: "unitEdit.unitUpdated"}) };
    } else {
      toast.current.show({
        severity: 'error',
        summary: intl.formatMessage({id: "unitEdit.error"}),
        detail: response.message || intl.formatMessage({id: "unitEdit.updateError"}),
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
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-pencil me-2"></i>
                  {intl.formatMessage({id: "unitEdit.title"})}
                  {form.values.name && (
                    <span className="text-muted ms-2">- {form.values.name}</span>
                  )}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title={intl.formatMessage({id: "unitEdit.backToList"})}
                  onClick={() => navigate('/products/units')}
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
                      label={intl.formatMessage({id: "unitEdit.unitName"})}
                      placeholder={intl.formatMessage({id: "unitEdit.unitNamePlaceholder"})}
                      icon="pi pi-calculator"
                      required
                      helperText={intl.formatMessage({id: "unitEdit.unitNameHelper"})}
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="abbreviation"
                      form={form}
                      type="text"
                      label={intl.formatMessage({id: "unitEdit.abbreviation"})}
                      placeholder={intl.formatMessage({id: "unitEdit.abbreviationPlaceholder"})}
                      icon="pi pi-tag"
                      helperText={intl.formatMessage({id: "unitEdit.abbreviationHelper"})}
                      disabled={form.loading}
                    />
                  </div>

                  <div className="col-12">
                    <FormField
                      name="description"
                      form={form}
                      type="textarea"
                      label={intl.formatMessage({id: "unitEdit.description"})}
                      placeholder={intl.formatMessage({id: "unitEdit.descriptionPlaceholder"})}
                      icon="pi pi-align-left"
                      helperText={intl.formatMessage({id: "unitEdit.descriptionHelper"})}
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
                      {intl.formatMessage({id: "unitEdit.reset"})}
                    </button>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/units')}
                      disabled={form.submitting || form.loading}
                    >
                      <i className="pi pi-times me-2"></i>
                      {intl.formatMessage({id: "unitEdit.cancel"})}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={!form.canSubmit || form.loading}
                    >
                      <i className={`${form.submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'} me-2`}></i>
                      {form.submitting ? intl.formatMessage({id: "unitEdit.updating"}) : intl.formatMessage({id: "unitEdit.update"})}
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

export default UnitEditScreen;