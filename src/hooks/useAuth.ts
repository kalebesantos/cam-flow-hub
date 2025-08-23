// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuthState {
  user: User | null;
  session: Session | null;
  role: string | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true
  });

  // Função para buscar a role do usuário
  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setAuthState(prev => ({ ...prev, role: data.role }));
    } else {
      setAuthState(prev => ({ ...prev, role: null }));
    }
  };

  useEffect(() => {
    // Listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          role: null,
          loading: false
        });
        if (session?.user?.id) fetchUserRole(session.user.id);
      }
    );

    // Verifica sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        role: null,
        loading: false
      });
      if (session?.user?.id) fetchUserRole(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user?.id) await fetchUserRole(data.user.id);

      toast.success('Login realizado com sucesso!');
      return { error: null };
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl }
      });
      if (error) throw error;

      toast.success('Conta criada com sucesso! Verifique seu email.');
      return { error: null };
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthState({ user: null, session: null, role: null, loading: false });
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout');
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut
  };
};
