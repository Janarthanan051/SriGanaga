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
      const { user } = await authService.signIn(email, password);
      dispatch(setUser(user as User));
      return user;
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
