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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Super Admin data
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [ipAuthorizations, setIpAuthorizations] = useState<IPAuthorization[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Partner data
  const [clients, setClients] = useState<Client[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tenantStats, setTenantStats] = useState<TenantStats[]>([]);
  const [partnerClients, setPartnerClients] = useState<Client[]>([]);
  const [partnerStats, setPartnerStats] = useState<TenantStats[]>([]);

  const fetchSuperAdminData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch tenants, licenses, IP authorizations, and sessions
      const [tenantsRes, licensesRes, ipAuthRes, sessionsRes] = await Promise.all([
        supabase.from('tenants').select('*'),
        supabase.from('licenses').select('*'),
        supabase.from('ip_authorizations').select('*'),
        supabase.from('sessions').select('*').eq('is_active', true)
      ]);

      if (tenantsRes.error) throw tenantsRes.error;
      if (licensesRes.error) throw licensesRes.error;
      if (ipAuthRes.error) throw ipAuthRes.error;
      if (sessionsRes.error) throw sessionsRes.error;

      setTenants(tenantsRes.data || []);
      setLicenses(licensesRes.data || []);
      setIpAuthorizations((ipAuthRes.data || []).map(ip => ({ ...ip, ip_address: String(ip.ip_address) })));
      setSessions((sessionsRes.data || []).map(session => ({ ...session, ip_address: String(session.ip_address) })));
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
      console.error('Error fetching super admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerData = async (tenantId?: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Get current user's tenant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let targetTenantId = tenantId;
      
      if (!targetTenantId) {
        // Get user's tenant_id
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('tenant_id')
          .eq('user_id', user.id)
          .single();

        if (!userRole?.tenant_id) throw new Error('Tenant não encontrado');
        targetTenantId = userRole.tenant_id;
      }

      // Fetch partner-specific data
      const [clientsRes, camerasRes, alertsRes, statsRes] = await Promise.all([
        supabase.from('clients').select('*').eq('tenant_id', targetTenantId),
        supabase.from('cameras').select('*').eq('tenant_id', targetTenantId),
        supabase.from('alerts').select('*').eq('tenant_id', targetTenantId).order('created_at', { ascending: false }).limit(10),
        supabase.from('tenant_stats').select('*').eq('tenant_id', targetTenantId)
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (camerasRes.error) throw camerasRes.error;
      if (alertsRes.error) throw alertsRes.error;
      if (statsRes.error) throw statsRes.error;

      setClients(clientsRes.data || []);
      setPartnerClients(clientsRes.data || []);
      setCameras(camerasRes.data || []);
      setAlerts(alertsRes.data || []);
      setTenantStats(statsRes.data || []);
      setPartnerStats(statsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do parceiro');
      console.error('Error fetching partner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch client-specific data (cameras and alerts for this client)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Get client data based on user
      const [camerasRes, alertsRes] = await Promise.all([
        supabase.from('cameras').select('*').eq('client_id', user.id),
        supabase.from('alerts').select('*').eq('client_id', user.id).order('created_at', { ascending: false }).limit(5)
      ]);

      if (camerasRes.error) throw camerasRes.error;
      if (alertsRes.error) throw alertsRes.error;

      setCameras(camerasRes.data || []);
      setAlerts(alertsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do cliente');
      console.error('Error fetching client data:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTenant = async (tenantId: string) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (error) throw error;

      setTenants(prev => prev.filter(tenant => tenant.id !== tenantId));
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar tenant');
      console.error('Error deleting tenant:', err);
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      setClients(prev => prev.filter(client => client.id !== clientId));
      setPartnerClients(prev => prev.filter(client => client.id !== clientId));
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar cliente');
      console.error('Error deleting client:', err);
    }
  };

  const createTenant = async (tenantData: { name: string; email: string; phone?: string; address?: string; plan: 'basic' | 'premium' | 'enterprise'; }) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenantData)
        .select()
        .single();

      if (error) throw error;

      setTenants(prev => [...prev, data]);
      return { data, error: null };
    } catch (err: any) {
      setError(err.message || 'Erro ao criar tenant');
      return { data: null, error: err };
    }
  };

  const updateTenant = async (tenantId: string, tenantData: Partial<Tenant>) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update(tenantData)
        .eq('id', tenantId)
        .select()
        .single();

      if (error) throw error;

      setTenants(prev => prev.map(tenant => 
        tenant.id === tenantId ? { ...tenant, ...data } : tenant
      ));
      return { data, error: null };
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar tenant');
      return { data: null, error: err };
    }
  };

  return {
    loading,
    error,
    // Super Admin data
    tenants,
    licenses,
    ipAuthorizations,
    sessions,
    // Partner data  
    clients,
    cameras,
    alerts,
    tenantStats,
    partnerClients,
    partnerStats,
    // Functions
    fetchSuperAdminData,
    fetchPartnerData,
    fetchClientData,
    deleteTenant,
    deleteClient,
    createTenant,
    updateTenant,
  };
};
