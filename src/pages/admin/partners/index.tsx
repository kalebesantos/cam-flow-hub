// src/pages/admin/partners/index.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData, Tenant } from '@/hooks/useSupabase';
import { Plus, Edit, Trash } from 'lucide-react';

const AdminPartners = () => {
  const { tenants, fetchSuperAdminData, deleteTenant, loading } = useSupabaseData();
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchSuperAdminData();
  }, [fetchSuperAdminData]);

  const handleDelete = async (tenantId: string) => {
    if (!confirm('Tem certeza que deseja deletar este parceiro?')) return;
    setDeleting(tenantId);
    try {
      await deleteTenant(tenantId);
      await fetchSuperAdminData();
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar parceiro');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Parceiros</h1>
        <Link to="/admin/partners/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Parceiro
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants?.map((tenant: Tenant) => (
          <Card key={tenant.id}>
            <CardHeader>
              <CardTitle>{tenant.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">Email: {tenant.email}</p>
              <p className="text-sm text-muted-foreground mb-1">Plano: {tenant.plan}</p>
              <p className="text-sm text-muted-foreground mb-2">
                Status: 
                <Badge
                  variant={tenant.status === 'active' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {tenant.status === 'active' ? 'Ativo' : tenant.status === 'suspended' ? 'Suspenso' : 'Inativo'}
                </Badge>
              </p>

              <div className="flex gap-2">
                <Link to={`/admin/partners/edit/${tenant.id}`}>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(tenant.id)}
                  disabled={deleting === tenant.id || loading}
                >
                  <Trash className="h-4 w-4 mr-1" /> {deleting === tenant.id ? 'Deletando...' : 'Deletar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {tenants.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center">
            Nenhum parceiro cadastrado.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminPartners;
