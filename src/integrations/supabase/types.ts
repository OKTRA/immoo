export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
        Relationships: [
          {
            foreignKeyName: "admin_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agencies: {
        Row: {
          blocked_at: string | null
          blocked_reason: string | null
          created_at: string
          description: string | null
          email: string | null
          hidden_from_index: boolean | null
          id: string
          is_blocked: boolean | null
          location: string | null
          logo_url: string | null
          name: string
          phone: string | null
          properties_count: number | null
          rating: number | null
          service_areas: string[] | null
          specialties: string[] | null
          updated_at: string
          user_id: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          hidden_from_index?: boolean | null
          id?: string
          is_blocked?: boolean | null
          location?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          properties_count?: number | null
          rating?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          hidden_from_index?: boolean | null
          id?: string
          is_blocked?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          properties_count?: number | null
          rating?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agencies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "analytics_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          id: string
          invoice_url: string | null
          payment_date: string | null
          payment_method: string | null
          plan_id: string | null
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
          id?: string
          invoice_url?: string | null
          payment_date?: string | null
          payment_method?: string | null
          plan_id?: string | null
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
          id?: string
          invoice_url?: string | null
          payment_date?: string | null
          payment_method?: string | null
          plan_id?: string | null
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
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "billing_history_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
            foreignKeyName: "commissions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
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
        ]
      }
      contracts: {
        Row: {
          additional_terms: string | null
          agency_id: string
          content: string
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          is_custom: boolean | null
          lease_id: string | null
          metadata: Json | null
          property_id: string | null
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
          end_date?: string | null
          id?: string
          is_custom?: boolean | null
          lease_id?: string | null
          metadata?: Json | null
          property_id?: string | null
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
          end_date?: string | null
          id?: string
          is_custom?: boolean | null
          lease_id?: string | null
          metadata?: Json | null
          property_id?: string | null
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
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
            foreignKeyName: "contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
          payment_type: string
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
          payment_type?: string
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
          payment_type?: string
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
      profiles: {
        Row: {
          agency_id: string | null
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
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
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
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
          {
            foreignKeyName: "property_owners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          max_users?: number | null
          name?: string
          price?: number
          updated_at?: string
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
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "system_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "tenants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
          {
            foreignKeyName: "ticket_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          ip_address: string | null
          is_verified: boolean | null
          last_name: string | null
          last_seen_at: string | null
          phone: string | null
          property_id: string | null
          purpose: string | null
          user_agent: string | null
          verification_token: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          ip_address?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          last_seen_at?: string | null
          phone?: string | null
          property_id?: string | null
          purpose?: string | null
          user_agent?: string | null
          verification_token?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          ip_address?: string | null
          is_verified?: boolean | null
          last_name?: string | null
          last_seen_at?: string | null
          phone?: string | null
          property_id?: string | null
          purpose?: string | null
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
        ]
      }
    }
    Views: {
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
      users: {
        Row: {
          agency_id: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          role: string | null
          updated_at: string | null
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
            referencedRelation: "owner_properties_with_agencies"
            referencedColumns: ["agency_id"]
          },
        ]
      }
    }
    Functions: {
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
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "manager" | "agent" | "owner" | "tenant" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "manager", "agent", "owner", "tenant", "user"],
    },
  },
} as const
