// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test on uncaught exceptions
  return false
})

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="home"]', { timeout: 10000 }).should('be.visible')
})

// Custom command to login user
Cypress.Commands.add('loginUser', (email, password) => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  
  cy.intercept('POST', '**/auth/login', {
    statusCode: 200,
    body: { 
      token: 'fake-jwt-token',
      user: { id: 1, username: 'testuser', email: email }
    }
  }).as('loginUser')
  
  cy.get('[data-testid="login-button"]').click()
  cy.wait('@loginUser')
})

// Custom command to search for movies
Cypress.Commands.add('searchMovies', (query, mockResults = []) => {
  cy.intercept('GET', '**/search/movie**', {
    statusCode: 200,
    body: { results: mockResults }
  }).as('searchMovies')
  
  cy.get('[data-testid="search-input"]').type(query)
  cy.get('button[type="submit"]').click()
  cy.wait('@searchMovies')
})
