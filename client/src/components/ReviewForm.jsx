import { useState } from 'react';

import '../styles/reviewForm.css';

const ReviewForm = ({ onSubmit, onCancel }) => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5); // default rating
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    if (rating < 1 || rating > 10) {
      setError('Rating must be between 1 and 10');
      return;
    }
    setError('');
    onSubmit({ comment, rating });
  };


  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Add Your Review</h3>

      <div className="form-group">
        <label htmlFor="comment">Comment:</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="rating">Rating (1–10):</label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          required
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="submit-button">Submit Review</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
