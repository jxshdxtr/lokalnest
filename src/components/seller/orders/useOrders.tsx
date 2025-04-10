
import { useState, useEffect } from 'react';
import { fetchSellerOrders, updateOrderStatus } from './orderService';
import { Order } from './types';
import { toast } from 'sonner';
import { formatDistance } from 'date-fns';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await fetchSellerOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Filter and sort orders
  const getFilteredAndSortedOrders = () => {
    const filteredOrders = orders.filter(order => {
      // Search term filter
      const searchMatch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        order.items.some(item => 
          item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      // Status filter
      const statusMatch = 
        statusFilter === 'all' || 
        order.status === statusFilter;
      
      // Time filter
      let timeMatch = true;
      const now = new Date();
      const orderDate = new Date(order.date);
      
      if (timeFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        timeMatch = orderDate >= today;
      } else if (timeFilter === 'this_week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        timeMatch = orderDate >= startOfWeek;
      } else if (timeFilter === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        timeMatch = orderDate >= startOfMonth;
      }
      
      return searchMatch && statusMatch && timeMatch;
    });

    // Sort orders
    return [...filteredOrders].sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'total_desc') {
        return b.total - a.total;
      } else {
        return a.total - b.total;
      }
    });
  };

  const formatOrderDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return {
    orders,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    sortBy,
    setSortBy,
    handleUpdateOrderStatus,
    getFilteredAndSortedOrders,
    formatOrderDate
  };
}
