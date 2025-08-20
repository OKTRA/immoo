export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_action_logs: {
        Row: {
          action_type: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_action_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          role_level: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role_level: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role_level?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      agencies: {
        Row: {
          created_at: string
          description: string | null
          domain_slug: string | null
          email: string | null
          id: string
          is_visible: boolean | null
          location: string | null
          logo_url: string | null
          name: string
          phone: string | null
          properties_count: number | null
          rating: number | null
          service_areas: string[] | null
          specialties: string[] | null
          status: string | null
          updated_at: string
          user_id: string | null
          username: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_slug?: string | null
          email?: string | null
          id?: string
          is_visible?: boolean | null
          location?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          properties_count?: number | null
          rating?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_slug?: string | null
          email?: string | null
          id?: string
          is_visible?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          properties_count?: number | null
          rating?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      agency_commissions: {
        Row: {
          agency_id: string
          calculation_type: string
          created_at: string | null
          effective_date: string
          id: string
          maximum_amount: number | null
          minimum_amount: number | null
          property_id: string
          rate: number
        }
        Insert: {
          agency_id: string
          calculation_type: string
          created_at?: string | null
          effective_date: string
          id?: string
          maximum_amount?: number | null
          minimum_amount?: number | null
          property_id: string
          rate: number
        }
        Update: {
          agency_id?: string
          calculation_type?: string
          created_at?: string | null
          effective_date?: string
          id?: string
          maximum_amount?: number | null
          minimum_amount?: number | null
          property_id?: string
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "agency_commissions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_commissions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_commissions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "agency_commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "agency_commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "agency_commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      agency_contact_access_logs: {
        Row: {
          access_type: string | null
          accessed_at: string | null
          agency_id: string | null
          id: string
          visitor_contact_id: string | null
        }
        Insert: {
          access_type?: string | null
          accessed_at?: string | null
          agency_id?: string | null
          id?: string
          visitor_contact_id?: string | null
        }
        Update: {
          access_type?: string | null
          accessed_at?: string | null
          agency_id?: string | null
          id?: string
          visitor_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_contact_access_logs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_contact_access_logs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_contact_access_logs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "agency_contact_access_logs_visitor_contact_id_fkey"
            columns: ["visitor_contact_id"]
            isOneToOne: false
            referencedRelation: "visitor_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_fees: {
        Row: {
          agency_id: string | null
          amount: number
          created_at: string | null
          date: string
          id: string
          lease_id: string | null
          notes: string | null
          property_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          amount: number
          created_at?: string | null
          date: string
          id?: string
          lease_id?: string | null
          notes?: string | null
          property_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          amount?: number
          created_at?: string | null
          date?: string
          id?: string
          lease_id?: string | null
          notes?: string | null
          property_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_fees_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_fees_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_fees_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "agency_fees_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_fees_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "agency_fees_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "agency_fees_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_fees_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      agency_ratings: {
        Row: {
          admin_id: string
          agency_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          agency_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          agency_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_ratings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_ratings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_ratings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
        ]
      }
      analytics_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          last_run_at: string | null
          parameters: Json | null
          report_data: Json | null
          report_type: string
          schedule: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          last_run_at?: string | null
          parameters?: Json | null
          report_data?: Json | null
          report_type: string
          schedule?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          last_run_at?: string | null
          parameters?: Json | null
          report_data?: Json | null
          report_type?: string
          schedule?: string | null
          title?: string
        }
        Relationships: []
      }
      apartment_leases: {
        Row: {
          agency_id: string
          created_at: string | null
          end_date: string
          id: string
          metadata: Json | null
          property_id: string
          start_date: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          created_at?: string | null
          end_date: string
          id?: string
          metadata?: Json | null
          property_id: string
          start_date: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          metadata?: Json | null
          property_id?: string
          start_date?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apartment_leases_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_leases_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_leases_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "apartment_leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "apartment_leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "apartment_leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apartment_leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "apartment_leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_history: {
        Row: {
          agency_id: string | null
          amount: number
          billing_date: string
          created_at: string
          description: string | null
          discount_amount: number | null
          final_amount: number | null
          id: string
          invoice_url: string | null
          original_amount: number | null
          payment_date: string | null
          payment_method: string | null
          payment_method_id: string | null
          plan_id: string | null
          promo_code: string | null
          promo_code_id: string | null
          status: string
          subscription_id: string | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          agency_id?: string | null
          amount: number
          billing_date?: string
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          final_amount?: number | null
          id?: string
          invoice_url?: string | null
          original_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          plan_id?: string | null
          promo_code?: string | null
          promo_code_id?: string | null
          status: string
          subscription_id?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          agency_id?: string | null
          amount?: number
          billing_date?: string
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          final_amount?: number | null
          id?: string
          invoice_url?: string | null
          original_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          plan_id?: string | null
          promo_code?: string | null
          promo_code_id?: string | null
          status?: string
          subscription_id?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "billing_history_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_reference: string
          created_at: string
          end_date: string
          guests: number
          id: string
          payment_status: string
          property_id: string | null
          start_date: string
          status: string
          total_price: number
          user_id: string | null
        }
        Insert: {
          booking_reference: string
          created_at?: string
          end_date: string
          guests: number
          id?: string
          payment_status?: string
          property_id?: string | null
          start_date: string
          status: string
          total_price: number
          user_id?: string | null
        }
        Update: {
          booking_reference?: string
          created_at?: string
          end_date?: string
          guests?: number
          id?: string
          payment_status?: string
          property_id?: string | null
          start_date?: string
          status?: string
          total_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      candidate_results: {
        Row: {
          candidate_number: string | null
          confidence_score: number | null
          contest_id: string | null
          created_at: string | null
          first_name: string | null
          full_name: string | null
          id: string
          language: string | null
          last_name: string | null
          mention: string | null
          page_number: number | null
          pdf_document_id: string | null
          rank: number | null
          raw_text: string | null
          registration_number: string | null
          score: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_number?: string | null
          confidence_score?: number | null
          contest_id?: string | null
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          mention?: string | null
          page_number?: number | null
          pdf_document_id?: string | null
          rank?: number | null
          raw_text?: string | null
          registration_number?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_number?: string | null
          confidence_score?: number | null
          contest_id?: string | null
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          mention?: string | null
          page_number?: number | null
          pdf_document_id?: string | null
          rank?: number | null
          raw_text?: string | null
          registration_number?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_results_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_results_pdf_document_id_fkey"
            columns: ["pdf_document_id"]
            isOneToOne: false
            referencedRelation: "pdf_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          lease_id: string
          payment_id: string
          processed_at: string | null
          processed_by: string | null
          property_id: string
          rate: number
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          lease_id: string
          payment_id: string
          processed_at?: string | null
          processed_by?: string | null
          property_id: string
          rate: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          lease_id?: string
          payment_id?: string
          processed_at?: string | null
          processed_by?: string | null
          property_id?: string
          rate?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      contests: {
        Row: {
          contest_date: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization: string
          updated_at: string | null
        }
        Insert: {
          contest_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization: string
          updated_at?: string | null
        }
        Update: {
          contest_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          additional_terms: string | null
          agency_id: string
          content: string
          created_at: string | null
          created_by: string | null
          details: Json | null
          end_date: string | null
          id: string
          is_custom: boolean | null
          jurisdiction: string | null
          lease_id: string | null
          metadata: Json | null
          parties: Json | null
          property_id: string | null
          related_entity: string | null
          start_date: string | null
          status: string
          tenant_id: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          additional_terms?: string | null
          agency_id: string
          content: string
          created_at?: string | null
          created_by?: string | null
          details?: Json | null
          end_date?: string | null
          id?: string
          is_custom?: boolean | null
          jurisdiction?: string | null
          lease_id?: string | null
          metadata?: Json | null
          parties?: Json | null
          property_id?: string | null
          related_entity?: string | null
          start_date?: string | null
          status?: string
          tenant_id?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          additional_terms?: string | null
          agency_id?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          details?: Json | null
          end_date?: string | null
          id?: string
          is_custom?: boolean | null
          jurisdiction?: string | null
          lease_id?: string | null
          metadata?: Json | null
          parties?: Json | null
          property_id?: string | null
          related_entity?: string | null
          start_date?: string | null
          status?: string
          tenant_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "contracts_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "apartment_leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_attachments: {
        Row: {
          expense_id: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          expense_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          expense_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_attachments_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expense_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_attachments_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_history: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string
          expense_id: string
          field_name: string | null
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by: string
          expense_id: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string
          expense_id?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_history_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expense_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_history_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          agency_id: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          date: string
          description: string
          due_date: string | null
          id: string
          is_recurring: boolean | null
          next_due_date: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          priority: string | null
          property_id: string
          recurring: boolean | null
          recurring_end_date: string | null
          recurring_frequency: string | null
          recurring_start_date: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          vendor_contact: string | null
          vendor_email: string | null
          vendor_name: string | null
          vendor_phone: string | null
          version: number | null
        }
        Insert: {
          agency_id?: string | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          date?: string
          description: string
          due_date?: string | null
          id?: string
          is_recurring?: boolean | null
          next_due_date?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          priority?: string | null
          property_id: string
          recurring?: boolean | null
          recurring_end_date?: string | null
          recurring_frequency?: string | null
          recurring_start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          vendor_contact?: string | null
          vendor_email?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
          version?: number | null
        }
        Update: {
          agency_id?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          date?: string
          description?: string
          due_date?: string | null
          id?: string
          is_recurring?: boolean | null
          next_due_date?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          priority?: string | null
          property_id?: string
          recurring?: boolean | null
          recurring_end_date?: string | null
          recurring_frequency?: string | null
          recurring_start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          vendor_contact?: string | null
          vendor_email?: string | null
          vendor_name?: string | null
          vendor_phone?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "fk_expense_category"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "fk_expense_category"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "expense_details"
            referencedColumns: ["category_name"]
          },
        ]
      }
      leases: {
        Row: {
          created_at: string
          end_date: string
          has_renewal_option: boolean | null
          id: string
          is_active: boolean | null
          lease_type: string | null
          monthly_rent: number
          payment_day: number | null
          payment_frequency: string | null
          payment_start_date: string | null
          property_id: string | null
          security_deposit: number
          signed_by_owner: boolean | null
          signed_by_tenant: boolean | null
          special_conditions: string | null
          start_date: string
          status: string
          tenant_id: string | null
          termination_date: string | null
          termination_notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          has_renewal_option?: boolean | null
          id?: string
          is_active?: boolean | null
          lease_type?: string | null
          monthly_rent: number
          payment_day?: number | null
          payment_frequency?: string | null
          payment_start_date?: string | null
          property_id?: string | null
          security_deposit: number
          signed_by_owner?: boolean | null
          signed_by_tenant?: boolean | null
          special_conditions?: string | null
          start_date: string
          status: string
          tenant_id?: string | null
          termination_date?: string | null
          termination_notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          has_renewal_option?: boolean | null
          id?: string
          is_active?: boolean | null
          lease_type?: string | null
          monthly_rent?: number
          payment_day?: number | null
          payment_frequency?: string | null
          payment_start_date?: string | null
          property_id?: string | null
          security_deposit?: number
          signed_by_owner?: boolean | null
          signed_by_tenant?: boolean | null
          special_conditions?: string | null
          start_date?: string
          status?: string
          tenant_id?: string | null
          termination_date?: string | null
          termination_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_dashboard_stats: {
        Row: {
          id: string
          last_updated: string | null
          maintenance_issues: number | null
          occupancy_rate: number | null
          occupied_units: number
          overdue_payments: number | null
          owner_id: string
          total_income: number
          total_properties: number
          vacant_units: number
        }
        Insert: {
          id?: string
          last_updated?: string | null
          maintenance_issues?: number | null
          occupancy_rate?: number | null
          occupied_units: number
          overdue_payments?: number | null
          owner_id: string
          total_income: number
          total_properties: number
          vacant_units: number
        }
        Update: {
          id?: string
          last_updated?: string | null
          maintenance_issues?: number | null
          occupancy_rate?: number | null
          occupied_units?: number
          overdue_payments?: number | null
          owner_id?: string
          total_income?: number
          total_properties?: number
          vacant_units?: number
        }
        Relationships: [
          {
            foreignKeyName: "owner_dashboard_stats_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_payment_history: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          owner_id: string
          payment_date: string
          payment_period_end: string | null
          payment_period_start: string | null
          payment_type: string
          property_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          owner_id: string
          payment_date: string
          payment_period_end?: string | null
          payment_period_start?: string | null
          payment_type: string
          property_id: string
          status: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          owner_id?: string
          payment_date?: string
          payment_period_end?: string | null
          payment_period_start?: string | null
          payment_type?: string
          property_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_payment_history_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_payment_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "owner_payment_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "owner_payment_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_payment_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      owner_properties_details: {
        Row: {
          active: boolean | null
          agency_id: string | null
          created_at: string | null
          current_value: number
          id: string
          owner_id: string
          ownership_percentage: number
          property_id: string
          purchase_date: string
          purchase_price: number
        }
        Insert: {
          active?: boolean | null
          agency_id?: string | null
          created_at?: string | null
          current_value: number
          id?: string
          owner_id: string
          ownership_percentage: number
          property_id: string
          purchase_date: string
          purchase_price: number
        }
        Update: {
          active?: boolean | null
          agency_id?: string | null
          created_at?: string | null
          current_value?: number
          id?: string
          owner_id?: string
          ownership_percentage?: number
          property_id?: string
          purchase_date?: string
          purchase_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "owner_properties_details_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_properties_details_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_properties_details_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "owner_properties_details_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_properties_details_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "owner_properties_details_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "owner_properties_details_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_properties_details_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      payment_bulk_update_items: {
        Row: {
          bulk_update_id: string
          created_at: string | null
          id: string
          new_status: string
          payment_id: string
          previous_status: string | null
        }
        Insert: {
          bulk_update_id: string
          created_at?: string | null
          id?: string
          new_status: string
          payment_id: string
          previous_status?: string | null
        }
        Update: {
          bulk_update_id?: string
          created_at?: string | null
          id?: string
          new_status?: string
          payment_id?: string
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_bulk_update_items_bulk_update_id_fkey"
            columns: ["bulk_update_id"]
            isOneToOne: false
            referencedRelation: "payment_bulk_updates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_bulk_update_items_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_bulk_updates: {
        Row: {
          id: string
          notes: string | null
          payments_count: number
          status: string
          update_date: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          payments_count: number
          status: string
          update_date?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          payments_count?: number
          status?: string
          update_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_configurations: {
        Row: {
          created_at: string | null
          default_agency_fees_percentage: number
          default_commission_rate: number
          default_payment_frequency: string
          default_security_deposit_multiplier: number
          id: string
          property_category: string
          proration_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          default_agency_fees_percentage: number
          default_commission_rate: number
          default_payment_frequency: string
          default_security_deposit_multiplier: number
          id?: string
          property_category: string
          proration_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          default_agency_fees_percentage?: number
          default_commission_rate?: number
          default_payment_frequency?: string
          default_security_deposit_multiplier?: number
          id?: string
          property_category?: string
          proration_rules?: Json | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          code: string
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          processing_fee_fixed: number | null
          processing_fee_percentage: number | null
          requires_verification: boolean | null
          supported_currencies: string[] | null
          updated_at: string | null
        }
        Insert: {
          code: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          processing_fee_fixed?: number | null
          processing_fee_percentage?: number | null
          requires_verification?: boolean | null
          supported_currencies?: string[] | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          processing_fee_fixed?: number | null
          processing_fee_percentage?: number | null
          requires_verification?: boolean | null
          supported_currencies?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          is_auto_generated: boolean
          lease_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string
          payment_type: Database["public"]["Enums"]["payment_type_enum"] | null
          processed_by: string | null
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          id?: string
          is_auto_generated?: boolean
          lease_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method: string
          payment_type?: Database["public"]["Enums"]["payment_type_enum"] | null
          processed_by?: string | null
          status: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          is_auto_generated?: boolean
          lease_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
          payment_type?: Database["public"]["Enums"]["payment_type_enum"] | null
          processed_by?: string | null
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_documents: {
        Row: {
          contest_id: string | null
          created_at: string | null
          error_message: string | null
          extraction_completed_at: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          mime_type: string | null
          processing_status: string | null
          updated_at: string | null
        }
        Insert: {
          contest_id?: string | null
          created_at?: string | null
          error_message?: string | null
          extraction_completed_at?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          processing_status?: string | null
          updated_at?: string | null
        }
        Update: {
          contest_id?: string | null
          created_at?: string | null
          error_message?: string | null
          extraction_completed_at?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          processing_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdf_documents_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agency_id: string | null
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
        ]
      }
      promo_code_usage: {
        Row: {
          billing_history_id: string | null
          discount_amount: number
          id: string
          order_amount: number
          promo_code_id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          billing_history_id?: string | null
          discount_amount: number
          id?: string
          order_amount: number
          promo_code_id: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          billing_history_id?: string | null
          discount_amount?: number
          id?: string
          order_amount?: number
          promo_code_id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usage_billing_history_id_fkey"
            columns: ["billing_history_id"]
            isOneToOne: false
            referencedRelation: "billing_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_billing_history_id_fkey"
            columns: ["billing_history_id"]
            isOneToOne: false
            referencedRelation: "recent_manual_activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_code_usages: {
        Row: {
          discount_amount: number
          final_amount: number
          id: string
          original_amount: number
          promo_code_id: string
          subscription_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          discount_amount: number
          final_amount: number
          id?: string
          original_amount: number
          promo_code_id: string
          subscription_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          discount_amount?: number
          final_amount?: number
          id?: string
          original_amount?: number
          promo_code_id?: string
          subscription_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usages_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usages_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          applicable_plans: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          name: string
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          user_usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_plans?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          name: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          user_usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_plans?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          name?: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          user_usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          agency_commission_rate: number | null
          agency_fees: number | null
          agency_id: string | null
          area: number
          bathrooms: number
          bedrooms: number
          commission_rate: number | null
          created_at: string
          description: string | null
          features: string[] | null
          furnished: boolean | null
          id: string
          image_url: string | null
          is_visible: boolean | null
          kitchens: number | null
          latitude: number | null
          living_rooms: number | null
          location: string | null
          longitude: number | null
          owner_id: string | null
          payment_frequency: string | null
          pets_allowed: boolean | null
          price: number
          property_category: string | null
          security_deposit: number | null
          shops: number | null
          status: string | null
          title: string
          type: string
          updated_at: string
          virtual_tour_url: string | null
          year_built: number | null
        }
        Insert: {
          agency_commission_rate?: number | null
          agency_fees?: number | null
          agency_id?: string | null
          area: number
          bathrooms: number
          bedrooms: number
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          furnished?: boolean | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          kitchens?: number | null
          latitude?: number | null
          living_rooms?: number | null
          location?: string | null
          longitude?: number | null
          owner_id?: string | null
          payment_frequency?: string | null
          pets_allowed?: boolean | null
          price: number
          property_category?: string | null
          security_deposit?: number | null
          shops?: number | null
          status?: string | null
          title: string
          type: string
          updated_at?: string
          virtual_tour_url?: string | null
          year_built?: number | null
        }
        Update: {
          agency_commission_rate?: number | null
          agency_fees?: number | null
          agency_id?: string | null
          area?: number
          bathrooms?: number
          bedrooms?: number
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          furnished?: boolean | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          kitchens?: number | null
          latitude?: number | null
          living_rooms?: number | null
          location?: string | null
          longitude?: number | null
          owner_id?: string | null
          payment_frequency?: string | null
          pets_allowed?: boolean | null
          price?: number
          property_category?: string | null
          security_deposit?: number | null
          shops?: number | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
          virtual_tour_url?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      property_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          property_id: string
          receipt_url: string | null
          status: string
          tenant_name: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          property_id: string
          receipt_url?: string | null
          status?: string
          tenant_name?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          property_id?: string
          receipt_url?: string | null
          status?: string
          tenant_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          position: number | null
          property_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          position?: number | null
          property_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          position?: number | null
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      property_owners: {
        Row: {
          bank_details: Json | null
          company_name: string | null
          created_at: string
          id: string
          payment_method: string
          payment_percentage: number
          tax_id: string | null
          user_id: string | null
        }
        Insert: {
          bank_details?: Json | null
          company_name?: string | null
          created_at?: string
          id?: string
          payment_method: string
          payment_percentage: number
          tax_id?: string | null
          user_id?: string | null
        }
        Update: {
          bank_details?: Json | null
          company_name?: string | null
          created_at?: string
          id?: string
          payment_method?: string
          payment_percentage?: number
          tax_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_property_owners_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      simple_visitor_sessions: {
        Row: {
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_activity_at: string | null
          name: string | null
          phone: string | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          name?: string | null
          phone?: string | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          name?: string | null
          phone?: string | null
          session_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_cycle: string
          created_at: string
          features: Json | null
          has_api_access: boolean | null
          id: string
          is_active: boolean | null
          max_agencies: number | null
          max_leases: number | null
          max_products: number | null
          max_properties: number | null
          max_shops: number | null
          max_tenants: number | null
          max_users: number | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          features?: Json | null
          has_api_access?: boolean | null
          id?: string
          is_active?: boolean | null
          max_agencies?: number | null
          max_leases?: number | null
          max_products?: number | null
          max_properties?: number | null
          max_shops?: number | null
          max_tenants?: number | null
          max_users?: number | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          features?: Json | null
          has_api_access?: boolean | null
          id?: string
          is_active?: boolean | null
          max_agencies?: number | null
          max_leases?: number | null
          max_products?: number | null
          max_properties?: number | null
          max_shops?: number | null
          max_tenants?: number | null
          max_users?: number | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          plan_type: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_type?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_type?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category: string
          created_at: string | null
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          category: string
          config_key: string
          config_value: Json
          description: string | null
          id: string
          is_public: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          config_key: string
          config_value: Json
          description?: string | null
          id?: string
          is_public?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          config_key?: string
          config_value?: Json
          description?: string | null
          id?: string
          is_public?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          agency_id: string | null
          created_at: string
          email: string
          emergency_contact: Json | null
          employment_status: string | null
          first_name: string
          id: string
          identity_photos: Json | null
          last_name: string
          phone: string
          photo_url: string | null
          profession: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          email: string
          emergency_contact?: Json | null
          employment_status?: string | null
          first_name: string
          id?: string
          identity_photos?: Json | null
          last_name: string
          phone: string
          photo_url?: string | null
          profession?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          email?: string
          emergency_contact?: Json | null
          employment_status?: string | null
          first_name?: string
          id?: string
          identity_photos?: Json | null
          last_name?: string
          phone?: string
          photo_url?: string | null
          profession?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_staff_reply: boolean | null
          message: string
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_staff_reply?: boolean | null
          message: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_staff_reply?: boolean | null
          message?: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_abuse_attempts: {
        Row: {
          abuse_type: string
          created_at: string | null
          details: Json | null
          device_fingerprint: string
          id: string
          ip_address: unknown | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          abuse_type: string
          created_at?: string | null
          details?: Json | null
          device_fingerprint: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          abuse_type?: string
          created_at?: string | null
          details?: Json | null
          device_fingerprint?: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      trial_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          feature_name: string | null
          id: string
          timestamp: string | null
          trial_session_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          feature_name?: string | null
          id?: string
          timestamp?: string | null
          trial_session_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          feature_name?: string | null
          id?: string
          timestamp?: string | null
          trial_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trial_analytics_trial_session_id_fkey"
            columns: ["trial_session_id"]
            isOneToOne: false
            referencedRelation: "trial_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_sessions: {
        Row: {
          activities_count: number | null
          browser_fingerprint: string | null
          conversion_type: string | null
          converted_at: string | null
          created_at: string | null
          device_fingerprint: string
          device_info: Json | null
          features_used: Json | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          language: string | null
          last_activity_at: string | null
          platform: string | null
          referrer: string | null
          screen_resolution: string | null
          status: string | null
          timezone: string | null
          trial_expires_at: string
          trial_started_at: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activities_count?: number | null
          browser_fingerprint?: string | null
          conversion_type?: string | null
          converted_at?: string | null
          created_at?: string | null
          device_fingerprint: string
          device_info?: Json | null
          features_used?: Json | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          language?: string | null
          last_activity_at?: string | null
          platform?: string | null
          referrer?: string | null
          screen_resolution?: string | null
          status?: string | null
          timezone?: string | null
          trial_expires_at: string
          trial_started_at?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activities_count?: number | null
          browser_fingerprint?: string | null
          conversion_type?: string | null
          converted_at?: string | null
          created_at?: string | null
          device_fingerprint?: string
          device_info?: Json | null
          features_used?: Json | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          language?: string | null
          last_activity_at?: string | null
          platform?: string | null
          referrer?: string | null
          screen_resolution?: string | null
          status?: string | null
          timezone?: string | null
          trial_expires_at?: string
          trial_started_at?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      trial_usage_logs: {
        Row: {
          feature_used: string
          id: string
          session_info: Json | null
          used_at: string | null
          user_trial_id: string | null
        }
        Insert: {
          feature_used: string
          id?: string
          session_info?: Json | null
          used_at?: string | null
          user_trial_id?: string | null
        }
        Update: {
          feature_used?: string
          id?: string
          session_info?: Json | null
          used_at?: string | null
          user_trial_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trial_usage_logs_user_trial_id_fkey"
            columns: ["user_trial_id"]
            isOneToOne: false
            referencedRelation: "user_trials"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          agency_id: string | null
          auto_renew: boolean | null
          created_at: string
          end_date: string | null
          id: string
          plan_id: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agency_id?: string | null
          auto_renew?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agency_id?: string | null
          auto_renew?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
        ]
      }
      user_trials: {
        Row: {
          created_at: string | null
          device_fingerprint: string
          device_info: Json | null
          email: string
          id: string
          ip_address: string | null
          trial_expires_at: string | null
          trial_started_at: string | null
          trial_status: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint: string
          device_info?: Json | null
          email: string
          id?: string
          ip_address?: string | null
          trial_expires_at?: string | null
          trial_started_at?: string | null
          trial_status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string
          device_info?: Json | null
          email?: string
          id?: string
          ip_address?: string | null
          trial_expires_at?: string | null
          trial_started_at?: string | null
          trial_status?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      visit_statistics: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          duration_seconds: number | null
          id: string
          is_bounce: boolean | null
          is_new_user: boolean | null
          page: string
          referrer: string | null
          session_id: string
          user_agent: string | null
          visit_time: string | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          is_bounce?: boolean | null
          is_new_user?: boolean | null
          page: string
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          visit_time?: string | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          is_bounce?: boolean | null
          is_new_user?: boolean | null
          page?: string
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          visit_time?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      visitor_contacts: {
        Row: {
          agency_id: string | null
          auto_recognition_enabled: boolean | null
          browser_fingerprint: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          ip_address: string | null
          is_verified: boolean | null
          last_name: string | null
          last_recognition_at: string | null
          last_seen_at: string | null
          phone: string | null
          property_id: string | null
          purpose: string | null
          recognition_count: number | null
          session_duration_days: number | null
          user_agent: string | null
          verification_token: string | null
        }
        Insert: {
          agency_id?: string | null
          auto_recognition_enabled?: boolean | null
          browser_fingerprint?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          ip_address?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          last_recognition_at?: string | null
          last_seen_at?: string | null
          phone?: string | null
          property_id?: string | null
          purpose?: string | null
          recognition_count?: number | null
          session_duration_days?: number | null
          user_agent?: string | null
          verification_token?: string | null
        }
        Update: {
          agency_id?: string | null
          auto_recognition_enabled?: boolean | null
          browser_fingerprint?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          ip_address?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          last_recognition_at?: string | null
          last_seen_at?: string | null
          phone?: string | null
          property_id?: string | null
          purpose?: string | null
          recognition_count?: number | null
          session_duration_days?: number | null
          user_agent?: string | null
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_contacts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_contacts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_contacts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "visitor_contacts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "visitor_contacts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "visitor_contacts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_contacts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
        ]
      }
      visitor_recognition_stats: {
        Row: {
          agency_id: string | null
          created_at: string | null
          id: string
          recognition_date: string | null
          recognition_method: string
          time_since_last_visit: unknown | null
          visitor_contact_id: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          id?: string
          recognition_date?: string | null
          recognition_method: string
          time_since_last_visit?: unknown | null
          visitor_contact_id?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          id?: string
          recognition_date?: string | null
          recognition_method?: string
          time_since_last_visit?: unknown | null
          visitor_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_recognition_stats_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_recognition_stats_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_recognition_stats_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "visitor_recognition_stats_visitor_contact_id_fkey"
            columns: ["visitor_contact_id"]
            isOneToOne: false
            referencedRelation: "visitor_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_sessions: {
        Row: {
          agency_id: string | null
          browser_fingerprint: string | null
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity_at: string | null
          recognition_method: string | null
          session_token: string
          user_agent: string | null
          visitor_contact_id: string | null
        }
        Insert: {
          agency_id?: string | null
          browser_fingerprint?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          recognition_method?: string | null
          session_token: string
          user_agent?: string | null
          visitor_contact_id?: string | null
        }
        Update: {
          agency_id?: string | null
          browser_fingerprint?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          recognition_method?: string | null
          session_token?: string
          user_agent?: string | null
          visitor_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_sessions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_sessions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_sessions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "visitor_sessions_visitor_contact_id_fkey"
            columns: ["visitor_contact_id"]
            isOneToOne: false
            referencedRelation: "visitor_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      agencies_with_property_count: {
        Row: {
          computed_properties_count: number | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string | null
          is_visible: boolean | null
          location: string | null
          logo_url: string | null
          name: string | null
          phone: string | null
          properties_count: number | null
          rating: number | null
          service_areas: string[] | null
          specialties: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          computed_properties_count?: never
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          is_visible?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          properties_count?: number | null
          rating?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          computed_properties_count?: never
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          is_visible?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          properties_count?: number | null
          rating?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      expense_details: {
        Row: {
          agency_id: string | null
          amount: number | null
          approved_at: string | null
          approved_by: string | null
          approver_first_name: string | null
          approver_last_name: string | null
          attachments_count: number | null
          category: string | null
          category_color: string | null
          category_icon: string | null
          category_name: string | null
          created_at: string | null
          created_by: string | null
          creator_first_name: string | null
          creator_last_name: string | null
          currency: string | null
          date: string | null
          description: string | null
          due_date: string | null
          id: string | null
          is_recurring: boolean | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          priority: string | null
          property_id: string | null
          property_location: string | null
          property_title: string | null
          recurring_end_date: string | null
          recurring_frequency: string | null
          recurring_start_date: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          vendor_contact: string | null
          vendor_email: string | null
          vendor_name: string | null
          vendor_phone: string | null
          version: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "owner_revenue_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_expense_stats"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "fk_expense_category"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "fk_expense_category"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "expense_details"
            referencedColumns: ["category_name"]
          },
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
        ]
      }
      owner_properties_with_agencies: {
        Row: {
          agency_id: string | null
          agency_logo: string | null
          agency_name: string | null
          commission_rate: number | null
          current_value: number | null
          location: string | null
          owner_id: string | null
          owner_name: string | null
          ownership_percentage: number | null
          payment_frequency: string | null
          price: number | null
          property_category: string | null
          property_id: string | null
          property_title: string | null
          status: string | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_properties_details_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_revenue_summary: {
        Row: {
          last_payment_date: string | null
          overdue_payments_count: number | null
          owner_id: string | null
          owner_name: string | null
          property_id: string | null
          property_title: string | null
          total_rent_overdue: number | null
          total_rent_paid: number | null
          total_rent_pending: number | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_payment_history_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      property_expense_stats: {
        Row: {
          agency_id: string | null
          average_expense: number | null
          last_expense_date: string | null
          property_id: string | null
          property_title: string | null
          total_approved: number | null
          total_expenses: number | null
          total_paid: number | null
          total_pending: number | null
          total_recurring: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_with_property_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
        ]
      }
      recent_manual_activations: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          plan_id: string | null
          plan_name: string | null
          transaction_id: string | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_manual_subscription: {
        Args: {
          p_user_id: string
          p_agency_id: string
          p_plan_id: string
          p_amount: number
          p_admin_note?: string
        }
        Returns: undefined
      }
      activate_subscription_with_promo: {
        Args: {
          p_user_id: string
          p_agency_id: string
          p_plan_id: string
          p_amount: number
          p_payment_method_id: string
          p_promo_code?: string
          p_admin_note?: string
        }
        Returns: Json
      }
      calculate_property_net_income: {
        Args: { property_uuid: string }
        Returns: number
      }
      can_start_trial: {
        Args: {
          p_device_fingerprint: string
          p_user_id: string
          p_ip_address?: unknown
        }
        Returns: Json
      }
      check_trial_eligibility: {
        Args: { p_device_fingerprint: string; p_email: string }
        Returns: Json
      }
      cleanup_duplicate_active_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id_cleaned: string
          subscriptions_deactivated: number
        }[]
      }
      cleanup_inactive_visitor_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_lease_with_payments: {
        Args: {
          lease_data: Json
          property_id: string
          new_property_status: string
          agency_fees: number
        }
        Returns: Json
      }
      create_property_expenses_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_visitor_session: {
        Args: {
          p_visitor_contact_id: string
          p_agency_id: string
          p_browser_fingerprint?: string
          p_ip_address?: string
          p_user_agent?: string
          p_duration_days?: number
          p_recognition_method?: string
        }
        Returns: {
          session_token: string
          expires_at: string
        }[]
      }
      delete_agency_safely: {
        Args: { agency_uuid: string }
        Returns: Json
      }
      generate_agency_slug: {
        Args: { agency_name: string }
        Returns: string
      }
      generate_recurring_expenses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_trial_status: {
        Args: { p_user_id: string; p_device_fingerprint?: string }
        Returns: Json
      }
      get_user_resource_count: {
        Args: {
          user_id_param: string
          resource_type: string
          agency_id_param?: string
        }
        Returns: number
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      recognize_returning_visitor: {
        Args: {
          p_email?: string
          p_phone?: string
          p_browser_fingerprint?: string
          p_session_token?: string
          p_agency_id?: string
        }
        Returns: {
          visitor_contact_id: string
          recognition_method: string
          session_valid: boolean
          days_since_last_visit: number
        }[]
      }
      start_trial: {
        Args: {
          p_user_id: string
          p_device_fingerprint: string
          p_email: string
          p_device_info?: Json
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: Json
      }
      validate_promo_code: {
        Args: {
          p_code: string
          p_user_id: string
          p_plan_id: string
          p_amount: number
        }
        Returns: Json
      }
    }
    Enums: {
      payment_type_enum: "rent" | "deposit" | "agency_fee" | "other"
      user_role: "admin" | "manager" | "agent" | "owner" | "tenant" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_type_enum: ["rent", "deposit", "agency_fee", "other"],
      user_role: ["admin", "manager", "agent", "owner", "tenant", "user"],
    },
  },
} as const
