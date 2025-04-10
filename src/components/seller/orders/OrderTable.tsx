
import React from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Order } from './types';
import OrderItemList from './OrderItemList';
import OrderStatus from './OrderStatus';
import PaymentStatus from './PaymentStatus';
import OrderActions from './OrderActions';
import EmptyOrdersState from './EmptyOrdersState';

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  hasFilters: boolean;
  formatOrderDate: (dateString: string) => string;
  onUpdateOrderStatus: (orderId: string, status: string) => Promise<void>;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  loading,
  hasFilters,
  formatOrderDate,
  onUpdateOrderStatus
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (orders.length === 0) {
    return <EmptyOrdersState hasFilters={hasFilters} />;
  }

  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Order Info</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <div>
                  <p>Order #{order.id.split('-')[0]}</p>
                  <div className="flex items-center text-muted-foreground text-xs gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatOrderDate(order.date)}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{order.buyer_name}</TableCell>
              <TableCell>
                <OrderItemList items={order.items} />
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-xs">{order.payment_method}</p>
                  <PaymentStatus status={order.payment_status} />
                </div>
              </TableCell>
              <TableCell>
                <p className="font-medium">₱{order.total.toFixed(2)}</p>
              </TableCell>
              <TableCell>
                <OrderStatus status={order.status} />
              </TableCell>
              <TableCell className="text-right">
                <OrderActions 
                  orderId={order.id} 
                  status={order.status} 
                  onUpdateStatus={onUpdateOrderStatus} 
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTable;
