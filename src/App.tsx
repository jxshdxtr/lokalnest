import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import SellerDashboard from './pages/SellerDashboard';
import ProductManagement from './components/seller/ProductManagement';
import OrderManagement from './components/seller/OrderManagement';
import PromotionManagement from './components/seller/PromotionManagement';
import CustomerManagement from './components/seller/CustomerManagement';
import SellerSettings from './components/seller/SellerSettings';
import LogisticsManagement from './components/seller/logistics/LogisticsManagement';
import InventoryManagement from './components/seller/InventoryManagement';
import ReviewManagement from './components/seller/ReviewManagement';
import BuyerDashboard from './pages/BuyerDashboard';
import Checkout from './pages/Checkout';
import BuyerHome from './pages/BuyerHome';
import BuyerOrders from './components/buyer/BuyerOrders';
import BuyerPayments from './components/buyer/BuyerPayments';
import BuyerReviews from './components/buyer/BuyerReviews';
import BuyerSupport from './components/buyer/BuyerSupport';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Seller Dashboard Routes */}
          <Route path="/seller">
            <Route index element={<Navigate to="/seller/dashboard" replace />} />
            <Route path="dashboard" element={<SellerDashboard />}>
              <Route index element={<Navigate to="/seller/dashboard/overview" replace />} />
              <Route path="overview" element={<div>Overview</div>} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="promotions" element={<PromotionManagement />} />
              <Route path="logistics" element={<LogisticsManagement />} />
              <Route path="reviews" element={<ReviewManagement />} />
              <Route path="settings" element={<SellerSettings />} />
            </Route>
          </Route>
          
          {/* Buyer Routes */}
          <Route path="/buyer" element={<BuyerDashboard />}>
            <Route index element={<Navigate to="/buyer/dashboard" replace />} />
            <Route path="dashboard" element={<div>Dashboard</div>} />
            <Route path="home" element={<BuyerHome />} />
            <Route path="orders" element={<BuyerOrders />} />
            <Route path="payments" element={<BuyerPayments />} />
            <Route path="reviews" element={<BuyerReviews />} />
            <Route path="support" element={<BuyerSupport />} />
          </Route>
          
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          
          {/* Add additional routes here */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
