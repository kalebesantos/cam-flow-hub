-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'partner_admin', 'client_user');
CREATE TYPE public.partner_status AS ENUM ('active', 'suspended', 'inactive');
CREATE TYPE public.partner_plan AS ENUM ('basic', 'premium', 'enterprise');
CREATE TYPE public.client_type AS ENUM ('pf', 'pj');
CREATE TYPE public.camera_status AS ENUM ('online', 'offline', 'maintenance');
CREATE TYPE public.alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.alert_type AS ENUM ('movement', 'person_detected', 'intrusion', 'object_detection');

-- Create tenants table (partners)
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    status partner_status NOT NULL DEFAULT 'active',
    plan partner_plan NOT NULL DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, tenant_id, role)
);

-- Create clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    type client_type NOT NULL,
    address TEXT,
    plan partner_plan NOT NULL DEFAULT 'basic',
    status partner_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cameras table
CREATE TABLE public.cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    rtsp_url TEXT,
    status camera_status NOT NULL DEFAULT 'offline',
    is_recording BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create licenses table
CREATE TABLE public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    license_type TEXT NOT NULL,
    max_cameras INTEGER NOT NULL DEFAULT 0,
    max_cloud_storage_gb INTEGER NOT NULL DEFAULT 0,
    ai_features TEXT[] DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create IP authorizations table
CREATE TABLE public.ip_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    ip_address INET NOT NULL,
    domain TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, ip_address)
);

-- Create sessions table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    device_info TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

-- Create alerts table
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    camera_id UUID REFERENCES public.cameras(id) ON DELETE CASCADE NOT NULL,
    type alert_type NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'low',
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stats table for caching dashboard metrics
CREATE TABLE public.tenant_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL UNIQUE,
    active_clients INTEGER NOT NULL DEFAULT 0,
    total_cameras INTEGER NOT NULL DEFAULT 0,
    online_cameras INTEGER NOT NULL DEFAULT 0,
    monthly_alerts INTEGER NOT NULL DEFAULT 0,
    monthly_revenue DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_stats ENABLE ROW LEVEL SECURITY;

-- Create function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role, _tenant_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (
        _tenant_id IS NULL 
        OR tenant_id = _tenant_id 
        OR (_role = 'super_admin' AND tenant_id IS NULL)
      )
  )
$$;

-- Create function to get user's tenant
CREATE OR REPLACE FUNCTION public.get_user_tenant(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role IN ('partner_admin', 'client_user')
  LIMIT 1
$$;

-- RLS Policies for tenants
CREATE POLICY "Super admins can manage all tenants"
ON public.tenants
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Partner admins can view their own tenant"
ON public.tenants
FOR SELECT
TO authenticated
USING (id = public.get_user_tenant(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Super admins can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for clients
CREATE POLICY "Super admins can view all clients"
ON public.clients
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Partners can manage their clients"
ON public.clients
FOR ALL
TO authenticated
USING (tenant_id = public.get_user_tenant(auth.uid()));

-- RLS Policies for cameras
CREATE POLICY "Partners can manage their cameras"
ON public.cameras
FOR ALL
TO authenticated
USING (tenant_id = public.get_user_tenant(auth.uid()));

CREATE POLICY "Clients can view their cameras"
ON public.cameras
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients 
    WHERE tenant_id = public.get_user_tenant(auth.uid())
  )
);

-- RLS Policies for licenses
CREATE POLICY "Super admins can manage all licenses"
ON public.licenses
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Partners can view their licenses"
ON public.licenses
FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant(auth.uid()));

-- RLS Policies for IP authorizations
CREATE POLICY "Super admins can manage all IP authorizations"
ON public.ip_authorizations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Partners can manage their IP authorizations"
ON public.ip_authorizations
FOR ALL
TO authenticated
USING (tenant_id = public.get_user_tenant(auth.uid()));

-- RLS Policies for sessions
CREATE POLICY "Super admins can view all sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Partners can view sessions in their tenant"
ON public.sessions
FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant(auth.uid()));

-- RLS Policies for alerts
CREATE POLICY "Partners can manage alerts in their tenant"
ON public.alerts
FOR ALL
TO authenticated
USING (tenant_id = public.get_user_tenant(auth.uid()));

-- RLS Policies for audit logs
CREATE POLICY "Super admins can view all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Partners can view their audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant(auth.uid()));

CREATE POLICY "All authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies for tenant stats
CREATE POLICY "Super admins can view all tenant stats"
ON public.tenant_stats
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Partners can view their stats"
ON public.tenant_stats
FOR SELECT
TO authenticated
USING (tenant_id = public.get_user_tenant(auth.uid()));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cameras_updated_at
  BEFORE UPDATE ON public.cameras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ip_authorizations_updated_at
  BEFORE UPDATE ON public.ip_authorizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();