
export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image?: string;
}

export interface Order {
  id: string;
  date: string;
  buyer_id: string;
  buyer_name?: string;
  items: OrderItem[];
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: string;
}
