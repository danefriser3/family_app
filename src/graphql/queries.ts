import { gql } from '@apollo/client';

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
