import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import http from '../api/http';
import './MovieDetail.css';

// Tell Profile to refresh itself
const notifyProfileRefresh = () =>
  window.dispatchEvent(new CustomEvent('profile:refresh'));

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 0, comment: '' });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userToken, setUserToken] = useState(localStorage.getItem('token'));

  const fetchMovie = async () => {
    try {
      const res = await axios.get(`https://www.omdbapi.com/?i=${id}&apikey=6e52756d`);
      setMovie(res.data);
    } catch (err) {
      console.error('Error fetching movie details:', err);
      setMovie({ Error: 'Failed to load movie details' });
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await http.get(`/api/reviews/${id}`);
      setReviews(res.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    }
  };

  const fetchUser = async () => {
    if (!userToken) return;
    try {
      const res = await http.get('/api/auth/profile');
      setUserId(res.data?._id);
    } catch (err) {
      console.error('Error fetching user:', err);
      setUserToken(null);
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMovie(), fetchUser(), fetchReviews()]);
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Helper function to render stars
  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={interactive && onStarClick ? () => onStarClick(i) : undefined}
          tabIndex={interactive ? 0 : -1}
          onKeyPress={interactive && onStarClick ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onStarClick(i);
            }
          } : undefined}
        >
          ⭐
        </span>
      );
    }
    return stars;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper function to calculate average rating
  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userToken) return;
    if (form.rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!form.comment.trim()) {
      alert('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      await http.post('/api/reviews', {
        movieId: id,
        movieTitle: movie?.Title || '',
        rating: form.rating,
        comment: form.comment.trim(),
      });

      setForm({ rating: 0, comment: '' });
      await fetchReviews();
      notifyProfileRefresh();
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (review) => {
    if (!userToken) return;

    const updatedComment = prompt('Edit your review', review.comment);
    if (updatedComment == null) return; // cancel
    const updatedRating = prompt('Edit your rating (1-5)', review.rating);
    if (updatedRating == null) return;

    const rating = parseInt(updatedRating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      alert('Rating must be between 1 and 5');
      return;
    }

    try {
      await http.put(`/api/reviews/${review._id}`, {
        comment: updatedComment.trim(),
        rating: rating,
      });

      await fetchReviews();
      notifyProfileRefresh();
    } catch (err) {
      console.error('Error updating review:', err);
      alert('Failed to update review. Please try again.');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!userToken) return;
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await http.delete(`/api/reviews/${reviewId}`);

      await fetchReviews();
      notifyProfileRefresh();
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="movie-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading movie details...</p>
      </div>
    );
  }

  // Error state
  if (movie?.Error) {
    return (
      <div className="movie-detail-error">
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎬</div>
        <h2>Movie Not Found</h2>
        <p>{movie.Error}</p>
        <Link to="/" style={{ 
          color: '#FF6B6B', 
          textDecoration: 'none', 
          fontWeight: '600',
          marginTop: '20px',
          display: 'inline-block'
        }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="movie-detail">
      {/* Movie Hero Section */}
      <section className="movie-hero">
        <div className="movie-hero-backdrop"></div>
        <div className="movie-hero-content">
          {/* Movie Poster */}
          <div className="movie-poster-container">
            {movie?.Poster && movie.Poster !== 'N/A' ? (
              <img 
                src={movie.Poster} 
                alt={movie.Title} 
                className="movie-poster"
              />
            ) : (
              <div className="movie-poster" style={{ 
                backgroundColor: '#f0f0f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '4rem',
                color: '#999'
              }}>
                🎬
              </div>
            )}
            <div className="movie-poster-overlay">
              <div className="movie-rating-badge">
                <span className="rating-number">{getAverageRating()}</span>
                <span className="rating-label">Average Rating</span>
              </div>
            </div>
          </div>

          {/* Movie Info */}
          <div className="movie-info">
            <h1 className="movie-title">{movie?.Title}</h1>
            
            <div className="movie-meta">
              {movie?.Year && <span className="movie-year">{movie.Year}</span>}
              {movie?.Runtime && <span className="movie-runtime">{movie.Runtime}</span>}
              {movie?.Genre && <span className="movie-genre">{movie.Genre}</span>}
            </div>

            {movie?.Plot && (
              <div className="movie-plot">
                <h3>Plot</h3>
                <p>{movie.Plot}</p>
              </div>
            )}

            <div className="movie-rating-section">
              <div className="average-rating">
                <h3>Community Rating</h3>
                <div className="stars-container">
                  {renderStars(Math.round(getAverageRating()))}
                  <span className="rating-text">
                    {getAverageRating()}/5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            </div>

            {/* Movie Details Grid */}
            <div className="movie-details-grid">
              {movie?.Director && (
                <div className="detail-item">
                  <span className="detail-label">Director</span>
                  <div className="detail-value">{movie.Director}</div>
                </div>
              )}
              {movie?.Actors && (
                <div className="detail-item">
                  <span className="detail-label">Cast</span>
                  <div className="detail-value">{movie.Actors}</div>
                </div>
              )}
              {movie?.imdbRating && (
                <div className="detail-item">
                  <span className="detail-label">IMDb Rating</span>
                  <div className="detail-value">{movie.imdbRating}/10</div>
                </div>
              )}
              {movie?.Rated && (
                <div className="detail-item">
                  <span className="detail-label">Rated</span>
                  <div className="detail-value">{movie.Rated}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section className="review-section">
        <div className="container">
          <h2 className="section-title">Reviews & Ratings</h2>

          {/* Review Form */}
          {userToken ? (
            <form onSubmit={handleSubmit} className="review-form">
              <div className="rating-input-section">
                <label className="rating-label">Your Rating</label>
                <div className="rating-input">
                  <div className="stars-container">
                    {renderStars(form.rating, true, (rating) => setForm({ ...form, rating }))}
                  </div>
                  <span>{form.rating > 0 ? `${form.rating}/5` : 'Select a rating'}</span>
                </div>
              </div>

              <div className="comment-input-section">
                <label htmlFor="comment" className="comment-label">Your Review</label>
                <textarea
                  id="comment"
                  className="comment-input"
                  placeholder="Share your thoughts about this movie..."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="submit-review-btn"
                disabled={submitting || form.rating === 0}
              >
                {submitting ? (
                  <>
                    <div className="spinner"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    📝 Submit Review
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <h3>Share Your Thoughts!</h3>
              <p>
                <Link to="/login">Sign in</Link> to write a review and rate this movie.
              </p>
            </div>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            <h3 className="reviews-title">
              All Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <div className="no-reviews">
                <div className="no-reviews-icon">💭</div>
                <p>No reviews yet. Be the first to share your opinion!</p>
              </div>
            ) : (
              <div className="reviews-grid">
                {reviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <div className="review-rating">
                        <div className="stars-container">
                          {renderStars(review.rating)}
                        </div>
                        <span className="review-rating-text">{review.rating}/5</span>
                      </div>
                      {String(review.userId) === String(userId) && (
                        <div className="review-actions">
                          <button 
                            onClick={() => handleEdit(review)} 
                            className="edit-btn"
                            title="Edit review"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(review._id)} 
                            className="delete-btn"
                            title="Delete review"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="review-content">
                      <p>"{review.comment}"</p>
                    </div>
                    
                    <div className="review-footer">
                      <div className="review-date">
                        {formatDate(review.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MovieDetail;
