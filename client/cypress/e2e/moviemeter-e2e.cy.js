describe('MovieMeter E2E Tests', () => {
  beforeEach(() => {
    // Visit the app before each test
    cy.visit('/')
    // Wait for the app to load
    cy.get('[data-testid="home"]', { timeout: 10000 }).should('be.visible')
  })

  it('should display the home page with search functionality', () => {
    // Take a screenshot of the initial state
    cy.screenshot('home-page-initial')
    
    // Check if the search input is visible
    cy.get('[data-testid="search-input"]')
      .should('be.visible')
      .should('have.attr', 'placeholder', 'Search for movies, TV shows, actors...')
    
    // Check if the search button is present
    cy.get('button[type="submit"]')
      .should('be.visible')
      .should('contain.text', 'Search')
  })

  it('should perform a movie search and display results', () => {
    // Intercept the API call to mock the response
    cy.intercept('GET', '**/search/movie**', {
      statusCode: 200,
      body: {
        results: [
          {
            id: 1,
            title: 'Batman Begins',
            overview: 'When his parents are killed, billionaire playboy Bruce Wayne relocates to Asia where he is mentored by Henri Ducard and Ra\'s Al Ghul in how to fight evil.',
            poster_path: '/8RW2runSEc34IwKN2D1aPcJd2UL.jpg',
            release_date: '2005-06-15',
            vote_average: 8.2
          },
          {
            id: 2,
            title: 'The Dark Knight',
            overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
            poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
            release_date: '2008-07-18',
            vote_average: 9.0
          }
        ]
      }
    }).as('searchMovies')

    // Type in the search input
    cy.get('[data-testid="search-input"]')
      .type('batman')
      .should('have.value', 'batman')

    // Take a screenshot after typing
    cy.screenshot('search-input-filled')

    // Submit the search
    cy.get('button[type="submit"]').click()

    // Wait for the API call
    cy.wait('@searchMovies')

    // Check if results are displayed
    cy.get('[data-testid="movie-card"]', { timeout: 10000 })
      .should('have.length', 2)

    // Take a screenshot of the results
    cy.screenshot('search-results-displayed')

    // Verify the first movie card
    cy.get('[data-testid="movie-card"]').first()
      .should('contain.text', 'Batman Begins')
      .should('contain.text', '8.2')
  })

  it('should handle search with no results', () => {
    // Intercept the API call to return empty results
    cy.intercept('GET', '**/search/movie**', {
      statusCode: 200,
      body: { results: [] }
    }).as('searchNoResults')

    // Type in the search input
    cy.get('[data-testid="search-input"]')
      .type('nonexistentmovie12345')
      .should('have.value', 'nonexistentmovie12345')

    // Submit the search
    cy.get('button[type="submit"]').click()

    // Wait for the API call
    cy.wait('@searchNoResults')

    // Check if no results message is displayed
    cy.get('[data-testid="no-results"]', { timeout: 10000 })
      .should('be.visible')
      .should('contain.text', 'No movies found')

    // Take a screenshot of no results
    cy.screenshot('no-results-displayed')
  })

  it('should navigate to movie details page', () => {
    // Intercept the API call for search results
    cy.intercept('GET', '**/search/movie**', {
      statusCode: 200,
      body: {
        results: [
          {
            id: 1,
            title: 'Batman Begins',
            overview: 'When his parents are killed, billionaire playboy Bruce Wayne relocates to Asia where he is mentored by Henri Ducard and Ra\'s Al Ghul in how to fight evil.',
            poster_path: '/8RW2runSEc34IwKN2D1aPcJd2UL.jpg',
            release_date: '2005-06-15',
            vote_average: 8.2
          }
        ]
      }
    }).as('searchMovies')

    // Intercept the API call for movie details
    cy.intercept('GET', '**/movie/1**', {
      statusCode: 200,
      body: {
        id: 1,
        title: 'Batman Begins',
        overview: 'When his parents are killed, billionaire playboy Bruce Wayne relocates to Asia where he is mentored by Henri Ducard and Ra\'s Al Ghul in how to fight evil.',
        poster_path: '/8RW2runSEc34IwKN2D1aPcJd2UL.jpg',
        release_date: '2005-06-15',
        vote_average: 8.2,
        runtime: 140,
        genres: [{ name: 'Action' }, { name: 'Crime' }, { name: 'Drama' }]
      }
    }).as('movieDetails')

    // Search for a movie
    cy.get('[data-testid="search-input"]').type('batman')
    cy.get('button[type="submit"]').click()
    cy.wait('@searchMovies')

    // Click on the first movie card
    cy.get('[data-testid="movie-card"]').first().click()

    // Wait for the movie details API call
    cy.wait('@movieDetails')

    // Check if we're on the movie details page
    cy.url().should('include', '/movie/1')
    cy.get('[data-testid="movie-detail"]', { timeout: 10000 })
      .should('be.visible')
      .should('contain.text', 'Batman Begins')

    // Take a screenshot of the movie details page
    cy.screenshot('movie-details-page')
  })

  it('should handle authentication flow', () => {
    // Test registration flow
    cy.get('[data-testid="register-link"]').click()
    cy.url().should('include', '/register')

    // Take a screenshot of the registration page
    cy.screenshot('registration-page')

    // Fill in registration form
    cy.get('[data-testid="username-input"]').type('testuser')
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="confirm-password-input"]').type('password123')

    // Take a screenshot before submitting
    cy.screenshot('registration-form-filled')

    // Mock successful registration
    cy.intercept('POST', '**/auth/register', {
      statusCode: 201,
      body: { message: 'User registered successfully' }
    }).as('registerUser')

    // Submit the form
    cy.get('[data-testid="register-button"]').click()
    cy.wait('@registerUser')

    // Should redirect to login page
    cy.url().should('include', '/login')

    // Take a screenshot of the login page
    cy.screenshot('login-page-after-registration')

    // Fill in login form
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('password123')

    // Mock successful login
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: { 
        token: 'fake-jwt-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' }
      }
    }).as('loginUser')

    // Submit login form
    cy.get('[data-testid="login-button"]').click()
    cy.wait('@loginUser')

    // Should redirect to home page and show user info
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.get('[data-testid="user-menu"]').should('be.visible')

    // Take a screenshot after successful login
    cy.screenshot('home-page-after-login')
  })

  it('should test responsive design', () => {
    // Test mobile viewport
    cy.viewport(375, 667)
    cy.screenshot('mobile-viewport')

    // Check if mobile menu is accessible
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible')
    cy.get('[data-testid="mobile-menu-button"]').click()
    cy.get('[data-testid="mobile-menu"]').should('be.visible')

    // Take a screenshot of mobile menu
    cy.screenshot('mobile-menu-open')

    // Test tablet viewport
    cy.viewport(768, 1024)
    cy.screenshot('tablet-viewport')

    // Test desktop viewport
    cy.viewport(1280, 720)
    cy.screenshot('desktop-viewport')
  })

  it('should test error handling', () => {
    // Intercept API call to simulate server error
    cy.intercept('GET', '**/search/movie**', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('serverError')

    // Search for a movie
    cy.get('[data-testid="search-input"]').type('batman')
    cy.get('button[type="submit"]').click()

    // Wait for the error response
    cy.wait('@serverError')

    // Check if error message is displayed
    cy.get('[data-testid="error-message"]', { timeout: 10000 })
      .should('be.visible')
      .should('contain.text', 'Something went wrong')

    // Take a screenshot of error state
    cy.screenshot('error-state-displayed')
  })

  it('should test loading states', () => {
    // Intercept API call with delay to test loading state
    cy.intercept('GET', '**/search/movie**', (req) => {
      req.reply({
        delay: 2000,
        statusCode: 200,
        body: {
          results: [
            {
              id: 1,
              title: 'Test Movie',
              overview: 'Test overview',
              poster_path: '/test.jpg',
              release_date: '2023-01-01',
              vote_average: 7.5
            }
          ]
        }
      })
    }).as('delayedSearch')

    // Search for a movie
    cy.get('[data-testid="search-input"]').type('test')
    cy.get('button[type="submit"]').click()

    // Check if loading spinner is displayed
    cy.get('[data-testid="loading-spinner"]', { timeout: 5000 })
      .should('be.visible')

    // Take a screenshot of loading state
    cy.screenshot('loading-state')

    // Wait for results
    cy.wait('@delayedSearch')
    cy.get('[data-testid="movie-card"]', { timeout: 10000 })
      .should('be.visible')

    // Take a screenshot after loading completes
    cy.screenshot('results-after-loading')
  })
})
