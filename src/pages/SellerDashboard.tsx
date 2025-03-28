
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SellerSidebar from '@/components/seller/SellerSidebar';
import SellerOverview from '@/components/seller/SellerOverview';

// Mock current user data - this would come from your auth system
const currentUser = {
  id: 'seller123',
  role: 'seller',
  name: 'Artisan Crafts Co.',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
  verified: true
};

const SellerDashboard = () => {
  const location = useLocation();
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect if user is not a seller
  if (currentUser.role !== 'seller') {
    return <Navigate to="/" replace />;
  }

  // Get current active tab from path
  const getActiveTab = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'products') return 'products';
    if (path === 'orders') return 'orders';
    if (path === 'promotions') return 'promotions';
    return 'overview';
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Seller Dashboard</h1>
              <p className="text-muted-foreground">Manage your products, orders, and store</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <SellerSidebar user={currentUser} />
            </div>

            {/* Content Area */}
            <div className="col-span-1 lg:col-span-9">
              <Tabs defaultValue={getActiveTab()} className="w-full">
                <TabsList className="w-full mb-6 overflow-x-auto flex sm:grid sm:grid-cols-4">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="products" className="flex-1">Products</TabsTrigger>
                  <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
                  <TabsTrigger value="promotions" className="flex-1">Promotions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <SellerOverview />
                </TabsContent>
                
                <TabsContent value="products">
                  <Outlet />
                </TabsContent>
                
                <TabsContent value="orders">
                  <Outlet />
                </TabsContent>
                
                <TabsContent value="promotions">
                  <Outlet />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SellerDashboard;
