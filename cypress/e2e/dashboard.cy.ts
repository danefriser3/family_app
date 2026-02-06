describe('Dashboard E2E', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body.operationName === 'GetExpenses' || req.body.query?.includes('expenses')) {
        req.reply({
          data: {
            expenses: [
              { id: 'e1', description: 'Spesa 1', amount: 50, date: '1704067200000', category: 'Food', card_id: 'c1' },
              { id: 'e2', description: 'Spesa 2', amount: 30, date: '1704067200000', category: 'Transport', card_id: 'c1' },
              { id: 'e3', description: 'Spesa 3', amount: 20, date: '1704153600000', category: 'Food', card_id: 'c1' },
            ]
          }
        });
      } else if (req.body.operationName === 'GetIncomes' || req.body.query?.includes('incomes')) {
        req.reply({
          data: {
            incomes: [
              { id: 'i1', description: 'Stipendio', amount: 2000, date: '1704067200000', category: 'Salary', card_id: 'c1' },
              { id: 'i2', description: 'Bonus', amount: 500, date: '1704153600000', category: 'Bonus', card_id: 'c1' },
            ]
          }
        });
      } else if (req.body.operationName === 'GetCards' || req.body.query?.includes('cards')) {
        req.reply({
          data: {
            cards: [
              { id: 'c1', name: 'Revolut', color: '#0066FF', credito_iniziale: 1000, start_date: '2024-01-01' },
              { id: 'c2', name: 'Postepay', color: '#FFD700', credito_iniziale: 500, start_date: '2024-01-01' },
            ]
          }
        });
      }
    });
  });

  it('loads dashboard and displays stats', () => {
    cy.visit('/dashboard');
    cy.contains('Dashboard Overview').should('be.visible');
    cy.contains('Credito totale').should('be.visible');
    cy.contains('Totale Spese').should('be.visible');
    cy.contains('Totale Entrate').should('be.visible');

    cy.get('[data-cy="stat-card-credito-totale"]').should('contain.text', '€ 3.900,00');
    cy.get('[data-cy="stat-card-totale-spese"]').should('contain.text', '€ 100,00');
    cy.get('[data-cy="stat-card-totale-entrate"]').should('contain.text', '€ 2.500,00');


  });

  it('displays expense and income charts', () => {
    cy.visit('/dashboard');
    cy.contains('Spese per Giorno').should('be.visible');
    cy.contains('Entrate per Giorno').should('be.visible');
  });
});
