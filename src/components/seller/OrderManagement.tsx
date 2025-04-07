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

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image?: string;
}

interface Order {
  id: string;
  date: string;
  buyer_id: string;
  buyer_name?: string;
  items: OrderItem[];
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to view orders');
        navigate('/auth');
        return;
      }

      console.log('Session user ID:', session.user.id);

      // First, fetch all products for this seller
      const { data: sellerProducts, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', session.user.id);
        
      if (productsError) {
        console.error('Error fetching seller products:', productsError);
        throw productsError;
      }
      
      console.log('Seller products found:', sellerProducts?.length || 0);
      
      if (!sellerProducts || sellerProducts.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }
      
      const productIds = sellerProducts.map(p => p.id);
      
      // Get all order items for these products
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          unit_price,
          total_price,
          products:product_id(name)
        `)
        .in('product_id', productIds);
        
      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        throw itemsError;
      }
      
      console.log('Order items found:', orderItems?.length || 0);
      
      if (!orderItems || orderItems.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }
      
      // Get unique order IDs
      const orderIds = [...new Set(orderItems.map(item => item.order_id))];
      
      // Get order details
      const { data: orderDetails, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          buyer_id,
          total_amount,
          status,
          payment_status,
          payment_method,
          shipping_address,
          profiles:buyer_id(full_name)
        `)
        .in('id', orderIds);
        
      if (ordersError) {
        console.error('Error fetching order details:', ordersError);
        throw ordersError;
      }
      
      console.log('Order details found:', orderDetails?.length || 0);
      
      try {
        // Prepare product images fetch promises
        const imagePromises = orderItems.map(async (item) => {
          try {
            const { data: images, error: imageError } = await supabase
              .from('product_images')
              .select('url')
              .eq('product_id', item.product_id)
              .eq('is_primary', true)
              .limit(1);
              
            if (imageError) {
              console.error('Error fetching image for product:', item.product_id, imageError);
              return { item_id: item.id, image_url: undefined };
            }
            
            return { 
              item_id: item.id, 
              image_url: images && images.length > 0 ? images[0].url : undefined 
            };
          } catch (imageErr) {
            console.error('Exception in image fetch:', imageErr);
            return { item_id: item.id, image_url: undefined };
          }
        });
        
        // Execute all image fetch promises
        const itemImages = await Promise.all(imagePromises);
        
        // Build complete orders with items
        const completeOrders = orderDetails.map(order => {
          // Find all items for this order
          const items = orderItems
            .filter(item => item.order_id === order.id)
            .map(item => {
              // Find image for this item
              const imageData = itemImages.find(img => img.item_id === item.id);
              return {
                id: item.id,
                product_id: item.product_id,
                product_name: item.products?.name || 'Unknown Product',
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                image: imageData?.image_url
              };
            });
            
          return {
            id: order.id,
            date: order.created_at,
            buyer_id: order.buyer_id,
            buyer_name: order.profiles?.full_name || 'Customer',
            items,
            total: order.total_amount,
            status: order.status,
            payment_status: order.payment_status,
            payment_method: order.payment_method,
            shipping_address: order.shipping_address
          };
        });
        
        setOrders(completeOrders);
      } catch (processingError) {
        console.error('Error processing order data:', processingError);
        throw processingError;
      }
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

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
        
      if (error) throw error;
      
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

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Refunded</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Newest First</SelectItem>
                  <SelectItem value="date_asc">Oldest First</SelectItem>
                  <SelectItem value="total_desc">Highest Amount</SelectItem>
                  <SelectItem value="total_asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sortedOrders.length > 0 ? (
            <div className="space-y-4">
              {sortedOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <div className="p-4 bg-muted/20">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">Order #{order.id.split('-')[0]}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center text-muted-foreground text-xs gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatOrderDate(order.date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Customer</p>
                          <p className="text-sm font-medium">{order.buyer_name || 'Customer'}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Payment</p>
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-sm font-medium">{order.payment_method}</span>
                            {getPaymentStatusBadge(order.payment_status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.product_name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-muted flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-medium truncate">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} × ₱{item.unit_price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₱{item.total_price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Shipping Address</p>
                      <p className="text-sm">{order.shipping_address}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-lg font-semibold">₱{order.total.toFixed(2)}</p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {order.status === 'processing' && (
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'shipped')}>
                              <Truck className="mr-2 h-4 w-4" />
                              Mark as Shipped
                            </DropdownMenuItem>
                          )}
                          
                          {order.status === 'shipped' && (
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'delivered')}>
                              <ClipboardCheck className="mr-2 h-4 w-4" />
                              Mark as Delivered
                            </DropdownMenuItem>
                          )}
                          
                          {(order.status === 'processing' || order.status === 'shipped') && (
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                              <Tag className="mr-2 h-4 w-4" />
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || timeFilter !== 'all'
                  ? 'Try adjusting your search filters.'
                  : "You haven't received any orders yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;
