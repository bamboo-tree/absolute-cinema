import { useState, useEffect } from 'react';

import api from "../../api";

import Navigation from "../Navigation"
import Authorize from "../../Authorize"
import AdminaDashboard from "../AdminDashboard"
import MovieList from "../MoviesList"


const Home = () => {
  const [movies, setMovies] = useState([]);

  // load movies from the API when the component mounts
  useEffect(() => {
    let isMounted = true;

    const fetchMovies = async () => {
      try {
        const response = await api.get('/common/get_all_movies');
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

    // Fetch movies only if the list is empty
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
        <section>
          <AdminaDashboard />
        </section>
      </Authorize>
      <Authorize requiredRoles={['USER', 'GUEST']}>
        <section>
          <MovieList movies={movies} />
        </section>
      </Authorize>
    </div>
  )
}

export default Home