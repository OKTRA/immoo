import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { fixInvalidDate } from '@/utils/dateUtils';
import {
  Expense,
  ExpenseDetails,
  ExpenseCategory,
  ExpenseAttachment,
  ExpenseHistory,
  PropertyExpenseStats,
  ExpenseFilters,
  ExpenseSummary,
  ExpenseChartData,
  ExpenseByCategory,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseBulkAction,
  ExpenseReport
} from '@/types/expenses';

/**
 * Récupérer toutes les dépenses d'une agence avec filtres
 */
export const getExpenses = async (
  agencyId: string,
  filters: ExpenseFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<{ data: ExpenseDetails[]; total: number; error: string | null }> => {
  try {
    // Récupérer d'abord les propriétés de l'agence
    const { data: agencyProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('agency_id', agencyId);

    if (propertiesError) throw propertiesError;

    const propertyIds = agencyProperties?.map(p => p.id) || [];

    if (propertyIds.length === 0) {
      return { data: [], total: 0, error: null };
    }

    let query = supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .in('property_id', propertyIds);

    // Appliquer les filtres
    if (filters.property_id) {
      query = query.eq('property_id', filters.property_id);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.date_from) {
      query = query.gte('date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('date', filters.date_to);
    }
    if (filters.amount_min) {
      query = query.gte('amount', filters.amount_min);
    }
    if (filters.amount_max) {
      query = query.lte('amount', filters.amount_max);
    }
    if (filters.recurring !== undefined) {
      query = query.eq('recurring', filters.recurring);
    }
    if (filters.vendor_name) {
      query = query.ilike('vendor_name', `%${filters.vendor_name}%`);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('date', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      error: null
    };
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return {
      data: [],
      total: 0,
      error: error.message
    };
  }
};

/**
 * Récupérer une dépense par ID
 */
export const getExpenseById = async (expenseId: string): Promise<{ data: ExpenseDetails | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .single();

    if (error) throw error;

    // Transformer en ExpenseDetails
    const expenseDetails: ExpenseDetails = {
      ...data,
      property_title: 'Propriété', // À récupérer séparément
      property_location: '',
      category_name: data.category,
      category_color: '#3B82F6',
      category_icon: 'receipt',
      creator_first_name: '',
      creator_last_name: '',
      approver_first_name: '',
      approver_last_name: '',
      attachments_count: 0
    };

    return { data: expenseDetails, error: null };
  } catch (error: any) {
    console.error('Error fetching expense:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Créer une nouvelle dépense
 */
export const createExpense = async (expenseData: CreateExpenseData): Promise<{ data: Expense | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expenseData,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    toast.success('Dépense créée avec succès');
    return { data, error: null };
  } catch (error: any) {
    console.error('Error creating expense:', error);
    toast.error('Erreur lors de la création de la dépense');
    return { data: null, error: error.message };
  }
};

/**
 * Mettre à jour une dépense
 */
export const updateExpense = async (
  expenseId: string,
  updateData: UpdateExpenseData
): Promise<{ data: Expense | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', expenseId)
      .select()
      .single();

    if (error) throw error;

    toast.success('Dépense mise à jour avec succès');
    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating expense:', error);
    toast.error('Erreur lors de la mise à jour de la dépense');
    return { data: null, error: error.message };
  }
};

/**
 * Supprimer une dépense
 */
export const deleteExpense = async (expenseId: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;

    toast.success('Dépense supprimée avec succès');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    toast.error('Erreur lors de la suppression de la dépense');
    return { success: false, error: error.message };
  }
};

/**
 * Récupérer les catégories de dépenses
 */
export const getExpenseCategories = async (): Promise<{ data: ExpenseCategory[]; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error: any) {
    console.error('Error fetching expense categories:', error);
    return { data: [], error: error.message };
  }
};

/**
 * Récupérer les statistiques de dépenses d'une agence
 */
export const getExpenseSummary = async (
  agencyId: string,
  period: 'month' | 'quarter' | 'year' = 'month',
  year: number = new Date().getFullYear()
): Promise<{ data: ExpenseSummary | null; error: string | null }> => {
  try {
    const { startDate, endDate } = getPeriodDates(period, year);

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        amount,
        status,
        priority,
        recurring,
        date,
        property_id,
        properties!inner(agency_id)
      `)
      .eq('properties.agency_id', agencyId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (error) throw error;

    const expenses = data || [];
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalPaid = expenses.filter(exp => exp.status === 'paid').reduce((sum, exp) => sum + exp.amount, 0);
    const totalPending = expenses.filter(exp => exp.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0);
    const totalApproved = expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);
    const totalRejected = expenses.filter(exp => exp.status === 'rejected').reduce((sum, exp) => sum + exp.amount, 0);

    const summary: ExpenseSummary = {
      total_expenses: totalExpenses,
      total_paid: totalPaid,
      total_pending: totalPending,
      total_approved: totalApproved,
      total_rejected: totalRejected,
      average_expense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
      expenses_count: expenses.length,
      recurring_expenses_count: expenses.filter(exp => exp.recurring).length,
      urgent_expenses_count: expenses.filter(exp => exp.priority === 'urgent').length,
      overdue_expenses_count: expenses.filter(exp => 
        exp.status === 'pending' && new Date(exp.date) < new Date()
      ).length
    };

    return { data: summary, error: null };
  } catch (error: any) {
    console.error('Error fetching expense summary:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Récupérer les dépenses par catégorie
 */
export const getExpensesByCategory = async (
  agencyId: string,
  period: 'month' | 'quarter' | 'year' = 'month',
  year: number = new Date().getFullYear()
): Promise<{ data: ExpenseByCategory[]; error: string | null }> => {
  try {
    const { startDate, endDate } = getPeriodDates(period, year);

    // 1. Get all properties for the agency
    const { data: agencyProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('agency_id', agencyId);
    if (propertiesError) throw propertiesError;
    const propertyIds = agencyProperties?.map(p => p.id) || [];
    if (propertyIds.length === 0) {
      return { data: [], error: null };
    }

    // 2. Get all expenses for these properties in the period
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('category, amount')
      .in('property_id', propertyIds)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);
    if (expensesError) throw expensesError;

    // 3. Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('expense_categories')
      .select('name, color, icon');
    if (categoriesError) throw categoriesError;
    const categoryMapMeta = new Map(categories.map(cat => [cat.name, cat]));

    // 4. Aggregate expenses by category
    const categoryMap = new Map<string, ExpenseByCategory>();
    expenses.forEach(expense => {
      const category = expense.category;
      const meta = categoryMapMeta.get(category) || { color: '#3B82F6', icon: 'receipt' };
      const existing = categoryMap.get(category) || {
        category,
        category_color: meta.color,
        category_icon: meta.icon,
        total_amount: 0,
        count: 0,
        percentage: 0
      };
      existing.total_amount += expense.amount;
      existing.count += 1;
      categoryMap.set(category, existing);
    });
    const totalAmount = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.total_amount, 0);
    const result = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      percentage: totalAmount > 0 ? (cat.total_amount / totalAmount) * 100 : 0
    }));
    return { data: result, error: null };
  } catch (error: any) {
    console.error('Error fetching expenses by category:', error);
    return { data: [], error: error.message };
  }
};

/**
 * Récupérer les données de graphique mensuel
 */
export const getMonthlyExpenseChart = async (
  agencyId: string,
  year: number = new Date().getFullYear()
): Promise<{ data: ExpenseChartData[]; error: string | null }> => {
  try {
    // 1. Récupérer les propriétés de l'agence
    const { data: agencyProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('agency_id', agencyId);
    if (propertiesError) throw propertiesError;
    const propertyIds = agencyProperties?.map(p => p.id) || [];
    if (propertyIds.length === 0) {
      // Pas de propriétés, donc pas de dépenses
      return { data: [], error: null };
    }

    // 2. Récupérer les dépenses pour ces propriétés sur l'année
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('amount, status, date, property_id')
      .in('property_id', propertyIds)
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`);
    if (expensesError) throw expensesError;

    // 3. Agréger par mois
    const monthlyMap = new Map<string, ExpenseChartData>();
    for (let m = 1; m <= 12; m++) {
      const month = `${year}-${m.toString().padStart(2, '0')}`;
      monthlyMap.set(month, {
        month,
        total: 0,
        paid: 0,
        pending: 0,
        approved: 0
      });
    }
    expenses.forEach(exp => {
      const month = exp.date.slice(0, 7); // YYYY-MM
      const entry = monthlyMap.get(month);
      if (entry) {
        entry.total += exp.amount;
        if (exp.status === 'paid') entry.paid += exp.amount;
        if (exp.status === 'pending') entry.pending += exp.amount;
        if (exp.status === 'approved') entry.approved += exp.amount;
      }
    });
    const result = Array.from(monthlyMap.values());
    return { data: result, error: null };
  } catch (error: any) {
    console.error('Error fetching monthly expense chart:', error);
    return { data: [], error: error.message };
  }
};

/**
 * Actions en lot sur les dépenses
 */
export const bulkActionExpenses = async (bulkAction: ExpenseBulkAction): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { expense_ids, action, notes } = bulkAction;
    const userId = (await supabase.auth.getUser()).data.user?.id;

    let updateData: any = {};

    switch (action) {
      case 'approve':
        updateData = {
          status: 'approved',
          approved_by: userId,
          approved_at: new Date().toISOString()
        };
        break;
      case 'reject':
        updateData = {
          status: 'rejected',
          approved_by: userId,
          approved_at: new Date().toISOString()
        };
        break;
      case 'mark_paid':
        updateData = {
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0]
        };
        break;
      case 'delete':
        const { error: deleteError } = await supabase
          .from('expenses')
          .delete()
          .in('id', expense_ids);
        
        if (deleteError) throw deleteError;
        
        toast.success(`${expense_ids.length} dépense(s) supprimée(s) avec succès`);
        return { success: true, error: null };
    }

    const { error } = await supabase
      .from('expenses')
      .update(updateData)
      .in('id', expense_ids);

    if (error) throw error;

    toast.success(`Action en lot effectuée sur ${expense_ids.length} dépense(s)`);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error performing bulk action:', error);
    toast.error('Erreur lors de l\'action en lot');
    return { success: false, error: error.message };
  }
};

