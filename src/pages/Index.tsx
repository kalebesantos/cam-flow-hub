
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Camera, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();
  const { getPrimaryRole, loading: permissionsLoading } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !permissionsLoading && user) {
      const primaryRole = getPrimaryRole();
      console.log("[Index] redirect check -> user:", !!user, "role:", primaryRole);

      if (primaryRole === 'super_admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (primaryRole === 'partner_admin') {
        navigate('/partner/dashboard', { replace: true });
      } else if (primaryRole === 'client_user') {
        navigate('/client/dashboard', { replace: true });
      } else {
        // Sem role definida: envia para unauthorized para não travar na Home
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [user, loading, permissionsLoading, getPrimaryRole, navigate]);

  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-security-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show landing page
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-security-primary" />
                <h1 className="text-2xl font-bold">Sistema de Monitoramento</h1>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/auth/login">
                  <Button variant="outline">Entrar</Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="security">Criar Conta</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Plataforma Multi-Tenant de Segurança</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sistema completo de monitoramento de câmeras com arquitetura multi-tenant, 
              IA avançada e conformidade LGPD para empresas de segurança.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center shadow-card-hover">
              <CardHeader>
                <Shield className="h-12 w-12 text-security-primary mx-auto mb-4" />
                <CardTitle>Super Admin</CardTitle>
                <CardDescription>
                  Gerenciamento completo da plataforma e parceiros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Gestão de parceiros</li>
                  <li>• Controle de licenças</li>
                  <li>• Monitoramento global</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card-hover">
              <CardHeader>
                <Users className="h-12 w-12 text-security-accent mx-auto mb-4" />
                <CardTitle>Parceiro</CardTitle>
                <CardDescription>
                  Gerenciamento de clientes e equipamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Gestão de clientes</li>
                  <li>• Controle de câmeras</li>
                  <li>• Dashboard personalizado</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card-hover">
              <CardHeader>
                <Camera className="h-12 w-12 text-security-success mx-auto mb-4" />
                <CardTitle>Cliente</CardTitle>
                <CardDescription>
                  Monitoramento em tempo real das câmeras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Visualização ao vivo</li>
                  <li>• Histórico de gravações</li>
                  <li>• Alertas de segurança</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/auth/register">
              <Button variant="security" size="lg" className="text-lg px-8 py-3">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Fallback - deve sair rápido com o useEffect acima
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">Redirecionando...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
