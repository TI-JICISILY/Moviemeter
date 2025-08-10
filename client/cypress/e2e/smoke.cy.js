// TIP: if you can, add data-testid="search-input" to your input in the app.
// Then replace the selector below with cy.get('[data-testid="search-input"]')

describe('MovieMeter E2E', () => {
  it('loads Home and shows content', () => {
    cy.visit('/');
    cy.screenshot('home-loaded'); // <-- creates a snapshot image
    // Expect the search box to exist
    cy.get('input[type="text"], input[placeholder*="search" i]').first().should('exist');
  });

  it('performs a search and shows a result (live API)', () => {
    cy.visit('/');
    cy.get('input[type="text"], input[placeholder*="search" i]').first()
      .clear().type('Inception{enter}');
    cy.contains(/Inception/i, { timeout: 10000 }).should('be.visible');
  });
});
