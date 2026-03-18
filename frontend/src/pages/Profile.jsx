import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuthForm } from '../hooks/useAuthForm';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  // ✅ Use our existing hook for profile form!
  const {
    formData,
    formErrors,
    loading: formLoading,
    handleChange,
    handleProfileSubmit,
    resetForm,
    setFormData
  } = useAuthForm('profile');

  // Set initial form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
    }
  }, [user, setFormData]);

  const handleSubmit = async (e) => {
    const result = await handleProfileSubmit(e);
    if (result?.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    resetForm({ name: user?.name, email: user?.email });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (authLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Profile Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personal details and settings
              </p>
            </div>
            <Button onClick={handleLogout} variant="danger" size="sm">
              Logout
            </Button>
          </div>

          {/* Profile Content */}
          <div className="border-t border-gray-200">
            {!isEditing ? (
              // View Mode
              <div className="px-4 py-5 sm:px-6">
                <dl className="divide-y divide-gray-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user?.name}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user?.email}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Member since</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <Button onClick={() => setIsEditing(true)} variant="primary">
                    Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit} className="px-4 py-5 sm:px-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm p-2`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm p-2`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button type="submit" loading={formLoading} variant="primary">
                    Save Changes
                  </Button>
                  <Button type="button" onClick={handleCancel} variant="secondary">
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;