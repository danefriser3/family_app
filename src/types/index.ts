// ========================
// DASHBOARD TYPES
// ========================

export interface StatCardData {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export interface TableColumn {
  id: string;
  label: string;
  format?: (value: unknown) => React.ReactNode;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  status: 'Attivo' | 'Inattivo';
  role: 'Admin' | 'User' | 'Moderator';
  lastLogin: string;
}

// ========================
// EXPENSES TYPES
// ========================

export interface Expense {
  id?: string;
  description: string;
  amount: number;
  card_id?: string;
  date: string;
  category?: string;
}

// ========================
// LAYOUT TYPES
// ========================

export interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// ========================
// COMPONENT PROPS TYPES
// ========================

export interface DataTableProps {
  title: string;
  data: Record<string, unknown>[];
  columns: TableColumn[];
}

// ========================
// FORM TYPES
// ========================

export interface ExpenseFormData {
  description: string;
  amount: string;
  date: string;
  category?: string;
}

// ========================
// API RESPONSE TYPES
// ========================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========================
// THEME TYPES
// ========================

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
}

// ========================
// NAVIGATION TYPES
// ========================

export type TabType = 
  | 'dashboard' 
  | 'analytics' 
  | 'users' 
  | 'inventory' 
  | 'reports' 
  | 'profile' 
  | 'settings'
  | 'expenses'
  | 'incomes';

// ========================
// CARD TYPES
// ========================

export interface Card {
  id: string;
  name: string;
  color: string;
  credito_iniziale?: number;
  start_date?: string;
}

// ========================
// DATE UTILS
// ========================

export function formatDateYYYYMMDDLocal(dateValue: string | number | Date | undefined): string {
  if (!dateValue) return '';
  const d = new Date(Number(dateValue));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
