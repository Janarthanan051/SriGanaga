import { useEffect, useState } from 'react';
import { useAppDispatch } from '@redux/hooks';
import { setUser, setError, setLoading } from '@redux/authSlice';
import { authService } from '@services/authService';
import { User } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch(setLoading(true));
        const user = await authService.getCurrentUser();
        if (user) {
          dispatch(setUser(user as User));
        }
      } catch (error) {
        dispatch(setError(error instanceof Error ? error.message : 'Auth error'));
      } finally {
        dispatch(setLoading(false));
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [dispatch]);

  return { isInitialized };
};

export const useSignIn = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setErrorState(null);
      
      // DEMO MODE INTERCEPT: Support all roles without needing real DB accounts due to email verification limits
      let targetEmail = email;
      let targetPassword = password;
      let roleOverride: string | null = null;
      let nameOverride: string | null = null;

      const demoRoles = [
        'super_admin', 'owner', 'manager', 'hr_manager', 'production_manager', 
        'store_keeper', 'warehouse_manager', 'sales_executive', 'accountant', 
        'vendor_manager', 'logistics_manager', 'employee'
      ];

      const emailPrefix = email.split('@')[0];
      if (email.endsWith('@sriganga.com') && emailPrefix !== 'admin' && emailPrefix !== 'hr') {
        if (demoRoles.includes(emailPrefix)) {
          targetEmail = 'admin@sriganga.com';
          targetPassword = 'Password123!';
          roleOverride = emailPrefix;
          nameOverride = emailPrefix.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
      }

      const { user } = await authService.signIn(targetEmail, targetPassword);
      
      let finalUser = user as User;
      if (roleOverride && finalUser?.user_metadata) {
        finalUser = {
          ...finalUser,
          user_metadata: {
            ...finalUser.user_metadata,
            role: roleOverride,
            full_name: nameOverride || finalUser.user_metadata.full_name
          }
        };
      }
      
      dispatch(setUser(finalUser));
      return finalUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setErrorState(message);
      dispatch(setError(message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, error };
};

export const useSignUp = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    try {
      setLoading(true);
      setErrorState(null);
      const result = await authService.signUp(email, password, fullName, role);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setErrorState(message);
      dispatch(setError(message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signUp, loading, error };
};

export const useSignOut = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      dispatch(setUser(null));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      dispatch(setError(message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signOut, loading };
};
