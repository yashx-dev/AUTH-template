import { useState } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';

export const useAuthForm = (type = 'login') => {
  const [formData, setFormData] = useState(() => {
    if (type === 'login') return { email: '', password: '' };
    if (type === 'register') return { name: '', email: '', password: '', confirmPassword: '' };
    if (type === 'profile') return { name: '', email: '' }; // 👈 Added profile
    return {};
  });
  
  const [formErrors, setFormErrors] = useState({});
  const { login, register, updateProfile, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
  };

  // Validation for different form types
  const validateForm = () => {
    let errors = {};
    
    if (type === 'login') {
      if (!formData.email) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
      if (!formData.password) errors.password = 'Password is required';
    }
    
    if (type === 'register') {
      if (!formData.name) errors.name = 'Name is required';
      else if (formData.name.length < 2) errors.name = 'Name must be at least 2 characters';
      
      if (!formData.email) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
      
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 6) errors.password = 'Must be at least 6 characters';
      
      if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm password';
      else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (type === 'profile') {
      if (!formData.name) errors.name = 'Name is required';
      else if (formData.name.length < 2) errors.name = 'Name must be at least 2 characters';
      
      if (!formData.email) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submission for different form types
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let result;
    if (type === 'login') {
      result = await login({ email: formData.email, password: formData.password });
      if (result?.success) navigate('/dashboard');
    }
    
    if (type === 'register') {
      const { confirmPassword: _confirmPassword, ...userData } = formData;
      result = await register(userData);
      if (result?.success) navigate('/dashboard');
    }
    
    if (type === 'profile') {
      result = await updateProfile(formData);
      return result; // Don't navigate, just return result
    }
  };

  // Special function for profile (doesn't navigate)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return { success: false };
    return await updateProfile(formData);
  };

  // Reset form to initial values
  const resetForm = (newData = null) => {
    if (newData) {
      setFormData(newData);
    } else {
      setFormData(type === 'login' ? { email: '', password: '' } :
                  type === 'register' ? { name: '', email: '', password: '', confirmPassword: '' } :
                  type === 'profile' ? { name: '', email: '' } : {});
    }
    setFormErrors({});
  };

  return {
    formData,
    formErrors,
    loading,
    error,
    handleChange,
    handleSubmit,
    handleProfileSubmit, // Special for profile
    resetForm,
    setFormData // Direct setter when needed
  };
};