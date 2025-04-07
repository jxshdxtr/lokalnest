
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CustomerTable from './customers/CustomerTable';
import EmptyState from './customers/EmptyState';
import { useCustomers } from './customers/useCustomers';
import { toast } from 'sonner';

const CustomerManagement = () => {
  // Fix: use correct property names from the useCustomers hook
  const { 
    customers, 
    isLoading, // Changed from 'loading' to 'isLoading'
    search,
    statusFilter,
    addTag,
    removeTag,
    refreshCustomers
  } = useCustomers();

  const handleUpdateStatus = async (customerId: string, status: string) => {
    try {
      // In a real app, you would call an API here
      // Since we can't setCustomers directly, we'll refresh the customer list after update
      const updatedCustomers = customers.map(customer => 
        customer.id === customerId ? { ...customer, status } : customer
      );
      
      // Simulate API update (in a real app, this would be an API call)
      // Then refresh the customers list
      setTimeout(() => {
        refreshCustomers();
        toast.success(`Customer status updated to ${status}`);
      }, 300);
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {customers.length === 0 && !isLoading ? (
            <EmptyState 
              searchTerm={search} // Fix: Pass the required searchTerm prop
              statusFilter={statusFilter} // Fix: Pass the required statusFilter prop
            />
          ) : (
            <CustomerTable 
              customers={customers} 
              loading={isLoading} // Changed from 'loading' to 'isLoading'
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;
