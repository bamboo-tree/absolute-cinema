import { useState } from 'react';
import api from '../api';
import '../styles/auth.css';
import '../styles/main.css';

// Login component for user authentication
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
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await api.post('/authorized/login', {
        username: formData.username,
        password: formData.password,
      });

      // save token to local storage
      localStorage.setItem('authToken', response.data.token);
      onLoginSuccess(response.data.token);
      console.log("Login successful, token: ", response.data.token);
      console.log("Local storage token: ", localStorage.getItem('authToken'));

    } catch (error) {
      if (error.response) {
        setErrors({ api: error.response.data.message });
      } else if (error.request) {
        setErrors({ api: 'Network error, please try again later.' });
      } else {
        setErrors({ api: 'An unexpected error occurred.' });
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

        <button className="auth-button" type="submit">Login</button>
      </form>

      <p className="auth-link" onClick={onSwitchToRegister}>
        Don't have an account? Register here
      </p>
    </div>
  );
};

export default Login;