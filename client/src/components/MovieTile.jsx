import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

import '../styles/movieTile.css';
import Authorize from "../Authorize"
import ReviewForm from './ReviewForm';
import api from '../api';

const MovieTile = ({ movie }) => {
  const [showReviews, setShowReviews] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded);
      return decoded._id;
    } catch (err) {
      console.error('Invalid token', err);
      return null;
    }
  };


  const toggleReviews = () => {
    setShowReviews(!showReviews);
    setShowForm(false);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setShowReviews(false);
    getUserIdFromToken(); // Ensure user ID is fetched when toggling form
    console.log('User ID:', getUserIdFromToken());
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    try {
      const response = await api.post(
        '/authorized/add_review',
        {
          title: movie.title,
          rating,
          comment
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setShowForm(false);
      setShowReviews(true);

      if (response.data.review) {
        movie.reviews.push(response.data.review);
      }

    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };


  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex + 1) % movie.gallery.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex - 1 + movie.gallery.length) % movie.gallery.length
    );
  };

  return (
    <div className="movie-tile">
      <div className="movie-header">
        <div className="thumbnail-container">
          <img
            src={`http://localhost:8080${movie.thumbnail}`}
            alt={`${movie.title} thumbnail`}
            className="movie-thumbnail"
          />
        </div>
        <div className="movie-header-info">
          <h2>{movie.title}</h2>
          <div className="movie-meta">
            <p><strong>Release Date:</strong> {new Date(movie.releaseDate).toLocaleDateString()}</p>
            <p><strong>Directors:</strong> {movie.directors.join(', ')}</p>
            <p><strong>Cast:</strong> {movie.cast.join(', ')}</p>
          </div>
        </div>
      </div>

      <div className="movie-description">
        <p>{movie.description}</p>
      </div>

      {movie.gallery && movie.gallery.length > 0 && (
        <div className="movie-gallery">
          <h3>Gallery</h3>
          <div className="gallery-wrapper">
            <button className="gallery-nav-button prev" onClick={prevImage}>&lt;</button>
            <div className="gallery-container">
              <img
                src={`http://localhost:8080${movie.gallery[currentImageIndex]}`}
                alt={`${movie.title} gallery ${currentImageIndex + 1}`}
                className="gallery-image"
              />
            </div>
            <button className="gallery-nav-button next" onClick={nextImage}>&gt;</button>
          </div>
          <div className="gallery-indicator">
            {currentImageIndex + 1} / {movie.gallery.length}
          </div>
        </div>
      )}


      <div className="reviews-button-container">
        {movie.reviews && movie.reviews.length > 0 && (
          <button onClick={toggleReviews} className="reviews-toggle-button">
            {showReviews ? 'Hide Reviews' : `Show Reviews (${movie.reviews?.length || 0})`}
          </button>
        )}
        <Authorize requiredRoles={['USER']}>
          {!movie.reviews.some(r => r.user === getUserIdFromToken()) ? (
            <button className="add-review-button" onClick={toggleForm}>
              Add Review
            </button>
          ) : (
            <button className="add-review-button" disabled>
              Review Submitted
            </button>
          )}
        </Authorize>

      </div>


      {showForm && (
        <ReviewForm
          onSubmit={handleReviewSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}


      {showReviews && movie.reviews && (
        <div className="reviews-section">
          <h3>Reviews</h3>
          <ul className="reviews-list">
            {movie.reviews.map((review, index) => (
              <li key={index} className="review-item">
                <div className="review-header">
                  <strong>{review.username}</strong>
                  <span className="review-rating">{review.rating}/10</span>
                </div>
                <div className="review-comment">{review.comment}</div>
                <div className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MovieTile;