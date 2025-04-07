
import React from 'react';
import { Order } from './types';
import OrderCard from './OrderCard';
import { Skeleton } from "@/components/ui/skeleton";

interface OrderListProps {
  orders: Order[];
  filterStatus?: Order['status'];
  loading?: boolean;
}

const OrderList: React.FC<OrderListProps> = ({ orders, filterStatus, loading = false }) => {
  const filteredOrders = filterStatus 
    ? orders.filter(order => order.status === filterStatus)
    : orders;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredOrders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          No orders found.
        </div>
      )}
    </div>
  );
};

export default OrderList;
