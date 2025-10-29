'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUtils } from '@/lib/services/authService';
import { useToast } from '@/hooks/use-toast';

interface UseAuthCheckOptions {
  redirectTo?: string;
  checkOnMount?: boolean;
  showToast?: boolean;
}

export const useAuthCheck = (options: UseAuthCheckOptions = {}) => {
  const { redirectTo = '/login', checkOnMount = true, showToast = true } = options;
  const router = useRouter();
  const { toast } = useToast();

  const checkAuthAndRedirect = () => {
    if (!AuthUtils.isAuthenticated()) {
      console.log('🚫 No authentication token found, redirecting to login');

      if (showToast) {
        toast({
          variant: 'destructive',
          title: 'Session Expired',
          description: 'Your session token has expired. Please sign in again.',
        });
      }

      // Immediate redirect without delay to prevent any API calls
      router.push(redirectTo);
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (checkOnMount) {
      checkAuthAndRedirect();
    }
  }, [checkOnMount, redirectTo, router, showToast]);

  return {
    isAuthenticated: AuthUtils.isAuthenticated(),
    checkAuthAndRedirect,
    getToken: AuthUtils.getToken,
  };
};
