import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../Login';
import Register from '../Register';

const AuthApp = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/home'); // Użytkownik już zalogowany
    }
  }, [navigate]);

  const handleAuthSuccess = (token) => {
    localStorage.setItem('authToken', token);
    setTimeout(() => {
      navigate('/home');
    }, 1000);
  };

  return (
    <div>
      {isLogin ? (
        <Login
          onLoginSuccess={handleAuthSuccess}
          onSwitchToRegister={() => {
            setIsLogin(false);
          }}
        />
      ) : (
        <Register
          onRegisterSuccess={handleAuthSuccess}
          onSwitchToLogin={() => {
            setIsLogin(true);
          }}
        />
      )}
    </div>
  );
};

export default AuthApp;
