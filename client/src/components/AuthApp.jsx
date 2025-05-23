import { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthApp = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSuccess = (token) => {
    console.log('User logged in with token:', token);

    // Tutaj możesz przekierować użytkownika lub zaktualizować stan aplikacji
    // np. używając react-router: navigate('/dashboard');
  };

  const handleRegisterSuccess = (token) => {
    console.log('User registered with token:', token);
    // Automatyczne logowanie po rejestracji lub przekierowanie
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