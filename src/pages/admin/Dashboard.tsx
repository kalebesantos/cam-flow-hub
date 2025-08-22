import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Users, Shield, Globe, Activity, Plus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const { 
    tenants, 
    licenses, 
    ipAuthorizations, 
    sessions, 
    loading, 
    error, 
    fetchSuperAdminData 
  } = useSupabaseData();

  useEffect(() => {
    fetchSuperAdminData();
  }, [fetchSuperAdminData]);

  // Super Admin Data
  const stats = [
    {
      title: "Parceiros Ativos",
      value: tenants?.filter(t => t.status === 'active').length || 0,
      icon: Users,
      color: "text-security-primary"
    },
    {
      title: "Licenças Emitidas",
      value: licenses?.length || 0,
      icon: Shield,
      color: "text-security-accent"
    },
    {
      title: "IPs Autorizados",
      value: ipAuthorizations?.filter(ip => ip.is_active).length || 0,
      icon: Globe,
      color: "text-security-success"
    },
    {
      title: "Sessões Ativas",
      value: sessions?.filter(s => s.is_active).length || 0,
      icon: Activity,
      color: "text-security-warning"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-security-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Erro ao carregar dados</p>
            <Button onClick={fetchSuperAdminData} variant="outline">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Painel Super Admin</h1>
                <p className="text-muted-foreground">Gerenciar toda a plataforma</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-security-primary text-white">
                Super Administrador
              </Badge>
              <Button variant="outline" onClick={signOut}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/partners">
            <Card className="hover:shadow-security transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-security-primary mx-auto mb-2" />
                <h3 className="font-semibold">Gerenciar Parceiros</h3>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/licenses">
            <Card className="hover:shadow-security transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-security-accent mx-auto mb-2" />
                <h3 className="font-semibold">Licenças</h3>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/ip-authorizations">
            <Card className="hover:shadow-security transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Globe className="h-8 w-8 text-security-success mx-auto mb-2" />
                <h3 className="font-semibold">IPs Autorizados</h3>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/settings">
            <Card className="hover:shadow-security transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Settings className="h-8 w-8 text-security-warning mx-auto mb-2" />
                <h3 className="font-semibold">Configurações</h3>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Partners Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Parceiros</CardTitle>
              <CardDescription>Gerenciar parceiros da plataforma</CardDescription>
            </div>
            <Link to="/admin/partners/new">
              <Button variant="security">
                <Plus className="h-4 w-4 mr-2" />
                Novo Parceiro
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenants?.slice(0, 5).map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{tenant.name}</h3>
                    <p className="text-sm text-muted-foreground">{tenant.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                      {tenant.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">
                      {tenant.plan}
                    </Badge>
                    <Link to={`/admin/partners/${tenant.id}`}>
                      <Button variant="outline" size="sm">
                        Gerenciar
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {tenants && tenants.length > 5 && (
              <div className="mt-4 text-center">
                <Link to="/admin/partners">
                  <Button variant="outline">Ver Todos os Parceiros</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;