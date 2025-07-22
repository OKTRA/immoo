import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  DollarSign,
  Tag,
  User,
  Building,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExpenseDetails } from '@/types/expenses';
import { cn } from '@/lib/utils';

interface ExpenseListProps {
  expenses: ExpenseDetails[];
  onEdit: (expenseId: string) => void;
  onDelete: (expenseId: string) => void;
  onSelect: (expenseId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  selectedIds: string[];
  isLoading: boolean;
  compact?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    onNext: () => void;
    onPrev: () => void;
    onGoToPage: (page: number) => void;
  };
}

export default function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  onSelect,
  onSelectAll,
  selectedIds,
  isLoading,
  compact = false,
  pagination
}: ExpenseListProps) {
  const [sortField, setSortField] = useState<keyof ExpenseDetails>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: 'Payée', variant: 'default', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      pending: { label: 'En attente', variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
      approved: { label: 'Approuvée', variant: 'outline', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      rejected: { label: 'Rejetée', variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant="outline" className={cn("text-xs", config.className)}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      urgent: { label: 'Urgent', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
      high: { label: 'Élevée', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
      normal: { label: 'Normale', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      low: { label: 'Faible', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;

    return (
      <Badge variant="outline" className={cn("text-xs", config.className)}>
        {config.label}
      </Badge>
    );
  };

  const handleSort = (field: keyof ExpenseDetails) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const isAllSelected = expenses.length > 0 && selectedIds.length === expenses.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < expenses.length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <Receipt className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Aucune dépense
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Commencez par ajouter votre première dépense.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {sortedExpenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <div className="font-medium text-sm">
                  {expense.property_title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {expense.category_name} • {expense.vendor_name || 'N/A'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium text-sm">
                  {formatCurrency(expense.amount)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(expense.date)}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getStatusBadge(expense.status)}
                {getPriorityBadge(expense.priority)}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onEdit(expense.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(expense.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectAll && (
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
            )}
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Date</span>
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort('property_title')}
            >
              <div className="flex items-center space-x-1">
                <Building className="h-4 w-4" />
                <span>Propriété</span>
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center space-x-1">
                <Tag className="h-4 w-4" />
                <span>Catégorie</span>
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort('amount')}
            >
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>Montant</span>
              </div>
            </TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Priorité</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort('vendor_name')}
            >
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Fournisseur</span>
              </div>
            </TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedExpenses.map((expense) => (
            <TableRow key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {onSelectAll && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(expense.id)}
                    onCheckedChange={(checked) => onSelect(expense.id, checked as boolean)}
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">
                {formatDate(expense.date)}
              </TableCell>
              <TableCell>
                <div className="max-w-[200px] truncate" title={expense.property_title}>
                  {expense.property_title}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: expense.category_color }}
                  />
                  <span className="text-sm">{expense.category_name}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(expense.amount)}
              </TableCell>
              <TableCell>
                {getStatusBadge(expense.status)}
              </TableCell>
              <TableCell>
                {getPriorityBadge(expense.priority)}
              </TableCell>
              <TableCell>
                <div className="max-w-[150px] truncate" title={expense.vendor_name || 'N/A'}>
                  {expense.vendor_name || 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(expense.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(expense.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir les détails
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Page {pagination.page} sur {pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={pagination.onPrev}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={pagination.onNext}
              disabled={pagination.page >= pagination.totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 