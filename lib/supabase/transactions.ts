import { supabase } from './client';
import type { Database } from './types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export interface TransactionWithBill extends Transaction {
  user_bills?: {
    id: string;
    account_number: string;
    account_name: string;
    service_providers: {
      id: string;
      name: string;
      logo_url: string | null;
    };
  } | null;
}

export const transactionsService = {
  // Get user's transactions
  getTransactions: async (limit = 50): Promise<TransactionWithBill[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        user_bills (
          id,
          account_number,
          account_name,
          service_providers (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get transaction by ID
  getTransactionById: async (id: string): Promise<TransactionWithBill> => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        user_bills (
          id,
          account_number,
          account_name,
          service_providers (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new transaction
  createTransaction: async (
    transaction: Omit<TransactionInsert, 'user_id'>
  ): Promise<Transaction> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update transaction status
  updateTransaction: async (
    id: string,
    updates: TransactionUpdate
  ): Promise<Transaction> => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get transactions by status
  getTransactionsByStatus: async (
    status: Transaction['status']
  ): Promise<TransactionWithBill[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        user_bills (
          id,
          account_number,
          account_name,
          service_providers (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get transaction statistics
  getTransactionStats: async (): Promise<{
    total: number;
    completed: number;
    pending: number;
    failed: number;
    totalAmount: number;
  }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .select('status, amount')
      .eq('user_id', user.id);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      completed: data?.filter((t) => t.status === 'completed').length || 0,
      pending: data?.filter((t) => t.status === 'pending').length || 0,
      failed: data?.filter((t) => t.status === 'failed').length || 0,
      totalAmount:
        data
          ?.filter((t) => t.status === 'completed')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
    };

    return stats;
  },
};

