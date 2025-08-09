import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('batman');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMovies = async (searchTerm) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`https://www.omdbapi.com/?s=${searchTerm}&apikey=6e52756d`);
      if (res.data.Search) {
        setMovies(res.data.Search);
      } else {
        setMovies([]);
        setError('No movies found. Try a different search term.');
      }
    } catch (err) {
      console.error('Error fetching movies', err);
      setError('Failed to fetch movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchMovies(query);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="movie-icon">🎬</span>
            MovieMeter
          </h1>
          <p className="hero-subtitle">Discover, Rate, and Review Your Favorite Movies</p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search for movies, TV shows, actors..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button" disabled={loading}>
                {loading ? '🔍' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching for movies...</p>
          </div>
        )}

        {!loading && !error && movies.length > 0 && (
          <div className="results-section">
            <h2 className="results-title">
              Found {movies.length} result{movies.length !== 1 ? 's' : ''} for "{query}"
            </h2>
            <div className="movies-grid">
              {movies.map((movie) => (
                <Link to={`/movie/${movie.imdbID}`} key={movie.imdbID} className="movie-card-link">
                  <div className="movie-card">
                    <div className="movie-poster">
                      {movie.Poster !== "N/A" ? (
                        <img 
                          src={movie.Poster} 
                          alt={movie.Title} 
                          className="movie-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="movie-image-placeholder" 
                        style={{ 
                          display: movie.Poster === "N/A" ? 'flex' : 'none',
                          width: '100%', 
                          height: '300px', 
                          backgroundColor: '#f0f0f0', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '48px',
                          color: '#999'
                        }}
                      >
                        🎬
                      </div>
                      <div className="movie-overlay">
                        <span className="view-details">View Details</span>
                      </div>
                    </div>
                    <div className="movie-info">
                      <h3 className="movie-title">{movie.Title}</h3>
                      <p className="movie-year">{movie.Year}</p>
                      {movie.Type && (
                        <span className="movie-type">{movie.Type}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && movies.length === 0 && query && (
          <div className="no-results">
            <div className="no-results-icon">🎭</div>
            <h3>No movies found</h3>
            <p>Try searching for a different movie or TV show</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
