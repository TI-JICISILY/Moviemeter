import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Mock the http module
jest.mock('../api/http', () => ({
  post: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Authentication E2E Tests', () => {
  let http;
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    http = require('../api/http');
    user = userEvent.setup();
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Login Page', () => {
    test('renders login form with all required elements', () => {
      renderWithRouter(<Login />);
      
      // Check page title and description
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your MovieMeter account')).toBeInTheDocument();
      
      // Check form elements
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      
      // Check navigation link
      expect(screen.getByText('Sign up here')).toBeInTheDocument();
    });

    test('successful login flow', async () => {
      const mockResponse = {
        data: {
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' }
        }
      };
      
      http.post.mockResolvedValueOnce(mockResponse);
      
      renderWithRouter(<Login />);
      
      // Fill login form
      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Verify API call
      await waitFor(() => {
        expect(http.post).toHaveBeenCalledWith('/api/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        });
      });
      
      // Verify token storage and navigation
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('handles login errors', async () => {
      const mockError = {
        response: {
          data: { error: 'Invalid email or password' }
        }
      };
      
      http.post.mockRejectedValueOnce(mockError);
      
      renderWithRouter(<Login />);
      
      // Fill login form with invalid credentials
      await user.type(screen.getByLabelText('Email Address'), 'invalid@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Check error message
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });
      
      // Verify no navigation occurred
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('handles network errors during login', async () => {
      http.post.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithRouter(<Login />);
      
      // Fill and submit form
      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Check generic error message
      await waitFor(() => {
        expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      });
    });

    test('clears error when user starts typing', async () => {
      const mockError = {
        response: {
          data: { error: 'Invalid credentials' }
        }
      };
      
      http.post.mockRejectedValueOnce(mockError);
      
      renderWithRouter(<Login />);
      
      // Submit form to trigger error
      await user.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Check error appears
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
      
      // Start typing to clear error
      await user.type(screen.getByLabelText('Email Address'), 'test');
      
      // Error should be cleared
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });

    test('shows loading state during login', async () => {
      // Mock delayed response
      http.post.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: { token: 'mock-token' } }), 100)
      ));
      
      renderWithRouter(<Login />);
      
      // Fill and submit form
      await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Check loading state
      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Signing In...' })).toBeDisabled();
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      });
    });

    test('validates required fields', async () => {
      renderWithRouter(<Login />);
      
      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Check that form validation prevents submission
      expect(http.post).not.toHaveBeenCalled();
    });

    test('validates email format', async () => {
      renderWithRouter(<Login />);
      
      // Enter invalid email
      await user.type(screen.getByLabelText('Email Address'), 'invalid-email');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      // Try to submit
      await user.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Check that form validation prevents submission
      expect(http.post).not.toHaveBeenCalled();
    });
  });

  describe('Register Page', () => {
    test('renders registration form with all required elements', () => {
      renderWithRouter(<Register />);
      
      // Check page title and description
      expect(screen.getByText('Join MovieMeter')).toBeInTheDocument();
      expect(screen.getByText('Create your account to start rating movies')).toBeInTheDocument();
      
      // Check form elements
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
      
      // Check navigation link
      expect(screen.getByText('Sign in here')).toBeInTheDocument();
    });

    test('successful registration flow', async () => {
      const mockResponse = {
        data: {
          message: 'User registered successfully'
        }
      };
      
      http.post.mockResolvedValueOnce(mockResponse);
      
      renderWithRouter(<Register />);
      
      // Fill registration form
      await user.type(screen.getByLabelText('Full Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Verify API call
      await waitFor(() => {
        expect(http.post).toHaveBeenCalledWith('/api/auth/register', {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });
      });
      
      // Verify navigation to login page
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('handles registration errors', async () => {
      const mockError = {
        response: {
          data: { error: 'Email already exists' }
        }
      };
      
      http.post.mockRejectedValueOnce(mockError);
      
      renderWithRouter(<Register />);
      
      // Fill registration form
      await user.type(screen.getByLabelText('Full Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address'), 'existing@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Check error message
      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });
      
      // Verify no navigation occurred
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('handles network errors during registration', async () => {
      http.post.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithRouter(<Register />);
      
      // Fill and submit form
      await user.type(screen.getByLabelText('Full Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Check generic error message
      await waitFor(() => {
        expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument();
      });
    });

    test('shows loading state during registration', async () => {
      // Mock delayed response
      http.post.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: { message: 'Success' } }), 100)
      ));
      
      renderWithRouter(<Register />);
      
      // Fill and submit form
      await user.type(screen.getByLabelText('Full Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address'), 'john@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Check loading state
      expect(screen.getByText('Creating Account...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Creating Account...' })).toBeDisabled();
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
      });
    });

    test('validates required fields in registration', async () => {
      renderWithRouter(<Register />);
      
      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Check that form validation prevents submission
      expect(http.post).not.toHaveBeenCalled();
    });

    test('validates email format in registration', async () => {
      renderWithRouter(<Register />);
      
      // Fill form with invalid email
      await user.type(screen.getByLabelText('Full Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address'), 'invalid-email');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      // Try to submit
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Check that form validation prevents submission
      expect(http.post).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Between Auth Pages', () => {
    test('navigates from login to register page', async () => {
      renderWithRouter(<Login />);
      
      // Click on sign up link
      await user.click(screen.getByText('Sign up here'));
      
      // Should navigate to register page
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    test('navigates from register to login page', async () => {
      renderWithRouter(<Register />);
      
      // Click on sign in link
      await user.click(screen.getByText('Sign in here'));
      
      // Should navigate to login page
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Form Accessibility', () => {
    test('login form has proper accessibility attributes', () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      
      // Check form structure
      expect(emailInput.closest('form')).toBeInTheDocument();
      expect(passwordInput.closest('form')).toBeInTheDocument();
      
      // Check input types
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Check required attributes
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    test('registration form has proper accessibility attributes', () => {
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      
      // Check form structure
      expect(nameInput.closest('form')).toBeInTheDocument();
      expect(emailInput.closest('form')).toBeInTheDocument();
      expect(passwordInput.closest('form')).toBeInTheDocument();
      
      // Check input types
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Check required attributes
      expect(nameInput).toBeRequired();
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Error Message Display', () => {
    test('displays error messages with proper styling', async () => {
      const mockError = {
        response: {
          data: { error: 'Test error message' }
        }
      };
      
      http.post.mockRejectedValueOnce(mockError);
      
      renderWithRouter(<Login />);
      
      // Submit form to trigger error
      await user.click(screen.getByRole('button', { name: 'Sign In' }));
      
      // Check error message with icon
      await waitFor(() => {
        expect(screen.getByText('⚠️')).toBeInTheDocument();
        expect(screen.getByText('Test error message')).toBeInTheDocument();
      });
    });
  });
});
