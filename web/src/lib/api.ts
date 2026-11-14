import { supabase } from './supabase';

export async function apiRequest<T>(
  promise: Promise<{ data: T | null; error: Error | null }>
): Promise<T> {
  const { data, error } = await promise;
  if (error) {
    throw new Error(error.message);
  }
  return data as T;
}

export { supabase };
