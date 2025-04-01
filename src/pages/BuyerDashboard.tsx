
import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import BuyerSidebar from '@/components/buyer/BuyerSidebar';
import { Button } from '@/components/ui/button';
import { ShoppingBag, CreditCard, MessageSquare } from 'lucide-react';

const BuyerDashboard = () => {
  const location = useLocation();
  const isRootDashboard = location.pathname === '/buyer/dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row">
        <BuyerSidebar />
        <main className="flex-1 p-4 md:p-6">
          {isRootDashboard ? (
            <div className="space-y-6">
              <h1 className="text-2xl font-semibold">Your Dashboard</h1>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="font-semibold mb-4">Recent Orders</h2>
                  <p className="text-sm text-muted-foreground">View your recent orders and track their status.</p>
                  <Link to="/buyer/orders" className="text-blue-light text-sm mt-4 inline-block hover:underline">View All Orders →</Link>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="font-semibold mb-4">Payment Methods</h2>
                  <p className="text-sm text-muted-foreground">Manage your payment methods and view transaction history.</p>
                  <Link to="/buyer/payments" className="text-blue-light text-sm mt-4 inline-block hover:underline">Manage Payments →</Link>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="font-semibold mb-4">Support & Help</h2>
                  <p className="text-sm text-muted-foreground">Need help? Contact our support team or view FAQs.</p>
                  <Link to="/buyer/support" className="text-blue-light text-sm mt-4 inline-block hover:underline">Get Support →</Link>
                </div>
              </div>
              
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                <h2 className="text-xl font-medium mb-4">Discover Local Artisan Products</h2>
                <p className="text-muted-foreground mb-6">
                  Browse our curated collection of handcrafted products from talented local artisans across the Philippines.
                </p>
                <Link to="/buyer/home">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Shop Now
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <h2 className="font-semibold">Quick Payment</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    We support multiple payment methods including credit/debit cards and cash on delivery.
                  </p>
                  <Link to="/buyer/payments" className="text-blue-light text-sm hover:underline">Manage Payment Options →</Link>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="font-semibold">Customer Support</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our support team is available to assist you with any questions or issues.
                  </p>
                  <Link to="/buyer/support" className="text-blue-light text-sm hover:underline">Contact Support →</Link>
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default BuyerDashboard;
