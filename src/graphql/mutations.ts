export const UPDATE_CARD = gql`
  mutation UpdateCard($id: ID!, $input: CardUpdateInput!) {
    updateCard(id: $id, input: $input) {
      id
      name
      color
      credito_iniziale
      start_date
    }
  }
`;
export const ADD_INCOME = gql`
  mutation AddIncome($incomeInput: IncomeInput!) {
    addIncome(incomeInput: $incomeInput) {
      id
      description
      amount
      date
      category
      card_id
    }
  }
`;

export const DELETE_INCOME = gql`
  mutation DeleteIncome($id: ID!) {
    deleteIncome(id: $id) {
      id
    }
  }
`;

export const DELETE_INCOMES = gql`
  mutation DeleteIncomes($ids: [ID!]!) {
    deleteIncomes(ids: $ids) {
      id
    }
  }
`;

import { gql } from '@apollo/client';

export const ADD_EXPENSE = gql`
  mutation AddExpense($expenseInput: ExpenseInput!) {
    addExpense(expenseInput: $expenseInput) {
      id
      description
      amount
      date
      category
      card_id
    }
  }
`;

export const ADD_EXPENSE_PRODUCT = gql`
  mutation AddExpenseProduct($expenseId: ID!, $product: ExpenseProductInput!) {
    addExpenseProduct(expenseId: $expenseId, product: $product) {
      id
      name
      quantity
      price
      note
    }
  }
`;

export const DELETE_EXPENSE = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id) {
      id
    }
  }
`;

export const DELETE_EXPENSES = gql`
  mutation DeleteExpenses($ids: [ID!]!) {
    deleteExpenses(ids: $ids) {
      id
    }
  }
`;

export const ADD_CARD = gql`
  mutation AddCard($input: CardInput!) {
    addCard(input: $input) {
      id
      name
      color
    }
  }
`;

export const ADD_USER = gql`
  mutation AddUser($input: UserInput!) {
    addUser(input: $input) {
      id
      name
      email
    }
  }
`;
