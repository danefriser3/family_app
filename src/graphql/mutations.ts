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
