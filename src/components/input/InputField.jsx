import React, { useState, useRef } from 'react';

/**
 * Composant InputField avec Bootstrap supportant tous types d'inputs
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
  const [showPassword, setShowPassword] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedChips, setSelectedChips] = useState(value || []);
  const [currentChip, setCurrentChip] = useState('');
  const fileInputRef = useRef(null);

  const fieldId = `field-${name}`;

  const handleChange = (e) => {
    let newValue;
    
    switch (type) {
      case 'checkbox':
        newValue = e.target.checked;
        break;
      case 'switch':
        newValue = e.target.checked;
        break;
      case 'number':
      case 'range':
        newValue = parseFloat(e.target.value) || 0;
        break;
      case 'date':
      case 'datetime-local':
      case 'time':
        newValue = e.target.value;
        break;
      case 'select':
      case 'multiselect':
        if (type === 'multiselect') {
          const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
          newValue = selectedOptions;
        } else {
          newValue = e.target.value;
        }
        break;
      case 'file':
        newValue = e.target.files;
        break;
      case 'color':
        newValue = e.target.value;
        break;
      case 'chips':
        return; // Géré séparément
      default:
        newValue = e.target.value;
        break;
    }
    
    onChange(name, newValue);
  };

  const handleBlur = () => {
    if (onBlur) onBlur(name);
    setShowSuggestions(false);
  };

  const handleChipKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (currentChip.trim()) {
        const newChips = [...selectedChips, currentChip.trim()];
        setSelectedChips(newChips);
        onChange(name, newChips);
        setCurrentChip('');
      }
    } else if (e.key === 'Backspace' && !currentChip && selectedChips.length > 0) {
      const newChips = selectedChips.slice(0, -1);
      setSelectedChips(newChips);
      onChange(name, newChips);
    }
  };

  const removeChip = (index) => {
    const newChips = selectedChips.filter((_, i) => i !== index);
    setSelectedChips(newChips);
    onChange(name, newChips);
  };

  const handleAutocomplete = (e) => {
    const inputValue = e.target.value;
    onChange(name, inputValue);
    
    if (inputValue.length > 0) {
      const filtered = options.filter(option => 
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    onChange(name, suggestion.value);
    setShowSuggestions(false);
  };

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      disabled,
      placeholder,
      className: `form-control ${error ? 'is-invalid' : ''} ${className}`,
      ...props
    };

    switch (type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
        return (
          <input
            {...commonProps}
            type={type}
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );

      case 'password':
        return (
          <div className="input-group">
            <input
              {...commonProps}
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`}></i>
            </button>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );

      case 'range':
        return (
          <div>
            <input
              {...commonProps}
              type="range"
              className="form-range"
              value={value || 0}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <div className="mt-1">
              <small className="text-muted">Valeur: {value || 0}</small>
            </div>
          </div>
        );

      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );

      case 'datetime-local':
        return (
          <input
            {...commonProps}
            type="datetime-local"
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );

      case 'time':
        return (
          <input
            {...commonProps}
            type="time"
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Sélectionner une option</option>
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <select
            {...commonProps}
            multiple
            value={value || []}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="form-check">
            <input
              className={`form-check-input ${error ? 'is-invalid' : ''}`}
              type="checkbox"
              id={fieldId}
              checked={!!value}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
            />
            {label && (
              <label className="form-check-label" htmlFor={fieldId}>
                {label}
              </label>
            )}
          </div>
        );

      case 'radio':
        return (
          <div>
            {options.map((option, index) => (
              <div key={index} className="form-check mb-2">
                <input
                  className={`form-check-input ${error ? 'is-invalid' : ''}`}
                  type="radio"
                  id={`${fieldId}-${index}`}
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={disabled}
                />
                <label className="form-check-label" htmlFor={`${fieldId}-${index}`}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'switch':
        return (
          <div className="form-check form-switch">
            <input
              className={`form-check-input ${error ? 'is-invalid' : ''}`}
              type="checkbox"
              id={fieldId}
              checked={!!value}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
            />
            {label && (
              <label className="form-check-label" htmlFor={fieldId}>
                {label}
              </label>
            )}
          </div>
        );

      case 'file':
        return (
          <div>
            <input
              {...commonProps}
              type="file"
              ref={fileInputRef}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        );

      case 'chips':
        return (
          <div className={`form-control ${error ? 'is-invalid' : ''}`} style={{ height: 'auto', minHeight: '38px' }}>
            <div className="d-flex flex-wrap gap-1 align-items-center">
              {selectedChips.map((chip, index) => (
                <span key={index} className="badge bg-primary d-flex align-items-center">
                  {chip}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: '0.6rem' }}
                    onClick={() => removeChip(index)}
                  ></button>
                </span>
              ))}
              <input
                type="text"
                className="border-0 outline-0 flex-grow-1"
                style={{ minWidth: '100px', outline: 'none' }}
                value={currentChip}
                onChange={(e) => setCurrentChip(e.target.value)}
                onKeyDown={handleChipKeyDown}
                onBlur={handleBlur}
                placeholder={selectedChips.length === 0 ? placeholder : ''}
                disabled={disabled}
              />
            </div>
          </div>
        );

      case 'color':
        return (
          <input
            {...commonProps}
            type="color"
            value={value || '#000000'}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );

      case 'rating':
        return (
          <div className="d-flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`btn btn-sm ${star <= (value || 0) ? 'text-warning' : 'text-muted'}`}
                onClick={() => onChange(name, star)}
                disabled={disabled}
              >
                <i className="pi pi-star-fill"></i>
              </button>
            ))}
            <span className="ms-2 text-muted small">({value || 0}/5)</span>
          </div>
        );

      case 'autocomplete':
        return (
          <div className="position-relative">
            <input
              {...commonProps}
              type="text"
              value={value || ''}
              onChange={handleAutocomplete}
              onBlur={handleBlur}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="dropdown-menu show position-absolute w-100" style={{ zIndex: 1000 }}>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="dropdown-item"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type="text"
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );
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

      {/* Messages d'erreur et d'aide */}
      <div className="mt-1">
        {error && (
          <div className="invalid-feedback d-block">
            <i className="pi pi-exclamation-circle me-1"></i>
            {error}
          </div>
        )}
        {!error && helperText && (
          <div className="form-text">
            <i className="pi pi-info-circle me-1"></i>
            {helperText}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;