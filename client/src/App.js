import { Route, Routes, Navigate } from "react-router-dom"

import Authorized from "./components/auth/Authorized"
import Unauthorized from "./components/Unauthorized"
import AuthApp from "./components/AuthApp"
import Home from "./components/Home"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/auth" element={<AuthApp />} />
      <Route path="/home" element={
        <Authorized>
          <Home />
        </Authorized>
      } />
      <Route path="/unauthorized" element={<Unauthorized />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      {/* <Route path="/profile" element={<Profile />} /> */}
      {/* <Route path="/settings" element={<Settings />} /> */}
      {/* <Route path="/about" element={<About />} /> */}
      {/* <Route path="/contact" element={<Contact />} /> */}
      {/* <Route path="/404" element={<NotFound />} /> */}
      {/* <Route path="*" element={<Navigate to="/404" />} /> */}
    </Routes>
  )
}
export default App