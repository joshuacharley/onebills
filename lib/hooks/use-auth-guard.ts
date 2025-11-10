import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to protect routes that require authentication
 * Redirects to welcome screen if not authenticated
 */
export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated, isLoading, segments]);
}

/**
 * Hook to redirect authenticated users away from auth screens
 */
export function useGuestGuard() {
  const { isAuthenticated, isLoading, needsProfileSetup } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      if (needsProfileSetup) {
        router.replace('/(auth)/profile-setup');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, needsProfileSetup, segments]);
}

