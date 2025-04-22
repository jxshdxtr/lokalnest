import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CustomerTable from './customers/CustomerTable';
import EmptyState from './customers/EmptyState';
import { useCustomers } from './customers/useCustomers';
import { toast } from 'sonner';
import { useSellerVerification } from '@/hooks/use-seller-verification';
import VerificationBanner from './VerificationBanner';

const CustomerManagement = () => {
  // Use our verification hook with updated logic
  const { isVerified, verificationStatus, isLoading: verificationLoading } = useSellerVerification();
  
  // Get customers data
  const { 
    customers, 
    isLoading,
    search,
    statusFilter,
    addTag,
    removeTag,
    refreshCustomers
  } = useCustomers();

  const handleUpdateStatus = async (customerId: string, status: string) => {
    if (!isVerified) return;
    
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

  // Show loading state while verification status is being checked
  if (verificationLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading customer management...</p>
        </div>
      </div>
    );
  }

  // Show verification banner for unverified sellers
  if (!isVerified && verificationStatus) {
    return (
      <div className="space-y-6">
        <VerificationBanner 
          status={verificationStatus} 
          message="To manage customers and view customer data, you need to verify your seller account."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {customers.length === 0 && !isLoading ? (
            <EmptyState 
              searchTerm={search}
              statusFilter={statusFilter}
            />
          ) : (
            <CustomerTable 
              customers={customers} 
              loading={isLoading}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;