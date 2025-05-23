import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const AdminOnly = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    // return <Navigate to="/auth" replace />;
    console.log("AdminOnly: No token found");
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "ADMIN") {
      return null;
    }
  } catch {
    return <Navigate to="/auth" replace />;
  }

  return children;
}