export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Card {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  card_id?: string;
}
