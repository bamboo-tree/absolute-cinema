import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Login from './Login';
import Register from './Register';

const AuthApp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleLoginSuccess = (token) => {
    console.log('User logged in with token:', token);
    localStorage.setItem('authToken', token);
    navigate('/home');
  };

  const handleRegisterSuccess = (token) => {
    console.log('User registered');
    handleLoginSuccess(token);
  };

  return (
    <div>
      {isLogin ? (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </div>
  );
};

export default AuthApp;