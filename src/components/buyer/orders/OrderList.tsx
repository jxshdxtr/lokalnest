
import React from 'react';
import { Order } from './types';
import OrderCard from './OrderCard';

interface OrderListProps {
  orders: Order[];
  filterStatus?: Order['status'];
}

const OrderList: React.FC<OrderListProps> = ({ orders, filterStatus }) => {
  const filteredOrders = filterStatus 
    ? orders.filter(order => order.status === filterStatus)
    : orders;

  return (
    <div className="space-y-4">
      {filteredOrders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
      {filteredOrders.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No orders found.
        </div>
      )}
    </div>
  );
};

export default OrderList;
