
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Order } from './types';
import { OrderStatusBadge, OrderStatusIcon } from './OrderStatusBadge';
import OrderTrackingInfo from './OrderTrackingInfo';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return (
    <Card key={order.id} className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle>Order #{order.id}</CardTitle>
            <CardDescription>Placed on {new Date(order.date).toLocaleDateString()}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <OrderStatusIcon status={order.status} />
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Order Items */}
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x ₱{item.price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₱{(item.quantity * item.price).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Total */}
          <div className="flex justify-between pt-4 border-t">
            <p className="font-semibold">Total</p>
            <p className="font-semibold">₱{order.total.toLocaleString()}</p>
          </div>

          {/* Tracking Info */}
          {order.tracking && (
            <OrderTrackingInfo order={order} tracking={order.tracking} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
