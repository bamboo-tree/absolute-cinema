const Unauthorized = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    return null;
  }
  return children;
}

export default Unauthorized;