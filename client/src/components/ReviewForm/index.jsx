import { useEffect, useState } from 'react';

import './style.css';

const ReviewForm = ({ onSubmit, onCancel, initialComment, initalRating, isEditing, onDelete }) => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setComment(initialComment);
    setRating(initalRating);
  }, [initialComment, initalRating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!comment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (rating < 1 || rating > 10) {
      setError('Rating must be between 1 and 10');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ comment, rating });
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      try {
        await onDelete();
        window.location.reload();
      } catch (err) {
        setError('Failed to delete review');
      }
    }
  }


  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>{initialComment ? 'Edit Your Review' : 'Add Your Review'}</h3>

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
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : (isEditing ? 'Update Review' : 'Submit Review')}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}

        {isEditing && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="delete-button"
            disabled={isSubmitting}
          >
            Delete Review
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
