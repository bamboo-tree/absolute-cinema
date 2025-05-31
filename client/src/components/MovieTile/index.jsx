import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

import './style.css';
import Authorize from "../../Authorize"
import ReviewForm from '../ReviewForm';
import api from '../../api';

const MovieTile = ({ movie }) => {
  const [showReviews, setShowReviews] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [movieData, setMovieData] = useState(movie);

  const refreshMovieData = async () => {
    try {
      const response = await api.get(`/common/get_movie/${encodeURIComponent(movie._id)}`);
      setMovieData(response.data);
    } catch (error) {
      console.error('Error fetching updated movie data:', error);
    }
  };

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded._id;
    } catch (err) {
      console.error('Invalid token', err);
      return null;
    }
  };

  const getCurrentUserReview = () => {
    const userId = getUserIdFromToken();
    return movieData.reviews?.find(r => r.user === userId);
  };

  const toggleReviews = () => {
    setShowReviews(!showReviews);
    setShowForm(false);
  };

  const toggleForm = () => {
    const userReview = getCurrentUserReview();
    if (userReview) {
      setShowForm(true);
    } else {
      setShowForm(!showForm);
    }
    setShowReviews(false);
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    try {
      const endpoint = getCurrentUserReview()
        ? '/authorized/update_review'
        : '/authorized/add_review';
      const method = getCurrentUserReview() ? 'PUT' : 'POST';
      await api({
        method,
        url: endpoint,
        data: {
          title: movie.title,
          rating,
          comment
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setShowForm(false);
      await refreshMovieData();
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const handleDeleteReview = async () => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      try {
        await api.delete('/authorized/delete_review', {
          data: { title: movie.title },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        await refreshMovieData();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
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

  const currentUserReview = getCurrentUserReview();

  return (
    <div className="movie-tile">
      <div className="movie-header">
        <div className="thumbnail-container">
          <img
            src={`${process.env.REACT_APP_BASE_URL}${movie.thumbnail}`}
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
                src={`${process.env.REACT_APP_BASE_URL}${movie.gallery[currentImageIndex]}`}
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
        {movieData.reviews?.length > 0 ? (
          <button onClick={toggleReviews} className="reviews-toggle-button">
            {showReviews ? 'Hide Reviews' : `Show Reviews (${movieData.reviews.length})`}
          </button>
        ) : (
          <button className="reviews-toggle-button" disabled>
            No reviews yet
          </button>
        )}

        <Authorize requiredRoles={['USER']}>
          <button
            className="add-review-button"
            onClick={toggleForm}
          >
            {currentUserReview ? 'Edit Review' : 'Add Review'}
          </button>
        </Authorize>
      </div>

      {showForm && (
        <ReviewForm
          initialComment={currentUserReview?.comment || ''}
          initialRating={currentUserReview?.rating || 1}
          onSubmit={handleReviewSubmit}
          onCancel={() => setShowForm(false)}
          isEditing={!!currentUserReview}
          onDelete={currentUserReview ? handleDeleteReview : null}
        />
      )}

      {showReviews && movieData.reviews?.length > 0 && (
        <div className="reviews-section">
          <h3>Reviews</h3>
          <ul className="reviews-list">
            {movieData.reviews.map((review) => (
              <li key={review._id} className="review-item">
                <div className="review-header">
                  <div>
                    <strong>{review.username}</strong>
                    <span className="review-rating">{review.rating}/10</span>
                  </div>
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