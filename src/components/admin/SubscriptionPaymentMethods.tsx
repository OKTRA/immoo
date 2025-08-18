import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit3, Phone, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { createSubscriptionPaymentMethod, deleteSubscriptionPaymentMethod, listSubscriptionPaymentMethods, SubscriptionPaymentMethod, updateSubscriptionPaymentMethod } from '@/services/subscription/paymentMethodService';
import { supabase } from '@/lib/supabase';

export default function SubscriptionPaymentMethods() {
  const [methods, setMethods] = useState<SubscriptionPaymentMethod[]>([]);
  const [plans, setPlans] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPaymentMethod | null>(null);

  const [form, setForm] = useState({
    provider: '',
    phone_numbers: [''] as string[],
    display_order: 0,
    applicable_plans: [] as string[],
    is_active: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [m] = await Promise.all([
          listSubscriptionPaymentMethods(),
        ]);
        const { data: p } = await supabase
          .from('subscription_plans')
          .select('id, name')
          .eq('is_active', true)
          .order('price', { ascending: true });
        setMethods(m);
        setPlans((p || []) as any);
      } catch (e: any) {
        toast.error(e?.message || 'Erreur chargement méthodes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ provider: '', phone_numbers: [''], display_order: 0, applicable_plans: [], is_active: true });
    setIsDialogOpen(true);
  };

  const openEdit = (m: SubscriptionPaymentMethod) => {
    setEditing(m);
    setForm({
      provider: m.provider,
      phone_numbers: [m.phone_number], // Convert single number to array for editing
      display_order: m.display_order,
      applicable_plans: (m.applicable_plans || []) as string[],
      is_active: m.is_active,
    });
    setIsDialogOpen(true);
  };

  const save = async () => {
    try {
      const validNumbers = form.phone_numbers.filter(num => num.trim().length > 0);
      if (!form.provider || validNumbers.length === 0) {
        toast.error('Fournisseur et au moins un numéro sont obligatoires');
        return;
      }

      if (editing) {
        // For editing, update the single entry
        const updated = await updateSubscriptionPaymentMethod(editing.id, {
          provider: form.provider,
          phone_number: validNumbers[0], // Use first valid number for editing
          display_order: form.display_order,
          applicable_plans: form.applicable_plans.length > 0 ? form.applicable_plans : null,
          is_active: form.is_active,
        });
        setMethods(prev => prev.map(m => (m.id === updated.id ? updated : m)));
        toast.success('Méthode mise à jour');
      } else {
        // For creating, create one entry for each number
        const createdMethods = [];
        for (let i = 0; i < validNumbers.length; i++) {
          const created = await createSubscriptionPaymentMethod({
            provider: form.provider,
            phone_number: validNumbers[i],
            display_order: form.display_order + i,
            applicable_plans: form.applicable_plans.length > 0 ? form.applicable_plans : null,
            is_active: form.is_active,
          });
          createdMethods.push(created);
        }
        setMethods(prev => [...prev, ...createdMethods]);
        toast.success(`${createdMethods.length} numéro(s) créé(s) pour ${form.provider}`);
      }
      setIsDialogOpen(false);
    } catch (e: any) {
      toast.error(e?.message || 'Erreur sauvegarde');
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteSubscriptionPaymentMethod(id);
      setMethods(prev => prev.filter(m => m.id !== id));
      toast.success('Méthode supprimée');
    } catch (e: any) {
      toast.error(e?.message || 'Erreur suppression');
    }
  };

  const addPhoneNumber = () => {
    setForm(f => ({ ...f, phone_numbers: [...f.phone_numbers, ''] }));
  };

  const removePhoneNumber = (index: number) => {
    setForm(f => ({ ...f, phone_numbers: f.phone_numbers.filter((_, i) => i !== index) }));
  };

  const updatePhoneNumber = (index: number, value: string) => {
    setForm(f => ({
      ...f,
      phone_numbers: f.phone_numbers.map((num, i) => (i === index ? value : num))
    }));
  };

  // Group methods by provider for better display
  const groupedMethods = useMemo(() => {
    const groups = new Map<string, SubscriptionPaymentMethod[]>();
    methods.forEach(method => {
      const key = method.provider;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(method);
    });
    return Array.from(groups.entries()).map(([provider, methodList]) => ({
      provider,
      methods: methodList.sort((a, b) => a.display_order - b.display_order),
      count: methodList.length
    }));
  }, [methods]);

  const planLabel = (ids?: string[] | null) => {
    if (!ids || ids.length === 0) return 'Tous les plans';
    const names = ids
      .map(id => plans.find(p => p.id === id)?.name)
      .filter(Boolean) as string[];
    return names.join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Config Paiements Mobile Money</CardTitle>
        <CardDescription>
          Gérez les numéros et fournisseurs affichés lors de l’activation des plans.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une méthode
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Numéro</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Plans</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedMethods.map((group) => 
                group.methods.map((m, index) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" /> 
                      {index === 0 ? (
                        <div className="flex items-center gap-2">
                          {m.provider}
                          {group.count > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              {group.count} numéros
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground ml-6">↳</span>
                      )}
                    </TableCell>
                    <TableCell>{m.phone_number}</TableCell>
                    <TableCell>{m.display_order}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{planLabel(m.applicable_plans as any)}</Badge>
                    </TableCell>
                    <TableCell>
                      {m.is_active ? (
                        <Badge className="bg-blue-100 text-blue-800">Actif</Badge>
                      ) : (
                        <Badge variant="secondary">Inactif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(m)}>
                        <Edit3 className="w-4 h-4 mr-1" />
                        Éditer
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => remove(m.id)}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {methods.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucune méthode configurée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier la méthode' : 'Ajouter une méthode'}</DialogTitle>
            <DialogDescription>
              Renseignez le fournisseur, les numéros (vous pouvez en ajouter plusieurs) et (optionnel) les plans concernés.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Input
                placeholder="Orange Money, Moov, Wave..."
                value={form.provider}
                onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Numéros</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addPhoneNumber}
                  className="h-8 px-2"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-2">
                {form.phone_numbers.map((number, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Ex: +223 70 00 00 00"
                      value={number}
                      onChange={(e) => updatePhoneNumber(index, e.target.value)}
                      className="flex-1"
                    />
                    {form.phone_numbers.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePhoneNumber(index)}
                        className="h-10 w-10 p-0 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ordre</Label>
              <Input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value || 0) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Plans concernés (optionnel)</Label>
              <Select
                onValueChange={(val) => {
                  setForm((f) => ({ ...f, applicable_plans: Array.from(new Set([...(f.applicable_plans || []), val])) }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un plan à ajouter" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.applicable_plans && form.applicable_plans.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {form.applicable_plans.map((id) => (
                    <Badge key={id} variant="outline" className="cursor-pointer" onClick={() => setForm((f) => ({ ...f, applicable_plans: (f.applicable_plans || []).filter(x => x !== id) }))}>
                      {plans.find(p => p.id === id)?.name || id} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={save}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}


