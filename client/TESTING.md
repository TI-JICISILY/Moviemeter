# MovieMeter E2E Testing Guide

This document provides comprehensive information about the End-to-End (E2E) testing setup for the MovieMeter application.

## Overview

The MovieMeter application uses React Testing Library with Jest for comprehensive E2E testing. The test suite covers:

- **Navigation and Layout**: Navbar functionality, routing, and responsive design
- **Authentication Flow**: Login, registration, and user state management
- **Movie Search**: Search functionality, results display, and error handling
- **User Interactions**: Form submissions, loading states, and accessibility
- **Error Handling**: API errors, network failures, and user feedback

## Test Structure

```
client/src/
├── tests/
│   ├── HomePage.test.jsx      # Home page and movie search tests
│   ├── Authentication.test.jsx # Login/Register flow tests
│   └── Navigation.test.jsx    # Navbar and routing tests
├── App.test.jsx               # Main application E2E tests
├── setupTests.js              # Test configuration and mocks
└── ...
```

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

### Test Coverage

The test suite aims for 80% coverage across:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Categories

### 1. Navigation and Layout Tests (`Navigation.test.jsx`)

Tests the navbar component and overall application navigation:

- **Navbar Rendering**: Logo, branding, and navigation links
- **Authentication State**: Different navigation for logged-in/out users
- **Mobile Menu**: Responsive design and mobile navigation
- **Active Links**: Highlighting current page
- **Logout Functionality**: Token removal and state updates

**Key Test Scenarios:**
```javascript
// Test navbar for unauthenticated users
test('renders navigation links for unauthenticated users', () => {
  // Checks for Sign In, Sign Up links
  // Verifies correct href attributes
});

// Test navbar for authenticated users
test('renders navigation links for authenticated users', () => {
  // Checks for My Profile, Logout links
  // Verifies auth links are hidden
});
```

### 2. Authentication Flow Tests (`Authentication.test.jsx`)

Tests the complete authentication user journey:

- **Login Flow**: Form validation, API calls, error handling
- **Registration Flow**: User registration, validation, success/error states
- **Form Validation**: Required fields, email format validation
- **Loading States**: Spinners and disabled buttons during API calls
- **Error Handling**: Network errors, validation errors, user feedback

**Key Test Scenarios:**
```javascript
// Test successful login
test('successful login flow', async () => {
  // Fill login form
  // Submit form
  // Verify API call
  // Check token storage
  // Verify navigation
});

// Test login errors
test('handles login errors', async () => {
  // Submit invalid credentials
  // Check error message display
  // Verify no navigation occurs
});
```

### 3. Home Page Tests (`HomePage.test.jsx`)

Tests the main movie search functionality:

- **Initial Load**: Default search and movie display
- **Search Functionality**: User input, API calls, results display
- **Movie Cards**: Information display, navigation, placeholder images
- **Loading States**: Search spinners and disabled states
- **Error Handling**: No results, API failures, network errors

**Key Test Scenarios:**
```javascript
// Test movie search
test('performs new search when user enters query and submits', async () => {
  // Enter search term
  // Submit search
  // Verify API call
  // Check results display
});

// Test no results
test('handles search with no results', async () => {
  // Search for non-existent movie
  // Check error message
  // Verify no results section
});
```

### 4. Application Integration Tests (`App.test.jsx`)

Tests the complete application flow:

- **Full User Journey**: Registration → Login → Search → Navigation
- **Cross-Component Integration**: How components work together
- **State Management**: User authentication state across components
- **Routing**: Navigation between different pages

## Mocking Strategy

### API Mocks

All external API calls are mocked to ensure reliable tests:

```javascript
// Mock axios for API calls
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// Mock responses
const mockMovieSearchResponse = {
  data: {
    Search: [
      {
        imdbID: 'tt0372784',
        Title: 'Batman Begins',
        Year: '2005',
        Poster: 'https://example.com/batman.jpg',
        Type: 'movie'
      }
    ],
    totalResults: '1',
    Response: 'True'
  }
};
```

### Browser API Mocks

Browser APIs are mocked for consistent test environment:

```javascript
// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
```

## Test Utilities

### Helper Functions

```javascript
// Render component with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Setup user events
const user = userEvent.setup();
```

### Common Test Patterns

```javascript
// Async test with waitFor
test('async operation', async () => {
  // Setup
  axios.get.mockResolvedValueOnce(mockResponse);
  
  // Action
  await user.click(button);
  
  // Assertion
  await waitFor(() => {
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});

// Error handling test
test('handles errors', async () => {
  // Setup error
  axios.get.mockRejectedValueOnce(new Error('Network error'));
  
  // Action
  await user.click(button);
  
  // Check error message
  await waitFor(() => {
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names that explain the scenario
- Arrange tests in logical order (setup → action → assertion)

### 2. Async Testing

- Always use `async/await` for asynchronous operations
- Use `waitFor` for assertions that depend on async operations
- Mock API calls to control test timing

### 3. Accessibility Testing

- Test keyboard navigation
- Verify proper ARIA attributes
- Check form labels and associations

### 4. Error Scenarios

- Test both success and failure paths
- Verify error messages are displayed correctly
- Test network failures and API errors

### 5. State Management

- Test component state changes
- Verify localStorage interactions
- Test authentication state updates

## Debugging Tests

### Common Issues

1. **Async Operations**: Use `waitFor` for assertions that depend on async operations
2. **Mocking**: Ensure all external dependencies are properly mocked
3. **Router Context**: Always wrap components in `BrowserRouter` for routing tests
4. **User Events**: Use `userEvent.setup()` for consistent user interactions

### Debug Commands

```bash
# Run specific test file
npm test -- HomePage.test.jsx

# Run tests with verbose output
npm test -- --verbose

# Run tests in debug mode
npm test -- --debug

# Run tests and keep browser open
npm test -- --watchAll=false --detectOpenHandles
```

## Continuous Integration

The test suite is configured for CI/CD with:

- **Coverage Thresholds**: 80% minimum coverage
- **CI Script**: `npm run test:ci` for automated testing
- **Watch Mode**: `npm run test:watch` for development

## Future Enhancements

Potential improvements for the test suite:

1. **Visual Regression Testing**: Add visual testing for UI consistency
2. **Performance Testing**: Test application performance under load
3. **Cross-Browser Testing**: Test in multiple browsers
4. **Mobile Testing**: Test responsive design on mobile devices
5. **Accessibility Testing**: Add automated accessibility checks

## Contributing

When adding new features:

1. Write tests before implementing features (TDD)
2. Ensure all user flows are covered
3. Test both success and error scenarios
4. Maintain test coverage above 80%
5. Update this documentation for new test patterns
