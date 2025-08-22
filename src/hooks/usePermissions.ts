import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'super_admin' | 'partner_admin' | 'client_user';

export interface UserRole {
  id: string;
  user_id: string;
  tenant_id: string | null;
  role: AppRole;
  created_at: string;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRoles();
    } else {
      setUserRoles([]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRoles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: AppRole, tenantId?: string): boolean => {
    return userRoles.some(userRole => {
      if (userRole.role !== role) return false;
      
      // Super admin can access everything
      if (role === 'super_admin') return true;
      
      // For tenant-specific roles, check tenant match
      if (tenantId && userRole.tenant_id !== tenantId) return false;
      
      return true;
    });
  };

  const getUserTenant = (): string | null => {
    const tenantRole = userRoles.find(role => 
      role.role === 'partner_admin' || role.role === 'client_user'
    );
    return tenantRole?.tenant_id || null;
  };

  const getPrimaryRole = (): AppRole | null => {
    if (userRoles.length === 0) return null;
    
    // Priority: super_admin > partner_admin > client_user
    if (userRoles.some(role => role.role === 'super_admin')) return 'super_admin';
    if (userRoles.some(role => role.role === 'partner_admin')) return 'partner_admin';
    if (userRoles.some(role => role.role === 'client_user')) return 'client_user';
    
    return userRoles[0].role;
  };

  const isSuperAdmin = () => hasRole('super_admin');
  const isPartnerAdmin = () => hasRole('partner_admin');
  const isClientUser = () => hasRole('client_user');

  return {
    userRoles,
    loading,
    hasRole,
    getUserTenant,
    getPrimaryRole,
    isSuperAdmin,
    isPartnerAdmin,
    isClientUser,
    refetch: fetchUserRoles
  };
};