import { useState, useEffect, useRef } from 'react';
import api from '../../api';
import './style.css';

const MovieForm = ({ movieId, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    directors: [],
    cast: [],
    releaseDate: '',
    thumbnail: '',
    gallery: []
  });

  const [errors, setErrors] = useState({
    title: '',
    description: '',
    directors: '',
    cast: '',
    releaseDate: '',
    thumbnail: '',
    gallery: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Temporary inputs for array fields
  const [directorsInput, setDirectorsInput] = useState('');
  const [castInput, setCastInput] = useState('');

  // Validate form data
  const validateForm = () => {
    const newErrors = {
      title: '',
      description: '',
      directors: '',
      cast: '',
      releaseDate: '',
      thumbnail: '',
      gallery: ''
    };

    let isValid = true;

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
      isValid = false;
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
      isValid = false;
    }

    // Validate directors
    if (formData.directors.length === 0) {
      newErrors.directors = 'At least one director is required';
      isValid = false;
    } else if (formData.directors.some(d => d.length > 50)) {
      newErrors.directors = 'Director names cannot exceed 50 characters';
      isValid = false;
    }

    // Validate cast
    if (formData.cast.length === 0) {
      newErrors.cast = 'At least one cast member is required';
      isValid = false;
    } else if (formData.cast.some(c => c.length > 50)) {
      newErrors.cast = 'Cast member names cannot exceed 50 characters';
      isValid = false;
    }

    // Validate release date
    if (!formData.releaseDate) {
      newErrors.releaseDate = 'Release date is required';
      isValid = false;
    } else {
      const releaseDate = new Date(formData.releaseDate);
      const currentDate = new Date();
      if (releaseDate > currentDate) {
        newErrors.releaseDate = 'Release date cannot be in the future';
        isValid = false;
      }
    }

    // Validate thumbnail
    if (!formData.thumbnail && !thumbnailFile) {
      newErrors.thumbnail = 'Thumbnail is required';
      isValid = false;
    }

    // Validate gallery images
    if (formData.gallery.length === 0 && galleryFiles.length === 0) {
      newErrors.gallery = 'At least one gallery image is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // build image URL based on the path - ok
  const buildImageUrl = (path) => {
    console.log(process.env.REACT_APP_BASE_URL);
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads/movies/')) {
      return `${process.env.REACT_APP_BASE_URL}${path}`;
    }
    return `${process.env.REACT_APP_BASE_URL}/uploads/movies/${path}`;
  };

  // Cache for images
  const imageCache = useRef({
    thumbnails: new Map(),
    gallery: new Map(),
    cleanup: () => {
      imageCache.current.thumbnails.forEach(url => URL.revokeObjectURL(url));
      imageCache.current.gallery.forEach(url => URL.revokeObjectURL(url));
      imageCache.current.thumbnails.clear();
      imageCache.current.gallery.clear();
    }
  });

  // Fetch images
  const cacheImage = async (path, isThumbnail = false) => {
    if (!path) return '';

    const cache = isThumbnail
      ? imageCache.current.thumbnails
      : imageCache.current.gallery;

    if (cache.has(path)) {
      return cache.get(path);
    }

    try {
      const url = buildImageUrl(path);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      cache.set(path, objectUrl);
      return objectUrl;
    } catch (error) {
      console.error('Error fetching image:', error);
      return '/images/placeholder.png';
    }
  };

  // Cleaning cache on unmount
  useEffect(() => {
    const loadMovieData = async () => {
      if (!movieId) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/common/get_movie/${movieId}`);
        const movie = response.data.movie;

        // Load and cache thumbnail
        const thumUrl = movie.thumbnail
          ? await cacheImage(movie.thumbnail, true)
          : '/images/placeholder.png';

        // Load and cache gallery images
        const galleryUrls = await Promise.all(
          movie.gallery.map(img => cacheImage(img))
        );

        setFormData({
          ...movie,
          thumbnail: thumUrl,
          gallery: galleryUrls,
          releaseDate: movie.releaseDate.split('T')[0]
        });
      } catch (error) {
        console.error('Error loading movie:', error);
        setError('Failed to load movie data');
      } finally {
        setLoading(false);
      }
    }
    loadMovieData();

    return () => {
      // Cleanup image cache on unmount
      imageCache.current.cleanup();
    };
  }, [movieId]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayAdd = (field, input, setInput) => {
    if (!input.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], input.trim()]
    }));
    setInput('');
  };

  const handleRemoveItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, thumbnail: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newUrls = files.map(file => URL.createObjectURL(file));
    setGalleryFiles(prev => [...prev, ...files]);
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, ...newUrls]
    }));
  };

  const removeGalleryImage = (index) => {
    const imageUrl = formData.gallery[index];

    // Check if it's a server image (has uploads/movies in path)
    if (imageUrl.includes('/uploads/movies/')) {
      // Extract filename from URL
      const filename = imageUrl.split('/uploads/movies/')[1];
      setFilesToRemove(prev => [...prev, filename]);
    } else if (imageUrl.startsWith('blob:')) {
      // Revoke blob URL for new images
      URL.revokeObjectURL(imageUrl);
    }

    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();

      // Add standard fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('directors', formData.directors.join(','));
      formDataToSend.append('cast', formData.cast.join(','));
      formDataToSend.append('releaseDate', formData.releaseDate);

      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile);
      }

      galleryFiles.forEach(file => {
        formDataToSend.append('gallery', file);
      });

      // If editing an existing movie, include files to remove
      if (movieId && filesToRemove.length > 0) {
        formDataToSend.append('removeGallery', JSON.stringify(filesToRemove));
        console.log('Removing gallery indexes:', filesToRemove);
      }

      const endpoint = movieId ? `/sudo/update_movie/${movieId}` : '/sudo/add_movie';
      await api(endpoint, {
        method: movieId ? 'PUT' : 'POST',
        data: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading movie data...</div>;

  return (
    <div className="movie-form-container">
      <h2>{movieId ? 'Edit Movie' : 'Add New Movie'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title*:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>Description*:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label>Directors*:</label>
          <div className="array-input">
            <input
              type="text"
              value={directorsInput}
              onChange={(e) => setDirectorsInput(e.target.value)}
              placeholder="Add director"
            />
            <button
              type="button"
              onClick={() => handleArrayAdd('directors', directorsInput, setDirectorsInput)}
            >
              Add
            </button>
          </div>
          {errors.directors && <span className="error-text">{errors.directors}</span>}
          <div className="array-items">
            {formData.directors.map((director, index) => (
              <div key={index} className="array-item">
                {director}
                <button
                  type="button"
                  onClick={() => handleRemoveItem('directors', index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Cast*:</label>
          <div className="array-input">
            <input
              type="text"
              value={castInput}
              onChange={(e) => setCastInput(e.target.value)}
              placeholder="Add cast member"
            />
            <button
              type="button"
              onClick={() => handleArrayAdd('cast', castInput, setCastInput)}
            >
              Add
            </button>
          </div>
          {errors.cast && <span className="error-text">{errors.cast}</span>}
          <div className="array-items">
            {formData.cast.map((member, index) => (
              <div key={index} className="array-item">
                {member}
                <button
                  type="button"
                  onClick={() => handleRemoveItem('cast', index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Release Date*:</label>
          <input
            type="date"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={handleInputChange}
          />
          {errors.releaseDate && <span className="error-text">{errors.releaseDate}</span>}
        </div>

        <div className="form-group">
          <label>Thumbnail*:</label>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} />
          {errors.thumbnail && <span className="error-text">{errors.thumbnail}</span>}
          {formData.thumbnail && (
            <div className="image-preview">
              <img
                src={formData.thumbnail || '/images/placeholder.png'}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder.png';
                }}
                alt="Thumbnail preview"
                className="thumbnail-preview"
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Gallery Images:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleGalleryChange}
            multiple
          />
          {errors.gallery && <span className="error-text">{errors.gallery}</span>}
          <div className="gallery-preview">
            {formData.gallery.map((img, index) => (
              <div key={index} className="gallery-item">
                <img
                  src={img}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.png';
                  }}
                  alt={`Gallery item ${index}`}
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  aria-label='Remove image'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>


        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          {movieId ? 'Movie updated successfully!' : 'Movie added successfully!'}
        </div>
      )}
    </div>
  );
};

export default MovieForm;
