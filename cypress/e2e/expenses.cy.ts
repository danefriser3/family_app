describe('Expenses E2E', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body.operationName === 'GetExpenses' || req.body.query?.includes('expenses')) {
        const cardId = req.body.variables?.cardId;
        const allExpenses = [
          { id: 'e1', description: 'Spesa 1', amount: 50, date: '1704067200000', category: 'Food', card_id: 'c1' },
          { id: 'e2', description: 'Spesa 2', amount: 30, date: '1704067200000', category: 'Transport', card_id: 'c1' },
          { id: 'e3', description: 'Spesa 3', amount: 20, date: '1704153600000', category: 'Food', card_id: 'c2' },
        ];
        const filteredExpenses = cardId ? allExpenses.filter(e => e.card_id === cardId) : allExpenses;
        req.reply({
          data: { expenses: filteredExpenses }
        });
      } else if (req.body.operationName === 'AddExpense' || (req.body.query?.includes('mutation') && req.body.query?.includes('addExpense'))) {
        req.reply({
          data: {
            addExpense: {
              id: 'e4',
              ...req.body.variables.expenseInput
            }
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

  it('loads expenses page and displays expenses', () => {
    cy.visit('/expenses');
    cy.contains('Gestione Spese').should('be.visible');
    cy.contains('Spesa 1').should('be.visible');
    cy.contains('Spesa 2').should('be.visible');
    cy.contains('Spesa 3').should('be.visible');
  });

  it('filters expenses by card', () => {
    cy.visit('/expenses');
    cy.get('[data-cy="card-filter"]').click();
    cy.contains('[data-cy="card-selector"]', 'Postepay').click();
    cy.contains('Spesa 3').should('be.visible');
    cy.contains('Spesa 1').should('not.exist');
    cy.contains('Spesa 2').should('not.exist');
  });

  it('displays daily totals in dividers', () => {
    cy.visit('/expenses');
    cy.contains('Totale:').should('be.visible');
  });

  it('adds a new expense and displays it in the table', () => {
    cy.visit('/expenses');
    cy.get('[data-cy="card-filter"]').click();
    cy.contains('[data-cy="card-selector"]', 'Postepay').click();

    
    cy.get('[data-cy="expense-summary-totals"]').should('contain.text', 'Spese totali: €20.00');
    cy.get('[data-cy="expense-summary-incomes"]').should('contain.text', 'Entrate totali: €0.00');
    cy.get('[data-cy="expense-summary-credito-attuale"]').should('contain.text', 'Credito attuale: €480.00');
    cy.get('[data-cy="expense-summary-numero-spese"]').should('contain.text', 'Numero spese: 1');

    cy.get('input[name="description"]').type('Nuova Spesa');
    cy.get('input[name="amount"]').type('75');
    cy.get('input[name="category"]').type('Shopping');
    cy.get('input[name="date"]').type('2024-01-15');
    cy.contains('button', 'Aggiungi').click();
    cy.contains('Nuova Spesa').should('be.visible');
    cy.contains('75').should('be.visible');

    cy.get('[data-cy="expense-summary-totals"]').should('contain.text', 'Spese totali: €95.00');
    cy.get('[data-cy="expense-summary-incomes"]').should('contain.text', 'Entrate totali: €0.00');
    cy.get('[data-cy="expense-summary-credito-attuale"]').should('contain.text', 'Credito attuale: €405.00');
    cy.get('[data-cy="expense-summary-numero-spese"]').should('contain.text', 'Numero spese: 2');
  });

  it('should not be possible to add an expense without selecting a card', () => {
    cy.visit('/expenses');
    
    cy.get('[data-cy="add-transaction-form"]').should('not.exist');
  });
});
