import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md text-center shadow-security">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Acesso Negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Entre em contato com o administrador se você acredita que deveria ter acesso a esta área.
          </p>
          
          <div className="flex flex-col gap-2">
            <Link to="/">
              <Button variant="security" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
            
            <Link to="/auth/login">
              <Button variant="outline" className="w-full">
                Fazer Login com Outra Conta
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;