import { useState, useEffect } from 'react';
import api from '../api';
import '../styles/manage.css';

import MovieForm from './MovieForm';

const ManageMovies = () => {
  const [movies, setMovies] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  // Fetch users
  const fetchMovies = async () => {
    try {
      const response = await api.get('/common/get_all_movies');
      setMovies(response.data.movies);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch movies');
    }
  };

  // Fetch movies on component mount
  useEffect(() => {
    fetchMovies();
  }, []);

  // Delete movies
  const handleDeleteMovie = async (title) => {
    try {
      await api.delete('/sudo/delete_movie', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        data: { title }
      });
      setMovies(movies.filter(movie => movie.title !== title));
    }
    catch (err) {
      setError(err.response?.data?.message || 'Failed to delete movie');
    }
  }

  // Edit movies
  const handleEditMovie = async (id) => {
    setIsEdit(true);
    setSelectedMovieId(id);
  }

  // Render error if exists
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="list-container">
      <h2>Manage Movies</h2>
      {/* Edit existing movie */}
      {isEdit && (
        <MovieForm
          movieId={selectedMovieId}
          onCancel={() => setIsEdit(false)}
          onSuccess={() => {
            setIsEdit(false);
          }}
        />
      )}

      {/* Display movies */}
      {(!isEdit && movies.length === 0) ? (
        <p>No movies found</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Year</th>
              <th>Id</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie._id}>
                <td>{movie.title}</td>
                <td>{movie.releaseDate.split('T')[0]}</td>
                <td>{movie._id}</td>
                <td>
                  <button
                    className="button"
                    onClick={() => handleEditMovie(movie._id)}>
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="button"
                    onClick={() => handleDeleteMovie(movie.title)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div >
  );
};

export default ManageMovies;