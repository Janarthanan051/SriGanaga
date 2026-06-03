import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { setEmployees, setLoading, setError } from '@redux/hrSlice';
import { employeeService } from '@services/hrService';

export const useEmployees = (page = 1, limit = 10, filters?: Record<string, any>) => {
  const dispatch = useAppDispatch();
  const { employees, loading, error } = useAppSelector((state) => state.hr);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        dispatch(setLoading(true));
        const { data, total: count } = await employeeService.getEmployees(page, limit, filters);
        dispatch(setEmployees(data));
        setTotal(count);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch employees';
        dispatch(setError(message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchEmployees();
  }, [page, limit, filters, dispatch]);

  return { employees, loading, error, total };
};

export const useProductSearch = (query: string) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        // Will be implemented with real API
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading };
};
