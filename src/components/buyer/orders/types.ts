export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface TrackingUpdate {
  status: string;
  location: string;
  timestamp: string;
}

export interface OrderTracking {
  id: string;
  courier: string;
  url: string;
  estimatedDelivery: string;
  currentLocation?: string;
  updates: TrackingUpdate[];
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking?: OrderTracking;
}

export type RawOrder = {
  id: string;
  created_at: string;
  total_amount: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
  buyer_id: string;
}

export type RawOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    name: string;
  }
}

export type RawProductImage = {
  url: string;
  product_id: string;
}
