import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminOnly = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
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

export default AdminOnly;