import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getExpensesByCategory,
  getMonthlyExpenseChart,
  bulkActionExpenses,
  ExpenseFilters,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseBulkAction
} from '@/services/expenses/expenseService';
import { toast } from 'sonner';

export const useExpensesManagement = (agencyId: string) => {
  const queryClient = useQueryClient();

  // Récupérer les dépenses
  const {
    data: expenses,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['expenses', agencyId],
    queryFn: () => getExpenses(agencyId),
    enabled: !!agencyId,
    refetchOnWindowFocus: false
  });

  // Récupérer le résumé
  const { data: summary } = useQuery({
    queryKey: ['expense-summary', agencyId],
    queryFn: () => getExpenseSummary(agencyId),
    enabled: !!agencyId,
    refetchOnWindowFocus: false
  });

  // Récupérer les dépenses par catégorie
  const { data: expensesByCategory } = useQuery({
    queryKey: ['expenses-by-category', agencyId],
    queryFn: () => getExpensesByCategory(agencyId),
    enabled: !!agencyId,
    refetchOnWindowFocus: false
  });

  // Récupérer les données de graphique mensuel
  const { data: monthlyChartData } = useQuery({
    queryKey: ['monthly-expense-chart', agencyId],
    queryFn: () => getMonthlyExpenseChart(agencyId),
    enabled: !!agencyId,
    refetchOnWindowFocus: false
  });

  // Mutation pour créer une dépense
  const createExpenseMutation = useMutation({
    mutationFn: (data: CreateExpenseData) => createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['expenses-by-category', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['monthly-expense-chart', agencyId] });
      toast.success('Dépense créée avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la création de la dépense');
      console.error('Error creating expense:', error);
    }
  });

  // Mutation pour mettre à jour une dépense
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseData }) => updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['expenses-by-category', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['monthly-expense-chart', agencyId] });
      toast.success('Dépense mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour de la dépense');
      console.error('Error updating expense:', error);
    }
  });

  // Mutation pour supprimer une dépense
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['expenses-by-category', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['monthly-expense-chart', agencyId] });
      toast.success('Dépense supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la suppression de la dépense');
      console.error('Error deleting expense:', error);
    }
  });

  // Mutation pour les actions en lot
  const bulkActionMutation = useMutation({
    mutationFn: (bulkAction: ExpenseBulkAction) => bulkActionExpenses(bulkAction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['expenses-by-category', agencyId] });
      queryClient.invalidateQueries({ queryKey: ['monthly-expense-chart', agencyId] });
    },
    onError: (error: any) => {
      toast.error('Erreur lors de l\'action en lot');
      console.error('Error performing bulk action:', error);
    }
  });

  // Fonctions d'action
  const createExpenseAction = (data: CreateExpenseData) => {
    return createExpenseMutation.mutateAsync(data);
  };

  const updateExpenseAction = (id: string, data: UpdateExpenseData) => {
    return updateExpenseMutation.mutateAsync({ id, data });
  };

  const deleteExpenseAction = (id: string) => {
    return deleteExpenseMutation.mutateAsync(id);
  };

  const bulkAction = (bulkAction: ExpenseBulkAction) => {
    return bulkActionMutation.mutateAsync(bulkAction);
  };

  return {
    // Données
    expenses: expenses?.data || [],
    summary: summary?.data,
    expensesByCategory: expensesByCategory?.data || [],
    monthlyChartData: monthlyChartData?.data || [],
    
    // États de chargement
    isLoading,
    isCreating: createExpenseMutation.isPending,
    isUpdating: updateExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending,
    isBulkActioning: bulkActionMutation.isPending,
    
    // Erreurs
    error: error?.message || summary?.error || expensesByCategory?.error || monthlyChartData?.error,
    
    // Actions
    createExpense: createExpenseAction,
    updateExpense: updateExpenseAction,
    deleteExpense: deleteExpenseAction,
    bulkAction,
    refetch
  };
}; 