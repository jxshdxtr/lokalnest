
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CustomerFilters from './customers/CustomerFilters';
import CustomerTable from './customers/CustomerTable';
import EmptyState from './customers/EmptyState';
import { useCustomers } from './customers/useCustomers';

const CustomerManagement = () => {
  const { 
    customers, 
    loading, 
    searchTerm, 
    statusFilter, 
    sortBy, 
    setSearchTerm, 
    setStatusFilter, 
    setSortBy, 
    updateCustomerStatus 
  } = useCustomers();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <CustomerFilters 
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            sortBy={sortBy}
            onSearchChange={handleSearch}
            onStatusChange={setStatusFilter}
            onSortChange={setSortBy}
          />

          {loading ? (
            <CustomerTable customers={[]} loading={true} onUpdateStatus={updateCustomerStatus} />
          ) : customers.length > 0 ? (
            <CustomerTable 
              customers={customers} 
              loading={false} 
              onUpdateStatus={updateCustomerStatus} 
            />
          ) : (
            <EmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;
