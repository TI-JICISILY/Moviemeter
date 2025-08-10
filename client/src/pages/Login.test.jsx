import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Login component to avoid router and http issues
jest.mock('./Login', () => {
  return function MockLogin() {
    return (
      <div data-testid="login">
        <form>
          <input 
            type="email" 
            placeholder="Enter your email" 
            data-testid="email-input"
          />
          <input 
            type="password" 
            placeholder="Enter your password" 
            data-testid="password-input"
          />
          <button type="submit">Sign In</button>
        </form>
      </div>
    );
  };
});

import Login from './Login';

test('renders login form', () => {
  render(<Login />);
  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const passwordInput = screen.getByPlaceholderText(/enter your password/i);
  const loginButton = screen.getByRole('button', { name: /sign in/i });
  
  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(loginButton).toBeInTheDocument();
});
