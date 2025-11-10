import { supabase } from './client';
import type { Database } from './types';

type BillCategory = Database['public']['Tables']['bill_categories']['Row'];
type ServiceProvider = Database['public']['Tables']['service_providers']['Row'];
type UserBill = Database['public']['Tables']['user_bills']['Row'];
type UserBillInsert = Database['public']['Tables']['user_bills']['Insert'];
type UserBillUpdate = Database['public']['Tables']['user_bills']['Update'];

export interface BillCategoryWithProviders extends BillCategory {
  service_providers?: ServiceProvider[];
}

export const billsService = {
  // Get all bill categories
  getCategories: async (): Promise<BillCategory[]> => {
    const { data, error } = await supabase
      .from('bill_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get service providers (optionally filtered by category)
  getProviders: async (categoryId?: string): Promise<ServiceProvider[]> => {
    let query = supabase
      .from('service_providers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get categories with their providers
  getCategoriesWithProviders: async (): Promise<BillCategoryWithProviders[]> => {
    const { data, error } = await supabase
      .from('bill_categories')
      .select(`
        *,
        service_providers (
          id,
          name,
          logo_url,
          is_active
        )
      `)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get user's saved bills
  getMyBills: async (): Promise<(UserBill & { service_providers: ServiceProvider })[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_bills')
      .select(`
        *,
        service_providers (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add a new bill
  addBill: async (bill: Omit<UserBillInsert, 'user_id'>): Promise<UserBill> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_bills')
      .insert({
        ...bill,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a bill
  updateBill: async (id: string, updates: UserBillUpdate): Promise<UserBill> => {
    const { data, error } = await supabase
      .from('user_bills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a bill
  deleteBill: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('user_bills')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get a single bill by ID
  getBillById: async (id: string): Promise<UserBill & { service_providers: ServiceProvider }> => {
    const { data, error } = await supabase
      .from('user_bills')
      .select(`
        *,
        service_providers (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};

