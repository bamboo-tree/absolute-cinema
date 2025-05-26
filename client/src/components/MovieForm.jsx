import { useState, useEffect, useRef } from 'react';
import api from '../api';

import '../styles/movieForm.css';

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

  // Cache for images
  const imageCache = useRef({
    thumbnails: new Map(),
    gallery: new Map()
  });

  // Function to build full image URL
  const buildImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads/movies/')) {
      return `${process.env.REACT_APP_API_BASE_URL || ''}${path}`;
    }
    return `${process.env.REACT_APP_API_BASE_URL || ''}/uploads/movies/${path}`;
  };

  // Fetch and cache images
  const fetchAndCacheImage = async (path) => {
    const url = buildImageUrl(path);
    if (!url) return null;

    if (imageCache.current.thumbnails.has(url) || imageCache.current.gallery.has(url)) {
      return url;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Image not found');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      if (url.includes('thumbnail')) {
        imageCache.current.thumbnails.set(url, objectUrl);
      } else {
        imageCache.current.gallery.set(url, objectUrl);
      }

      return objectUrl;
    } catch (error) {
      console.error('Error caching image:', error);
      return null;
    }
  };

  // Cleaning cache on unmount
  useEffect(() => {
    return () => {
      // Zwolnienie URL-i obiektów
      imageCache.current.thumbnails.forEach(url => URL.revokeObjectURL(url));
      imageCache.current.gallery.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Load movie data if movieId is provided
  useEffect(() => {
    const loadMovieData = async () => {

      if (!movieId) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/common/get_movie/${movieId}`);
        const movie = response.data.movie;

        // Fetch and cache thumbnail
        const thumbUrl = await fetchAndCacheImage(movie.thumbnail);

        // Fetch and cache gallery images
        const galleryUrlsSet = new Set();
        const galleryUrls = [];

        for (const imgPath of movie.gallery) {
          const cachedUrl = await fetchAndCacheImage(imgPath);
          const finalUrl = cachedUrl || buildImageUrl(imgPath);

          if (finalUrl && !galleryUrlsSet.has(finalUrl)) {
            galleryUrlsSet.add(finalUrl);
            galleryUrls.push(finalUrl);
          }
        }

        setFormData({
          ...movie,
          thumbnail: thumbUrl || buildImageUrl(movie.thumbnail),
          gallery: galleryUrls,
          releaseDate: movie.releaseDate.split('T')[0]
        });
      } catch (error) {
        console.error('Error loading movie:', error);
        setError('Failed to load movie data');
      } finally {
        setLoading(false);
      }
    };

    loadMovieData();
  }, [movieId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayAdd = (field, input, setInput) => {
    if (input.trim() === '') return;

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

  const previewImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, thumbnail: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);

    const newUrls = files.map(file => URL.createObjectURL(file));
    const cleanGallery = newUrls.filter(url => url && typeof url === 'string');

    setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...cleanGallery] }));
  };

  const removeGalleryImage = (index) => {
    const isNewImage = formData.gallery[index]?.startsWith('blob:') || formData.gallery[index]?.startsWith('data:');

    if (!isNewImage) {
      setFilesToRemove(prev => [...prev, index]);
    }

    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
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

      // Add thumbnail and gallery files
      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile);
      }

      galleryFiles.forEach(file => {
        formDataToSend.append('gallery', file);
      });

      // If editing an existing movie, include files to remove
      if (movieId && filesToRemove.length > 0) {
        formDataToSend.append('removeGallery', JSON.stringify(filesToRemove));
      }

      if (movieId) {
        await api.put(`/sudo/update_movie/${movieId}`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await api.post('/sudo/add_movie', formDataToSend, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

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
            required
          />
        </div>

        <div className="form-group">
          <label>Description*:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
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
            required
          />
        </div>

        <div className="form-group">
          <label>Thumbnail*:</label>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} />
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
          <div className="gallery-preview">
            {formData.gallery.map((img, index) => (
              <div key={index} className="gallery-item">
                {img && (
                  <img
                    src={img}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/placeholder.png';
                    }}
                    alt={`Gallery item ${index}`}
                  />
                )}
                {!img && (
                  <img
                    src="/images/placeholder.png"
                    alt="Placeholder"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
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
      {success && (
        <div className="success-message">
          {movieId ? 'Movie updated successfully!' : 'Movie added successfully!'}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default MovieForm;