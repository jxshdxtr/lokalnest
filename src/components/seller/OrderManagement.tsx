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
  XCircle,
  CreditCard,
  Wallet,
  Phone,
  Database,
  Bell,
  ShoppingBag,
  Users,
  DollarSign,
  MoreHorizontal,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

type PaymentDetails = {
  cardType?: string;
  last4?: string;
  reference?: string;
};

type Payment = {
  method: string;
  status: string;
  details: PaymentDetails;
};

type Order = {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  date: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    currentStock: number;
  }[];
  total: number;
  status: string;
  payment: Payment;
  shipping: {
    address: string;
    method: string;
    tracking: string | null;
  };
};

const initialOrders: Order[] = [
  {
    id: 'ORD-7352',
    customer: {
      name: 'Juan Dela Cruz',
      email: 'juan@example.com',
      phone: '+63 912 345 6789'
    },
    date: '2023-06-15',
    items: [
      { id: 'prod1', name: 'Handwoven Cotton Tote Bag', quantity: 1, price: 850, currentStock: 15 }
    ],
    total: 850,
    status: 'delivered',
    payment: {
      method: 'card',
      status: 'paid',
      details: {
        cardType: 'Visa',
        last4: '4242'
      }
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
      { id: 'prod4', name: 'Handcrafted Silver Earrings', quantity: 1, price: 1800, currentStock: 5 }
    ],
    total: 1800,
    status: 'shipped',
    payment: {
      method: 'card',
      status: 'paid',
      details: {
        cardType: 'Mastercard',
        last4: '5678'
      }
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
      { id: 'prod3', name: 'Hand-painted Ceramic Mug', quantity: 1, price: 450, currentStock: 22 },
      { id: 'prod6', name: 'Artisanal Coconut Jam Set', quantity: 1, price: 420, currentStock: 12 }
    ],
    total: 870,
    status: 'processing',
    payment: {
      method: 'cod',
      status: 'pending',
      details: {}
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
      { id: 'prod2', name: 'Wooden Serving Bowl', quantity: 1, price: 1200, currentStock: 8 }
    ],
    total: 1200,
    status: 'pending',
    payment: {
      method: 'gcash',
      status: 'paid',
      details: {
        reference: 'GC123456'
      }
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
      { id: 'prod5', name: 'Handwoven Bamboo Wall Hanging', quantity: 1, price: 1650, currentStock: 0 }
    ],
    total: 1650,
    status: 'cancelled',
    payment: {
      method: 'card',
      status: 'refunded',
      details: {
        cardType: 'Visa',
        last4: '9876'
      }
    },
    shipping: {
      address: '222 Roxas Avenue, Davao City',
      method: 'express',
      tracking: null
    }
  }
];

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'gcash', name: 'GCash', icon: Wallet },
  { id: 'paymaya', name: 'PayMaya', icon: Phone },
  { id: 'cod', name: 'Cash on Delivery', icon: DollarSign },
  { id: 'bank', name: 'Bank Transfer', icon: Database },
];

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isUpdatePaymentOpen, setIsUpdatePaymentOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isNotifyCustomerOpen, setIsNotifyCustomerOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [updateInventory, setUpdateInventory] = useState(true);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const searchMatch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const statusMatch = statusFilter === 'all' || order.status === statusFilter;
      
      return searchMatch && statusMatch;
    });
  };

  const filteredOrders = getFilteredOrders();

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        if (newStatus === 'cancelled' && ['processing', 'shipped'].includes(order.status)) {
          toast.info("Inventory has been automatically updated");
        }
        
        if ((newStatus === 'shipped' || newStatus === 'delivered') && updateInventory) {
          if (order.status === 'pending' || order.status === 'processing') {
            toast.info("Inventory has been automatically updated");
          }
        }
        
        if (newStatus === 'delivered' && order.payment.method === 'cod' && order.payment.status === 'pending') {
          return {
            ...order,
            status: newStatus,
            payment: {
              ...order.payment,
              status: 'paid'
            }
          };
        }
        
        return { ...order, status: newStatus };
      }
      return order;
    }));
    
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
    
    if (newStatus === 'shipped' || newStatus === 'delivered') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const message = newStatus === 'shipped' 
          ? `Your order ${orderId} has been shipped and is on its way to you!`
          : `Your order ${orderId} has been delivered. Thank you for shopping with us!`;
        
        toast.success(`Customer ${order.customer.name} has been automatically notified about their ${newStatus} order`);
      }
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const openUpdatePayment = (order: Order) => {
    setSelectedOrder(order);
    setSelectedPaymentMethod(order.payment.method);
    setPaymentStatus(order.payment.status);
    setIsUpdatePaymentOpen(true);
  };

  const updatePaymentMethod = () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    
    setOrders(orders.map(order => {
      if (order.id === selectedOrder?.id) {
        let details: PaymentDetails = {};
        
        if (selectedPaymentMethod === 'card' && order.payment.method === 'card') {
          details = {
            ...order.payment.details,
          };
        } else if (selectedPaymentMethod === 'gcash') {
          details = {
            reference: order.payment.details.reference || 'GC' + Math.floor(100000 + Math.random() * 900000)
          };
        }
        
        return {
          ...order,
          payment: {
            method: selectedPaymentMethod,
            status: paymentStatus,
            details: details
          }
        };
      }
      return order;
    }));
    
    toast.success(`Payment method for Order ${selectedOrder?.id} updated to ${selectedPaymentMethod}`);
    setIsUpdatePaymentOpen(false);
  };

  const openNotifyCustomer = (order: Order) => {
    setSelectedOrder(order);
    
    let message = '';
    switch(order.status) {
      case 'pending':
        message = `Dear ${order.customer.name},\n\nThank you for your order ${order.id}. We're currently processing it and will update you soon.\n\nBest regards,\nArtisan Crafts Team`;
        break;
      case 'processing':
        message = `Dear ${order.customer.name},\n\nYour order ${order.id} is now being processed. We'll notify you once it ships.\n\nBest regards,\nArtisan Crafts Team`;
        break;
      case 'shipped':
        message = `Dear ${order.customer.name},\n\nGreat news! Your order ${order.id} has been shipped and is on its way to you.\n\nTracking number: ${order.shipping.tracking || 'Will be provided soon'}\n\nBest regards,\nArtisan Crafts Team`;
        break;
      case 'delivered':
        message = `Dear ${order.customer.name},\n\nYour order ${order.id} has been delivered. We hope you love your handcrafted items!\n\nBest regards,\nArtisan Crafts Team`;
        break;
      default:
        message = `Dear ${order.customer.name},\n\nRegarding your order ${order.id}:\n\n[Your message here]\n\nBest regards,\nArtisan Crafts Team`;
    }
    
    setNotificationMessage(message);
    setIsNotifyCustomerOpen(true);
  };

  const sendCustomerNotification = () => {
    if (!notificationMessage) {
      toast.error("Please enter a message");
      return;
    }
    
    toast.success(`Message sent to ${selectedOrder.customer.name}`);
    setIsNotifyCustomerOpen(false);
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
    const paymentIcon = paymentMethods.find(p => p.id === method)?.icon || Wallet;
    
    const statusColor = status === 'paid' ? 'green' : 
                  status === 'refunded' ? 'orange' : 'yellow';
    
    return (
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="bg-muted p-1 rounded-full">
                {React.createElement(paymentIcon, { size: 14 })}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {paymentMethods.find(p => p.id === method)?.name || 'Payment Method'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex flex-col">
          <span className="capitalize text-sm">{method}</span>
          <Badge variant="outline" className={`bg-${statusColor}-100 text-${statusColor}-800 border-${statusColor}-200 text-xs mt-1 w-fit`}>
            {status}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
            <h2 className="text-xl font-semibold">Order Management</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Bell className="h-4 w-4" />
                <span>Alerts</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <ShoppingBag className="h-4 w-4" />
                <span>Bulk Update</span>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-semibold">{orders.length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 flex items-center">
                <div className="bg-yellow-100 p-2 rounded-full mr-4">
                  <ClipboardList className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-semibold">{orders.filter(o => o.status === 'pending').length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 flex items-center">
                <div className="bg-purple-100 p-2 rounded-full mr-4">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shipped</p>
                  <p className="text-2xl font-semibold">{orders.filter(o => o.status === 'shipped').length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-semibold">{orders.filter(o => o.status === 'delivered').length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => viewOrderDetails(order)}
                        >
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

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openUpdatePayment(order)}>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Update Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openNotifyCustomer(order)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Notify Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.id} Details</DialogTitle>
            <DialogDescription>
              Order placed on {selectedOrder?.date}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  <div className="text-sm">
                    <p className="font-medium">{selectedOrder.customer.name}</p>
                    <p>{selectedOrder.customer.email}</p>
                    <p>{selectedOrder.customer.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Shipping Information</h4>
                  <div className="text-sm">
                    <p>{selectedOrder.shipping.address}</p>
                    <p>Method: {selectedOrder.shipping.method}</p>
                    {selectedOrder.shipping.tracking && (
                      <p>Tracking: {selectedOrder.shipping.tracking}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Payment Information</h4>
                  <div className="text-sm">
                    <p>Method: {selectedOrder.payment.method}</p>
                    <p>Status: {selectedOrder.payment.status}</p>
                    {selectedOrder.payment.details && selectedOrder.payment.details.cardType && (
                      <p>{selectedOrder.payment.details.cardType} ending in {selectedOrder.payment.details.last4}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Order Items</h4>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="p-2">Product</th>
                      <th className="p-2">Quantity</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="border-b border-border">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">₱{item.price.toFixed(2)}</td>
                        <td className="p-2">₱{(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-medium">
                      <td colSpan={3} className="p-2 text-right">Total:</td>
                      <td className="p-2">₱{selectedOrder.total.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsOrderDetailOpen(false)}>Close</Button>
                <Button 
                  onClick={() => {
                    setIsOrderDetailOpen(false);
                    openNotifyCustomer(selectedOrder);
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Customer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdatePaymentOpen} onOpenChange={setIsUpdatePaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Method</DialogTitle>
            <DialogDescription>
              Update payment details for order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center gap-2">
                        {React.createElement(method.icon, { size: 14 })}
                        <span>{method.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdatePaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updatePaymentMethod}>
              Update Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNotifyCustomerOpen} onOpenChange={setIsNotifyCustomerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notify Customer</DialogTitle>
            <DialogDescription>
              Send a message to {selectedOrder?.customer.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                value={selectedOrder?.customer.email} 
                disabled
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Message</label>
              <textarea 
                className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Type your message to the customer here..."
                rows={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotifyCustomerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendCustomerNotification}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
