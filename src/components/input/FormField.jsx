import React from 'react';
import InputField from './InputField';

/**
 * Composant FormField - Wrapper pour InputField avec props du useForm
 */
const FormField = ({
  name,
  form, // objet retourné par useForm
  ...props
}) => {
  return (
    <InputField
      name={name}
      value={form.values[name] || ''}
      onChange={form.handleChange}
      onBlur={form.handleBlur}
      error={form.getError(name)}
      disabled={form.submitting}
      {...props}
    />
  );
};

export default FormField;