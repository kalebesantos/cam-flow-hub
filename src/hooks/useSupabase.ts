import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'active' | 'suspended' | 'inactive';
  plan: 'basic' | 'premium' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  tenant_id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'pf' | 'pj';
  address?: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'suspended' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Camera {
  id: string;
  tenant_id: string;
  client_id: string;
  name: string;
  location: string;
  rtsp_url?: string;
  status: 'online' | 'offline' | 'maintenance';
  is_recording: boolean;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  tenant_id: string;
  client_id: string;
  camera_id: string;
  type: 'movement' | 'person_detected' | 'intrusion' | 'object_detection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: any;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

export interface TenantStats {
  id: string;
  tenant_id: string;
  active_clients: number;
  total_cameras: number;
  online_cameras: number;
  monthly_alerts: number;
  monthly_revenue: number;
  last_updated: string;
}

export interface License {
  id: string;
  tenant_id: string;
  license_type: string;
  max_cameras: number;
  max_cloud_storage_gb: number;
  ai_features: string[];
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IPAuthorization {
  id: string;
  tenant_id: string;
  ip_address: string;
  domain?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  tenant_id?: string;
  client_id?: string;
  ip_address: string;
  device_info?: string;
  is_active: boolean;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

export const useSupabaseData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Super Admin Data
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [totalLicenses, setTotalLicenses] = useState(0);
  const [totalIPAuthorizations, setTotalIPAuthorizations] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);

  // Partner Data
  const [partnerClients, setPartnerClients] = useState<Client[]>([]);
  const [partnerStats, setPartnerStats] = useState<TenantStats | null>(null);

  // Client Data
  const [clientCameras, setClientCameras] = useState<Camera[]>([]);
  const [clientAlerts, setClientAlerts] = useState<Alert[]>([]);

  const fetchSuperAdminData = async () => {
    try {
      setLoading(true);
      
      const [tenantsRes, licensesRes, ipsRes, sessionsRes] = await Promise.all([
        supabase.from('tenants').select('*'),
        supabase.from('licenses').select('id'),
        supabase.from('ip_authorizations').select('id').eq('is_active', true),
        supabase.from('sessions').select('id').eq('is_active', true)
      ]);

      if (tenantsRes.error) throw tenantsRes.error;
      if (licensesRes.error) throw licensesRes.error;
      if (ipsRes.error) throw ipsRes.error;
      if (sessionsRes.error) throw sessionsRes.error;

      setTenants(tenantsRes.data || []);
      setTotalLicenses(licensesRes.data?.length || 0);
      setTotalIPAuthorizations(ipsRes.data?.length || 0);
      setActiveSessions(sessionsRes.data?.length || 0);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerData = async (tenantId: string) => {
    try {
      setLoading(true);
      
      const [clientsRes, statsRes] = await Promise.all([
        supabase.from('clients').select('*').eq('tenant_id', tenantId),
        supabase.from('tenant_stats').select('*').eq('tenant_id', tenantId).single()
      ]);

      if (clientsRes.error) throw clientsRes.error;
      
      setPartnerClients(clientsRes.data || []);
      setPartnerStats(statsRes.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do parceiro');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientData = async (clientId: string) => {
    try {
      setLoading(true);
      
      const [camerasRes, alertsRes] = await Promise.all([
        supabase.from('cameras').select('*').eq('client_id', clientId),
        supabase
          .from('alerts')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (camerasRes.error) throw camerasRes.error;
      if (alertsRes.error) throw alertsRes.error;

      setClientCameras(camerasRes.data || []);
      setClientAlerts(alertsRes.data || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    
    // Super Admin Data
    tenants,
    totalLicenses,
    totalIPAuthorizations,
    activeSessions,
    fetchSuperAdminData,
    
    // Partner Data
    partnerClients,
    partnerStats,
    fetchPartnerData,
    
    // Client Data
    clientCameras,
    clientAlerts,
    fetchClientData
  };
};