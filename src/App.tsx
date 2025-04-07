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
import BuyerDashboard from './pages/BuyerDashboard';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';
import { CartProvider } from './components/buyer/shopping/Cart';
import AuthForm from './components/auth/AuthForm';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthForm />} />
          
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
              <Route path="settings" element={<SellerSettings />} />
            </Route>
          </Route>
          
          {/* Buyer Routes */}
          <Route path="/buyer/*" element={<BuyerDashboard />} />
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
