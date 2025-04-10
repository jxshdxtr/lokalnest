
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  MoreHorizontal, 
  Calendar, 
  Tag, 
  Package, 
  Truck,
  ClipboardCheck,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistance } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchSellerOrders, updateOrderStatus } from './orders/orderService';
import { OrderItem, Order } from './orders/types';
import EmptyOrdersState from './orders/EmptyOrdersState';
import OrderFilters from './orders/OrderFilters';
import OrderItemList from './orders/OrderItemList';
import OrderStatus from './orders/OrderStatus';
import PaymentStatus from './orders/PaymentStatus';

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  
  const navigate = useNavigate();

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
      toast.error('Failed to load orders: ' + (error.message || 'Unknown error'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
  const sortedOrders = [...filteredOrders].sort((a, b) => {
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

  const formatOrderDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <OrderFilters 
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sortedOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Order Info</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>Order #{order.id.split('-')[0]}</p>
                          <div className="flex items-center text-muted-foreground text-xs gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatOrderDate(order.date)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{order.buyer_name}</TableCell>
                      <TableCell>
                        <OrderItemList items={order.items} />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs">{order.payment_method}</p>
                          <PaymentStatus status={order.payment_status} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">₱{order.total.toFixed(2)}</p>
                      </TableCell>
                      <TableCell>
                        <OrderStatus status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {order.status === 'processing' && (
                              <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}>
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as Shipped
                              </DropdownMenuItem>
                            )}
                            
                            {order.status === 'shipped' && (
                              <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}>
                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                Mark as Delivered
                              </DropdownMenuItem>
                            )}
                            
                            {(order.status === 'processing' || order.status === 'shipped') && (
                              <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}>
                                <Tag className="mr-2 h-4 w-4" />
                                Cancel Order
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem>
                              <Package className="mr-2 h-4 w-4" />
                              View Order Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyOrdersState 
              hasFilters={searchTerm || statusFilter !== 'all' || timeFilter !== 'all'} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;
