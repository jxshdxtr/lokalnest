export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
  product_id: string; // Adding proper UUID product ID field
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
