'use server';

import { getSessionOrThrow } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'savings' | 'credit' | 'other';
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  account_id: string | null;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  description: string | null;
  transaction_date: string;
  created_at: string;
  category?: { name: string; color: string | null; icon: string | null } | null;
  account?: { name: string } | null;
}

export interface Budget {
  id: string;
  category_id: string | null;
  amount: number;
  month: string;
  spent: number;
  category?: { name: string; color: string | null } | null;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
}

export async function getAccounts(): Promise<Account[]> {
  const { user, supabase } = await getSessionOrThrow();
  
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('balance', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as Account[];
}

export async function getTransactions(limit = 10): Promise<Transaction[]> {
  const { user, supabase } = await getSessionOrThrow();
  
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      category:finance_categories(name, color, icon),
      account:accounts(name)
    `)
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []) as Transaction[];
}

export async function deleteTransaction(id: string): Promise<void> {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/finance');
  revalidatePath('/');
}

export async function addTransaction(transaction: {
  account_id: string | null;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  description?: string;
  transaction_date?: string;
}): Promise<void> {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await (supabase.from('transactions') as any).insert({
    ...transaction,
    user_id: user.id,
    transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
  });

  if (error) throw new Error(error.message);

  revalidatePath('/finance');
  revalidatePath('/');
}

export async function getBudgets(): Promise<Budget[]> {
  const { user, supabase } = await getSessionOrThrow();
  
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

  // Get budgets with category info
  const { data: budgets, error } = await supabase
    .from('budgets')
    .select(`
      *,
      category:finance_categories(name, color)
    `)
    .eq('user_id', user.id)
    .eq('month', startOfMonthStr);

  if (error) throw new Error(error.message);
  if (!budgets) return [];

  // Cast budgets to proper type
  const typedBudgets = budgets as Array<{
    id: string;
    category_id: string | null;
    amount: number;
    month: string;
    category: { name: string; color: string | null } | null;
  }>;

  // Calculate spent for each budget
  const enrichedBudgets = await Promise.all(
    typedBudgets.map(async (budget) => {
      if (!budget.category_id) {
        return { ...budget, spent: 0 } as Budget;
      }
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('category_id', budget.category_id)
        .gte('transaction_date', startOfMonthStr)
        .eq('type', 'expense');
      
      const txArray = transactions as Array<{ amount: number }> | null;
      const totalSpent = (txArray ?? []).reduce((sum, t) => sum + Number(t.amount), 0);
      
      return {
        ...budget,
        spent: totalSpent,
      } as Budget;
    })
  );

  return enrichedBudgets;
}

export async function getCategories(): Promise<Category[]> {
  const { user, supabase } = await getSessionOrThrow();
  
  const { data, error } = await supabase
    .from('finance_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  if (error) throw new Error(error.message);
  return (data || []) as Category[];
}

export async function createAccount(account: {
  name: string;
  type: Account['type'];
  balance?: number;
  currency?: string;
}): Promise<void> {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await (supabase.from('accounts') as any).insert({
    ...account,
    user_id: user.id,
    balance: account.balance || 0,
    currency: account.currency || 'EUR',
  });

  if (error) throw new Error(error.message);
  revalidatePath('/finance');
}

export async function getFinanceSummary() {
  const { user, supabase } = await getSessionOrThrow();
  
  // Total balance across all accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', user.id);
  
  const accountsArray = accounts as { balance: number }[] | null;
  const totalBalance = accountsArray?.reduce((sum, a) => sum + Number(a.balance), 0) || 0;

  // This month's expenses and income
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

  const { data: monthTransactions } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', user.id)
    .gte('transaction_date', startOfMonthStr);

  const transactionsArray = monthTransactions as { amount: number; type: string }[] | null;

  const monthIncome = transactionsArray
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const monthExpenses = transactionsArray
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  return {
    totalBalance,
    monthIncome,
    monthExpenses,
    monthNet: monthIncome - monthExpenses,
  };
}
