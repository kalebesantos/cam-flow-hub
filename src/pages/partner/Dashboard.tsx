import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { ArrowLeft, Users, Camera, AlertTriangle, TrendingUp, Plus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const PartnerDashboard = () => {
  const { signOut } = useAuth();
  const { getUserTenant } = usePermissions();
  const { 
    clients, 
    cameras, 
    alerts, 
    tenantStats, 
    loading, 
    error, 
    fetchPartnerData 
  } = useSupabaseData();

  const tenantId = getUserTenant();

  useEffect(() => {
    if (tenantId) {
      fetchPartnerData();
    }
  }, [tenantId, fetchPartnerData]);

  const stats = [
    {
      title: "Clientes Ativos",
      value: clients?.filter(c => c.status === 'active').length || 0,
      icon: Users,
      color: "text-security-primary"
    },
    {
      title: "Câmeras Online",
      value: cameras?.filter(c => c.status === 'online').length || 0,
      icon: Camera,
      color: "text-security-success"
    },
    {
      title: "Alertas Ativos",
      value: alerts?.filter(a => !a.is_acknowledged).length || 0,
      icon: AlertTriangle,
      color: "text-security-warning"
    },
    {
      title: "Receita Mensal",
      value: tenantStats?.[0]?.monthly_revenue || 0,
      icon: TrendingUp,
      color: "text-security-accent",
      format: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`
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
            <Button onClick={() => fetchPartnerData()} variant="outline">
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
                <h1 className="text-2xl font-bold">Painel do Parceiro</h1>
                <p className="text-muted-foreground">Gerenciar clientes e câmeras</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-security-accent text-white">
                Parceiro
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
                    <p className="text-3xl font-bold">
                      {stat.format ? stat.format(stat.value) : stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/partner/clients">
            <Card className="hover:shadow-security transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-security-primary mx-auto mb-2" />
                <h3 className="font-semibold">Gerenciar Clientes</h3>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/partner/cameras">
            <Card className="hover:shadow-security transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Camera className="h-8 w-8 text-security-success mx-auto mb-2" />
                <h3 className="font-semibold">Câmeras</h3>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/partner/alerts">
            <Card className="hover:shadow-security transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-security-warning mx-auto mb-2" />
                <h3 className="font-semibold">Alertas</h3>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/partner/settings">
            <Card className="hover:shadow-security transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Settings className="h-8 w-8 text-security-accent mx-auto mb-2" />
                <h3 className="font-semibold">Configurações</h3>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Clients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Clientes Recentes</CardTitle>
                <CardDescription>Últimos clientes cadastrados</CardDescription>
              </div>
              <Link to="/partner/clients/new">
                <Button variant="security" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients?.slice(0, 3).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {client.type === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                      </p>
                    </div>
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas Recentes</CardTitle>
              <CardDescription>Últimos alertas do sistema</CardDescription>
            </CardHeader>
            <CardContent>
          <div className="space-y-4">
            {alerts?.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{alert.message}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(alert.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Badge 
                  variant={
                    alert.severity === 'high' ? 'destructive' : 
                    alert.severity === 'medium' ? 'default' : 'secondary'
                  }
                >
                  {alert.severity === 'high' ? 'Alta' : 
                   alert.severity === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
              </div>
            ))}
            
            {(!alerts || alerts.length === 0) && (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm">Nenhum alerta recente</p>
              </div>
            )}
          </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PartnerDashboard;