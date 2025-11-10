import { supabase } from './client';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { handleSupabaseError } from '../utils/errors';

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export const authService = {
  // Sign up with email and password
  signUp: async (data: SignUpData): Promise<AuthResponse> => {
    const { email, password, fullName, phone } = data;
    
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    });

    return {
      user: authData.user,
      session: authData.session,
      error,
    };
  },

  // Sign in with email and password
  signIn: async (data: SignInData): Promise<AuthResponse> => {
    const { email, password } = data;
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: authData.user,
      session: authData.session,
      error,
    };
  },

  // Sign out
  signOut: async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  getSession: async (): Promise<Session | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Get current user
  getUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Reset password
  resetPassword: async (email: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'onebills://reset-password',
    });
    return { error };
  },

  // Update password
  updatePassword: async (newPassword: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  },

  // Sign in with OTP (Phone)
  signInWithOtp: async (phone: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { error };
  },

  // Verify OTP
  verifyOtp: async (phone: string, token: string): Promise<AuthResponse> => {
    const { data: authData, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    return {
      user: authData.user,
      session: authData.session,
      error,
    };
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

