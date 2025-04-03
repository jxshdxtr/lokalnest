import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import VerifyOTP from '@/pages/VerifyOTP';
import ProductDetail from '@/pages/ProductDetail';
import Checkout from '@/pages/Checkout';
import BuyerDashboard from '@/pages/BuyerDashboard';
import SellerDashboard from '@/pages/SellerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/sonner';

// Seller dashboard components
import SellerOverview from '@/components/seller/SellerOverview';
import ProductManagement from '@/components/seller/ProductManagement';
import InventoryManagement from '@/components/seller/InventoryManagement';
import OrderManagement from '@/components/seller/OrderManagement';
import CustomerManagement from '@/components/seller/CustomerManagement';
import PromotionManagement from '@/components/seller/PromotionManagement';
import ReviewManagement from '@/components/seller/ReviewManagement';
import StoreManagement from '@/components/seller/StoreManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Buyer Dashboard Routes */}
        <Route path="/buyer" element={<BuyerDashboard />}>
          {/* Buyer dashboard routes would go here */}
        </Route>

        {/* Seller Dashboard Routes */}
        <Route path="/seller" element={<SellerDashboard />}>
          <Route index element={<Navigate to="/seller/overview" replace />} />
          <Route path="overview" element={<SellerOverview />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="promotions" element={<PromotionManagement />} />
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="settings" element={<StoreManagement />} />
          <Route path="profile" element={<StoreManagement />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          {/* Admin dashboard routes would go here */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
