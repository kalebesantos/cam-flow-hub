import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building, Users, Calendar, ExternalLink, Settings } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  created_at: string;
  tenant_domains?: Array<{
    domain: string;
    subdomain: string;
    is_primary: boolean;
  }>;
  licenses?: Array<{
    max_cameras: number;
    max_cloud_storage_gb: number;
    expires_at: string;
  }>;
}

export const TenantManagement = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          tenant_domains (domain, subdomain, is_primary),
          licenses (max_cameras, max_cloud_storage_gb, expires_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Erro ao carregar tenants');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inativo</Badge>;
      case 'suspended':
        return <Badge variant="secondary">Suspenso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <Badge variant="outline">Básico</Badge>;
      case 'premium':
        return <Badge variant="secondary">Premium</Badge>;
      case 'enterprise':
        return <Badge variant="default">Enterprise</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  const getPrimaryDomain = (tenant: Tenant) => {
    const primaryDomain = tenant.tenant_domains?.find(d => d.is_primary);
    return primaryDomain ? (primaryDomain.domain || primaryDomain.subdomain) : 'N/A';
  };

  if (loading) {
    return <div>Carregando tenants...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Gerenciamento de Tenants
        </CardTitle>
        <CardDescription>
          Gerencie todos os tenants da plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Tenants</p>
                <p className="text-2xl font-bold">{tenants.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tenants Ativos</p>
                <p className="text-2xl font-bold">
                  {tenants.filter(t => t.status === 'active').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Planos Enterprise</p>
                <p className="text-2xl font-bold">
                  {tenants.filter(t => t.plan === 'enterprise').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Domínio</TableHead>
              <TableHead>Licença</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell>{tenant.email}</TableCell>
                <TableCell>{getPlanBadge(tenant.plan)}</TableCell>
                <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getPrimaryDomain(tenant)}
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell>
                  {tenant.licenses && tenant.licenses.length > 0 ? (
                    <div className="text-sm">
                      <div>{tenant.licenses[0].max_cameras} câmeras</div>
                      <div>{tenant.licenses[0].max_cloud_storage_gb}GB storage</div>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // TODO: Implementar configurações do tenant
                      toast.info('Configurações do tenant em desenvolvimento');
                    }}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {tenants.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum tenant encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};