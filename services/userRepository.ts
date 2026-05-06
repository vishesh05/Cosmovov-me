
import { UserProfile } from '../types';

export interface SavedChart extends UserProfile {
  id: string;
  email?: string;
  gender: 'male' | 'female' | 'other';
  relation?: string;
}

export interface UserTransaction {
  id: string;
  title: string;
  type: 'debit' | 'credit';
  amount: number;
  date: string;
  status: 'success' | 'failed' | 'pending';
  details?: {
    duration?: string; // e.g. "15 mins"
    rate?: string;     // e.g. "₹25/min"
    sessionId?: string;
    paymentMode?: string; // e.g. "UPI"
  };
}

const CHARTS_KEY = 'astroveda_saved_charts';
const WALLET_KEY = 'astroveda_user_wallet';

// Mock Data Initialization
const INITIAL_CHARTS: SavedChart[] = [];

const INITIAL_TRANSACTIONS: UserTransaction[] = [];

export const getUserWalletBalance = (): number => {
  const bal = localStorage.getItem(WALLET_KEY);
  return bal ? parseFloat(bal) : 0.00; // Default balance
};

export const addUserMoney = (amount: number) => {
  const current = getUserWalletBalance();
  const newBal = current + amount;
  localStorage.setItem(WALLET_KEY, newBal.toString());
  return newBal;
};

export const getSavedCharts = (): SavedChart[] => {
  const data = localStorage.getItem(CHARTS_KEY);
  return data ? JSON.parse(data) : INITIAL_CHARTS;
};

export const saveNewChart = (chart: Omit<SavedChart, 'id'>) => {
  const charts = getSavedCharts();
  const newChart = { ...chart, id: Date.now().toString() };
  const updated = [newChart, ...charts];
  localStorage.setItem(CHARTS_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteSavedChart = (id: string) => {
  const charts = getSavedCharts();
  const updated = charts.filter(c => c.id !== id);
  localStorage.setItem(CHARTS_KEY, JSON.stringify(updated));
  return updated;
};

export const getUserTransactions = (): UserTransaction[] => {
  // In a real app, this would fetch from API. For now, returning static mock data.
  return INITIAL_TRANSACTIONS;
};
