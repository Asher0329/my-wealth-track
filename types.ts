
export type RecordType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  subCategories: string[];
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}

export interface LedgerEntry {
  id: string;
  amount: number;
  type: RecordType;
  accountId: string;
  primaryCategory: string;
  secondaryCategory: string;
  date: string;
  remark?: string;
}

export interface FixedDeposit {
  id: string;
  name: string;
  principal: number;
  startDate: string;
  endDate: string;
  apr: number; // Annual Percentage Rate (e.g., 3.5 for 3.5%)
  status: 'ONGOING' | 'EXPIRED';
  settledToAccountId?: string;
}

export interface StockRecord {
  id: string;
  name: string;
  code: string;
  buyPrice: number;
  sellPrice: number;
  fee: number;
}

export type ViewType = 'DASHBOARD' | 'LEDGER' | 'ACCOUNTS' | 'DEPOSITS' | 'STOCKS' | 'SETTINGS';
