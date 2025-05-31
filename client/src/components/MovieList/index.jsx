import MovieTile from '../MovieTile';

import './style.css';

const MovieList = ({ movies }) => {
  if (movies.length === 0) {
    return <div className="loading">Loading movies...</div>;
  }
  if (!Array.isArray(movies)) {
    return <div className="error">Invalid movie data</div>;
  }
  if (movies.some(movie => !movie._id || !movie.title || !movie.description)) {
    return <div className="error">Some movie data is missing</div>;
  }

  return (
    <div className="movie-list">
      <h1>Movie Collection</h1>
      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieTile key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default MovieList;