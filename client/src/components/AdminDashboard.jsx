import { useState } from "react";

import ManageUsers from "./ManageUsers";
import ManageMovies from "./ManageMovies";

import "../styles/adminDashboard.css";




const AdminaDashboard = () => {

  const [actionName, setActionName] = useState("manage-users");

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-menu">
        <div className="admin-menu-buttons">
          <button onClick={() => setActionName("manage-users")}>
            Manage Users
          </button>
          <button onClick={() => setActionName("manage-movies")}>
            Manage Movies
          </button>
          <button onClick={() => setActionName("add-movie")}>
            Add Movie
          </button>
        </div>
      </div>
      <div>
        {actionName === "manage-users" && <ManageUsers />}
        {actionName === "manage-movies" && <ManageMovies />}
        {/* {actionName === "add-movie" && <div>Add Movie Section</div>} */}
      </div>
    </div>
  );
}

export default AdminaDashboard;