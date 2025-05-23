import { Route, Routes, Navigate } from "react-router-dom"
import AuthApp from "./components/AuthApp"


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      {/* <Route path="/profile" element={<Profile />} /> */}
      {/* <Route path="/settings" element={<Settings />} /> */}
      {/* <Route path="/about" element={<About />} /> */}
      {/* <Route path="/contact" element={<Contact />} /> */}
      {/* <Route path="/404" element={<NotFound />} /> */}
      {/* <Route path="*" element={<Navigate to="/404" />} /> */}
      <Route path="/auth" element={<AuthApp />} />
    </Routes>
  )
}
export default App