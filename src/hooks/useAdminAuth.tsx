import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const REMEMBER_KEY = 'sigma-admin-remember';
const SESSION_MARKER = 'sigma-admin-session-active';

interface AdminAuthValue {
  session: Session | null;
  user: User | null;
  isStaff: boolean;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AdminAuthContext = createContext<AdminAuthValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the previous session was not "remembered" and this is a fresh browser
    // session, drop it before anything else renders.
    const remembered = localStorage.getItem(REMEMBER_KEY) === 'true';
    const sameBrowserSession = sessionStorage.getItem(SESSION_MARKER) === 'true';
    if (!remembered && !sameBrowserSession) {
      void supabase.auth.signOut();
    }
    sessionStorage.setItem(SESSION_MARKER, 'true');

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setRole(null);
        setLoading(false);
        return;
      }
      // Defer the role lookup out of the auth callback.
      setTimeout(() => {
        void loadRole(nextSession.user.id);
      }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        void loadRole(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadRole(userId: string) {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('role', { ascending: true });
    const roles = (data ?? []).map((r) => r.role as string);
    setRole(roles.includes('admin') ? 'admin' : roles.includes('staff') ? 'staff' : null);
    setLoading(false);
  }

  const value: AdminAuthValue = {
    session,
    user: session?.user ?? null,
    isStaff: role === 'admin' || role === 'staff',
    role,
    loading,
    signIn: async (email, password, remember) => {
      localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    signOut: async () => {
      localStorage.setItem(REMEMBER_KEY, 'false');
      await supabase.auth.signOut();
      setRole(null);
    },
    resetPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      return { error: error?.message ?? null };
    },
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
