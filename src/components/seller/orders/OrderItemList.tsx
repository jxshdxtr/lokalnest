
import React from 'react';
import { Package } from 'lucide-react';
import { OrderItem } from './types';

interface OrderItemListProps {
  items: OrderItem[];
}

const OrderItemList: React.FC<OrderItemListProps> = ({ items }) => {
  return (
    <div className="space-y-1 max-w-[250px]">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded overflow-hidden bg-muted flex-shrink-0">
            {item.image ? (
              <img 
                src={item.image} 
                alt={item.product_name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium truncate">{item.product_name}</p>
            <p className="text-xs text-muted-foreground">
              {item.quantity} × ₱{item.unit_price.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderItemList;
