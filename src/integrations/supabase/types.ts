export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string | null
          date: string
          doctor_id: string
          id: string
          patient_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          doctor_id: string
          id?: string
          patient_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          patient_id: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          patient_id?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          patient_id?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_items: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      dispensed_medicines: {
        Row: {
          dispensed_at: string
          dispensed_by: string
          id: string
          inventory_item_id: string
          medical_record_id: string | null
          notes: string | null
          patient_id: string
          quantity_dispensed: number
        }
        Insert: {
          dispensed_at?: string
          dispensed_by: string
          id?: string
          inventory_item_id: string
          medical_record_id?: string | null
          notes?: string | null
          patient_id: string
          quantity_dispensed: number
        }
        Update: {
          dispensed_at?: string
          dispensed_by?: string
          id?: string
          inventory_item_id?: string
          medical_record_id?: string | null
          notes?: string | null
          patient_id?: string
          quantity_dispensed?: number
        }
        Relationships: [
          {
            foreignKeyName: "dispensed_medicines_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispensed_medicines_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispensed_medicines_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          billing_item_id: string | null
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          billing_item_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          billing_item_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_billing_item_id_fkey"
            columns: ["billing_item_id"]
            isOneToOne: false
            referencedRelation: "billing_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          appointment_id: string | null
          created_at: string | null
          created_by: string
          discount_amount: number
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string | null
          created_by: string
          discount_amount?: number
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string | null
          created_by?: string
          discount_amount?: number
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          created_at: string | null
          id: string
          patient_id: string
          result: string
          technician_id: string
          test_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          patient_id: string
          result: string
          technician_id: string
          test_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          patient_id?: string
          result?: string
          technician_id?: string
          test_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          created_at: string | null
          diagnosis: string
          doctor_id: string
          id: string
          patient_id: string
          prescription: string | null
          treatment: string | null
        }
        Insert: {
          created_at?: string | null
          diagnosis: string
          doctor_id: string
          id?: string
          patient_id: string
          prescription?: string | null
          treatment?: string | null
        }
        Update: {
          created_at?: string | null
          diagnosis?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          prescription?: string | null
          treatment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          contact: string
          created_at: string | null
          dob: string
          gender: string
          id: string
          medical_history: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact: string
          created_at?: string | null
          dob: string
          gender: string
          id?: string
          medical_history?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact?: string
          created_at?: string | null
          dob?: string
          gender?: string
          id?: string
          medical_history?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string | null
          payment_method: string
          recorded_by: string
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method: string
          recorded_by: string
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
          recorded_by?: string
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_inventory: {
        Row: {
          batch_number: string | null
          category: string
          created_at: string
          description: string | null
          drug_name: string
          expiry_date: string | null
          id: string
          manufacturer: string | null
          quantity: number
          reorder_level: number
          unit: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          category: string
          created_at?: string
          description?: string | null
          drug_name: string
          expiry_date?: string | null
          id?: string
          manufacturer?: string | null
          quantity?: number
          reorder_level?: number
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          category?: string
          created_at?: string
          description?: string | null
          drug_name?: string
          expiry_date?: string | null
          id?: string
          manufacturer?: string | null
          quantity?: number
          reorder_level?: number
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          id: string
          last_login: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          id: string
          last_login?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          address: string | null
          contact: string
          created_at: string | null
          date_of_employment: string
          department: string
          email: string
          id: string
          name: string
          role: string
          staff_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact: string
          created_at?: string | null
          date_of_employment?: string
          department: string
          email: string
          id?: string
          name: string
          role: string
          staff_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact?: string
          created_at?: string | null
          date_of_employment?: string
          department?: string
          email?: string
          id?: string
          name?: string
          role?: string
          staff_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_otps: { Args: never; Returns: undefined }
      generate_invoice_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "lab_tech"
        | "receptionist"
        | "pharmacist"
      invoice_status: "draft" | "pending" | "paid" | "overdue" | "cancelled"
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
      app_role: [
        "admin",
        "doctor",
        "nurse",
        "lab_tech",
        "receptionist",
        "pharmacist",
      ],
      invoice_status: ["draft", "pending", "paid", "overdue", "cancelled"],
    },
  },
} as const
