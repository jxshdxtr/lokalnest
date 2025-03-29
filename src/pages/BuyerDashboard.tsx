
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BuyerSidebar from '@/components/buyer/BuyerSidebar';

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
                  <a href="/buyer/orders" className="text-blue-light text-sm mt-4 inline-block hover:underline">View All Orders →</a>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="font-semibold mb-4">Payment Methods</h2>
                  <p className="text-sm text-muted-foreground">Manage your payment methods and view transaction history.</p>
                  <a href="/buyer/payments" className="text-blue-light text-sm mt-4 inline-block hover:underline">Manage Payments →</a>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="font-semibold mb-4">Support & Help</h2>
                  <p className="text-sm text-muted-foreground">Need help? Contact our support team or view FAQs.</p>
                  <a href="/buyer/support" className="text-blue-light text-sm mt-4 inline-block hover:underline">Get Support →</a>
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
