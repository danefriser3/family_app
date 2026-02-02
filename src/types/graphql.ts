export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Card {
  id: string;
  name: string;
  color: string;
  credito_iniziale: number;
  start_date: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  card_id?: string;
}

export interface AldiProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sku: string;
}

export interface AldiCategory {
  aldiCategories: { category: string }[];
}

// Query result types
export interface GetCardsData {
  cards: Card[];
}

export interface GetExpensesData {
  expenses: Expense[];
}

export interface GetIncomesData {
  incomes: Expense[];
}