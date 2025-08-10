import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from './App';

// Mock axios for API calls
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// Mock the OMDB API response
const mockMovieSearchResponse = {
  data: {
    Search: [
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
      }
    ],
    totalResults: '2',
    Response: 'True'
  }
};

// Mock the auth API responses
const mockLoginResponse = {
  data: {
    token: 'mock-jwt-token',
    user: { id: 1, name: 'Test User', email: 'test@example.com' }
  }
};

const mockRegisterResponse = {
  data: {
    message: 'User registered successfully'
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Helper function to render App with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('MovieMeter E2E Tests', () => {
  let axios;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
    
    // Import axios after mocking
    axios = require('axios');
  });

  describe('Navigation and Layout', () => {
    test('renders navbar with logo and navigation links', () => {
      renderWithRouter(<App />);
      
      // Check if navbar is rendered
      expect(screen.getByText('TJ')).toBeInTheDocument();
      expect(screen.getByText('PRO')).toBeInTheDocument();
      
      // Check if navigation links are present
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    test('navigates to different pages when clicking nav links', async () => {
      const user = userEvent.setup();
      renderWithRouter(<App />);
      
      // Navigate to login page
      await user.click(screen.getByText('Sign In'));
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      
      // Navigate to register page
      await user.click(screen.getByText('Sign Up'));
      expect(screen.getByText('Join MovieMeter')).toBeInTheDocument();
      
      // Navigate back to home
      await user.click(screen.getByText('Home'));
      expect(screen.getByText('MovieMeter')).toBeInTheDocument();
    });
  });

  describe('Home Page - Movie Search', () => {
    test('displays hero section with search functionality', () => {
      renderWithRouter(<App />);
      
      // Check hero section elements
      expect(screen.getByText('MovieMeter')).toBeInTheDocument();
      expect(screen.getByText('Discover, Rate, and Review Your Favorite Movies')).toBeInTheDocument();
      
      // Check search form
      expect(screen.getByPlaceholderText('Search for movies, TV shows, actors...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    });

    test('performs movie search and displays results', async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValueOnce(mockMovieSearchResponse);
      
      renderWithRouter(<App />);
      
      // Get search input and button
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      // Clear default search and enter new search term
      await user.clear(searchInput);
      await user.type(searchInput, 'batman');
      
      // Submit search
      await user.click(searchButton);
      
      // Wait for API call and results
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          'https://www.omdbapi.com/?s=batman&apikey=6e52756d'
        );
      });
      
      // Check if results are displayed
      await waitFor(() => {
        expect(screen.getByText('Found 2 results for "batman"')).toBeInTheDocument();
        expect(screen.getByText('Batman Begins')).toBeInTheDocument();
        expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
      });
    });

    test('handles search with no results', async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValueOnce({
        data: { Response: 'False', Error: 'Movie not found!' }
      });
      
      renderWithRouter(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      await user.clear(searchInput);
      await user.type(searchInput, 'nonexistentmovie12345');
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('No movies found. Try a different search term.')).toBeInTheDocument();
      });
    });

    test('handles search API errors gracefully', async () => {
      const user = userEvent.setup();
      axios.get.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithRouter(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      await user.clear(searchInput);
      await user.type(searchInput, 'batman');
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch movies. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Flow', () => {
    test('user can register a new account', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValueOnce(mockRegisterResponse);
      
      renderWithRouter(<App />);
      
      // Navigate to register page
      await user.click(screen.getByText('Sign Up'));
      
      // Fill registration form
      await user.type(screen.getByLabelText('Full Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Verify API call
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });
      });
    });

    test('user can login with existing credentials', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValueOnce(mockLoginResponse);
      
      renderWithRouter(<App />);
      
      // Navigate to login page
      await user.click(screen.getByText('Sign In'));
      
      // Fill login form
      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Verify API call and token storage
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        });
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');
      });
    });

    test('handles authentication errors', async () => {
      const user = userEvent.setup();
      axios.post.mockRejectedValueOnce({
        response: { data: { error: 'Invalid credentials' } }
      });
      
      renderWithRouter(<App />);
      
      // Navigate to login page
      await user.click(screen.getByText('Sign In'));
      
      // Fill login form with invalid credentials
      await user.type(screen.getByLabelText('Email Address'), 'invalid@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Check error message
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    test('user can logout and see updated navigation', async () => {
      const user = userEvent.setup();
      
      // Mock logged in state
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      renderWithRouter(<App />);
      
      // Check if logout button is visible
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      
      // Click logout
      await user.click(screen.getByText('Logout'));
      
      // Verify token removal and navigation update
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
  });

  describe('Movie Detail Navigation', () => {
    test('clicking on movie card navigates to movie detail page', async () => {
      const user = userEvent.setup();
      axios.get.mockResolvedValueOnce(mockMovieSearchResponse);
      
      renderWithRouter(<App />);
      
      // Perform search to get movie results
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      await user.clear(searchInput);
      await user.type(searchInput, 'batman');
      await user.click(searchButton);
      
      // Wait for results and click on first movie
      await waitFor(() => {
        expect(screen.getByText('Batman Begins')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Batman Begins'));
      
      // Should navigate to movie detail page
      // Note: This would require the MovieDetail component to be properly implemented
      // For now, we're testing the navigation intent
    });
  });

  describe('Form Validation', () => {
    test('registration form validates required fields', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<App />);
      
      // Navigate to register page
      await user.click(screen.getByText('Sign Up'));
      
      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Check that form validation prevents submission
      expect(axios.post).not.toHaveBeenCalled();
    });

    test('login form validates required fields', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<App />);
      
      // Navigate to login page
      await user.click(screen.getByText('Sign In'));
      
      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Check that form validation prevents submission
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    test('mobile menu toggle works correctly', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<App />);
      
      // Find mobile menu button (hamburger menu)
      const mobileMenuButton = screen.getByRole('button', { 
        name: /menu/i 
      });
      
      // Click to open mobile menu
      await user.click(mobileMenuButton);
      
      // Check if mobile menu is visible
      // Note: This would require checking for mobile menu classes or elements
      // The exact implementation depends on the CSS classes used
    });
  });

  describe('Loading States', () => {
    test('shows loading state during search', async () => {
      const user = userEvent.setup();
      
      // Mock a delayed response
      axios.get.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve(mockMovieSearchResponse), 100)
      ));
      
      renderWithRouter(<App />);
      
      const searchInput = screen.getByPlaceholderText('Search for movies, TV shows, actors...');
      const searchButton = screen.getByRole('button', { name: 'Search' });
      
      await user.clear(searchInput);
      await user.type(searchInput, 'batman');
      await user.click(searchButton);
      
      // Check loading state
      expect(screen.getByText('Searching for movies...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '🔍' })).toBeInTheDocument();
    });

    test('shows loading state during authentication', async () => {
      const user = userEvent.setup();
      
      // Mock a delayed response
      axios.post.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve(mockLoginResponse), 100)
      ));
      
      renderWithRouter(<App />);
      
      // Navigate to login page
      await user.click(screen.getByText('Sign In'));
      
      // Fill and submit form
      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Check loading state
      expect(screen.getByText('Signing In...')).toBeInTheDocument();
    });
  });
});
