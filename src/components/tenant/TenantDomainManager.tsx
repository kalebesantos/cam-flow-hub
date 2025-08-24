import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { Globe, Plus, ExternalLink } from 'lucide-react';

interface Domain {
  id: string;
  domain: string;
  subdomain: string;
  is_primary: boolean;
  ssl_enabled: boolean;
  is_active: boolean;
}

export const TenantDomainManager = () => {
  const { getUserTenant } = usePermissions();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const tenantId = getUserTenant();
      if (!tenantId) return;

      const { data, error } = await supabase
        .from('tenant_domains')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setDomains(data || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast.error('Erro ao carregar domínios');
    } finally {
      setLoading(false);
    }
  };

  const addDomain = async () => {
    if (!newDomain.trim()) return;

    setAdding(true);
    try {
      const tenantId = getUserTenant();
      if (!tenantId) {
        toast.error('Tenant não encontrado');
        return;
      }

      const { error } = await supabase
        .from('tenant_domains')
        .insert({
          tenant_id: tenantId,
          domain: newDomain,
          subdomain: newDomain,
          is_primary: domains.length === 0,
          is_active: true
        });

      if (error) throw error;

      toast.success('Domínio adicionado com sucesso!');
      setNewDomain('');
      fetchDomains();
    } catch (error: any) {
      console.error('Error adding domain:', error);
      toast.error(error.message || 'Erro ao adicionar domínio');
    } finally {
      setAdding(false);
    }
  };

  const setPrimary = async (domainId: string) => {
    try {
      const tenantId = getUserTenant();
      if (!tenantId) return;

      // First, set all domains as non-primary
      await supabase
        .from('tenant_domains')
        .update({ is_primary: false })
        .eq('tenant_id', tenantId);

      // Then set the selected domain as primary
      const { error } = await supabase
        .from('tenant_domains')
        .update({ is_primary: true })
        .eq('id', domainId);

      if (error) throw error;

      toast.success('Domínio principal atualizado!');
      fetchDomains();
    } catch (error) {
      console.error('Error setting primary domain:', error);
      toast.error('Erro ao definir domínio principal');
    }
  };

  const toggleActive = async (domainId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('tenant_domains')
        .update({ is_active: !isActive })
        .eq('id', domainId);

      if (error) throw error;

      toast.success(`Domínio ${!isActive ? 'ativado' : 'desativado'} com sucesso!`);
      fetchDomains();
    } catch (error) {
      console.error('Error toggling domain:', error);
      toast.error('Erro ao alterar status do domínio');
    }
  };

  if (loading) {
    return <div>Carregando domínios...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Gerenciamento de Domínios
        </CardTitle>
        <CardDescription>
          Gerencie os domínios e subdomínios da sua plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="new-domain">Novo Domínio/Subdomínio</Label>
            <Input
              id="new-domain"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="meudominio.com ou subdominio"
            />
          </div>
          <Button 
            onClick={addDomain} 
            disabled={adding || !newDomain.trim()}
            className="mt-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            {adding ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Domínios Configurados</h4>
          {domains.length === 0 ? (
            <p className="text-muted-foreground">Nenhum domínio configurado ainda.</p>
          ) : (
            domains.map((domain) => (
              <div key={domain.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {domain.domain}
                      <ExternalLink className="w-4 h-4" />
                      {domain.is_primary && (
                        <Badge variant="default">Principal</Badge>
                      )}
                      {!domain.is_active && (
                        <Badge variant="destructive">Inativo</Badge>
                      )}
                      {domain.ssl_enabled && (
                        <Badge variant="secondary">SSL</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Subdomínio: {domain.subdomain}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!domain.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPrimary(domain.id)}
                    >
                      Definir como Principal
                    </Button>
                  )}
                  <Button
                    variant={domain.is_active ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleActive(domain.id, domain.is_active)}
                  >
                    {domain.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h5 className="font-medium mb-2">Configuração DNS</h5>
          <p className="text-sm text-muted-foreground">
            Para que seus domínios personalizados funcionem, você precisa configurar os seguintes registros DNS:
          </p>
          <div className="mt-2 space-y-1 text-sm font-mono">
            <div>Tipo: A</div>
            <div>Nome: @ (ou seu domínio)</div>
            <div>Valor: [IP_DA_PLATAFORMA]</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};