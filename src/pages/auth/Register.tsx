import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-security">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Registro Restrito</CardTitle>
          <CardDescription>
            Apenas administradores podem criar novas contas
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-security-warning" />
          </div>
          <p className="text-muted-foreground mb-6">
            Este sistema possui registro restrito. Novas contas são criadas apenas através dos painéis administrativos pelos Super Admins e Parceiros.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Se você já possui uma conta, faça login abaixo:
            </p>
            <Link to="/auth/login">
              <Button variant="security" className="w-full">
                Fazer Login
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;