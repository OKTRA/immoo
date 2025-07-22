export interface Expense {
  id: string;
  property_id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  receipt_url?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  vendor_name?: string;
  vendor_contact?: string;
  payment_method?: string;
  payment_date?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  tags: string[];
  recurring: boolean;
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  next_due_date?: string;
  parent_expense_id?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ExpenseAttachment {
  id: string;
  expense_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_by: string;
  created_at: string;
}

export interface ExpenseHistory {
  id: string;
  expense_id: string;
  action: string;
  old_values?: any;
  new_values?: any;
  changed_by: string;
  changed_at: string;
  notes?: string;
}

export interface ExpenseDetails extends Expense {
  property_title: string;
  property_location: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  creator_first_name?: string;
  creator_last_name?: string;
  approver_first_name?: string;
  approver_last_name?: string;
  attachments_count: number;
}

export interface PropertyExpenseStats {
  property_id: string;
  property_title: string;
  agency_id: string;
  total_expenses: number;
  total_paid: number;
  total_pending: number;
  total_approved: number;
  average_expense: number;
  last_expense_date?: string;
  recurring_expenses_count: number;
}

export interface ExpenseFilters {
  property_id?: string;
  category?: string;
  status?: string;
  priority?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  recurring?: boolean;
  vendor_name?: string;
  tags?: string[];
}

export interface ExpenseSummary {
  total_expenses: number;
  total_paid: number;
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  average_expense: number;
  expenses_count: number;
  recurring_expenses_count: number;
  urgent_expenses_count: number;
  overdue_expenses_count: number;
}

export interface ExpenseChartData {
  month: string;
  total: number;
  paid: number;
  pending: number;
  approved: number;
}

export interface ExpenseByCategory {
  category: string;
  category_color: string;
  category_icon: string;
  total_amount: number;
  count: number;
  percentage: number;
}

export interface CreateExpenseData {
  property_id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  vendor_name?: string;
  vendor_contact?: string;
  payment_method?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  recurring?: boolean;
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  next_due_date?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {
  status?: 'pending' | 'approved' | 'rejected' | 'paid';
  payment_date?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface ExpenseBulkAction {
  expense_ids: string[];
  action: 'approve' | 'reject' | 'mark_paid' | 'delete';
  notes?: string;
}

export interface ExpenseReport {
  period: string;
  total_expenses: number;
  total_revenue: number;
  net_income: number;
  expenses_by_category: ExpenseByCategory[];
  monthly_trend: ExpenseChartData[];
  top_properties: Array<{
    property_id: string;
    property_title: string;
    total_expenses: number;
    percentage: number;
  }>;
} 