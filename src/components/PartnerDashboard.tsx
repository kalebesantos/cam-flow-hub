import { ArrowLeft, Camera, Users, AlertTriangle, TrendingUp, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useSupabaseData } from "@/hooks/useSupabase";

interface PartnerDashboardProps {
  onBack: () => void;
}

const PartnerDashboard = ({ onBack }: PartnerDashboardProps) => {
  const {
    loading,
    error,
    partnerClients,
    partnerStats,
    fetchPartnerData
  } = useSupabaseData();

  // For demo purposes, using the first tenant
  const DEMO_TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';

  useEffect(() => {
    fetchPartnerData(DEMO_TENANT_ID);
  }, []);

  const stats = [
    { title: "Clientes Ativos", value: partnerStats?.active_clients?.toString() || "0", change: "+5", icon: Users, color: "text-security-primary" },
    { title: "Câmeras Online", value: partnerStats?.online_cameras?.toString() || "0", change: "+12", icon: Camera, color: "text-security-success" },
    { title: "Alertas IA (24h)", value: partnerStats?.monthly_alerts?.toString() || "0", change: "-3", icon: AlertTriangle, color: "text-security-warning" },
    { title: "Receita Mensal", value: `R$ ${(partnerStats?.monthly_revenue || 0).toLocaleString('pt-BR')}`, change: "+8%", icon: TrendingUp, color: "text-security-accent" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-security-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Erro: {error}</p>
          <Button onClick={() => fetchPartnerData(DEMO_TENANT_ID)} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Painel do Parceiro</h1>
              <p className="text-muted-foreground">SecureMax Ltda - Dashboard exclusivo</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
            <Badge variant="default" className="bg-security-success text-white">
              Conformidade LGPD
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="transition-all duration-200 hover:shadow-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className={`text-sm ${stat.change.includes('+') || stat.change.includes('%') ? 'text-security-success' : 'text-security-danger'}`}>
                        {stat.change} este mês
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-muted/50 to-muted/80 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Clients Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-security-primary" />
                  Gestão de Clientes
                </CardTitle>
                <CardDescription>
                  Controle exclusivo dos seus clientes (dados não compartilhados)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partnerClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-foreground">{client.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {client.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {client.email || 'Sem email'} • {client.phone || 'Sem telefone'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={client.plan === "premium" || client.plan === "enterprise" ? "default" : "secondary"}>
                          {client.plan === "premium" ? "Premium" : client.plan === "enterprise" ? "Empresarial" : "Básico"}
                        </Badge>
                        <Badge variant={client.status === "active" ? "default" : "destructive"}>
                          {client.status === "active" ? "Ativo" : client.status === "suspended" ? "Suspenso" : "Inativo"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">APIs Conectadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Câmeras</span>
                  <Badge variant="default" className="bg-security-success">Ativa</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API IA Analytics</span>
                  <Badge variant="default" className="bg-security-success">Ativa</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage REC</span>
                  <Badge variant="default" className="bg-security-success">Ativa</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conformidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Separação de Dados</span>
                  <Badge variant="default" className="bg-security-success">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auditoria LGPD</span>
                  <Badge variant="default" className="bg-security-success">✓</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Logs de Acesso</span>
                  <Badge variant="default" className="bg-security-success">✓</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;