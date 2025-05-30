import { useState } from 'react';

import api from '../../api';
import '../AuthApp/auth.css';


const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username)
      newErrors.username = 'Username is required';
    if (!formData.firstName)
      newErrors.firstName = 'First name is required';
    if (!formData.lastName)
      newErrors.lastName = 'Last name is required';
    if (!formData.email)
      newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Email is invalid';
    if (!formData.password)
      newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.repeatPassword)
      newErrors.repeatPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await api.post('/common/register', {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      onRegisterSuccess(response.data.token);
    } catch (error) {
      if (error.response) {
        setApiError(error.response.data.message ||
          `Server error: ${error.response.status}`);
        setErrors({});
      } else if (error.request) {
        setApiError('No response from server. Check your connection.');
      } else {
        setApiError('Error: ' + error.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Register</h2>
      <div className='validation-info'>
        <span className="auth-error" style={{ display: "inline-block", textAlign: 'center', marginBottom: '1rem' }}>{apiError}</span>
      </div>
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
          <label className="input-label" htmlFor="firstName">First Name</label>
          <input
            className="auth-input"
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
          />
          <div className='validation-info'>
            <span className="auth-error">{errors.firstName}</span>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="lastName">Last Name</label>
          <input
            className="auth-input"
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
          />
          <div className='validation-info'>
            <span className="auth-error">{errors.lastName}</span>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="email">Email</label>
          <input
            className="auth-input"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <div className='validation-info'>
            <span className="auth-error">{errors.email}</span>
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

        <div className="input-group">
          <label className="input-label" htmlFor="repeatPassword">Repeat Password</label>
          <input
            className="auth-input"
            id="repeatPassword"
            name="repeatPassword"
            type="password"
            value={formData.repeatPassword}
            onChange={handleChange}
          />
          <div className='validation-info'>
            <span className="auth-error">{errors.repeatPassword}</span>
          </div>
        </div>

        <button className="auth-button" type="submit">Register</button>
      </form>

      <p className="auth-link" onClick={onSwitchToLogin}>
        Already have an account? Login here
      </p>
    </div>
  );
};

export default Register;