import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TenantDomain {
  id: string;
  tenant_id: string;
  domain: string;
  subdomain: string;
  is_primary: boolean;
  ssl_enabled: boolean;
  is_active: boolean;
}

export interface TenantBranding {
  id: string;
  tenant_id: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  company_name: string | null;
  email_from_name: string | null;
  favicon_url: string | null;
  custom_css: string | null;
}

export interface TenantContext {
  tenantId: string | null;
  domain: TenantDomain | null;
  branding: TenantBranding | null;
  loading: boolean;
}

export const useTenant = () => {
  const [tenantContext, setTenantContext] = useState<TenantContext>({
    tenantId: null,
    domain: null,
    branding: null,
    loading: true
  });

  useEffect(() => {
    detectTenant();
  }, []);

  const detectTenant = async () => {
    try {
      const hostname = window.location.hostname;
      
      // Check if it's a subdomain or custom domain
      const { data: tenantDomain, error } = await supabase
        .from('tenant_domains')
        .select(`
          *,
          tenant_branding (*)
        `)
        .or(`domain.eq.${hostname},subdomain.eq.${hostname}`)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (tenantDomain) {
        setTenantContext({
          tenantId: tenantDomain.tenant_id,
          domain: tenantDomain,
          branding: Array.isArray(tenantDomain.tenant_branding) 
            ? tenantDomain.tenant_branding[0] || null 
            : tenantDomain.tenant_branding || null,
          loading: false
        });
      } else {
        // Default to no tenant (main platform)
        setTenantContext({
          tenantId: null,
          domain: null,
          branding: null,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error detecting tenant:', error);
      setTenantContext({
        tenantId: null,
        domain: null,
        branding: null,
        loading: false
      });
    }
  };

  const getTenantUrl = async (tenantId: string): Promise<string | null> => {
    try {
      const { data } = await supabase
        .from('tenant_domains')
        .select('domain, subdomain')
        .eq('tenant_id', tenantId)
        .eq('is_primary', true)
        .eq('is_active', true)
        .single();

      if (data) {
        return `https://${data.domain || data.subdomain}`;
      }
      return null;
    } catch (error) {
      console.error('Error getting tenant URL:', error);
      return null;
    }
  };

  const updateBranding = async (tenantId: string, branding: Partial<TenantBranding>) => {
    try {
      const { error } = await supabase
        .from('tenant_branding')
        .upsert({
          tenant_id: tenantId,
          ...branding
        });

      if (error) throw error;

      // Refresh tenant context if this is the current tenant
      if (tenantContext.tenantId === tenantId) {
        detectTenant();
      }
    } catch (error) {
      console.error('Error updating branding:', error);
      throw error;
    }
  };

  return {
    ...tenantContext,
    detectTenant,
    getTenantUrl,
    updateBranding
  };
};