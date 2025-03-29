
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { mockOrders } from './orders/mockData';
import OrderList from './orders/OrderList';
import { Order } from './orders/types';

const BuyerOrders = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

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
        
        <TabsContent value="all">
          <OrderList orders={orders} />
        </TabsContent>
        
        <TabsContent value="processing">
          <OrderList orders={orders} filterStatus="processing" />
        </TabsContent>
        
        <TabsContent value="shipped">
          <OrderList orders={orders} filterStatus="shipped" />
        </TabsContent>
        
        <TabsContent value="delivered">
          <OrderList orders={orders} filterStatus="delivered" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuyerOrders;
