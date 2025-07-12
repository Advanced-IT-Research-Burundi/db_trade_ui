import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import categoryService from '../services/categoryService.js';
import { toast } from 'react-toastify';

export const useCategoryForm = (categoryId = null) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Mode édition ou création
  const isEditing = !!categoryId;

  // Charger les données pour l'édition
  useEffect(() => {
    if (isEditing) {
      loadCategoryData();
    }
  }, [categoryId, isEditing]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategory(categoryId);
      
      if (response.success) {
        setFormData({
          name: response.data.name || '',
          description: response.data.description || ''
        });
      } else {
        toast.error(response.message || 'Erreur lors du chargement');
        navigate('/categories');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error(error.message || 'Erreur lors du chargement');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  // Gestion des changements de formulaire
  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Le nom ne peut dépasser 255 caractères';
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'La description ne peut dépasser 1000 caractères';
    }
    
    return newErrors;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setSubmitting(true);
      setErrors({});
      
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null
      };
      
      let response;
      if (isEditing) {
        response = await categoryService.updateCategory(categoryId, categoryData);
      } else {
        response = await categoryService.createCategory(categoryData);
      }
      
      if (response.success) {
        toast.success(response.message || 
          `Catégorie ${isEditing ? 'mise à jour' : 'créée'} avec succès`
        );
        navigate('/categories');
      } else {
        toast.error(response.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      
      if (error.status === 422 && error.errors) {
        setErrors(error.errors);
      } else {
        toast.error(error.message || 'Erreur lors de la sauvegarde');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setErrors({});
  };

  // Annuler et retourner à la liste
  const handleCancel = () => {
    navigate('/categories');
  };

  return {
    // État
    formData,
    loading,
    submitting,
    errors,
    isEditing,
    
    // Actions
    handleInputChange,
    handleSubmit,
    handleCancel,
    resetForm,
    
    // Helpers
    getFieldError: (field) => errors[field],
    hasError: (field) => !!errors[field],
    isFieldValid: (field) => !errors[field] && formData[field],
    canSubmit: () => !submitting && formData.name.trim(),
  };
};