
import React from 'react';
import { Users } from 'lucide-react';

interface EmptyStateProps {
  searchTerm: string;
  statusFilter: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchTerm, statusFilter }) => {
  return (
    <div className="text-center py-12">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No customers found</h3>
      <p className="text-muted-foreground">
        {searchTerm || statusFilter !== 'all'
          ? 'Try adjusting your search filters.'
          : "You don't have any customers yet."}
      </p>
    </div>
  );
};

export default EmptyState;
