import { useState } from 'react';

import api from '../../api';
import '../AuthApp/auth.css';


const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        console.log('Validation errors:', validationErrors);
        return;
      }

      const response = await api.post('/authorized/login', {
        username: formData.username,
        password: formData.password,
      });

      if (response.data.success === false) {
        setErrors({
          api: 'Authentication failed: No token received'
        });
        return;
      }
      if (response.data.success === true) {
        onLoginSuccess(response.data.token);
      }
    } catch (error) {
      console.error('Login error:', error);

      if (error.response) {
        const serverError = error.response.data;

        setErrors({
          username: serverError.errorUser || "",
          password: serverError.errorPassword || "",
          api: serverError.error ||
            serverError.message ||
            'Authentication failed. Please try again.'
        });

      } else if (error.request) {
        setErrors({
          api: 'Network error. Please check your connection and try again.'
        });
      } else {
        setErrors({
          api: 'An unexpected error occurred. Please try again later.'
        });
      }
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Login</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label" htmlFor="username">Username</label>
          <input
            className="auth-input"
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
          />
          <div className='validation-info'>
            <span className="auth-error">{errors.username}</span>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="password">Password</label>
          <input
            className="auth-input"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <div className='validation-info'>
            <span className="auth-error">{errors.password}</span>
          </div>
        </div>
        <div className='validation-info'>
          <span className="auth-error">{errors.api}</span>
        </div>
        <button className="auth-button" type="submit" >
          Login
        </button>
      </form>

      <p className="auth-link" onClick={onSwitchToRegister}>
        Don't have an account? Register here
      </p>
    </div>
  );
};

export default Login;