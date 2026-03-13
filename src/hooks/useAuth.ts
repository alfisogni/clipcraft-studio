/**
 * useAuth Hook
 * Manages authentication state with demo mode support
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemo, DEMO_EMAIL, DEMO_PASSWORD } from '@/contexts/DemoContext';
import type { User } from '@supabase/supabase-js';

// Fake user object for demo mode
const DEMO_USER: User = {
  id: 'demo-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: DEMO_EMAIL,
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { full_name: 'Usuario Demo', avatar_url: '' },
  identities: [],
  factors: [],
} as unknown as User;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDemo, enterDemo, exitDemo } = useDemo();

  useEffect(() => {
    if (isDemo) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    // Check for demo credentials
    if (email.toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      enterDemo();
      return { user: DEMO_USER, session: null } as any;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, [enterDemo]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    if (isDemo) {
      exitDemo();
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  }, [isDemo, exitDemo]);

  return { user, loading, isDemo, signInWithEmail, signUpWithEmail, signOut };
};
