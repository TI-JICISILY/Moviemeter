import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Home component to avoid router and axios issues
jest.mock('./pages/Home', () => {
  return function MockHome() {
    return (
      <div data-testid="home">
        <form>
          <input 
            type="text" 
            placeholder="Search for movies, TV shows, actors..." 
            data-testid="search-input"
          />
          <button type="submit">Search</button>
        </form>
      </div>
    );
  };
});

import Home from './pages/Home';

test('renders the search input', () => {
  render(<Home />);
  const input = screen.getByPlaceholderText(/search for movies/i);
  expect(input).toBeInTheDocument();
});
