import { Route, Routes, Navigate } from "react-router-dom"
import Test from './components/Test'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/test" />} />
      <Route path="/test" exact element={<Test />} />
    </Routes>
  )
}
export default App