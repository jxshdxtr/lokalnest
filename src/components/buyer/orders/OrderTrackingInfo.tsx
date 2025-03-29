
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { OrderTracking, Order } from './types';
import OrderTimeline from './OrderTimeline';
import { getDeliveryProgress } from './OrderStatusBadge';

interface OrderTrackingInfoProps {
  order: Order;
  tracking: OrderTracking;
}

const OrderTrackingInfo: React.FC<OrderTrackingInfoProps> = ({ order, tracking }) => {
  return (
    <div className="border-t pt-4">
      <h4 className="font-medium mb-4">Tracking Information</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <p className="text-muted-foreground">Courier</p>
          <p>{tracking.courier}</p>
        </div>
        <div className="flex justify-between text-sm">
          <p className="text-muted-foreground">Tracking Number</p>
          <p>{tracking.id}</p>
        </div>
        <div className="flex justify-between text-sm">
          <p className="text-muted-foreground">Estimated Delivery</p>
          <p>{new Date(tracking.estimatedDelivery).toLocaleDateString()}</p>
        </div>
        
        {tracking.currentLocation && (
          <div className="flex justify-between text-sm">
            <p className="text-muted-foreground">Current Location</p>
            <p>{tracking.currentLocation}</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Order Placed</span>
          <span>Delivered</span>
        </div>
        <Progress value={getDeliveryProgress(order)} className="h-2" />
      </div>

      {/* Timeline */}
      {tracking.updates.length > 0 && (
        <OrderTimeline updates={tracking.updates} />
      )}

      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <a href={tracking.url} target="_blank" rel="noopener noreferrer">
            Track Order
          </a>
        </Button>
      </div>
    </div>
  );
};

export default OrderTrackingInfo;
