import { gql } from '@apollo/client';

export const GET_INCOMES = gql`
  query Incomes($cardId: ID) {
    incomes(card_id: $cardId) {
      id
      description
      amount
      date
      category
      card_id
    }
  }
`;

export const GET_EXPENSE_PRODUCTS = gql`
  query ExpenseProducts($expenseId: ID!) {
    expenseProducts(expenseId: $expenseId) {
      id
      name
      quantity
      note
      price
    }
  }
`;

export const GET_USERS = gql`
  query {
    users {
      id
      name
      email
    }
  }
`;

export const GET_CARDS = gql`
  query {
    cards {
      id
      name
      color
      credito_iniziale
      start_date
    }
  }
`;

export const GET_EXPENSES = gql`
  query Expenses($cardId: ID) {
    expenses(card_id: $cardId) {
      id
      description
      amount
      date
      category
      card_id
    }
  }
`;

export const GET_ALDI_PRODUCTS = gql`
  query GetAldiProducts {
    aldiProducts {
      id
      name
      price
      image
      category
    }
  }
`;

export const GET_ALDI_CATEGORIES = gql`
  query GetAldiCategories {
    aldiCategories {
      category
    }
  }
`;