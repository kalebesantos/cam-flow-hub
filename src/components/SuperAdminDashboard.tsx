import { ArrowLeft, Building2, Key, Shield, Globe, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SuperAdminDashboardProps {
  onBack: () => void;
}

const SuperAdminDashboard = ({ onBack }: SuperAdminDashboardProps) => {
  const stats = [
    { title: "Parceiros Ativos", value: "24", change: "+3", icon: Building2, color: "text-security-primary" },
    { title: "Licenças Emitidas", value: "1,247", change: "+127", icon: Key, color: "text-security-accent" },
    { title: "IPs Autorizados", value: "156", change: "+12", icon: Globe, color: "text-security-success" },
    { title: "Sessões Ativas", value: "89", change: "-5", icon: Activity, color: "text-security-warning" }
  ];

  const partners = [
    { name: "SecureMax Ltda", clients: 45, cameras: 234, status: "Ativo", plan: "Premium" },
    { name: "VigiTech Solutions", clients: 32, cameras: 178, status: "Ativo", plan: "Empresarial" },
    { name: "Safety Guard Corp", clients: 28, cameras: 156, status: "Suspenso", plan: "Básico" },
    { name: "ProSecurity Brasil", clients: 67, cameras: 389, status: "Ativo", plan: "Premium" }
  ];

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
              <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
              <p className="text-muted-foreground">Controle total da plataforma multi-tenant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-security-primary" />
            <span className="font-medium">Admin Master</span>
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
                      <p className={`text-sm ${stat.change.startsWith('+') ? 'text-security-success' : 'text-security-danger'}`}>
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

        {/* Partners Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-security-primary" />
              Gestão de Parceiros
            </CardTitle>
            <CardDescription>
              Controle de empresas parceiras e suas licenças
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {partners.map((partner, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{partner.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {partner.clients} clientes • {partner.cameras} câmeras
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={partner.plan === "Premium" ? "default" : "secondary"}>
                      {partner.plan}
                    </Badge>
                    <Badge variant={partner.status === "Ativo" ? "default" : "destructive"}>
                      {partner.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Gerenciar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;