/**
 * Récupérer l'historique d'une dépense
 */
export const getExpenseHistory = async (expenseId: string): Promise<{ data: ExpenseHistory[]; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('expense_history')
      .select(`
        *,
        profiles!expense_history_changed_by_fkey(first_name, last_name)
      `)
      .eq('expense_id', expenseId)
      .order('changed_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error: any) {
    console.error('Error fetching expense history:', error);
    return { data: [], error: error.message };
  }
};

/**
 * Télécharger une pièce jointe
 */
export const uploadExpenseAttachment = async (
  expenseId: string,
  file: File
): Promise<{ data: ExpenseAttachment | null; error: string | null }> => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `expense-attachments/${expenseId}/${fileName}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('expenses')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('expenses')
      .getPublicUrl(filePath);

    // Create attachment record
    const { data, error } = await supabase
      .from('expense_attachments')
      .insert({
        expense_id: expenseId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: userId!
      })
      .select()
      .single();

    if (error) throw error;

    toast.success('Pièce jointe téléchargée avec succès');
    return { data, error: null };
  } catch (error: any) {
    console.error('Error uploading attachment:', error);
    toast.error('Erreur lors du téléchargement de la pièce jointe');
    return { data: null, error: error.message };
  }
};

/**
 * Supprimer une pièce jointe
 */
export const deleteExpenseAttachment = async (attachmentId: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase
      .from('expense_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) throw error;

    toast.success('Pièce jointe supprimée avec succès');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting attachment:', error);
    toast.error('Erreur lors de la suppression de la pièce jointe');
    return { success: false, error: error.message };
  }
};

/**
 * Générer un rapport complet des dépenses
 */
export const generateExpenseReport = async (
  agencyId: string,
  period: 'month' | 'quarter' | 'year' = 'month',
  year: number = new Date().getFullYear()
): Promise<{ data: ExpenseReport | null; error: string | null }> => {
  try {
    const [summaryResult, categoryResult, chartResult] = await Promise.all([
      getExpenseSummary(agencyId, period, year),
      getExpensesByCategory(agencyId, period, year),
      getMonthlyExpenseChart(agencyId, year)
    ]);

    if (summaryResult.error || categoryResult.error || chartResult.error) {
      throw new Error('Erreur lors de la génération du rapport');
    }

    // Calculer le revenu net (revenus - dépenses)
    const totalRevenue = 0; // À implémenter avec le service des gains
    const netIncome = totalRevenue - (summaryResult.data?.total_paid || 0);

    const report: ExpenseReport = {
      period: `${period} ${year}`,
      total_expenses: summaryResult.data?.total_expenses || 0,
      total_revenue: totalRevenue,
      net_income: netIncome,
      expenses_by_category: categoryResult.data,
      monthly_trend: chartResult.data,
      top_properties: [] // À implémenter
    };

    return { data: report, error: null };
  } catch (error: any) {
    console.error('Error generating expense report:', error);
    return { data: null, error: error.message };
  }
};

// Fonction utilitaire pour calculer les dates de période
function getPeriodDates(period: 'month' | 'quarter' | 'year', year: number) {
  const now = new Date();
  const currentYear = year || now.getFullYear();
  
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'month':
      const currentMonth = now.getMonth();
      startDate = new Date(currentYear, currentMonth, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
      break;
    case 'quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(currentYear, currentQuarter * 3, 1);
      endDate = new Date(currentYear, (currentQuarter + 1) * 3, 0);
      break;
    case 'year':
      startDate = new Date(currentYear, 0, 1);
      // Use the date utility function to ensure valid date
      const lastDay = fixInvalidDate(currentYear, 12, 31);
      endDate = new Date(lastDay);
      break;
    default:
      startDate = new Date(currentYear, 0, 1);
      // Use the date utility function to ensure valid date
      const defaultLastDay = fixInvalidDate(currentYear, 12, 31);
      endDate = new Date(defaultLastDay);
  }

  return { startDate, endDate };
} 