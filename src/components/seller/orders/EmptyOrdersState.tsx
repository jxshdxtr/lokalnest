
import React from 'react';
import { Package } from 'lucide-react';

interface EmptyOrdersStateProps {
  hasFilters: boolean;
}

const EmptyOrdersState: React.FC<EmptyOrdersStateProps> = ({ hasFilters }) => {
  return (
    <div className="text-center py-12">
      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No orders found</h3>
      <p className="text-muted-foreground">
        {hasFilters
          ? 'Try adjusting your search filters.'
          : "You haven't received any orders yet."}
      </p>
    </div>
  );
};

export default EmptyOrdersState;
