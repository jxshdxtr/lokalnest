
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CustomerTable from './customers/CustomerTable';
import EmptyState from './customers/EmptyState';
import { useCustomers } from './customers/useCustomers';
import { toast } from 'sonner';

const CustomerManagement = () => {
  const { customers, loading, setCustomers } = useCustomers();

  const handleUpdateStatus = async (customerId: string, status: string) => {
    try {
      // In a real app, you would call an API here
      const updatedCustomers = customers.map(customer => 
        customer.id === customerId ? { ...customer, status } : customer
      );
      
      setCustomers(updatedCustomers);
      toast.success(`Customer status updated to ${status}`);
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {customers.length === 0 && !loading ? (
            <EmptyState />
          ) : (
            <CustomerTable 
              customers={customers} 
              loading={loading} 
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;
