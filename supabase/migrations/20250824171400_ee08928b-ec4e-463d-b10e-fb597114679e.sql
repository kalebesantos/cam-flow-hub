-- Create tenant_domains table for custom URLs
CREATE TABLE public.tenant_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  subdomain TEXT UNIQUE,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  ssl_enabled BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tenant_branding table for whitelabel customization
CREATE TABLE public.tenant_branding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e40af',
  accent_color TEXT DEFAULT '#06b6d4',
  company_name TEXT,
  email_from_name TEXT,
  favicon_url TEXT,
  custom_css TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.tenant_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenant_domains
CREATE POLICY "Super admins can manage all domains" 
ON public.tenant_domains FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Partners can view their domains" 
ON public.tenant_domains FOR SELECT 
USING (tenant_id = get_user_tenant(auth.uid()));

-- RLS policies for tenant_branding
CREATE POLICY "Super admins can manage all branding" 
ON public.tenant_branding FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Partners can manage their branding" 
ON public.tenant_branding FOR ALL 
USING (tenant_id = get_user_tenant(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_tenant_domains_updated_at
  BEFORE UPDATE ON public.tenant_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_branding_updated_at
  BEFORE UPDATE ON public.tenant_branding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate automatic license when tenant is created
CREATE OR REPLACE FUNCTION public.create_automatic_license()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  max_cameras_limit INTEGER;
  max_storage_limit INTEGER;
  ai_features_array TEXT[];
BEGIN
  -- Set limits based on plan
  CASE NEW.plan
    WHEN 'basic' THEN
      max_cameras_limit := 10;
      max_storage_limit := 100;
      ai_features_array := ARRAY['motion_detection']::TEXT[];
    WHEN 'premium' THEN
      max_cameras_limit := 50;
      max_storage_limit := 500;
      ai_features_array := ARRAY['motion_detection', 'face_recognition', 'object_detection']::TEXT[];
    WHEN 'enterprise' THEN
      max_cameras_limit := 200;
      max_storage_limit := 2000;
      ai_features_array := ARRAY['motion_detection', 'face_recognition', 'object_detection', 'analytics', 'custom_ai']::TEXT[];
    ELSE
      max_cameras_limit := 5;
      max_storage_limit := 50;
      ai_features_array := ARRAY['motion_detection']::TEXT[];
  END CASE;

  -- Create license
  INSERT INTO public.licenses (
    tenant_id,
    license_type,
    max_cameras,
    max_cloud_storage_gb,
    ai_features,
    expires_at,
    is_active
  ) VALUES (
    NEW.id,
    NEW.plan::TEXT,
    max_cameras_limit,
    max_storage_limit,
    ai_features_array,
    now() + INTERVAL '1 year',
    true
  );

  -- Create default subdomain
  INSERT INTO public.tenant_domains (
    tenant_id,
    subdomain,
    domain,
    is_primary
  ) VALUES (
    NEW.id,
    LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]', '', 'g')),
    LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]', '', 'g')) || '.yourplatform.com',
    true
  );

  -- Create default branding
  INSERT INTO public.tenant_branding (
    tenant_id,
    company_name,
    email_from_name,
    primary_color,
    secondary_color,
    accent_color
  ) VALUES (
    NEW.id,
    NEW.name,
    NEW.name,
    '#3b82f6',
    '#1e40af',
    '#06b6d4'
  );

  RETURN NEW;
END;
$$;

-- Trigger to create license, domain and branding automatically when tenant is created
CREATE TRIGGER create_tenant_resources
  AFTER INSERT ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.create_automatic_license();

-- Function to create client license when client is created
CREATE OR REPLACE FUNCTION public.create_client_license()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  parent_license RECORD;
  client_max_cameras INTEGER;
  client_max_storage INTEGER;
BEGIN
  -- Get parent tenant license
  SELECT * INTO parent_license 
  FROM public.licenses 
  WHERE tenant_id = NEW.tenant_id AND is_active = true 
  LIMIT 1;

  IF parent_license IS NULL THEN
    RAISE EXCEPTION 'No active license found for tenant';
  END IF;

  -- Set client limits based on plan (percentage of parent license)
  CASE NEW.plan
    WHEN 'basic' THEN
      client_max_cameras := LEAST(5, parent_license.max_cameras);
      client_max_storage := LEAST(25, parent_license.max_cloud_storage_gb);
    WHEN 'premium' THEN
      client_max_cameras := LEAST(15, parent_license.max_cameras);
      client_max_storage := LEAST(100, parent_license.max_cloud_storage_gb);
    WHEN 'enterprise' THEN
      client_max_cameras := LEAST(50, parent_license.max_cameras);
      client_max_storage := LEAST(500, parent_license.max_cloud_storage_gb);
    ELSE
      client_max_cameras := LEAST(3, parent_license.max_cameras);
      client_max_storage := LEAST(10, parent_license.max_cloud_storage_gb);
  END CASE;

  -- Create client sub-license
  INSERT INTO public.licenses (
    tenant_id,
    license_type,
    max_cameras,
    max_cloud_storage_gb,
    ai_features,
    expires_at,
    is_active
  ) VALUES (
    NEW.tenant_id,
    'client_' || NEW.plan::TEXT,
    client_max_cameras,
    client_max_storage,
    parent_license.ai_features,
    parent_license.expires_at,
    true
  );

  RETURN NEW;
END;
$$;

-- Trigger to create client license automatically
CREATE TRIGGER create_client_license_trigger
  AFTER INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.create_client_license();

-- Function to get tenant by domain/subdomain
CREATE OR REPLACE FUNCTION public.get_tenant_by_domain(domain_name TEXT)
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT tenant_id
  FROM public.tenant_domains
  WHERE (domain = domain_name OR subdomain = domain_name)
    AND is_active = true
  LIMIT 1;
$$;