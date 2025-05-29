import { useState, useEffect } from 'react';
import api from '../../api';

import Navigation from '../Navigation';
import './style.css';

const UserProfile = () => {
  const [userData, setUserData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: ''
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/authorized/get_account', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        setUserData(response.data);
        setFormData({
          username: response.data.username,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email,
          password: '',
          confirmPassword: ''
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setFormErrors([]);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFormErrors([]);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setFormErrors(['Passwords do not match']);
      return;
    }

    try {
      const updateData = {
        username: userData.username, // Username is not editable
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        ...(formData.password && { password: formData.password })
      };

      const response = await api.put('/authorized/update_account', updateData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      // Update formData with the latest user data
      setUserData(response.data.user);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      const message = err.response?.data?.message;

      if (serverErrors && Array.isArray(serverErrors)) {
        setFormErrors(serverErrors);
      } else if (message) {
        setFormErrors([message]);
      } else {
        setFormErrors(['Unexpected error occurred']);
      }
      setIsEditing(true);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/authorized/delete_account', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      localStorage.removeItem('authToken');
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile data...</div>;
  }

  {
    error && !isEditing && (
      <div className="error-message">{error}</div>
    )
  }


  return (
    <div>
      <Navigation />
      <div className="user-profile-container">
        <div className="profile-header">
          <h2>User Profile</h2>
          {!isEditing && (
            <button className="edit-button" onClick={handleEditToggle}>
              Edit Profile
            </button>
          )}
        </div>

        {success && <div className="success-message">{success}</div>}
        {formErrors.length > 0 && (
          <div className="error-message">
            {formErrors.map((err, index) => (
              <p key={index}>{err}</p>
            ))}
          </div>
        )}

        {!isEditing ? (
          <div className="profile-info">
            <div className="profile-field">
              <label>Username:</label>
              <span>{userData.username}</span>
            </div>
            <div className="profile-field">
              <label>First Name:</label>
              <span>{userData.firstName || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <label>Last Name:</label>
              <span>{userData.lastName || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <label>Email:</label>
              <span>{userData.email}</span>
            </div>
          </div>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">New Password (leave blank to keep current)</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            {formData.password && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            )}
            <div className="form-actions">
              <button type="submit" className="save-button">
                Save Changes
              </button>
              <button type="button" className="cancel-button" onClick={handleEditToggle}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="delete-section">
          <h3>Danger Zone</h3>
          {!deleteConfirm ? (
            <button className="delete-button" onClick={() => setDeleteConfirm(true)}>
              Delete Account
            </button>
          ) : (
            <div className="delete-confirmation">
              <p>Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="confirmation-buttons">
                <button className="confirm-delete" onClick={handleDeleteAccount}>
                  Yes, Delete My Account
                </button>
                <button className="cancel-delete" onClick={() => setDeleteConfirm(false)}>
                  No, Keep My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;