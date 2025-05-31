import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api";
import './style.css';
import Authorize from "../../Authorize";
import MovieTile from "../MovieTile";

const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [movieFound, setMovieFound] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const location = useLocation();

  const isHomePage = location.pathname === '/home';

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
        return;
      }

      const response = await api.get(`/common/get_movie/title/${encodeURIComponent(query)}`);

      if (!response.data?.movie) {
        throw new Error("Movie not found");
      }

      setMovieFound(response.data.movie);
      setSubmitError("");
    } catch (error) {
      setSubmitError("Movie not found");
      setMovieFound(null);
    }
  }

  const clearSearch = () => {
    setSearchQuery("");
    setMovieFound(null);
    setSubmitError("");
  }

  return (
    <div className="navigation-container">
      <nav className="navigation">
        <div className="logo">
          <h1>Absolute Cinema</h1>
        </div>

        <Authorize requiredRoles={['USER', 'GUEST']}>
          {isHomePage && (
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search movie title..."
                  className="search-input"
                />
                {movieFound ? (
                  <button
                    type="button"
                    className="search-button clear"
                    onClick={clearSearch}
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="search-button submit"
                  >
                    Search
                  </button>
                )}
              </div>
              {submitError && <div className="submit-error">{submitError}</div>}
            </form>
          )}
        </Authorize>

        <div className="nav-buttons">
          <Authorize requiredRoles={['ANY']}>
            <button
              className="nav-button home"
              onClick={() => window.location.href = '/'}
            >
              Home
            </button>
          </Authorize>

          <Authorize requiredRoles={['ADMIN', 'USER']}>
            <button
              className="nav-button profile"
              onClick={() => window.location.href = '/profile'}
            >
              Profile
            </button>
            <button
              className="nav-button logout"
              onClick={() => {
                localStorage.removeItem('authToken');
                window.location.href = '/home';
              }}
            >
              Logout
            </button>
          </Authorize>

          <Authorize requiredRoles={['GUEST']}>
            <button
              className="nav-button login"
              onClick={() => window.location.href = '/auth'}
            >
              Login
            </button>
          </Authorize>
        </div>
      </nav>

      {movieFound && (
        <div className="search-results-container">
          <div className="search-results-card">
            <MovieTile movie={movieFound} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Navigation;