describe('App smoke test', () => {
  it('loads dashboard by default and shows navigation', () => {
    cy.visit('/');
    cy.contains('Dashboard Overview').should('be.visible');
    cy.contains('Spese');
    cy.contains('Entrate');
  });
});
