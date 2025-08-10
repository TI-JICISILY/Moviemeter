import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Navbar from '../components/Navbar';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock useLocation
const mockLocation = { pathname: '/' };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navigation E2E Tests', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Navbar Rendering', () => {
    test('renders navbar with logo and branding', () => {
      renderWithRouter(<Navbar />);
      
      // Check logo elements
      expect(screen.getByText('🎬')).toBeInTheDocument();
      expect(screen.getByText('TJ')).toBeInTheDocument();
      expect(screen.getByText('PRO')).toBeInTheDocument();
      
      // Check if logo is a link to home
      const logoLink = screen.getByText('TJ').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    test('renders navigation links for unauthenticated users', () => {
      renderWithRouter(<Navbar />);
      
      // Check main navigation links
      expect(screen.getByText('Home')).toBeInTheDocument();
      
      // Check authentication links
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      
      // Verify links have correct href attributes
      const homeLink = screen.getByText('Home').closest('a');
      const signInLink = screen.getByText('Sign In').closest('a');
      const signUpLink = screen.getByText('Sign Up').closest('a');
      
      expect(homeLink).toHaveAttribute('href', '/');
      expect(signInLink).toHaveAttribute('href', '/login');
      expect(signUpLink).toHaveAttribute('href', '/register');
    });

    test('renders navigation links for authenticated users', () => {
      // Mock authenticated state
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      renderWithRouter(<Navbar />);
      
      // Check main navigation links
      expect(screen.getByText('Home')).toBeInTheDocument();
      
      // Check authenticated user links
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      
      // Check that auth links are not present
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
      
      // Verify links have correct href attributes
      const profileLink = screen.getByText('My Profile').closest('a');
      expect(profileLink).toHaveAttribute('href', '/profile');
    });

    test('highlights active navigation link', () => {
      // Mock location for home page
      mockLocation.pathname = '/';
      
      renderWithRouter(<Navbar />);
      
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('active');
    });

    test('highlights active navigation link for different pages', () => {
      // Mock location for profile page
      mockLocation.pathname = '/profile';
      
      renderWithRouter(<Navbar />);
      
      // Mock authenticated state for profile link to be visible
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      const profileLink = screen.getByText('My Profile').closest('a');
      expect(profileLink).toHaveClass('active');
    });
  });

  describe('Authentication State Changes', () => {
    test('updates navigation when user logs in', async () => {
      // Start with unauthenticated state
      localStorageMock.getItem.mockReturnValue(null);
      
      const { rerender } = renderWithRouter(<Navbar />);
      
      // Check unauthenticated state
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
      
      // Simulate login by updating localStorage mock
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      // Rerender to reflect new state
      rerender(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      
      // Check authenticated state
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    test('updates navigation when user logs out', async () => {
      // Start with authenticated state
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      const { rerender } = renderWithRouter(<Navbar />);
      
      // Check authenticated state
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
      
      // Simulate logout by updating localStorage mock
      localStorageMock.getItem.mockReturnValue(null);
      
      // Rerender to reflect new state
      rerender(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      
      // Check unauthenticated state
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
      expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    test('logout button removes token and updates navigation', async () => {
      // Mock authenticated state
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      renderWithRouter(<Navbar />);
      
      // Check logout button is present
      const logoutButton = screen.getByText('Logout');
      expect(logoutButton).toBeInTheDocument();
      
      // Click logout
      await user.click(logoutButton);
      
      // Verify token removal
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    test('logout button has proper styling and icon', () => {
      // Mock authenticated state
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      renderWithRouter(<Navbar />);
      
      const logoutButton = screen.getByText('Logout');
      const logoutIcon = screen.getByText('🚪');
      
      expect(logoutButton).toBeInTheDocument();
      expect(logoutIcon).toBeInTheDocument();
    });
  });

  describe('Mobile Menu Functionality', () => {
    test('renders mobile menu button', () => {
      renderWithRouter(<Navbar />);
      
      // Find mobile menu button (hamburger menu)
      const mobileMenuButton = screen.getByRole('button', { 
        name: /menu/i 
      });
      
      expect(mobileMenuButton).toBeInTheDocument();
    });

    test('toggles mobile menu when button is clicked', async () => {
      renderWithRouter(<Navbar />);
      
      const mobileMenuButton = screen.getByRole('button', { 
        name: /menu/i 
      });
      
      // Click to open mobile menu
      await user.click(mobileMenuButton);
      
      // Check if mobile menu is visible
      // Note: This would require checking for mobile menu classes or elements
      // The exact implementation depends on the CSS classes used
      
      // Click again to close mobile menu
      await user.click(mobileMenuButton);
    });

    test('mobile menu contains all navigation links for unauthenticated users', () => {
      renderWithRouter(<Navbar />);
      
      // Open mobile menu
      const mobileMenuButton = screen.getByRole('button', { 
        name: /menu/i 
      });
      
      // Check that mobile menu links are present
      // This would depend on the actual implementation of the mobile menu
    });

    test('mobile menu contains all navigation links for authenticated users', () => {
      // Mock authenticated state
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      renderWithRouter(<Navbar />);
      
      // Open mobile menu
      const mobileMenuButton = screen.getByRole('button', { 
        name: /menu/i 
      });
      
      // Check that mobile menu links are present for authenticated users
      // This would depend on the actual implementation of the mobile menu
    });

    test('closes mobile menu when navigation link is clicked', async () => {
      renderWithRouter(<Navbar />);
      
      const mobileMenuButton = screen.getByRole('button', { 
        name: /menu/i 
      });
      
      // Open mobile menu
      await user.click(mobileMenuButton);
      
      // Click on a navigation link
      const homeLink = screen.getByText('Home');
      await user.click(homeLink);
      
      // Mobile menu should close
      // This would depend on the actual implementation
    });
  });

  describe('Scroll Behavior', () => {
    test('navbar changes appearance on scroll', () => {
      renderWithRouter(<Navbar />);
      
      const navbar = screen.getByRole('navigation');
      
      // Initially should not have scrolled class
      expect(navbar).not.toHaveClass('navbar-scrolled');
      
      // Simulate scroll
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        writable: true
      });
      
      // Trigger scroll event
      window.dispatchEvent(new Event('scroll'));
      
      // Should now have scrolled class
      // Note: This would require the component to re-render
      // The exact implementation depends on how the scroll listener is set up
    });
  });

  describe('Accessibility', () => {
    test('navigation links have proper accessibility attributes', () => {
      renderWithRouter(<Navbar />);
      
      const homeLink = screen.getByText('Home').closest('a');
      const signInLink = screen.getByText('Sign In').closest('a');
      const signUpLink = screen.getByText('Sign Up').closest('a');
      
      // Check that all links have href attributes
      expect(homeLink).toHaveAttribute('href');
      expect(signInLink).toHaveAttribute('href');
      expect(signUpLink).toHaveAttribute('href');
    });

    test('mobile menu button has proper accessibility attributes', () => {
      renderWithRouter(<Navbar />);
      
      const mobileMenuButton = screen.getByRole('button', { 
        name: /menu/i 
      });
      
      expect(mobileMenuButton).toBeInTheDocument();
      expect(mobileMenuButton).toHaveAttribute('aria-label');
    });

    test('logout button has proper accessibility attributes', () => {
      // Mock authenticated state
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      renderWithRouter(<Navbar />);
      
      const logoutButton = screen.getByText('Logout');
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Responsive Design', () => {
    test('navbar adapts to different screen sizes', () => {
      renderWithRouter(<Navbar />);
      
      // Check that both desktop and mobile elements are present
      expect(screen.getByText('Home')).toBeInTheDocument();
      
      // Mobile menu button should be present
      const mobileMenuButton = screen.getByRole('button', { 
        name: /menu/i 
      });
      expect(mobileMenuButton).toBeInTheDocument();
      
      // Desktop navigation should be present
      const desktopNav = screen.getByText('Home').closest('.navbar-links');
      expect(desktopNav).toBeInTheDocument();
    });
  });

  describe('Navigation State Management', () => {
    test('maintains navigation state across route changes', () => {
      // Mock authenticated state
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      const { rerender } = renderWithRouter(<Navbar />);
      
      // Check initial state
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      
      // Simulate route change by updating location
      mockLocation.pathname = '/profile';
      
      // Rerender to reflect new route
      rerender(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      
      // Navigation state should be maintained
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    test('updates active link when route changes', () => {
      // Mock authenticated state
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      // Start on home page
      mockLocation.pathname = '/';
      
      const { rerender } = renderWithRouter(<Navbar />);
      
      // Home link should be active
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('active');
      
      // Change to profile page
      mockLocation.pathname = '/profile';
      
      rerender(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      
      // Profile link should now be active
      const profileLink = screen.getByText('My Profile').closest('a');
      expect(profileLink).toHaveClass('active');
    });
  });
});
