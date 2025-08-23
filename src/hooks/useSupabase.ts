import { useState } from 'react';
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
  const [licenses, setLicenses] = useState<License[]>([]);
  const [ipAuthorizations, setIPAuthorizations] = useState<IPAuthorization[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Partner Data
  const [clients, setClients] = useState<Client[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tenantStats, setTenantStats] = useState<TenantStats[]>([]);

  const fetchSuperAdminData = async () => {
    try {
      setLoading(true);
      const [tenantsRes, licensesRes, ipsRes, sessionsRes] = await Promise.all([
        supabase.from('tenants').select('*'),
        supabase.from('licenses').select('*'),
        supabase.from('ip_authorizations').select('*').eq('is_active', true),
        supabase.from('sessions').select('*').eq('is_active', true),
      ]);

      if (tenantsRes.error) throw tenantsRes.error;
      if (licensesRes.error) throw licensesRes.error;
      if (ipsRes.error) throw ipsRes.error;
      if (sessionsRes.error) throw sessionsRes.error;

      setTenants(tenantsRes.data || []);
      setLicenses(licensesRes.data || []);
      setIPAuthorizations((ipsRes.data || []).map(ip => ({ ...ip, ip_address: String(ip.ip_address) })));
      setSessions((sessionsRes.data || []).map(session => ({ ...session, ip_address: String(session.ip_address) })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerData = async () => {
    try {
      setLoading(true);
      const [clientsRes, camerasRes, alertsRes, statsRes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('cameras').select('*'),
        supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('tenant_stats').select('*'),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (camerasRes.error) throw camerasRes.error;
      if (alertsRes.error) throw alertsRes.error;
      if (statsRes.error) throw statsRes.error;

      setClients(clientsRes.data || []);
      setCameras(camerasRes.data || []);
      setAlerts(alertsRes.data || []);
      setTenantStats(statsRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do parceiro');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [camerasRes, alertsRes] = await Promise.all([
        supabase.from('cameras').select('*'),
        supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      if (camerasRes.error) throw camerasRes.error;
      if (alertsRes.error) throw alertsRes.error;

      setCameras(camerasRes.data || []);
      setAlerts(alertsRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const deleteTenant = async (tenantId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('tenants').delete().eq('id', tenantId);
      if (error) throw error;
      setTenants(prev => prev.filter(t => t.id !== tenantId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar parceiro');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,

    // Super Admin Data
    tenants,
    licenses,
    ipAuthorizations,
    sessions,
    fetchSuperAdminData,
    deleteTenant,

    // Partner Data
    clients,
    cameras,
    alerts,
    tenantStats,
    fetchPartnerData,

    // Client Data
    fetchClientData,
  };
};
