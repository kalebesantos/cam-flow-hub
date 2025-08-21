import { Shield, Users, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoleSelectorProps {
  onRoleSelect: (role: 'super-admin' | 'partner' | 'client') => void;
}

const RoleSelector = ({ onRoleSelect }: RoleSelectorProps) => {
  const roles = [
    {
      id: 'super-admin' as const,
      title: 'Super Admin',
      description: 'Gerencia parceiros, licenças e toda a plataforma',
      icon: Shield,
      color: 'text-security-primary',
      features: ['Gestão de Parceiros', 'Controle de Licenças', 'Autorização de IPs', 'Auditoria Global']
    },
    {
      id: 'partner' as const,
      title: 'Parceiro',
      description: 'Empresa de segurança com painel próprio',
      icon: Users,
      color: 'text-security-accent',
      features: ['Painel Exclusivo', 'Gestão de Clientes', 'APIs de Câmeras', 'Conformidade LGPD']
    },
    {
      id: 'client' as const,
      title: 'Cliente Final',
      description: 'Monitoramento de câmeras e alertas',
      icon: Eye,
      color: 'text-security-success',
      features: ['Visualização ao Vivo', 'Gravações', 'Alertas IA', 'Multi-dispositivo']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Sistema de Monitoramento
            <span className="bg-gradient-primary bg-clip-text text-transparent ml-2">
              Multi-Tenant
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Plataforma whitelabel para empresas de segurança
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card 
                key={role.id}
                className="relative overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:scale-105 cursor-pointer group"
                onClick={() => onRoleSelect(role.id)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-muted/50 to-muted/80 flex items-center justify-center mb-4 group-hover:from-security-primary/10 group-hover:to-security-primary/20 transition-colors`}>
                    <Icon className={`w-6 h-6 ${role.color}`} />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {role.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-security-primary mr-3" />
                      {feature}
                    </div>
                  ))}
                  
                  <Button className="w-full mt-6 bg-gradient-primary hover:opacity-90 transition-opacity">
                    Acessar Dashboard
                  </Button>
                </CardContent>
                
                <div className="absolute inset-0 bg-gradient-to-r from-security-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;