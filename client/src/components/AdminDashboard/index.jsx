import { useState } from "react";

import ManageUsers from "../ManageUsers";
import MovieForm from "../MovieForm";
import ManageMovies from "../ManageMovies";

import "./style.css";


const AdminaDashboard = () => {
  const [actionName, setActionName] = useState("manage-users");
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const handleEditMovie = (movieId) => {
    setSelectedMovieId(movieId);
    setActionName("edit-movie");
  }

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
        {actionName === "manage-movies" && (
          <ManageMovies onEditMovie={handleEditMovie} />
        )}
        {actionName === "add-movie" && (
          <MovieForm
            onCancel={() => setActionName("manage-movies")}
            onSuccess={() => {
              setActionName("manage-movies");
            }}
          />
        )}
        {actionName === "edit-movie" && (
          <MovieForm
            movieId={selectedMovieId}
            onCancel={() => setActionName("manage-movies")}
            onSuccess={() => {
              setActionName("manage-movies");
              setSelectedMovieId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default AdminaDashboard;