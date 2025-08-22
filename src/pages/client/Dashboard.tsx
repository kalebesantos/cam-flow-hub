import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Camera, AlertTriangle, Shield, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientDashboard = () => {
  const { signOut } = useAuth();
  const { 
    cameras, 
    alerts, 
    loading, 
    error, 
    fetchClientData 
  } = useSupabaseData();

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  const stats = [
    {
      title: "Câmeras Totais",
      value: cameras?.length || 0,
      icon: Camera,
      color: "text-security-primary"
    },
    {
      title: "Câmeras Online",
      value: cameras?.filter(c => c.status === 'online').length || 0,
      icon: Shield,
      color: "text-security-success"
    },
    {
      title: "Gravando",
      value: cameras?.filter(c => c.is_recording).length || 0,
      icon: Activity,
      color: "text-security-accent"
    },
    {
      title: "Alertas Ativos",
      value: alerts?.filter(a => !a.is_acknowledged).length || 0,
      icon: AlertTriangle,
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
            <Button onClick={() => fetchClientData()} variant="outline">
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
                <h1 className="text-2xl font-bold">Meu Painel</h1>
                <p className="text-muted-foreground">Monitoramento das suas câmeras</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-security-success text-white">
                Cliente
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

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/client/live">
            <Card className="hover:shadow-security transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Camera className="h-12 w-12 text-security-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Visualização ao Vivo</h3>
                <p className="text-muted-foreground">Acompanhe suas câmeras em tempo real</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/client/recordings">
            <Card className="hover:shadow-security transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Activity className="h-12 w-12 text-security-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gravações</h3>
                <p className="text-muted-foreground">Acesse o histórico de gravações</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/client/alerts">
            <Card className="hover:shadow-security transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-security-warning mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Alertas</h3>
                <p className="text-muted-foreground">Gerencie seus alertas de segurança</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Cameras Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Câmeras</CardTitle>
            <CardDescription>Status das câmeras instaladas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cameras?.map((camera) => (
                <Card key={camera.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{camera.name}</h4>
                      <Badge 
                        variant={camera.status === 'online' ? 'default' : 'secondary'}
                        className={
                          camera.status === 'online' 
                            ? 'bg-security-success text-white' 
                            : ''
                        }
                      >
                        {camera.status === 'online' ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{camera.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {camera.is_recording ? 'Gravando' : 'Parado'}
                      </span>
                      <Link to={`/client/camera/${camera.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {(!cameras || cameras.length === 0) && (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma câmera encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        {alerts && alerts.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Alertas Recentes</CardTitle>
              <CardDescription>Últimos alertas de segurança</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
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
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;