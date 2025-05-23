import { AdminOnly } from "./auth/AdminOnly"
import { UserOnly } from "./auth/UserOnly"

const Home = () => {

  return (
    <div>
      <h1>Dashboard</h1>
      <AdminOnly>
        <section className="admin-section">
          <h2>Panel administracyjny</h2>
          <p>Tutaj są funkcje dostępne tylko dla administratorów</p>
        </section>
      </AdminOnly>

      <UserOnly>
        <section className="user-section">
          <h2>Panel użytkownika</h2>
          <p>Tutaj są funkcje dostępne dla wszystkich użytkowników</p>
        </section>
      </UserOnly>
    </div>
  )
}

export default Home