
import React, { useEffect, useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SellerStats } from './dashboard/types';
import { fetchSellerStats } from './dashboard/sellerStatsService';
import { fetchRevenueData } from './dashboard/revenueService';
import { fetchCategoryData } from './dashboard/categoryService';
import { fetchRecentOrders } from './dashboard/ordersService';
import StatsCard from './dashboard/StatsCard';
import CategoryChart from './dashboard/CategoryChart';
import RevenueChart from './dashboard/RevenueChart';
import RecentOrdersTable from './dashboard/RecentOrdersTable';

const SellerOverview = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const [stats, setStats] = useState<SellerStats>({
    sales: { 
      title: "Total Sales", 
      value: "₱0.00", 
      description: "Loading...", 
      trend: "neutral",
      iconName: "DollarSign",
      iconColor: "text-blue-500"
    },
    orders: { 
      title: "Orders", 
      value: "0", 
      description: "Loading...",
      trend: "neutral", 
      iconName: "ShoppingBag",
      iconColor: "text-orange-500"
    },
    rating: { 
      title: "Rating", 
      value: "0/5", 
      description: "No reviews yet", 
      trend: "neutral",
      iconName: "Star",
      iconColor: "text-yellow-500"
    },
    customers: { 
      title: "Customers", 
      value: "0", 
      description: "Loading...",
      trend: "neutral", 
      iconName: "Users",
      iconColor: "text-green-500"
    }
  });
  const [recentOrders, setRecentOrders] = useState([]);

  // Fetch seller dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          toast.error("You must be logged in to view this page");
          return;
        }
        
        const sellerId = session.session.user.id;
        
        // Check seller verification status
        const { data: sellerProfile, error: profileError } = await supabase
          .from('seller_profiles')
          .select('is_verified')
          .eq('id', sellerId)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking seller verification:', profileError);
        }
        
        setIsVerified(sellerProfile?.is_verified || false);
        
        // Fetch stats: total sales, order count, average rating, customer count
        const statsData = await fetchSellerStats(sellerId);
        setStats(statsData);
        
        // Only fetch additional data if seller is verified
        if (sellerProfile?.is_verified) {
          // Fetch revenue data for chart
          const revenueData = await fetchRevenueData(sellerId);
          setRevenueData(revenueData);
          
          // Fetch category data for pie chart
          const categoryData = await fetchCategoryData(sellerId);
          setCategoryData(categoryData);
          
          // Fetch recent orders
          const recentOrders = await fetchRecentOrders(sellerId);
          setRecentOrders(recentOrders);
        } else {
          // Set empty data for unverified sellers
          setRevenueData([]);
          setCategoryData([]);
          setRecentOrders([]);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <h3 className="font-medium text-amber-800">Account Verification Required</h3>
          <p className="text-amber-700 text-sm mt-1">
            Your seller account is pending verification. Some dashboard features are limited until your account is verified.
          </p>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard {...stats.sales} />
        <StatsCard {...stats.orders} />
        <StatsCard {...stats.rating} />
        <StatsCard {...stats.customers} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData} />
        <CategoryChart data={categoryData} />
      </div>

      {/* Recent Orders */}
      <RecentOrdersTable orders={recentOrders} />
    </div>
  );
};

export default SellerOverview;
