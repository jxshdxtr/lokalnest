
export interface Customer {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  total_orders: number;
  total_spent: number;
  last_purchase_date: string;
  status: string;
  tags: string[];
}
