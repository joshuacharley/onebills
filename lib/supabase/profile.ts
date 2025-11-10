import { supabase } from './client';
import type { Database } from './types';
import { ErrorCode, createAppError, handleSupabaseError } from '../utils/errors';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export interface ProfileData {
  full_name?: string;
  phone?: string;
  kyc_status?: 'pending' | 'verified' | 'rejected';
}

export const profileService = {
  // Get user profile
  getProfile: async (): Promise<UserProfile | null> => {
    try {
      // Check session first (more reliable than getUser)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Not authenticated - return null instead of throwing
        // This is a valid state (user might not be logged in)
        return null;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        // Profile might not exist yet - this is expected for new users
        if (error.code === 'PGRST116') {
          return null;
        }
        
        // For other errors, throw structured error
        throw handleSupabaseError(error);
      }

      return data;
    } catch (error: any) {
      // If it's already a structured error, re-throw it
      if (error.code && error.userMessage) {
        throw error;
      }
      
      // Handle authentication errors gracefully
      if (error?.message?.includes('Not authenticated') || 
          error?.message?.includes('JWT')) {
        return null; // Not authenticated is a valid state
      }
      
      // For other errors, throw structured error
      throw handleSupabaseError(error);
    }
  },

  // Create or update profile
  upsertProfile: async (profile: Omit<UserProfileInsert, 'user_id' | 'id'>): Promise<UserProfile> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw createAppError(
          ErrorCode.AUTH_NOT_AUTHENTICATED,
          'User not authenticated',
          'You need to sign in to update your profile.'
        );
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: session.user.id,
          ...profile,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }
      
      return data;
    } catch (error: any) {
      // Re-throw structured errors as-is
      if (error.code && error.userMessage) {
        throw error;
      }
      throw handleSupabaseError(error);
    }
  },

  // Update profile
  updateProfile: async (updates: UserProfileUpdate): Promise<UserProfile> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw createAppError(
          ErrorCode.AUTH_NOT_AUTHENTICATED,
          'User not authenticated',
          'You need to sign in to update your profile.'
        );
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }
      
      return data;
    } catch (error: any) {
      // Re-throw structured errors as-is
      if (error.code && error.userMessage) {
        throw error;
      }
      throw handleSupabaseError(error);
    }
  },

  // Update KYC status
  updateKycStatus: async (status: 'pending' | 'verified' | 'rejected'): Promise<UserProfile> => {
    return profileService.updateProfile({ kyc_status: status });
  },
};

