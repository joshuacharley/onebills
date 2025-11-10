import { create } from 'zustand';
import { authService } from '../supabase/auth';
import { profileService } from '../supabase/profile';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '../supabase/types';
import { handleSupabaseError, getUserFriendlyMessage, ErrorCode, logError } from '../utils/errors';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsProfileSetup: boolean;
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (data: { full_name?: string; phone?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  needsProfileSetup: false,

  initialize: async () => {
    try {
      const session = await authService.getSession();
      const user = session?.user || null;

      // Set initial state first
      set({
        user,
        session,
        isAuthenticated: !!user,
        isLoading: false,
      });

      // Only load profile if we have a valid user and session
      if (user && session) {
        // Load profile asynchronously - don't block initialization
        // Profile might not exist yet for new users, so we handle errors gracefully
        get().loadProfile().catch((error) => {
          // Only log in development, and only if it's not a "not found" error
          if (__DEV__ && error?.code !== ErrorCode.PROFILE_NOT_FOUND) {
            logError(error, 'Profile load during init');
          }
        });
      }

      // Listen to auth state changes
      authService.onAuthStateChange(async (event, session) => {
        const user = session?.user || null;
        
        if (user && session) {
          // Load profile when user signs in
          await get().loadProfile();
        } else {
          // Clear profile when user signs out
          set({ profile: null, needsProfileSetup: false });
        }
        
        set({
          user,
          session,
          isAuthenticated: !!user,
        });
      });
    } catch (error) {
      logError(error, 'Auth initialization');
      set({ 
        isLoading: false, 
        isAuthenticated: false,
        user: null,
        session: null,
        profile: null,
      });
    }
  },

  loadProfile: async () => {
    try {
      // Only try to load profile if user is authenticated
      const currentUser = get().user;
      const currentSession = get().session;
      
      if (!currentUser || !currentSession) {
        set({ profile: null, needsProfileSetup: false });
        return;
      }

      const profile = await profileService.getProfile();
      
      // Profile can be null if it doesn't exist yet (new user)
      // This is a valid state, not an error
      set({
        profile,
        needsProfileSetup: !profile || !profile.full_name || !profile.phone,
      });
    } catch (error: any) {
      // Handle structured errors
      const isNotAuthenticated = error?.code === ErrorCode.AUTH_NOT_AUTHENTICATED ||
                                 error?.message?.includes('Not authenticated');
      
      if (isNotAuthenticated) {
        // Not authenticated is a valid state - don't log as error
        set({ profile: null, needsProfileSetup: false });
        return;
      }
      
      // For other errors, log in development only and assume profile needs setup
      if (__DEV__) {
        console.warn('Profile load warning:', error?.userMessage || error?.message || error);
      }
      
      set({ 
        profile: null,
        needsProfileSetup: true 
      });
    }
  },

  signUp: async (email: string, password: string, fullName?: string, phone?: string) => {
    set({ isLoading: true });
    try {
      const { user, session, error } = await authService.signUp({
        email,
        password,
        fullName,
        phone,
      });

      if (error) {
        const appError = handleSupabaseError(error);
        set({ isLoading: false });
        throw appError;
      }

      // Set auth state first
      set({
        user,
        session,
        isAuthenticated: !!user,
      });

      // Load profile after signup (don't block on this)
      if (user && session) {
        get().loadProfile().catch((err) => {
          // Profile might not exist yet for new users - that's expected
          // Only log in development if it's an unexpected error
          if (__DEV__ && err?.code !== ErrorCode.PROFILE_NOT_FOUND) {
            logError(err, 'Profile load after signup');
          }
        });
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      // Re-throw with proper error handling
      if (error.code && error.userMessage) {
        throw error;
      }
      throw handleSupabaseError(error);
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user, session, error } = await authService.signIn({
        email,
        password,
      });

      if (error) {
        const appError = handleSupabaseError(error);
        set({ isLoading: false });
        throw appError;
      }

      // Set auth state first
      set({
        user,
        session,
        isAuthenticated: !!user,
      });

      // Load profile after signin
      if (user && session) {
        await get().loadProfile();
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      // Re-throw with proper error handling
      if (error.code && error.userMessage) {
        throw error;
      }
      throw handleSupabaseError(error);
    }
  },

  signInWithPhone: async (phone: string) => {
    set({ isLoading: true });
    try {
      const { error } = await authService.signInWithOtp(phone);
      
      if (error) {
        const appError = handleSupabaseError(error);
        set({ isLoading: false });
        throw appError;
      }
      
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      // Re-throw with proper error handling
      if (error.code && error.userMessage) {
        throw error;
      }
      throw handleSupabaseError(error);
    }
  },

  verifyOtp: async (phone: string, token: string) => {
    set({ isLoading: true });
    try {
      const { user, session, error } = await authService.verifyOtp(phone, token);
      
      if (error) {
        const appError = handleSupabaseError(error);
        set({ isLoading: false });
        throw appError;
      }

      // Set auth state first
      set({
        user,
        session,
        isAuthenticated: !!user,
      });

      // Load profile after OTP verification
      if (user && session) {
        await get().loadProfile();
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      // Re-throw with proper error handling
      if (error.code && error.userMessage) {
        throw error;
      }
      throw handleSupabaseError(error);
    }
  },

  updateProfile: async (data: { full_name?: string; phone?: string }) => {
    try {
      await profileService.upsertProfile(data);
      await get().loadProfile();
    } catch (error: any) {
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await authService.signOut();
      if (error) throw error;

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },
}));

