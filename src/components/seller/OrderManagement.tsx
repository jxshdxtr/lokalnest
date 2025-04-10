
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useOrders } from './orders/useOrders';
import OrderFilters from './orders/OrderFilters';
import OrderTable from './orders/OrderTable';

const OrderManagement = () => {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    sortBy,
    setSortBy,
    loading,
    handleUpdateOrderStatus,
    getFilteredAndSortedOrders,
    formatOrderDate
  } = useOrders();

  const filteredOrders = getFilteredAndSortedOrders();
  const hasFilters = !!searchTerm || statusFilter !== 'all' || timeFilter !== 'all';

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <OrderFilters 
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />

          <OrderTable 
            orders={filteredOrders}
            loading={loading}
            hasFilters={hasFilters}
            formatOrderDate={formatOrderDate}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;
