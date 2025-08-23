import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Se você não gerou os tipos, pode criar uma interface manual para profiles
interface Profile {
  id: string;
  email: string | null;
  role: 'super_admin' | 'partner_admin' | 'client_user';
  tenant_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  });

  useEffect(() => {
    // Listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        });
      }
    );

    // Verifica sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast.success('Login realizado com sucesso!');
      return { error: null };
    } catch (error) {
      const e = error as AuthError;
      toast.error(e.message || 'Erro ao fazer login');
      return { error: e };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles' as any) // 👈 força a tipagem (já que seu client não conhece a tabela)
          .insert<Profile>({
            id: data.user.id,
            email: data.user.email,
            role: 'client_user', // 👈 usar enum válido
          });

        if (profileError) throw profileError;
      }

      toast.success('Conta criada com sucesso!');
      return { error: null };
    } catch (error) {
      const e = error as AuthError;
      toast.error(e.message || 'Erro ao criar conta');
      return { error: e };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      const e = error as AuthError;
      toast.error(e.message || 'Erro ao fazer logout');
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut
  };
};
