-- Fix RLS policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Partners can view profiles in their tenant" 
ON public.profiles FOR SELECT 
USING (tenant_id = get_user_tenant(auth.uid()));

-- Create policy for users to insert their own profile
CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);