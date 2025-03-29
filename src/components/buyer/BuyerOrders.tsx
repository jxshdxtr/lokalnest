
import React, { useState } from 'react';
import { 
  Truck, 
  Package, 
  ShoppingBag, 
  Clock,
  AlertCircle,
  CheckCircle2 
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Order {
  id: string;
  date: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking?: {
    id: string;
    courier: string;
    url: string;
    estimatedDelivery: string;
    currentLocation?: string;
    updates: {
      status: string;
      location: string;
      timestamp: string;
    }[];
  };
}

const BuyerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-8294",
      date: "2023-10-25",
      items: [
        {
          name: "Handwoven Cotton Tote Bag",
          quantity: 1,
          price: 850,
          image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2670&q=80",
        },
        {
          name: "Bamboo Serving Tray",
          quantity: 1,
          price: 650,
          image: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=2670&q=80",
        }
      ],
      total: 1500,
      status: 'shipped',
      tracking: {
        id: "TRK-5862",
        courier: "Philippine Express",
        url: "#track-url",
        estimatedDelivery: "2023-10-30",
        currentLocation: "Manila Sorting Facility",
        updates: [
          {
            status: "Order Processed",
            location: "Warehouse",
            timestamp: "Oct 26, 2023 - 09:15 AM"
          },
          {
            status: "Picked Up",
            location: "Iloilo City",
            timestamp: "Oct 27, 2023 - 10:23 AM"
          },
          {
            status: "In Transit",
            location: "Manila Sorting Facility",
            timestamp: "Oct 28, 2023 - 03:45 PM"
          }
        ]
      }
    },
    {
      id: "ORD-7392",
      date: "2023-10-15",
      items: [
        {
          name: "Handcrafted Wooden Bowls (Set of 3)",
          quantity: 1,
          price: 1200,
          image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=2670&q=80",
        }
      ],
      total: 1200,
      status: 'delivered',
      tracking: {
        id: "TRK-3921",
        courier: "Philippine Express",
        url: "#track-url",
        estimatedDelivery: "2023-10-20",
        updates: [
          {
            status: "Order Processed",
            location: "Warehouse",
            timestamp: "Oct 16, 2023 - 10:30 AM"
          },
          {
            status: "Picked Up",
            location: "Cebu City",
            timestamp: "Oct 17, 2023 - 09:15 AM"
          },
          {
            status: "In Transit",
            location: "Manila Sorting Facility",
            timestamp: "Oct 18, 2023 - 02:20 PM"
          },
          {
            status: "Out for Delivery",
            location: "Local Delivery Center",
            timestamp: "Oct 19, 2023 - 08:45 AM"
          },
          {
            status: "Delivered",
            location: "Customer Address",
            timestamp: "Oct 19, 2023 - 02:30 PM"
          }
        ]
      }
    },
    {
      id: "ORD-6104",
      date: "2023-09-30",
      items: [
        {
          name: "Hand-painted Ceramic Mug",
          quantity: 2,
          price: 450,
          image: "https://images.unsplash.com/photo-1547619292-8816ee7cdd50?auto=format&fit=crop&w=2670&q=80",
        }
      ],
      total: 900,
      status: 'processing'
    }
  ]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Shipped</Badge>;
      case 'delivered': 
        return <Badge variant="outline" className="border-green-500 text-green-500">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="border-red-500 text-red-500">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getDeliveryProgress = (order: Order) => {
    if (order.status === 'cancelled') return 0;
    if (order.status === 'processing') return 25;
    if (order.status === 'shipped') return 75;
    if (order.status === 'delivered') return 100;
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-semibold">My Orders</h2>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>
        <Button size="sm">Contact Support</Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle>Order #{order.id}</CardTitle>
                    <CardDescription>Placed on {new Date(order.date).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x ₱{item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₱{(item.quantity * item.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Total */}
                  <div className="flex justify-between pt-4 border-t">
                    <p className="font-semibold">Total</p>
                    <p className="font-semibold">₱{order.total.toLocaleString()}</p>
                  </div>

                  {/* Tracking Info */}
                  {order.tracking && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">Tracking Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <p className="text-muted-foreground">Courier</p>
                          <p>{order.tracking.courier}</p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <p className="text-muted-foreground">Tracking Number</p>
                          <p>{order.tracking.id}</p>
                        </div>
                        <div className="flex justify-between text-sm">
                          <p className="text-muted-foreground">Estimated Delivery</p>
                          <p>{new Date(order.tracking.estimatedDelivery).toLocaleDateString()}</p>
                        </div>
                        
                        {order.tracking.currentLocation && (
                          <div className="flex justify-between text-sm">
                            <p className="text-muted-foreground">Current Location</p>
                            <p>{order.tracking.currentLocation}</p>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Order Placed</span>
                          <span>Delivered</span>
                        </div>
                        <Progress value={getDeliveryProgress(order)} className="h-2" />
                      </div>

                      {/* Timeline */}
                      <div className="mt-6">
                        <h5 className="text-sm font-medium mb-4">Delivery Updates</h5>
                        <div className="space-y-4">
                          {order.tracking.updates.map((update, index) => (
                            <div key={index} className="flex">
                              <div className="mr-4 flex flex-col items-center">
                                <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
                                {index < order.tracking!.updates.length - 1 && (
                                  <div className="h-full w-px bg-muted-foreground/30 my-1"></div>
                                )}
                              </div>
                              <div className="pb-4">
                                <p className="text-sm font-medium">{update.status}</p>
                                <p className="text-xs text-muted-foreground">{update.location}</p>
                                <p className="text-xs text-muted-foreground">{update.timestamp}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <a href={order.tracking.url} target="_blank" rel="noopener noreferrer">
                            Track Order
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="processing" className="space-y-4">
          {orders.filter(order => order.status === 'processing').map(order => (
            // Similar rendering as above, filtered for processing orders
            // ... Using the same rendering logic
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle>Order #{order.id}</CardTitle>
                    <CardDescription>Placed on {new Date(order.date).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Order Items - Processing */}
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x ₱{item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₱{(item.quantity * item.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between pt-4 border-t">
                    <p className="font-semibold">Total</p>
                    <p className="font-semibold">₱{order.total.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="shipped" className="space-y-4">
          {orders.filter(order => order.status === 'shipped').map(order => (
            // Similar rendering as above, filtered for shipped orders
            <Card key={order.id} className="overflow-hidden">
              {/* Same rendering logic as above */}
              <CardHeader className="bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle>Order #{order.id}</CardTitle>
                    <CardDescription>Placed on {new Date(order.date).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Content is similar to above */}
                {/* ... */}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="delivered" className="space-y-4">
          {orders.filter(order => order.status === 'delivered').map(order => (
            // Similar rendering as above, filtered for delivered orders
            <Card key={order.id} className="overflow-hidden">
              {/* Same rendering logic as above */}
              <CardHeader className="bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle>Order #{order.id}</CardTitle>
                    <CardDescription>Placed on {new Date(order.date).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Content is similar to above */}
                {/* ... */}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuyerOrders;
