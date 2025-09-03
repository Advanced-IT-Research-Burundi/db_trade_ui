import React from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../../hooks/useForm';
import FormField from '../../../components/input/FormField';
import ApiService from '../../../services/api.js';
import { Toast } from 'primereact/toast';

const UnitCreateScreen = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const toast = React.useRef(null);
  
  const initialValues = {
    name: '',
    abbreviation: '',
    description: ''
  };
  
  const validationRules = {
    name: {
      required: intl.formatMessage({id: "unitCreate.validations.nameRequired"}),
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
        summary: intl.formatMessage({id: "unitCreate.success"}),
        detail: intl.formatMessage({id: "unitCreate.unitCreated"}),
        life: 3000
      });
      
      setTimeout(() => {
        navigate('/products/units');
      }, 1000);
      console.log("response : " +response);
    } else {
      toast.current.show({
        severity: 'error',
        summary: intl.formatMessage({id: "unitCreate.error"}),
        detail: response.error || intl.formatMessage({id: "unitCreate.createError"}),
        life: 3000
      });
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
                  {intl.formatMessage({id: "unitCreate.title"})}
                </h4>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  title={intl.formatMessage({id: "unitCreate.backToList"})}
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
                      label={intl.formatMessage({id: "unitCreate.unitName"})}
                      placeholder={intl.formatMessage({id: "unitCreate.unitNamePlaceholder"})}
                      icon="pi pi-calculator"
                      required
                      helperText={intl.formatMessage({id: "unitCreate.unitNameHelper"})}
                    />
                  </div>
                  <div className="col-12">
                    <FormField
                      name="abbreviation"
                      form={form}
                      type="text"
                      label={intl.formatMessage({id: "unitCreate.abbreviation"})}
                      placeholder={intl.formatMessage({id: "unitCreate.abbreviationPlaceholder"})}
                      icon="pi pi-tag"
                      helperText={intl.formatMessage({id: "unitCreate.abbreviationHelper"})}
                    />
                  </div>
                  <div className="col-12">
                    <FormField
                      name="description"
                      form={form}
                      type="textarea"
                      label={intl.formatMessage({id: "unitCreate.description"})}
                      placeholder={intl.formatMessage({id: "unitCreate.descriptionPlaceholder"})}
                      icon="pi pi-align-left"
                      helperText={intl.formatMessage({id: "unitCreate.descriptionHelper"})}
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
                    {intl.formatMessage({id: "unitCreate.cancel"})}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={!form.canSubmit}
                  >
                    <i className={`${form.submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'} me-2`}></i>
                    {form.submitting ? intl.formatMessage({id: "unitCreate.creating"}) : intl.formatMessage({id: "unitCreate.create"})}
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