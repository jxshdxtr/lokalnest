
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Order } from './types';

interface OrderStatusBadgeProps {
  status: Order['status'];
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  return (
    <Badge 
      variant="outline" 
      className={`
        ${status === 'processing' ? 'border-amber-500 text-amber-500' : ''}
        ${status === 'shipped' ? 'border-blue-500 text-blue-500' : ''}
        ${status === 'delivered' ? 'border-green-500 text-green-500' : ''}
        ${status === 'cancelled' ? 'border-red-500 text-red-500' : ''}
      `}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export const OrderStatusIcon: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'processing':
      return <Clock className="h-5 w-5 text-amber-500" />;
    case 'shipped':
      return <Truck className="h-5 w-5 text-blue-500" />;
    case 'delivered':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'cancelled':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
};

export const getDeliveryProgress = (order: Order): number => {
  if (order.status === 'cancelled') return 0;
  if (order.status === 'processing') return 25;
  if (order.status === 'shipped') return 75;
  if (order.status === 'delivered') return 100;
  return 0;
};
