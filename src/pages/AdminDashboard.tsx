
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/AdminOverview';

// Mock admin user data - this would come from your auth system
const currentUser = {
  id: 'admin123',
  role: 'admin',
  name: 'Admin User',
  avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80',
  permissions: ['manage_users', 'manage_products', 'manage_analytics', 'manage_security', 'manage_logistics']
};

const AdminDashboard = () => {
  const location = useLocation();
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect if user is not an admin
  if (currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Get current active tab from path
  const getActiveTab = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'users') return 'users';
    if (path === 'products') return 'products';
    if (path === 'analytics') return 'analytics';
    if (path === 'security') return 'security';
    if (path === 'logistics') return 'logistics';
    return 'overview';
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your marketplace platform</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <AdminSidebar user={currentUser} />
            </div>

            {/* Content Area */}
            <div className="col-span-1 lg:col-span-9">
              <Tabs defaultValue={getActiveTab()} className="w-full">
                <TabsList className="w-full mb-6 overflow-x-auto flex sm:grid sm:grid-cols-6">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
                  <TabsTrigger value="products" className="flex-1">Products</TabsTrigger>
                  <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
                  <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
                  <TabsTrigger value="logistics" className="flex-1">Logistics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <AdminOverview />
                </TabsContent>
                
                <TabsContent value="users">
                  <Outlet />
                </TabsContent>
                
                <TabsContent value="products">
                  <Outlet />
                </TabsContent>
                
                <TabsContent value="analytics">
                  <Outlet />
                </TabsContent>
                
                <TabsContent value="security">
                  <Outlet />
                </TabsContent>
                
                <TabsContent value="logistics">
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

export default AdminDashboard;
