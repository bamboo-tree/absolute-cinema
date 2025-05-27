import { useState, useEffect } from 'react';

import axios from 'axios';

import Navigation from "./Navigation"
import Authorize from "../Authorize"
import AdminaDashboard from "./AdminDashboard"
import MovieList from "./MoviesList"



const Home = () => {

  const [movies, setMovies] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/common/get_all_movies');
        if (response.err) {
          throw new Error('Failed to fetch movies');
        }
        if (isMounted) {
          setMovies(response.data.movies);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
      }
    };

    if (movies.length === 0) {
      fetchMovies();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <Navigation />
      <Authorize requiredRoles={['ADMIN']}>
        <section className="admin-section">
          <AdminaDashboard />
        </section>
      </Authorize>
      <Authorize requiredRoles={['USER', 'GUEST']}>
        <section className="user-section">
          <MovieList movies={movies} />
        </section>
      </Authorize>
    </div>
  )
}

export default Home