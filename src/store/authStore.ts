import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          session,
          user: profile ? {
            id: session.user.id,
            email: session.user.email!,
            name: profile.name || session.user.email!,
            avatar_url: profile.avatar_url,
            created_at: profile.created_at,
          } : null,
          initialized: true,
        });
      } else {
        set({ initialized: true });
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          set({ user: null, session: null });
        } else if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({
            session,
            user: profile ? {
              id: session.user.id,
              email: session.user.email!,
              name: profile.name || session.user.email!,
              avatar_url: profile.avatar_url,
              created_at: profile.created_at,
            } : null,
          });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ initialized: true });
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name,
          email,
          created_at: new Date().toISOString(),
        });
      }

      set({ loading: false });
      return {};
    } catch (error: any) {
      set({ loading: false });
      return { error: error.message };
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({
          session: data.session,
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: profile?.name || data.user.email!,
            avatar_url: profile?.avatar_url,
            created_at: profile?.created_at || data.user.created_at,
          },
          loading: false,
        });
      }

      return {};
    } catch (error: any) {
      set({ loading: false });
      return { error: error.message };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
