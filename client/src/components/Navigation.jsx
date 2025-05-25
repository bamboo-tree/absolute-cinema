import { useState } from "react";

import '../styles/navigation.css';
import Authorize from "../Authorize";


const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  }
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    console.log("Search submitted:", searchQuery);
  }

  return (
    <nav className="navigation">
      <div className="logo">
        <h1>Absolute Cinema</h1>
      </div>
      <form onSubmit={handleSearchSubmit} className="search-form">
        <Authorize requiredRoles={['ANY']}>
          <input
            type="button"
            className="home-button"
            value="Home"
            onClick={() => window.location.href = '/'}
          />
        </Authorize>
        <Authorize requiredRoles={['USER', 'GUEST']}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
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