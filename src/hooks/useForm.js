import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Hook useForm simple et réutilisable pour tous les modèles
 */
export const useForm = ({
  initialValues = {},
  validationRules = {},
  onSubmit,
  loadData,
  entityId = null
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!entityId;

  // Charger les données pour l'édition
  useEffect(() => {
    if (isEditing && loadData) {
      loadEntityData();
    }
  }, [entityId, isEditing]);

  const loadEntityData = async () => {
    try {
      setLoading(true);
      const response = await loadData(entityId);
      if (response?.success && response?.data) {
        setValues({ ...initialValues, ...response.data });
        setErrors({});
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données'+error.message);
    } finally {
      setLoading(false);
    }
  };

  // Validation d'un champ
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Required
    if (rules.required && (!value || value.toString().trim() === '')) {
      return typeof rules.required === 'string' ? rules.required : `${name} est requis`;
    }

    // MinLength
    if (rules.minLength && value && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} caractères`;
    }

    // MaxLength
    if (rules.maxLength && value && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} caractères`;
    }

    // Email
    if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Format email invalide';
    }

    // Min/Max pour nombres
    if (rules.min !== undefined && value && Number(value) < rules.min) {
      return `Valeur minimum: ${rules.min}`;
    }

    if (rules.max !== undefined && value && Number(value) > rules.max) {
      return `Valeur maximum: ${rules.max}`;
    }

    return null;
  };

  // Validation complète du formulaire
  const validateForm = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Changer la valeur d'un champ
  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Supprimer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validation à la perte de focus
  const handleBlur = (name) => {
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    try {
      setSubmitting(true);
      const response = await onSubmit(values, isEditing, entityId);
      
      if (response?.success) {
        toast.success(response.message || `${isEditing ? 'Modification' : 'Création'} réussie`);
        return response;
      }
    } catch (error) {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors);
      }
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset du formulaire
  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    loading,
    submitting,
    isEditing,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getError: (name) => errors[name],
    hasError: (name) => !!errors[name],
    isValid: Object.keys(errors).length === 0,
    canSubmit: Object.keys(errors).length === 0 && !submitting
  };
};