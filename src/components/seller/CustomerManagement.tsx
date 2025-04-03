import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CustomerFilters from './customers/CustomerFilters';
import CustomerTable from './customers/CustomerTable';
import EmptyState from './customers/EmptyState';
import { useCustomers } from './customers/useCustomers';

const CustomerManagement = () => {
  const { 
    customers, 
    isLoading, 
    search, 
    statusFilter, 
    sortField,
    sortOrder,
    setSearch, 
    setStatusFilter, 
    setSortField,
    setSortOrder
  } = useCustomers();

  // Map sortField and sortOrder to a single sortBy value for the filter component
  const getSortByValue = () => {
    if (sortField === 'last_purchase_date') return 'recent';
    if (sortField === 'full_name') return 'name';
    if (sortField === 'total_orders') return 'orders';
    if (sortField === 'total_spent') return 'spent';
    return 'recent';
  };

  // Handle sort change from the filter component
  const handleSortChange = (value: string) => {
    if (value === 'recent') {
      setSortField('last_purchase_date');
      setSortOrder('desc');
    } else if (value === 'name') {
      setSortField('full_name');
      setSortOrder('asc');
    } else if (value === 'orders') {
      setSortField('total_orders');
      setSortOrder('desc');
    } else if (value === 'spent') {
      setSortField('total_spent');
      setSortOrder('desc');
    }
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Handle customer status update
  const updateCustomerStatus = (customerId: string, status: string) => {
    // Since we don't have this function directly from useCustomers,
    // we would need to implement it here using the available methods
    console.log(`Updating customer ${customerId} status to ${status}`);
    // In a real implementation, we would call an API or use the addTag/removeTag methods
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <CustomerFilters 
            searchTerm={search}
            statusFilter={statusFilter}
            sortBy={getSortByValue()}
            onSearchChange={handleSearch}
            onStatusChange={setStatusFilter}
            onSortChange={handleSortChange}
          />

          {isLoading ? (
            <CustomerTable customers={[]} loading={true} onUpdateStatus={updateCustomerStatus} />
          ) : customers.length > 0 ? (
            <CustomerTable 
              customers={customers} 
              loading={false} 
              onUpdateStatus={updateCustomerStatus} 
            />
          ) : (
            <EmptyState searchTerm={search} statusFilter={statusFilter} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;
