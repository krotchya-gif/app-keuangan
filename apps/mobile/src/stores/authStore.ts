import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        set({ user: { id: user.id, email: user.email! } });
      }
    }
    return { error };
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  fetchUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      set({ user: { id: user.id, email: user.email! }, loading: false });
    } else {
      set({ user: null, loading: false });
    }
  },
}));
