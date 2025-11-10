// Database types generated from Supabase
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bill_categories: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_providers: {
        Row: {
          id: string;
          name: string;
          category_id: string;
          logo_url: string | null;
          api_endpoint: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category_id: string;
          logo_url?: string | null;
          api_endpoint?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category_id?: string;
          logo_url?: string | null;
          api_endpoint?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_bills: {
        Row: {
          id: string;
          user_id: string;
          service_provider_id: string;
          account_number: string;
          account_name: string;
          is_saved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_provider_id: string;
          account_number: string;
          account_name: string;
          is_saved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_provider_id?: string;
          account_number?: string;
          account_name?: string;
          is_saved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          bill_id: string | null;
          amount: number;
          currency: string;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          payment_method: string;
          recipient_details: Json | null;
          receipt_url: string | null;
          payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bill_id?: string | null;
          amount: number;
          currency?: string;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          payment_method: string;
          recipient_details?: Json | null;
          receipt_url?: string | null;
          payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bill_id?: string | null;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          payment_method?: string;
          recipient_details?: Json | null;
          receipt_url?: string | null;
          payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          type: 'card' | 'bank_account' | 'wallet';
          details: Json;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'card' | 'bank_account' | 'wallet';
          details: Json;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'card' | 'bank_account' | 'wallet';
          details?: Json;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          phone: string | null;
          kyc_status: 'pending' | 'verified' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          phone?: string | null;
          kyc_status?: 'pending' | 'verified' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          phone?: string | null;
          kyc_status?: 'pending' | 'verified' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      transaction_status: 'pending' | 'processing' | 'completed' | 'failed';
      payment_method_type: 'card' | 'bank_account' | 'wallet';
      kyc_status: 'pending' | 'verified' | 'rejected';
    };
  };
}

