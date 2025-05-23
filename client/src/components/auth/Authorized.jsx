import { Navigate } from "react-router-dom";

export const Authorized = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default Authorized;