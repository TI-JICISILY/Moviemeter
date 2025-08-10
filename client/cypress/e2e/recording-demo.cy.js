describe('MovieMeter Recording Demo', () => {
  beforeEach(() => {
    // Clear any existing data
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('should record a complete user journey from search to movie details', () => {
    // Step 1: Initial page load
    cy.screenshot('01-initial-page-load')
    cy.get('[data-testid="home"]').should('be.visible')
    
    // Step 2: User starts typing in search
    cy.get('[data-testid="search-input"]')
      .click()
      .type('batman', { delay: 150 }) // Realistic typing speed
    
    cy.screenshot('02-user-typing-search')
    
    // Step 3: Mock API response for search
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
          },
          {
            id: 3,
            title: 'The Dark Knight Rises',
            overview: 'Following the death of District Attorney Harvey Dent, Batman assumes responsibility for Dent\'s crimes to protect the late attorney\'s reputation and is subsequently hunted by the Gotham City Police Department.',
            poster_path: '/85cWkCVftSVVsA5eK3sfWJaAmPq.jpg',
            release_date: '2012-07-20',
            vote_average: 8.4
          }
        ]
      }
    }).as('searchResults')
    
    // Step 4: Submit search
    cy.get('button[type="submit"]').click()
    cy.screenshot('03-search-submitted')
    
    // Step 5: Wait for results and show loading state
    cy.get('[data-testid="loading-spinner"]', { timeout: 5000 }).should('be.visible')
    cy.screenshot('04-loading-state')
    
    // Step 6: Results displayed
    cy.wait('@searchResults')
    cy.get('[data-testid="movie-card"]', { timeout: 10000 }).should('have.length', 3)
    cy.screenshot('05-search-results-displayed')
    
    // Step 7: User hovers over first movie card
    cy.get('[data-testid="movie-card"]').first().trigger('mouseover')
    cy.screenshot('06-movie-card-hover')
    
    // Step 8: User clicks on first movie card
    cy.get('[data-testid="movie-card"]').first().click()
    cy.screenshot('07-movie-card-clicked')
    
    // Step 9: Mock movie details API
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
        genres: [{ name: 'Action' }, { name: 'Crime' }, { name: 'Drama' }],
        production_companies: [
          { name: 'Warner Bros. Pictures' },
          { name: 'Legendary Pictures' }
        ],
        budget: 150000000,
        revenue: 374218673
      }
    }).as('movieDetails')
    
    // Step 10: Wait for movie details page to load
    cy.wait('@movieDetails')
    cy.url().should('include', '/movie/1')
    cy.get('[data-testid="movie-detail"]', { timeout: 10000 }).should('be.visible')
    cy.screenshot('08-movie-details-page')
    
    // Step 11: User scrolls down to see more details
    cy.scrollTo('bottom', { duration: 2000 })
    cy.screenshot('09-scrolled-to-bottom')
    
    // Step 12: User goes back to search results
    cy.go('back')
    cy.screenshot('10-back-to-search-results')
    
    // Step 13: User clears search and starts new search
    cy.get('[data-testid="search-input"]').clear()
    cy.get('[data-testid="search-input"]').type('spider', { delay: 150 })
    cy.screenshot('11-new-search-typed')
    
    // Step 14: Mock new search results
    cy.intercept('GET', '**/search/movie**', {
      statusCode: 200,
      body: {
        results: [
          {
            id: 4,
            title: 'Spider-Man',
            overview: 'After being bitten by a genetically-modified spider, a shy teenager gains spider-like abilities that eventually make him a superhero.',
            poster_path: '/gh4cZbhZxyTbgxQPxD0dOudNPTn.jpg',
            release_date: '2002-05-01',
            vote_average: 7.3
          }
        ]
      }
    }).as('spiderSearch')
    
    cy.get('button[type="submit"]').click()
    cy.wait('@spiderSearch')
    cy.get('[data-testid="movie-card"]', { timeout: 10000 }).should('have.length', 1)
    cy.screenshot('12-spider-man-results')
  })

  it('should record authentication flow with form validation', () => {
    // Step 1: Navigate to registration page
    cy.get('[data-testid="register-link"]').click()
    cy.url().should('include', '/register')
    cy.screenshot('auth-01-registration-page')
    
    // Step 2: Try to submit empty form (validation error)
    cy.get('[data-testid="register-button"]').click()
    cy.screenshot('auth-02-empty-form-validation')
    
    // Step 3: Fill form with invalid data
    cy.get('[data-testid="username-input"]').type('test')
    cy.get('[data-testid="email-input"]').type('invalid-email')
    cy.get('[data-testid="password-input"]').type('123')
    cy.get('[data-testid="confirm-password-input"]').type('456')
    cy.screenshot('auth-03-invalid-data-filled')
    
    // Step 4: Submit invalid form
    cy.get('[data-testid="register-button"]').click()
    cy.screenshot('auth-04-invalid-form-validation')
    
    // Step 5: Fill form with valid data
    cy.get('[data-testid="username-input"]').clear().type('testuser')
    cy.get('[data-testid="email-input"]').clear().type('test@example.com')
    cy.get('[data-testid="password-input"]').clear().type('password123')
    cy.get('[data-testid="confirm-password-input"]').clear().type('password123')
    cy.screenshot('auth-05-valid-data-filled')
    
    // Step 6: Mock successful registration
    cy.intercept('POST', '**/auth/register', {
      statusCode: 201,
      body: { message: 'User registered successfully' }
    }).as('registerSuccess')
    
    // Step 7: Submit valid form
    cy.get('[data-testid="register-button"]').click()
    cy.wait('@registerSuccess')
    cy.screenshot('auth-06-registration-success')
    
    // Step 8: Should redirect to login page
    cy.url().should('include', '/login')
    cy.screenshot('auth-07-login-page')
    
    // Step 9: Fill login form
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.screenshot('auth-08-login-form-filled')
    
    // Step 10: Mock successful login
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: { 
        token: 'fake-jwt-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com' }
      }
    }).as('loginSuccess')
    
    // Step 11: Submit login form
    cy.get('[data-testid="login-button"]').click()
    cy.wait('@loginSuccess')
    cy.screenshot('auth-09-login-success')
    
    // Step 12: Should be logged in and redirected to home
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.get('[data-testid="user-menu"]').should('be.visible')
    cy.screenshot('auth-10-logged-in-home-page')
  })

  it('should record responsive design testing', () => {
    // Test different viewport sizes
    const breakpoints = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'tablet-landscape' },
      { width: 1280, height: 720, name: 'desktop' },
      { width: 1920, height: 1080, name: 'large-desktop' }
    ]
    
    breakpoints.forEach(({ width, height, name }) => {
      cy.viewport(width, height)
      cy.screenshot(`responsive-${name}-initial`)
      
      // Test search functionality on this viewport
      cy.get('[data-testid="search-input"]').type('test')
      cy.screenshot(`responsive-${name}-with-search`)
      
      // Clear search for next iteration
      cy.get('[data-testid="search-input"]').clear()
    })
  })

  it('should record error handling scenarios', () => {
    // Step 1: Test network error
    cy.intercept('GET', '**/search/movie**', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('serverError')
    
    cy.get('[data-testid="search-input"]').type('error-test')
    cy.get('button[type="submit"]').click()
    cy.wait('@serverError')
    cy.screenshot('error-01-server-error')
    
    // Step 2: Test network timeout
    cy.intercept('GET', '**/search/movie**', {
      statusCode: 408,
      body: { error: 'Request timeout' }
    }).as('timeoutError')
    
    cy.get('[data-testid="search-input"]').clear().type('timeout-test')
    cy.get('button[type="submit"]').click()
    cy.wait('@timeoutError')
    cy.screenshot('error-02-timeout-error')
    
    // Step 3: Test 404 error
    cy.intercept('GET', '**/search/movie**', {
      statusCode: 404,
      body: { error: 'Not found' }
    }).as('notFoundError')
    
    cy.get('[data-testid="search-input"]').clear().type('notfound-test')
    cy.get('button[type="submit"]').click()
    cy.wait('@notFoundError')
    cy.screenshot('error-03-not-found-error')
  })
})
