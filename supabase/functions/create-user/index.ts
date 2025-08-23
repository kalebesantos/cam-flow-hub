import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password?: string;
  fullName: string;
  role: 'partner_admin' | 'client_user';
  tenantId?: string;
  clientData?: {
    name: string;
    type: 'pf' | 'pj';
    phone?: string;
    address?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(
      "https://sxrbbhudxyxfbkubuyca.supabase.co",
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Initialize regular client for RLS operations
    const supabaseUrl = "https://sxrbbhudxyxfbkubuyca.supabase.co";
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cmJiaHVkeHl4ZmJrdWJ1eWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MTU0NTMsImV4cCI6MjA3MTM5MTQ1M30.5oEEeLCE1P9du6_5ucnQYZ6bSwkcg8ikB_PmrQqYTjI";
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    const { email, password, fullName, role, tenantId, clientData }: CreateUserRequest = await req.json();

    console.log('Creating user:', { email, role, tenantId });

    // Verify the requesting user has permission
    const { data: { user: requestingUser } } = await supabase.auth.getUser();
    if (!requestingUser) {
      throw new Error('Não autenticado');
    }

    // Check if requesting user has appropriate role
    const { data: requestingUserRole } = await supabase
      .from('user_roles')
      .select('role, tenant_id')
      .eq('user_id', requestingUser.id)
      .single();

    if (!requestingUserRole) {
      throw new Error('Role do usuário não encontrado');
    }

    // Permission validation
    if (role === 'partner_admin' && requestingUserRole.role !== 'super_admin') {
      throw new Error('Apenas super admins podem criar parceiros');
    }

    if (role === 'client_user' && requestingUserRole.role !== 'partner_admin') {
      throw new Error('Apenas partner admins podem criar clientes');
    }

    // Generate password if not provided
    const userPassword = password || generateRandomPassword();

    // Create user with admin client
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: userPassword,
      user_metadata: {
        full_name: fullName,
      },
      email_confirm: true, // Auto-confirm email
    });

    if (userError) {
      console.error('Error creating user:', userError);
      throw userError;
    }

    console.log('User created successfully:', userData.user.id);

    // Determine tenant ID for the new user
    let userTenantId = tenantId;
    
    if (role === 'client_user') {
      // For clients, use the partner's tenant
      userTenantId = requestingUserRole.tenant_id;
    }

    // Create user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: role,
        tenant_id: userTenantId,
      });

    if (roleError) {
      console.error('Error creating user role:', roleError);
      // Clean up created user if role creation fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw roleError;
    }

    // If creating a client, also create client record
    if (role === 'client_user' && clientData && userTenantId) {
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          email: email,
          phone: clientData.phone,
          address: clientData.address,
          type: clientData.type,
          tenant_id: userTenantId,
        });

      if (clientError) {
        console.error('Error creating client record:', clientError);
        // Clean up created user if client creation fails
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        throw clientError;
      }
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: requestingUser.id,
      tenant_id: userTenantId,
      action: 'CREATE_USER',
      resource_type: 'user',
      resource_id: userData.user.id,
      metadata: {
        created_user_email: email,
        created_user_role: role,
        created_user_name: fullName,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: userData.user,
        password: userPassword,
        message: 'Usuário criado com sucesso',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        success: false 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

function generateRandomPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

serve(handler);