import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Home from '../pages/Home';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
}));

// Mock data
const mockMovies = [
  {
    imdbID: 'tt0372784',
    Title: 'Batman Begins',
    Year: '2005',
    Poster: 'https://example.com/batman.jpg',
    Type: 'movie'
  },
  {
    imdbID: 'tt0468569',
    Title: 'The Dark Knight',
    Year: '2008',
    Poster: 'https://example.com/dark-knight.jpg',
    Type: 'movie'
  },
  {
    imdbID: 'tt1345836',
    Title: 'The Dark Knight Rises',
    Year: '2012',
    Poster: 'N/A',
    Type: 'movie'
  }
];

const mockSearchResponse = {
  data: {
    Search: mockMovies,
    totalResults: '3',
    Response: 'True'
  }
};

const mockNoResultsResponse = {
  data: {
    Response: 'False',
    Error: 'Movie not found!'
  }
};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Page E2E Tests', () => {
  let axios;
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    axios = require('axios');
    user = userEvent.setup();
  });

  describe('Initial Load', () => {
    test('loads with default search and displays movies', async () => {
      axios.get.mockResolvedValueOnce(mockSearchResponse);
      
      renderWithRouter(<Home />);
      
      // Check if default search is performed
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          'https://www.omdbapi.com/?s=batman&apikey=6e52756d'
        );
      });
      
      // Check if movies are displayed
      await waitFor(() => {
        expect(screen.getByText('Found 3 results for "batman"')).toBeInTheDocument();
        expect(screen.getByText('Batman Begins')).toBeInTheDocument();
        expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
        expect(screen.getByText('The Dark Knight Rises')).toBeInTheDocument();
      });
    });

    test('displays hero section correctly', () => {
      axios.get.mockResolvedValueOnce(mockSearchResponse);
      
      renderWithRouter(<Home />);
      
      // Check hero section elements
      expect(screen.getByText('🎬')).toBeInTheDocument();
      expect(screen.getByText('MovieMeter')).toBeInTheDocument();
      expect(screen.getByText('Discover, Rate, and Review Your Favorite Movies')).toBeInTheDocument();
      
      // Check search form
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('batman');
      
      const searchButton = screen.getByRole('button', { name: 'Search' });
      expect(searchButton).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('performs new search when user enters query and submits', async () => {
      axios.get
        .mockResolvedValueOnce(mockSearchResponse) // Initial load
        .mockResolvedValueOnce({
          data: {
            Search: [
              {
                imdbID: 'tt0111161',
                Title: 'The Shawshank Redemption',
                Year: '1994',
                Poster: 'https://example.com/shawshank.jpg',
                Type: 'movie'
              }
            ],
            totalResults: '1',
            Response: 'True'
          }
        }); // New search
      
      renderWithRouter(<Home />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument();
      });
      
      // Perform new search
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      await user.clear(searchInput);
      await user.type(searchInput, 'shawshank');
      await user.click(searchButton);
      
      // Verify new search was called
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          'https://www.omdbapi.com/?s=shawshank&apikey=6e52756d'
        );
      });
      
      // Check new results
      await waitFor(() => {
        expect(screen.getByText('Found 1 result for "shawshank"')).toBeInTheDocument();
        expect(screen.getByText('The Shawshank Redemption')).toBeInTheDocument();
      });
    });

    test('handles search with no results', async () => {
      axios.get
        .mockResolvedValueOnce(mockSearchResponse) // Initial load
        .mockResolvedValueOnce(mockNoResultsResponse); // No results search
      
      renderWithRouter(<Home />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument();
      });
      
      // Search for non-existent movie
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      await user.clear(searchInput);
      await user.type(searchInput, 'nonexistentmovie12345');
      await user.click(searchButton);
      
      // Check error message
      await waitFor(() => {
        expect(screen.getByText('No movies found. Try a different search term.')).toBeInTheDocument();
      });
      
      // Check no results section
      expect(screen.getByText('🎭')).toBeInTheDocument();
      expect(screen.getByText('No movies found')).toBeInTheDocument();
      expect(screen.getByText('Try searching for a different movie or TV show')).toBeInTheDocument();
    });

    test('handles API errors gracefully', async () => {
      axios.get
        .mockResolvedValueOnce(mockSearchResponse) // Initial load
        .mockRejectedValueOnce(new Error('Network error')); // Error search
      
      renderWithRouter(<Home />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument();
      });
      
      // Perform search that will fail
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      await user.clear(searchInput);
      await user.type(searchInput, 'batman');
      await user.click(searchButton);
      
      // Check error message
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch movies. Please try again.')).toBeInTheDocument();
      });
    });

    test('prevents search with empty query', async () => {
      axios.get.mockResolvedValueOnce(mockSearchResponse);
      
      renderWithRouter(<Home />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      // Clear input and try to search
      await user.clear(searchInput);
      await user.click(searchButton);
      
      // Verify no additional API call was made
      expect(axios.get).toHaveBeenCalledTimes(1); // Only initial load
    });

    test('prevents search with whitespace-only query', async () => {
      axios.get.mockResolvedValueOnce(mockSearchResponse);
      
      renderWithRouter(<Home />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      // Enter only whitespace and try to search
      await user.clear(searchInput);
      await user.type(searchInput, '   ');
      await user.click(searchButton);
      
      // Verify no additional API call was made
      expect(axios.get).toHaveBeenCalledTimes(1); // Only initial load
    });
  });

  describe('Movie Cards', () => {
    test('displays movie cards with correct information', async () => {
      axios.get.mockResolvedValueOnce(mockSearchResponse);
      
      renderWithRouter(<Home />);
      
      await waitFor(() => {
        // Check first movie card
        expect(screen.getByText('Batman Begins')).toBeInTheDocument();
        expect(screen.getByText('2005')).toBeInTheDocument();
        expect(screen.getByText('movie')).toBeInTheDocument();
        
        // Check second movie card
        expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
        expect(screen.getByText('2008')).toBeInTheDocument();
        
        // Check third movie card (with N/A poster)
        expect(screen.getByText('The Dark Knight Rises')).toBeInTheDocument();
        expect(screen.getByText('2012')).toBeInTheDocument();
      });
    });

    test('movie cards are clickable and navigate to detail page', async () => {
      axios.get.mockResolvedValueOnce(mockSearchResponse);
      
      renderWithRouter(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument();
      });
      
      // Click on a movie card
      const movieCard = screen.getByText('Batman Begins').closest('a');
      expect(movieCard).toHaveAttribute('href', '/movie/tt0372784');
      
      // Click on another movie card
      const secondMovieCard = screen.getByText('The Dark Knight').closest('a');
      expect(secondMovieCard).toHaveAttribute('href', '/movie/tt0468569');
    });

    test('displays placeholder for movies without posters', async () => {
      axios.get.mockResolvedValueOnce(mockSearchResponse);
      
      renderWithRouter(<Home />);
      
      await waitFor(() => {
        // Check that placeholder is shown for movie with N/A poster
        const placeholder = screen.getByText('🎬');
        expect(placeholder).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading spinner during search', async () => {
      // Mock delayed response
      axios.get.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve(mockSearchResponse), 100)
      ));
      
      renderWithRouter(<Home />);
      
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      await user.clear(searchInput);
      await user.type(searchInput, 'new search');
      await user.click(searchButton);
      
      // Check loading state
      expect(screen.getByText('Searching for movies...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '🔍' })).toBeInTheDocument();
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Found 3 results for "new search"')).toBeInTheDocument();
      });
    });

    test('disables search button during loading', async () => {
      // Mock delayed response
      axios.get.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve(mockSearchResponse), 100)
      ));
      
      renderWithRouter(<Home />);
      
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      await user.clear(searchInput);
      await user.type(searchInput, 'new search');
      await user.click(searchButton);
      
      // Check that button is disabled during loading
      expect(searchButton).toBeDisabled();
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(searchButton).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    test('clears error when user starts typing', async () => {
      axios.get
        .mockResolvedValueOnce(mockSearchResponse) // Initial load
        .mockRejectedValueOnce(new Error('Network error')); // Error search
      
      renderWithRouter(<Home />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      // Perform search that will fail
      await user.clear(searchInput);
      await user.type(searchInput, 'batman');
      await user.click(searchButton);
      
      // Check error message appears
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch movies. Please try again.')).toBeInTheDocument();
      });
      
      // Start typing to clear error
      await user.type(searchInput, 'new');
      
      // Error should be cleared
      expect(screen.queryByText('Failed to fetch movies. Please try again.')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('search form has proper labels and accessibility attributes', () => {
      axios.get.mockResolvedValueOnce(mockSearchResponse);
      
      renderWithRouter(<Home />);
      
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      // Check form accessibility
      expect(searchInput).toBeInTheDocument();
      expect(searchButton).toBeInTheDocument();
      
      // Check that form can be submitted with Enter key
      expect(searchInput.closest('form')).toBeInTheDocument();
    });

    test('movie cards have proper accessibility attributes', async () => {
      axios.get.mockResolvedValueOnce(mockSearchResponse);
      
      renderWithRouter(<Home />);
      
      await waitFor(() => {
        const movieLinks = screen.getAllByRole('link');
        
        // Check that movie cards are accessible
        expect(movieLinks.length).toBeGreaterThan(0);
        
        // Check that each link has proper href
        movieLinks.forEach(link => {
          expect(link).toHaveAttribute('href');
        });
      });
    });
  });
});
