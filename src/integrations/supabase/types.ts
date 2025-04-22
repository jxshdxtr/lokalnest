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
      activity_logs: {
        Row: {
          activity: string
          details: Json | null
          id: string
          ip: string
          status: string
          timestamp: string
          user_id: string
        }
        Insert: {
          activity: string
          details?: Json | null
          id?: string
          ip: string
          status: string
          timestamp?: string
          user_id: string
        }
        Update: {
          activity?: string
          details?: Json | null
          id?: string
          ip?: string
          status?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string
          city: string
          country: string
          created_at: string
          id: string
          is_default: boolean | null
          postal_code: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type?: string
          city: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          postal_code: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          postal_code?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      customer_messages: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          is_read: boolean | null
          message: string
          seller_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          is_read?: boolean | null
          message: string
          seller_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          is_read?: boolean | null
          message?: string
          seller_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      delivery_partners: {
        Row: {
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          pricing_model: Json | null
          service_areas: Json | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          pricing_model?: Json | null
          service_areas?: Json | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          pricing_model?: Json | null
          service_areas?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_logs: {
        Row: {
          change_quantity: number
          created_at: string | null
          created_by: string | null
          id: string
          new_quantity: number
          previous_quantity: number
          product_id: string | null
          reason: string | null
        }
        Insert: {
          change_quantity: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_quantity: number
          previous_quantity: number
          product_id?: string | null
          reason?: string | null
        }
        Update: {
          change_quantity?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_quantity?: number
          previous_quantity?: number
          product_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message_content: string
          read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_content: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_content?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          notification_type: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          notification_type?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          notification_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_disputes: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          order_id: string
          reported_by: string
          resolution: string | null
          resolved_at: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          id?: string
          order_id: string
          reported_by: string
          resolution?: string | null
          resolved_at?: string | null
          status: string
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          order_id?: string
          reported_by?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_disputes_assigned_to_profiles_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: string
          buyer_id: string
          created_at: string
          estimated_delivery: string | null
          id: string
          payment_method: string
          payment_status: string
          seller_id: string | null
          shipping_address: string
          status: string
          total_amount: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          billing_address: string
          buyer_id: string
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          payment_method: string
          payment_status?: string
          seller_id?: string | null
          shipping_address: string
          status?: string
          total_amount: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: string
          buyer_id?: string
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          payment_method?: string
          payment_status?: string
          seller_id?: string | null
          shipping_address?: string
          status?: string
          total_amount?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_flags: {
        Row: {
          created_at: string
          id: string
          product_id: string
          reason: string
          reported_by: string | null
          resolution: string | null
          review_date: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          reason: string
          reported_by?: string | null
          resolution?: string | null
          review_date?: string | null
          reviewed_by?: string | null
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          reason?: string
          reported_by?: string | null
          resolution?: string | null
          review_date?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_flags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_flags_reviewed_by_profiles_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_primary: boolean | null
          product_id: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          product_id: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          dimensions: string | null
          featured: boolean | null
          id: string
          is_available: boolean | null
          materials: string | null
          name: string
          price: number
          rating: number | null
          review_count: number | null
          sale_price: number | null
          seller_id: string
          shipping_info: string | null
          shipping_note: string | null
          stock_quantity: number
          tags: string | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          featured?: boolean | null
          id?: string
          is_available?: boolean | null
          materials?: string | null
          name: string
          price: number
          rating?: number | null
          review_count?: number | null
          sale_price?: number | null
          seller_id: string
          shipping_info?: string | null
          shipping_note?: string | null
          stock_quantity?: number
          tags?: string | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          featured?: boolean | null
          id?: string
          is_available?: boolean | null
          materials?: string | null
          name?: string
          price?: number
          rating?: number | null
          review_count?: number | null
          sale_price?: number | null
          seller_id?: string
          shipping_info?: string | null
          shipping_note?: string | null
          stock_quantity?: number
          tags?: string | null
          updated_at?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          status: string | null
          store_name: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          status?: string | null
          store_name?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          status?: string | null
          store_name?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      promotion_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          promotion_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          promotion_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          promotion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_items_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          applies_to: string | null
          coupon_code: string | null
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          minimum_purchase: number | null
          seller_id: string
          start_date: string
          title: string
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          applies_to?: string | null
          coupon_code?: string | null
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean | null
          minimum_purchase?: number | null
          seller_id: string
          start_date: string
          title: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          applies_to?: string | null
          coupon_code?: string | null
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          minimum_purchase?: number | null
          seller_id?: string
          start_date?: string
          title?: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          buyer_id: string
          comment: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          product_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          product_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          product_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_customers: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          last_purchase_date: string | null
          notes: string | null
          seller_id: string | null
          status: string | null
          tags: string[] | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          last_purchase_date?: string | null
          notes?: string | null
          seller_id?: string | null
          status?: string | null
          tags?: string[] | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          last_purchase_date?: string | null
          notes?: string | null
          seller_id?: string | null
          status?: string | null
          tags?: string[] | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_customers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_profiles: {
        Row: {
          business_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          is_verified: boolean | null
          location: string | null
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          business_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id: string
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          business_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seller_verifications: {
        Row: {
          business_name: string | null
          created_at: string
          document_expiry_date: string | null
          document_number: string | null
          document_type: string
          document_url: string
          first_name: string | null
          id: string
          last_name: string | null
          middle_name: string | null
          notes: string | null
          registered_address: string | null
          seller_id: string
          seller_type: string | null
          status: string
          suffix: string | null
          tin_number: string | null
          updated_at: string
          valid_id: string | null
          valid_id_back: string | null
          valid_id_front: string | null
          vat_status: string | null
          verification_date: string | null
          verified_by: string | null
          zip_code: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          document_expiry_date?: string | null
          document_number?: string | null
          document_type: string
          document_url: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          middle_name?: string | null
          notes?: string | null
          registered_address?: string | null
          seller_id: string
          seller_type?: string | null
          status: string
          suffix?: string | null
          tin_number?: string | null
          updated_at?: string
          valid_id?: string | null
          valid_id_back?: string | null
          valid_id_front?: string | null
          vat_status?: string | null
          verification_date?: string | null
          verified_by?: string | null
          zip_code?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string
          document_expiry_date?: string | null
          document_number?: string | null
          document_type?: string
          document_url?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          middle_name?: string | null
          notes?: string | null
          registered_address?: string | null
          seller_id?: string
          seller_type?: string | null
          status?: string
          suffix?: string | null
          tin_number?: string | null
          updated_at?: string
          valid_id?: string | null
          valid_id_back?: string | null
          valid_id_front?: string | null
          vat_status?: string | null
          verification_date?: string | null
          verified_by?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_verifications_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_verifications_verified_by_profiles_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_profiles_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      product_reports: {
        Row: {
          created_at: string | null
          id: string | null
          product_id: string | null
          reason: string | null
          reporter_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          product_id?: string | null
          reason?: string | null
          reporter_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          product_id?: string | null
          reason?: string | null
          reporter_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_flags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_access_order: {
        Args: { order_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      submit_seller_verification: {
        Args: {
          p_seller_id: string
          p_document_type: string
          p_document_url: string
          p_document_number: string
          p_document_expiry_date: string
          p_government_id_type: string
          p_government_id_url: string
          p_seller_type: string
          p_first_name: string
          p_middle_name: string
          p_last_name: string
          p_suffix: string
          p_business_name: string
          p_registered_address: string
          p_zip_code: string
          p_tin_number: string
          p_vat_status: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
