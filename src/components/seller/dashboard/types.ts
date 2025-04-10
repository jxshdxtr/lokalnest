
import { ReactNode } from 'react';

export interface StatData {
  title: string;
  value: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
  icon: ReactNode;
}

export interface SellerStats {
  sales: StatData;
  orders: StatData;
  rating: StatData;
  customers: StatData;
}

export interface RevenueData {
  name: string;
  value: number;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: string;
  date: string;
}
