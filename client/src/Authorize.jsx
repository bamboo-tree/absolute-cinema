import { jwtDecode } from 'jwt-decode';

const Authorize = ({ children, requiredRoles }) => {
  const token = localStorage.getItem('authToken');

  for (const requiredRole of requiredRoles) {
    switch (requiredRole) {
      case 'ADMIN':
        if (token) {
          try {
            const decoded = jwtDecode(token);
            if (decoded.role === 'ADMIN') {
              return children;
            }
          } catch (error) {
            console.error('Authorize: Error decoding token', error);
          }
        }
        break;
      case 'USER':
        if (token) {
          try {
            const decoded = jwtDecode(token);
            if (decoded.role === 'USER') {
              return children;
            }
          } catch (error) {
            console.error('Authorize: Error decoding token', error);
          }
        }
        break;
      case 'GUEST':
        if (!token) {
          return children;
        }
        break;
      case 'ANY':
        return children;
      default:
        console.warn(`Authorize: Unknown role ${requiredRole}`);
    }
  }
};

export default Authorize;