// src/pages/admin/partners/new.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseData } from '@/hooks/useSupabase';

const AdminPartnersNew = () => {
  const { fetchSuperAdminData, createTenant } = useSupabaseData();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<'basic' | 'premium' | 'enterprise'>('basic');
  const [status, setStatus] = useState<'active' | 'suspended' | 'inactive'>('active');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await createTenant({ name, email, plan, status });
      await fetchSuperAdminData();
      navigate('/admin/partners');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar parceiro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Novo Parceiro</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Parceiro</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do parceiro"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email do parceiro"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Plano</label>
              <Select value={plan} onValueChange={(value) => setPlan(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPartnersNew;
