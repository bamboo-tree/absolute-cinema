import { useState, useEffect } from 'react';
import api from '../api';

const MovieForm = ({ movieTitle, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    directors: [],
    cast: [],
    releaseDate: '',
    thumbnail: '',
    gallery: []
  });

  const [error, setError] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const [directorsInput, setDirectorsInput] = useState('');
  const [castInput, setCastInput] = useState('');

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const response = await api.get(`/api/common/get_movie/${movieTitle}`);
        const movie = response.data.movie;

        setFormData({
          title: movie.title,
          description: movie.description,
          directors: movie.directors,
          cast: movie.cast,
          releaseDate: movie.releaseDate.split('T')[0],
          thumbnail: movie.thumbnail,
          gallery: movie.gallery
        });

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch movie data');
      }
    };

    if (movieTitle) {
      fetchMovieData();
    }
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

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setThumbnailFile(file);
      // Podgląd obrazka
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, thumbnail: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files).filter(file =>
      file.type === 'image/jpeg' || file.type === 'image/png'
    );
    setGalleryFiles(prev => [...prev, ...files]);

    // Podgląd galerii
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          gallery: [...prev.gallery, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      }
    });

    return response.data.path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let thumbnailPath = formData.thumbnail;
      let galleryPaths = [...formData.gallery];

      // Upload thumbnail if new file was selected
      if (thumbnailFile) {
        thumbnailPath = await uploadFile(thumbnailFile, 'thumbnail');
      }

      // Upload new gallery files
      if (galleryFiles.length > 0) {
        const newPaths = await Promise.all(
          galleryFiles.map(file => uploadFile(file, 'gallery'))
        );
        galleryPaths = [...formData.gallery.filter(path => !path.startsWith('data:')), ...newPaths];
      }

      // Prepare final data
      const finalData = {
        ...formData,
        thumbnail: thumbnailPath,
        gallery: galleryPaths
      };

      // Submit to server
      await axios.put(`/api/movies/${movieId}`, finalData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update movie');
    }
  };

  if (loading) return <div className="loading">Loading movie data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="movie-form-container">
      <h2>{movieId ? 'Edit Movie' : 'Add New Movie'}</h2>

      {success && (
        <div className="success-message">Movie updated successfully!</div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ... (pozostałe pola formularza bez zmian) ... */}

        <div className="form-group">
          <label>Thumbnail:</label>
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleThumbnailChange}
          />
          {formData.thumbnail && (
            <div className="image-preview">
              <img
                src={formData.thumbnail}
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
            accept="image/jpeg, image/png"
            onChange={handleGalleryChange}
            multiple
          />
          <div className="gallery-preview">
            {formData.gallery.map((image, index) => (
              <div key={index} className="gallery-item">
                <img src={image} alt={`Gallery ${index}`} />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="remove-image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">Save Changes</button>
          <button type="button" onClick={onCancel} className="cancel-button">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;