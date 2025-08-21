import { ArrowLeft, Camera, Play, Download, Bell, Smartphone, Monitor, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClientDashboardProps {
  onBack: () => void;
}

const ClientDashboard = ({ onBack }: ClientDashboardProps) => {
  const cameras = [
    { name: "Entrada Principal", location: "Portaria", status: "Online", recording: true, alerts: 0 },
    { name: "Estacionamento", location: "Área Externa", status: "Online", recording: true, alerts: 2 },
    { name: "Recepção", location: "Térreo", status: "Online", recording: false, alerts: 0 },
    { name: "Corredor Salas", location: "1º Andar", status: "Offline", recording: false, alerts: 1 }
  ];

  const recentAlerts = [
    { time: "14:32", type: "Movimento", camera: "Estacionamento", severity: "Médio" },
    { time: "12:15", type: "Pessoa Detectada", camera: "Entrada Principal", severity: "Baixo" },
    { time: "10:47", type: "Intrusão", camera: "Corredor Salas", severity: "Alto" },
    { time: "09:23", type: "Movimento", camera: "Recepção", severity: "Baixo" }
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
              <h1 className="text-3xl font-bold text-foreground">Monitoramento ao Vivo</h1>
              <p className="text-muted-foreground">Loja Central Shopping - Visualização e alertas</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="default" className="bg-security-success text-white">
              <Shield className="w-4 h-4 mr-1" />
              Protegido
            </Badge>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Monitor className="w-4 h-4" />
              <Smartphone className="w-4 h-4" />
              <span>Multi-dispositivo</span>
            </div>
          </div>
        </div>

        {/* Camera Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-security-primary" />
                    Câmeras ao Vivo
                  </div>
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Ver Todas
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cameras.map((camera, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-security-primary/50 transition-colors cursor-pointer">
                        <div className="text-center">
                          <Camera className={`w-8 h-8 mx-auto mb-2 ${camera.status === 'Online' ? 'text-security-success' : 'text-muted-foreground'}`} />
                          <p className="text-sm font-medium text-foreground">{camera.name}</p>
                          <p className="text-xs text-muted-foreground">{camera.location}</p>
                        </div>
                        
                        {/* Status indicators */}
                        <div className="absolute top-2 left-2 flex space-x-2">
                          <Badge variant={camera.status === 'Online' ? 'default' : 'destructive'} className="text-xs">
                            {camera.status}
                          </Badge>
                          {camera.recording && (
                            <Badge variant="secondary" className="text-xs bg-security-danger text-white">
                              ● REC
                            </Badge>
                          )}
                        </div>
                        
                        {/* Alert badge */}
                        {camera.alerts > 0 && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="destructive" className="text-xs">
                              {camera.alerts} alertas
                            </Badge>
                          </div>
                        )}
                        
                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                          <Play className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-security-warning" />
                  Alertas Recentes
                </CardTitle>
                <CardDescription>
                  Detecções de IA em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={alert.severity === 'Alto' ? 'destructive' : alert.severity === 'Médio' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{alert.time}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{alert.type}</p>
                        <p className="text-xs text-muted-foreground">{alert.camera}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button className="bg-gradient-primary">
            <Download className="w-4 h-4 mr-2" />
            Baixar Gravações
          </Button>
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Configurar Alertas
          </Button>
          <Button variant="outline">
            <Camera className="w-4 h-4 mr-2" />
            Visualização Completa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;