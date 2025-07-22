import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  X, 
  CalendarIcon, 
  DollarSign, 
  Tag, 
  Building,
  User,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ExpenseFilters, ExpenseCategory } from '@/types/expenses';
import { Property } from '@/assets/types';

interface ExpenseFiltersPanelProps {
  filters: ExpenseFilters;
  onUpdateFilters: (filters: Partial<ExpenseFilters>) => void;
  onResetFilters: () => void;
  properties: Property[];
  categories: ExpenseCategory[];
}

export default function ExpenseFiltersPanel({
  filters,
  onUpdateFilters,
  onResetFilters,
  properties,
  categories
}: ExpenseFiltersPanelProps) {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.date_from ? new Date(filters.date_from) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.date_to ? new Date(filters.date_to) : undefined
  );

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    onUpdateFilters({ 
      date_from: date ? date.toISOString().split('T')[0] : undefined 
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    onUpdateFilters({ 
      date_to: date ? date.toISOString().split('T')[0] : undefined 
    });
  };

  const handleReset = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    onResetFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.property_id) count++;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.date_from) count++;
    if (filters.date_to) count++;
    if (filters.amount_min) count++;
    if (filters.amount_max) count++;
    if (filters.recurring !== undefined) count++;
    if (filters.vendor_name) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    return count;
  };

  const statusOptions = [
    { value: 'pending', label: 'En attente' },
    { value: 'approved', label: 'Approuvée' },
    { value: 'paid', label: 'Payée' },
    { value: 'rejected', label: 'Rejetée' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Faible' },
    { value: 'normal', label: 'Normale' },
    { value: 'high', label: 'Élevée' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="border-2 border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} actif(s)
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Propriété et catégorie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <Building className="h-4 w-4" />
              <span>Propriété</span>
            </Label>
            <Select
              value={filters.property_id || ''}
              onValueChange={(value) => onUpdateFilters({ 
                property_id: value || undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les propriétés" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les propriétés</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <Tag className="h-4 w-4" />
              <span>Catégorie</span>
            </Label>
            <Select
              value={filters.category || ''}
              onValueChange={(value) => onUpdateFilters({ 
                category: value || undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
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

        <Separator />

        {/* Statut et priorité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => onUpdateFilters({ 
                status: value || undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priorité</Label>
            <Select
              value={filters.priority || ''}
              onValueChange={(value) => onUpdateFilters({ 
                priority: value || undefined 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les priorités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les priorités</SelectItem>
                {priorityOptions.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Dates */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-1">
            <CalendarIcon className="h-4 w-4" />
            <span>Période</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Du</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={handleDateFromChange}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Au</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={handleDateToChange}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <Separator />

        {/* Montant */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>Montant (FCFA)</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Minimum</Label>
              <Input
                type="number"
                min="0"
                step="100"
                value={filters.amount_min || ''}
                onChange={(e) => onUpdateFilters({ 
                  amount_min: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Maximum</Label>
              <Input
                type="number"
                min="0"
                step="100"
                value={filters.amount_max || ''}
                onChange={(e) => onUpdateFilters({ 
                  amount_max: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="Illimité"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Fournisseur et récurrent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Fournisseur</span>
            </Label>
            <Input
              value={filters.vendor_name || ''}
              onChange={(e) => onUpdateFilters({ 
                vendor_name: e.target.value || undefined 
              })}
              placeholder="Rechercher par fournisseur..."
            />
          </div>

          <div className="space-y-2">
            <Label>Type de dépense</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={filters.recurring === true}
                  onCheckedChange={(checked) => onUpdateFilters({ 
                    recurring: checked ? true : undefined 
                  })}
                />
                <Label htmlFor="recurring" className="text-sm">Récurrentes uniquement</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres actifs */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filtres actifs</Label>
              <div className="flex flex-wrap gap-2">
                {filters.property_id && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Propriété: {properties.find(p => p.id === filters.property_id)?.title}</span>
                    <button
                      onClick={() => onUpdateFilters({ property_id: undefined })}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Catégorie: {filters.category}</span>
                    <button
                      onClick={() => onUpdateFilters({ category: undefined })}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.status && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Statut: {statusOptions.find(s => s.value === filters.status)?.label}</span>
                    <button
                      onClick={() => onUpdateFilters({ status: undefined })}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.priority && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Priorité: {priorityOptions.find(p => p.value === filters.priority)?.label}</span>
                    <button
                      onClick={() => onUpdateFilters({ priority: undefined })}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.date_from && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Du: {format(new Date(filters.date_from), "dd/MM/yyyy")}</span>
                    <button
                      onClick={() => onUpdateFilters({ date_from: undefined })}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.date_to && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Au: {format(new Date(filters.date_to), "dd/MM/yyyy")}</span>
                    <button
                      onClick={() => onUpdateFilters({ date_to: undefined })}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.amount_min && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Min: {filters.amount_min.toLocaleString()} FCFA</span>
                    <button
                      onClick={() => onUpdateFilters({ amount_min: undefined })}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.amount_max && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Max: {filters.amount_max.toLocaleString()} FCFA</span>
                    <button
                      onClick={() => onUpdateFilters({ amount_max: undefined })}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.vendor_name && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Fournisseur: {filters.vendor_name}</span>
                    <button
                      onClick={() => onUpdateFilters({ vendor_name: undefined })}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.recurring === true && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Récurrentes uniquement</span>
                    <button
                      onClick={() => onUpdateFilters({ recurring: undefined })}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 