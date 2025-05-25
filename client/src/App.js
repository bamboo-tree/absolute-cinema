import { Route, Routes, Navigate } from "react-router-dom"

import Unauthorized from "./components/Unauthorized"
import AuthApp from "./components/AuthApp"
import Home from "./components/Home"
import NotFound from "./components/NotFound"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/auth" element={<AuthApp />} />
      <Route path="/home" element={<Home />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Routes>
  )
}
export default App