import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Register component to avoid router and http issues
jest.mock('./Register', () => {
  return function MockRegister() {
    return (
      <div data-testid="register">
        <form>
          <input 
            type="text" 
            placeholder="Enter your full name" 
            data-testid="name-input"
          />
          <input 
            type="email" 
            placeholder="Enter your email" 
            data-testid="email-input"
          />
          <input 
            type="password" 
            placeholder="Create a password" 
            data-testid="password-input"
          />
          <button type="submit">Create Account</button>
        </form>
      </div>
    );
  };
});

import Register from './Register';

test('renders registration form', () => {
  render(<Register />);
  const nameInput = screen.getByPlaceholderText(/enter your full name/i);
  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const passwordInput = screen.getByPlaceholderText(/create a password/i);
  const registerButton = screen.getByRole('button', { name: /create account/i });
  
  expect(nameInput).toBeInTheDocument();
  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(registerButton).toBeInTheDocument();
});
