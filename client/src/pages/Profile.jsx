import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState({});
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const API = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API}/api/auth/profile`, {
        headers: { Authorization: token },
      });
      setUser(res.data || {});
    } catch (err) {
      console.error('Error fetching user:', err);
      setUser({});
    }
  }, [API, token]);

  const fetchUserReviews = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API}/api/reviews/user`, {
        headers: { Authorization: token },
      });
      setReviews(res.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [API, token]);

  useEffect(() => {
    fetchUser();
    fetchUserReviews();

    const onRefresh = () => {
      setLoading(true);
      fetchUser();
      fetchUserReviews();
    };
    window.addEventListener('profile:refresh', onRefresh);
    return () => window.removeEventListener('profile:refresh', onRefresh);
  }, [fetchUser, fetchUserReviews]);

  // Helper function to generate user initials
  const getUserInitials = (name) => {
    if (!name) return '👤';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Handle profile picture upload
  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (1MB limit)
    if (file.size > 1024 * 1024) {
      alert('Image must be smaller than 1MB');
      return;
    }

    setUploadingPicture(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        
        try {
          const response = await axios.put(`${API}/api/auth/profile/picture`, {
            profilePicture: base64
          }, {
            headers: { Authorization: token }
          });

          setUser(response.data);
          setShowPictureModal(false);
        } catch (err) {
          console.error('Error uploading picture:', err);
          alert(err.response?.data?.error || 'Failed to upload picture');
        } finally {
          setUploadingPicture(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setUploadingPicture(false);
      alert('Failed to read image file');
    }
  };

  // Remove profile picture
  const removePicture = async () => {
    setUploadingPicture(true);
    try {
      const response = await axios.put(`${API}/api/auth/profile/picture`, {
        profilePicture: null
      }, {
        headers: { Authorization: token }
      });

      setUser(response.data);
      setShowPictureModal(false);
    } catch (err) {
      console.error('Error removing picture:', err);
      alert('Failed to remove picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  // Helper function to render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star' : 'star empty'}>
          ★
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

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <div className="profile-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <div className="empty-reviews">
            <div className="empty-icon">🔐</div>
            <h2 className="empty-title">Please Log In</h2>
            <p className="empty-subtitle">You need to be logged in to view your profile</p>
            <Link to="/login" className="start-reviewing-btn">
              <span>🚀</span>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-container">
            <div className="profile-avatar" onClick={() => setShowPictureModal(true)}>
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="Profile" 
                  className="profile-picture"
                />
              ) : (
                getUserInitials(user?.name)
              )}
            </div>
            <button 
              className="change-picture-btn"
              onClick={() => setShowPictureModal(true)}
              title="Change profile picture"
            >
              📷
            </button>
          </div>
          <h1 className="profile-name">{user?.name || 'Movie Enthusiast'}</h1>
          <p className="profile-email">{user?.email || 'No email provided'}</p>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{reviews.length}</span>
              <div className="stat-label">Reviews</div>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </span>
              <div className="stat-label">Avg Rating</div>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {new Set(reviews.map(r => r.movieId)).size}
              </span>
              <div className="stat-label">Movies</div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <span className="reviews-icon">📝</span>
            <h2 className="reviews-title">My Reviews</h2>
          </div>

          {reviews.length === 0 ? (
            <div className="empty-reviews">
              <div className="empty-icon">🎭</div>
              <h3 className="empty-title">No Reviews Yet</h3>
              <p className="empty-subtitle">
                Start your movie journey by reviewing your first film!
              </p>
              <Link to="/" className="start-reviewing-btn">
                <span>🎬</span>
                Explore Movies
              </Link>
            </div>
          ) : (
            <div className="reviews-grid">
              {reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <h3 className="review-movie-title">{review.movieTitle}</h3>
                  
                  <div className="review-rating">
                    <div className="rating-stars">
                      {renderStars(review.rating)}
                    </div>
                    <span className="rating-text">{review.rating}/5</span>
                  </div>
                  
                  {review.comment && (
                    <div className="review-comment">
                      "{review.comment}"
                    </div>
                  )}
                  
                  <div className="review-date">
                    {formatDate(review.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Picture Modal */}
        {showPictureModal && (
          <div className="picture-modal-overlay" onClick={() => setShowPictureModal(false)}>
            <div className="picture-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Change Profile Picture</h3>
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowPictureModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="current-picture">
                  <div className="preview-avatar">
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="Current profile" 
                        className="preview-image"
                      />
                    ) : (
                      <div className="preview-initials">
                        {getUserInitials(user?.name)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <label className="upload-btn" disabled={uploadingPicture}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureUpload}
                      disabled={uploadingPicture}
                      style={{ display: 'none' }}
                    />
                    {uploadingPicture ? (
                      <>
                        <div className="small-spinner"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        📁 Choose New Photo
                      </>
                    )}
                  </label>

                  {user?.profilePicture && (
                    <button 
                      className="remove-btn"
                      onClick={removePicture}
                      disabled={uploadingPicture}
                    >
                      🗑️ Remove Photo
                    </button>
                  )}
                </div>

                <div className="upload-info">
                  <p>• Maximum file size: 1MB</p>
                  <p>• Supported formats: JPG, PNG, GIF</p>
                  <p>• Recommended: Square images (1:1 ratio)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
