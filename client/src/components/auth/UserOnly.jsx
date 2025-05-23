import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const UserOnly = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.log("UserOnly: No token found");
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "USER") {
      return null;
    }
  } catch {
    return <Navigate to="/auth" replace />;
  }

  return children;
}