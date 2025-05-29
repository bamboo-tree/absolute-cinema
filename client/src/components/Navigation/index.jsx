import { useState } from "react";

import api from "../../api";

import './style.css';
import Authorize from "../../Authorize";


const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setSubmitError("");
  }

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    try {
      const query = searchQuery.trim();
      setSearchQuery(query);

      if (query === "") {
        setSubmitError("Search query cannot be empty");
        console.error("Search query cannot be empty");
        return;
      }
      const response = await api.get(`/common/get_movie/title/${encodeURIComponent(query)}`);

      if (!response.data) {
        throw new Error("No data received from server");
      }
      if (!response.data.movie) {
        setSubmitError("Movie not found");
        throw new Error("Movie not found");
      }
      console.log("Movie found:", response.data.movie);
      // TODO: Show movie details in a modal or redirect to a movie details page
    }
    catch (error) {
      setSubmitError("Movie not found");
      console.error("Error during search:", error.message);
    }
  }

  return (
    <nav className="navigation">
      <div className="logo">
        <h1>Absolute Cinema</h1>
      </div>
      <form onSubmit={handleSearchSubmit} className="search-form">
        <Authorize requiredRoles={['USER', 'GUEST']}>
          <div className="submit-error">{submitError}</div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="search-input"
          />
          <button type="submit" className="search-button" onSubmit={handleSearchSubmit}>Search</button>
        </Authorize>
        <Authorize requiredRoles={['ANY']}>
          <input
            type="button"
            className="home-button"
            value="Home"
            onClick={() => window.location.href = '/'}
          />
        </Authorize>
        <Authorize requiredRoles={['ADMIN', 'USER']}>
          <input
            type="button"
            className="profile-button"
            value="Profile"
            onClick={() => window.location.href = '/profile'}
          />
          <input
            type="button"
            className="logout-button"
            value="Logout"
            onClick={() => {
              localStorage.removeItem('authToken'); // Clear the auth token
              console.log("User logged out");
              window.location.href = '/home';
            }}
          />
        </Authorize>
        <Authorize requiredRoles={['GUEST']}>
          <input
            type="button"
            className="login-button"
            value="Login"
            onClick={() => window.location.href = '/auth'}
          />
        </Authorize>
      </form>
    </nav>
  );
}

export default Navigation