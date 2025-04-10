
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface OrderStatusProps {
  status: string;
}

const OrderStatus: React.FC<OrderStatusProps> = ({ status }) => {
  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return getStatusBadge(status);
};

export default OrderStatus;
