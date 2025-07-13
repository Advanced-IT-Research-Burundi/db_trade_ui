import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Password } from 'primereact/password';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { InputSwitch } from 'primereact/inputswitch';
import { FileUpload } from 'primereact/fileupload';
import { Chips } from 'primereact/chips';
import { ColorPicker } from 'primereact/colorpicker';
import { Rating } from 'primereact/rating';
import { Slider } from 'primereact/slider';
import { AutoComplete } from 'primereact/autocomplete';

/**
 * Composant InputField simple supportant tous types d'inputs
 */
const InputField = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  label,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  icon,
  options = [],
  children,
  className = '',
  ...props
}) => {
  const fieldId = `field-${name}`;

  const handleChange = (e) => {
    let newValue;
    
    switch (type) {
      case 'checkbox':
        newValue = e.checked;
        break;
      case 'switch':
        newValue = e.value;
        break;
      case 'number':
        newValue = e.value;
        break;
      case 'date':
      case 'datetime':
        newValue = e.value;
        break;
      case 'dropdown':
      case 'multiselect':
        newValue = e.value;
        break;
      case 'chips':
      case 'rating':
      case 'slider':
      case 'color':
      case 'autocomplete':
        newValue = e.value;
        break;
      default:
        newValue = e.target ? e.target.value : e;
        break;
    }
    
    onChange(name, newValue);
  };

  const handleBlur = () => {
    if (onBlur) onBlur(name);
  };

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      value: value || '',
      onChange: handleChange,
      onBlur: handleBlur,
      disabled,
      placeholder,
      className: `${error ? 'p-invalid' : ''} ${className}`,
      ...props
    };

    switch (type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
        return <InputText {...commonProps} type={type} />;

      case 'password':
        return <Password {...commonProps} feedback={false} toggleMask />;

      case 'textarea':
        return <InputTextarea {...commonProps} rows={4} autoResize />;

      case 'number':
        return <InputNumber {...commonProps} showButtons />;

      case 'date':
        return (
          <Calendar 
            {...commonProps} 
            dateFormat="dd/mm/yy" 
            showIcon 
            showButtonBar 
          />
        );

      case 'datetime':
        return (
          <Calendar 
            {...commonProps} 
            showTime 
            dateFormat="dd/mm/yy" 
            showIcon 
            showButtonBar 
          />
        );

      case 'dropdown':
        return (
          <Dropdown
            {...commonProps}
            options={options}
            optionLabel="label"
            optionValue="value"
            showClear
            filter={options.length > 10}
            emptyMessage="Aucune option disponible"
          />
        );

      case 'multiselect':
        return (
          <MultiSelect
            {...commonProps}
            options={options}
            optionLabel="label"
            optionValue="value"
            display="chip"
            showClear
            filter={options.length > 10}
            emptyMessage="Aucune option disponible"
          />
        );

      case 'checkbox':
        return (
          <div className="d-flex align-items-center">
            <Checkbox
              {...commonProps}
              checked={!!value}
            />
            {label && (
              <label htmlFor={fieldId} className="ms-2">
                {label}
              </label>
            )}
          </div>
        );

      case 'radio':
        return (
          <div>
            {options.map((option, index) => (
              <div key={index} className="d-flex align-items-center mb-2">
                <RadioButton
                  inputId={`${fieldId}-${index}`}
                  value={option.value}
                  onChange={handleChange}
                  checked={value === option.value}
                  disabled={disabled}
                />
                <label htmlFor={`${fieldId}-${index}`} className="ms-2">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'switch':
        return (
          <div className="d-flex align-items-center">
            <InputSwitch
              {...commonProps}
              checked={!!value}
            />
            {label && (
              <label htmlFor={fieldId} className="ms-2">
                {label}
              </label>
            )}
          </div>
        );

      case 'file':
        return (
          <FileUpload
            {...commonProps}
            mode="basic"
            auto
            chooseLabel="Choisir un fichier"
          />
        );

      case 'chips':
        return <Chips {...commonProps} separator="," />;

      case 'color':
        return <ColorPicker {...commonProps} format="hex" />;

      case 'rating':
        return <Rating {...commonProps} stars={5} cancel />;

      case 'slider':
        return (
          <div>
            <Slider {...commonProps} />
            <div className="mt-2">
              <small className="text-muted">Valeur: {value || 0}</small>
            </div>
          </div>
        );

      case 'autocomplete':
        return (
          <AutoComplete
            {...commonProps}
            suggestions={options}
            completeMethod={() => {}}
            field="label"
            dropdown
          />
        );

      default:
        return <InputText {...commonProps} />;
    }
  };

  return (
    <div className="mb-3">
      {/* Label */}
      {label && type !== 'checkbox' && type !== 'switch' && (
        <label htmlFor={fieldId} className="form-label fw-semibold">
          {icon && <i className={`${icon} me-2`}></i>}
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      {/* Input */}
      <div className="position-relative">
        {children ? children : renderInput()}
      </div>

      {/* Messages */}
      <div className="mt-1" style={{ minHeight: '1.25rem' }}>
        {error && (
          <small className="text-danger d-flex align-items-center">
            <i className="pi pi-exclamation-circle me-1"></i>
            {error}
          </small>
        )}
        {!error && helperText && (
          <small className="text-muted d-flex align-items-center">
            <i className="pi pi-info-circle me-1"></i>
            {helperText}
          </small>
        )}
      </div>
    </div>
  );
};

export default InputField;