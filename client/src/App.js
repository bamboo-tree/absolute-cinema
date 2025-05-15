import { Route, Routes, Navigate } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";


function App() {

  const user = localStorage.getItem('token')

  return (
    <Routes>
      {/* {user && <Route path="/" element={<Main />} />} */}
      <Route path="/login" exact element={<Login />} />
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/register" exact element={<SignUp />} />
    </Routes>
  );
}

export default App;
