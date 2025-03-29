
import React from 'react';
import { TrackingUpdate } from './types';

interface OrderTimelineProps {
  updates: TrackingUpdate[];
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ updates }) => {
  return (
    <div className="mt-6">
      <h5 className="text-sm font-medium mb-4">Delivery Updates</h5>
      <div className="space-y-4">
        {updates.map((update, index) => (
          <div key={index} className="flex">
            <div className="mr-4 flex flex-col items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
              {index < updates.length - 1 && (
                <div className="h-full w-px bg-muted-foreground/30 my-1"></div>
              )}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium">{update.status}</p>
              <p className="text-xs text-muted-foreground">{update.location}</p>
              <p className="text-xs text-muted-foreground">{update.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTimeline;
