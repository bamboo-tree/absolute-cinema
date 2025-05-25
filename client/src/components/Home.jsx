import Navigation from "./Navigation"
import Authorize from "../Authorize"
import AdminaDashboard from "./AdminDashboard"


const Home = () => {

  return (
    <div>
      <Navigation />
      <Authorize requiredRoles={['ADMIN']}>
        <section className="admin-section">
          <AdminaDashboard />
        </section>
      </Authorize>
      <Authorize requiredRoles={['USER']}>
        <section className="user-section">
          <h2>Panel użytkownika</h2>
          <p>Tutaj są funkcje dostępne dla wszystkich użytkowników</p>
        </section>
      </Authorize>
    </div>
  )
}

export default Home