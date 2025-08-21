
import { supabase } from '@/integrations/supabase/client';

export interface SupportTicket {
  id?: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assigned_to?: string;
  resolution_notes?: string;
}

export class SupportTicketService {
  /**
   * Create a new support ticket
   */
  static async createTicket(ticket: Omit<SupportTicket, 'id'>): Promise<SupportTicket | null> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([ticket])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      return null;
    }
  }

  /**
   * Get all support tickets (for admins)
   */
  static async getAllTickets(): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      return [];
    }
  }

  /**
   * Get tickets by status
   */
  static async getTicketsByStatus(status: SupportTicket['status']): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tickets by status:', error);
      return [];
    }
  }

  /**
   * Get open tickets count
   */
  static async getOpenTicketsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching open tickets count:', error);
      return 0;
    }
  }

  /**
   * Update ticket status
   */
  static async updateTicketStatus(ticketId: string, status: SupportTicket['status'], resolutionNotes?: string): Promise<boolean> {
    try {
      const updateData: Partial<SupportTicket> = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved' && resolutionNotes) {
        updateData.resolution_notes = resolutionNotes;
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return false;
    }
  }

  /**
   * Assign ticket to admin
   */
  static async assignTicket(ticketId: string, adminUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          assigned_to: adminUserId,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      return false;
    }
  }

  /**
   * Get ticket statistics
   */
  static async getTicketStatistics(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  }> {
    try {
      const [total, open, inProgress, resolved, closed] = await Promise.all([
        this.getTicketsByStatus('open'),
        this.getTicketsByStatus('in_progress'),
        this.getTicketsByStatus('resolved'),
        this.getTicketsByStatus('closed'),
        this.getAllTickets()
      ]);

      return {
        total: total.length,
        open: open.length,
        inProgress: inProgress.length,
        resolved: resolved.length,
        closed: closed.length
      };
    } catch (error) {
      console.error('Error fetching ticket statistics:', error);
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0
      };
    }
  }
}
