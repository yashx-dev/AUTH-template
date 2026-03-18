import { useState } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';

export const useAuthForm = (type = 'login') => {
  const [formData, setFormData] = useState(
    type === 'login' 
      ? { email: '', password: '' }
      : { name: '', email: '', password: '', confirmPassword: '' }
  );
  const [formErrors, setFormErrors] = useState({});
  const { login, register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
  };

  const validateLogin = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  const validateRegister = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    else if (formData.name.length < 2) errors.name = 'Name must be at least 2 characters';
    
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = type === 'login' ? validateLogin() : validateRegister();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;

    let result;
    if (type === 'login') {
      result = await login({ email: formData.email, password: formData.password });
    } else {
      const { confirmPassword: _confirmPassword, ...userData } = formData;
      result = await register(userData);
    }
    
    if (result?.success) {
      navigate('/dashboard');
    }
  };

  return {
    formData,
    formErrors,
    loading,
    error,
    handleChange,
    handleSubmit
  };
};