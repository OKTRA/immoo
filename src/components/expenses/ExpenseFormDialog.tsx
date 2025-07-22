import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CreateExpenseData, UpdateExpenseData, ExpenseCategory } from '@/types/expenses';
import { getExpenseById } from '@/services/expenses/expenseService';
import { Property } from '@/assets/types';

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseId?: string;
  onSubmit: (data: CreateExpenseData | UpdateExpenseData) => void;
  properties: Property[];
  categories: ExpenseCategory[];
  isLoading: boolean;
}

export default function ExpenseFormDialog({
  open,
  onOpenChange,
  expenseId,
  onSubmit,
  properties,
  categories,
  isLoading
}: ExpenseFormDialogProps) {
  const [formData, setFormData] = useState<CreateExpenseData>({
    property_id: '',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    vendor_name: '',
    vendor_contact: '',
    payment_method: '',
    priority: 'medium', // valeur par défaut corrigée
    recurring: false,
    recurring_frequency: 'monthly',
    next_due_date: '',
    notes: '',
    tags: []
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>();
  const [tagInput, setTagInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // Récupérer les données de la dépense si on est en mode édition
  const { data: expenseData, isLoading: isLoadingExpense } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => getExpenseById(expenseId!),
    enabled: !!expenseId && open,
    refetchOnWindowFocus: false
  });

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (expenseData?.data && expenseId) {
      const expense = expenseData.data;
      setFormData({
        property_id: expense.property_id,
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
        description: expense.description || '',
        vendor_name: expense.vendor_name || '',
        vendor_contact: expense.vendor_contact || '',
        payment_method: expense.payment_method || '',
        priority: expense.priority || 'medium', // valeur par défaut corrigée
        recurring: expense.recurring,
        recurring_frequency: expense.recurring_frequency || 'monthly',
        next_due_date: expense.next_due_date || '',
        notes: expense.notes || '',
        tags: expense.tags || []
      });
      setSelectedDate(new Date(expense.date));
      if (expense.next_due_date) {
        setNextDueDate(new Date(expense.next_due_date));
      }
    } else if (!expenseId) {
      // Reset form for new expense
      setFormData({
        property_id: '',
        category: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        vendor_name: '',
        vendor_contact: '',
        payment_method: '',
        priority: 'medium', // valeur par défaut corrigée
        recurring: false,
        recurring_frequency: 'monthly',
        next_due_date: '',
        notes: '',
        tags: []
      });
      setSelectedDate(new Date());
      setNextDueDate(undefined);
      setAttachments([]);
    }
  }, [expenseData, expenseId, open]);

  const handleInputChange = (field: keyof CreateExpenseData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      handleInputChange('date', date.toISOString().split('T')[0]);
    }
  };

  const handleNextDueDateChange = (date: Date | undefined) => {
    setNextDueDate(date);
    if (date) {
      handleInputChange('next_due_date', date.toISOString().split('T')[0]);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.property_id || !formData.category || formData.amount <= 0) {
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      property_id: '',
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      vendor_name: '',
      vendor_contact: '',
      payment_method: '',
      priority: 'medium', // valeur par défaut corrigée
      recurring: false,
      recurring_frequency: 'monthly',
      next_due_date: '',
      notes: '',
      tags: []
    });
    setSelectedDate(new Date());
    setNextDueDate(undefined);
    setAttachments([]);
    setTagInput('');
  };

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'cash', label: 'Espèces' },
    { value: 'check', label: 'Chèque' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'credit_card', label: 'Carte de crédit' },
    { value: 'other', label: 'Autre' }
  ];

  const priorities = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Élevée' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const recurringFrequencies = [
    { value: 'monthly', label: 'Mensuel' },
    { value: 'quarterly', label: 'Trimestriel' },
    { value: 'yearly', label: 'Annuel' },
    { value: 'custom', label: 'Personnalisé' }
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {expenseId ? 'Modifier la dépense' : 'Nouvelle dépense'}
          </DialogTitle>
          <DialogDescription>
            {expenseId 
              ? 'Modifiez les informations de la dépense'
              : 'Ajoutez une nouvelle dépense pour une propriété'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Propriété et catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property">Propriété *</Label>
              <Select
                value={formData.property_id}
                onValueChange={(value) => handleInputChange('property_id', value)}
                disabled={isLoadingExpense}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une propriété" />
                </SelectTrigger>
                              <SelectContent>
                {Array.isArray(properties) && properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                disabled={isLoadingExpense}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Montant et date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (FCFA) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="100"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                disabled={isLoadingExpense}
              />
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                    disabled={isLoadingExpense}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description de la dépense..."
              rows={3}
              disabled={isLoadingExpense}
            />
          </div>

          {/* Fournisseur et contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Fournisseur</Label>
              <Input
                id="vendor"
                value={formData.vendor_name}
                onChange={(e) => handleInputChange('vendor_name', e.target.value)}
                placeholder="Nom du fournisseur"
                disabled={isLoadingExpense}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact fournisseur</Label>
              <Input
                id="contact"
                value={formData.vendor_contact}
                onChange={(e) => handleInputChange('vendor_contact', e.target.value)}
                placeholder="Téléphone ou email"
                disabled={isLoadingExpense}
              />
            </div>
          </div>

          {/* Méthode de paiement et priorité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Méthode de paiement</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleInputChange('payment_method', value)}
                disabled={isLoadingExpense}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
                disabled={isLoadingExpense}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une priorité" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dépense récurrente */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.recurring}
                onCheckedChange={(checked) => handleInputChange('recurring', checked)}
                disabled={isLoadingExpense}
              />
              <Label htmlFor="recurring">Dépense récurrente</Label>
            </div>

            {formData.recurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Fréquence</Label>
                  <Select
                    value={formData.recurring_frequency}
                    onValueChange={(value) => handleInputChange('recurring_frequency', value)}
                    disabled={isLoadingExpense}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      {recurringFrequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prochaine échéance</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !nextDueDate && "text-muted-foreground"
                        )}
                        disabled={isLoadingExpense}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextDueDate ? format(nextDueDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={nextDueDate}
                        onSelect={handleNextDueDateChange}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Ajouter un tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                disabled={isLoadingExpense}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || isLoadingExpense}
              >
                Ajouter
              </Button>
            </div>
          </div>

          {/* Pièces jointes */}
          <div className="space-y-2">
            <Label>Pièces jointes</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2">
                <Upload className="h-5 w-5 text-gray-400" />
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoadingExpense}
                />
                <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                  Télécharger des fichiers
                </label>
              </div>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notes supplémentaires..."
              rows={3}
              disabled={isLoadingExpense}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.property_id || !formData.category || formData.amount <= 0}
            >
              {isLoading ? 'Enregistrement...' : (expenseId ? 'Mettre à jour' : 'Créer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 