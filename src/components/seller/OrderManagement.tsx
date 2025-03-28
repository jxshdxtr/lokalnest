
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileDown, 
  Mail, 
  ChevronDown, 
  ClipboardList, 
  Eye, 
  CheckCircle2, 
  Truck, 
  Package, 
  XCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Sample order data
const initialOrders = [
  {
    id: 'ORD-7352',
    customer: {
      name: 'Juan Dela Cruz',
      email: 'juan@example.com',
      phone: '+63 912 345 6789'
    },
    date: '2023-06-15',
    items: [
      { id: 'prod1', name: 'Handwoven Cotton Tote Bag', quantity: 1, price: 850 }
    ],
    total: 850,
    status: 'delivered',
    payment: {
      method: 'card',
      status: 'paid'
    },
    shipping: {
      address: '123 Bonifacio St, Makati City',
      method: 'standard',
      tracking: 'TRK123456789'
    }
  },
  {
    id: 'ORD-7351',
    customer: {
      name: 'Maria Santos',
      email: 'maria@example.com',
      phone: '+63 919 876 5432'
    },
    date: '2023-06-14',
    items: [
      { id: 'prod4', name: 'Handcrafted Silver Earrings', quantity: 1, price: 1800 }
    ],
    total: 1800,
    status: 'shipped',
    payment: {
      method: 'card',
      status: 'paid'
    },
    shipping: {
      address: '456 Rizal Ave, Quezon City',
      method: 'express',
      tracking: 'TRK987654321'
    }
  },
  {
    id: 'ORD-7350',
    customer: {
      name: 'Pedro Gomez',
      email: 'pedro@example.com',
      phone: '+63 917 555 1234'
    },
    date: '2023-06-14',
    items: [
      { id: 'prod3', name: 'Hand-painted Ceramic Mug', quantity: 1, price: 450 },
      { id: 'prod6', name: 'Artisanal Coconut Jam Set', quantity: 1, price: 420 }
    ],
    total: 870,
    status: 'processing',
    payment: {
      method: 'cod',
      status: 'pending'
    },
    shipping: {
      address: '789 Magsaysay Blvd, Manila',
      method: 'standard',
      tracking: null
    }
  },
  {
    id: 'ORD-7349',
    customer: {
      name: 'Sofia Garcia',
      email: 'sofia@example.com',
      phone: '+63 920 123 4567'
    },
    date: '2023-06-13',
    items: [
      { id: 'prod2', name: 'Wooden Serving Bowl', quantity: 1, price: 1200 }
    ],
    total: 1200,
    status: 'pending',
    payment: {
      method: 'gcash',
      status: 'paid'
    },
    shipping: {
      address: '101 Aguinaldo Highway, Cavite',
      method: 'standard',
      tracking: null
    }
  },
  {
    id: 'ORD-7348',
    customer: {
      name: 'Roberto Lim',
      email: 'roberto@example.com',
      phone: '+63 995 555 7890'
    },
    date: '2023-06-12',
    items: [
      { id: 'prod5', name: 'Handwoven Bamboo Wall Hanging', quantity: 1, price: 1650 }
    ],
    total: 1650,
    status: 'cancelled',
    payment: {
      method: 'card',
      status: 'refunded'
    },
    shipping: {
      address: '222 Roxas Avenue, Davao City',
      method: 'express',
      tracking: null
    }
  }
];

const OrderManagement = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Filter by search term
      const searchMatch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const statusMatch = statusFilter === 'all' || order.status === statusFilter;
      
      return searchMatch && statusMatch;
    });
  };

  const filteredOrders = getFilteredOrders();

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (method: string, status: string) => {
    const color = status === 'paid' ? 'green' : 
                  status === 'refunded' ? 'orange' : 'yellow';
    
    return (
      <div className="flex flex-col">
        <span className="capitalize text-sm">{method}</span>
        <Badge variant="outline" className={`bg-${color}-100 text-${color}-800 border-${color}-200 text-xs mt-1 w-fit`}>
          {status}
        </Badge>
      </div>
    );
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
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="p-3 text-sm font-medium">Order ID</th>
                  <th className="p-3 text-sm font-medium">Customer</th>
                  <th className="p-3 text-sm font-medium">Date</th>
                  <th className="p-3 text-sm font-medium">Payment</th>
                  <th className="p-3 text-sm font-medium">Total</th>
                  <th className="p-3 text-sm font-medium">Status</th>
                  <th className="p-3 text-sm font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-3 font-medium">{order.id}</td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{order.date}</td>
                    <td className="p-3">
                      {getPaymentBadge(order.payment.method, order.payment.status)}
                    </td>
                    <td className="p-3 font-medium">₱{order.total.toFixed(2)}</td>
                    <td className="p-3">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 px-2">
                              Update
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              disabled={order.status === 'processing'}
                            >
                              <ClipboardList className="h-4 w-4 mr-2" />
                              Mark as Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                              disabled={order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled'}
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              Mark as Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              disabled={order.status === 'delivered' || order.status === 'cancelled'}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Mark as Delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              disabled={order.status === 'delivered' || order.status === 'cancelled'}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" size="icon">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      No orders found. Try adjusting your search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;
