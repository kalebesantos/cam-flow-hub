import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTenantContext } from '@/components/TenantProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

interface BrandingData {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  company_name: string;
  email_from_name: string;
  favicon_url: string;
  custom_css: string;
}

export const TenantBrandingForm = () => {
  const { branding, tenantId, updateBranding } = useTenantContext();
  const { getUserTenant } = usePermissions();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<BrandingData>({
    logo_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#1e40af',
    accent_color: '#06b6d4',
    company_name: '',
    email_from_name: '',
    favicon_url: '',
    custom_css: ''
  });

  useEffect(() => {
    if (branding) {
      setFormData({
        logo_url: branding.logo_url || '',
        primary_color: branding.primary_color || '#3b82f6',
        secondary_color: branding.secondary_color || '#1e40af',
        accent_color: branding.accent_color || '#06b6d4',
        company_name: branding.company_name || '',
        email_from_name: branding.email_from_name || '',
        favicon_url: branding.favicon_url || '',
        custom_css: branding.custom_css || ''
      });
    }
  }, [branding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentTenantId = tenantId || getUserTenant();
      if (!currentTenantId) {
        toast.error('Tenant não encontrado');
        return;
      }

      await updateBranding(currentTenantId, formData);
      toast.success('Branding atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating branding:', error);
      toast.error('Erro ao atualizar branding');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BrandingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configuração de Marca</CardTitle>
        <CardDescription>
          Personalize a aparência da sua plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nome da Empresa</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Sua Empresa Ltda"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_from_name">Nome no Email</Label>
              <Input
                id="email_from_name"
                value={formData.email_from_name}
                onChange={(e) => handleInputChange('email_from_name', e.target.value)}
                placeholder="Sua Empresa"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo_url">URL do Logo</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favicon_url">URL do Favicon</Label>
              <Input
                id="favicon_url"
                type="url"
                value={formData.favicon_url}
                onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                placeholder="https://exemplo.com/favicon.ico"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_color">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                  placeholder="#1e40af"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent_color">Cor de Destaque</Label>
              <div className="flex gap-2">
                <Input
                  id="accent_color"
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => handleInputChange('accent_color', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={formData.accent_color}
                  onChange={(e) => handleInputChange('accent_color', e.target.value)}
                  placeholder="#06b6d4"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_css">CSS Personalizado</Label>
            <Textarea
              id="custom_css"
              value={formData.custom_css}
              onChange={(e) => handleInputChange('custom_css', e.target.value)}
              placeholder="/* Adicione CSS personalizado aqui */"
              rows={8}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};