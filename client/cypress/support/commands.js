// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to clear localStorage
Cypress.Commands.overwrite('clearLocalStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
  })
})

// Custom command to set localStorage item
Cypress.Commands.add('setLocalStorage', (key, value) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, value)
  })
})

// Custom command to get localStorage item
Cypress.Commands.add('getLocalStorage', (key) => {
  cy.window().then((win) => {
    return win.localStorage.getItem(key)
  })
})

// Custom command to wait for element to be visible and clickable
Cypress.Commands.add('waitAndClick', (selector, options = {}) => {
  cy.get(selector, { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click(options)
})

// Custom command to type with delay (more realistic user behavior)
Cypress.Commands.add('typeWithDelay', (selector, text, delay = 100) => {
  cy.get(selector).clear()
  text.split('').forEach((char, index) => {
    cy.get(selector).type(char, { delay })
  })
})

// Custom command to take screenshot with timestamp
Cypress.Commands.add('screenshotWithTimestamp', (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  cy.screenshot(`${name}-${timestamp}`)
})

// Custom command to check if element exists
Cypress.Commands.add('elementExists', (selector) => {
  return cy.get('body').then(($body) => {
    return $body.find(selector).length > 0
  })
})

// Custom command to wait for API response
Cypress.Commands.add('waitForApi', (method, url, alias) => {
  cy.intercept(method, url).as(alias)
  return cy.wait(`@${alias}`)
})

// Custom command to mock API response
Cypress.Commands.add('mockApi', (method, url, response, alias) => {
  cy.intercept(method, url, response).as(alias)
})

// Custom command to test responsive breakpoints
Cypress.Commands.add('testResponsive', (breakpoints) => {
  breakpoints.forEach(({ width, height, name }) => {
    cy.viewport(width, height)
    cy.screenshot(`responsive-${name}`)
  })
})

// Custom command to test form validation
Cypress.Commands.add('testFormValidation', (formSelector, fields) => {
  fields.forEach(({ selector, value, expectedError }) => {
    cy.get(formSelector).within(() => {
      cy.get(selector).clear().type(value)
      cy.get('button[type="submit"]').click()
      if (expectedError) {
        cy.get('[data-testid="error-message"]')
          .should('be.visible')
          .should('contain.text', expectedError)
      }
    })
  })
})
