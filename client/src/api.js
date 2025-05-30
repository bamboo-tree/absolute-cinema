import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in the headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    // ignore 401 errors for the login endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest.url.includes('/authorized/login')
    ) {
      console.error('Unauthorized, logging out...');
      localStorage.removeItem('authToken');
      window.location.href = '/auth';
    }

    return Promise.reject(error);
  }
);


export default api;