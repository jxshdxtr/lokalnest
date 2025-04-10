
import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  Star, 
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

// Define types for our data
interface RevenueData {
  name: string;
  value: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface StatData {
  title: string;
  value: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: string;
  date: string;
}

const SellerOverview = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [stats, setStats] = useState<StatData[]>([
    { 
      title: "Total Sales", 
      value: "₱0.00", 
      description: "Loading...", 
      trend: "neutral",
      icon: <DollarSign className="h-5 w-5 text-blue-500" /> 
    },
    { 
      title: "Orders", 
      value: "0", 
      description: "Loading...",
      trend: "neutral", 
      icon: <ShoppingBag className="h-5 w-5 text-orange-500" /> 
    },
    { 
      title: "Rating", 
      value: "0/5", 
      description: "No reviews yet", 
      trend: "neutral",
      icon: <Star className="h-5 w-5 text-yellow-500" /> 
    },
    { 
      title: "Customers", 
      value: "0", 
      description: "Loading...",
      trend: "neutral", 
      icon: <Users className="h-5 w-5 text-green-500" /> 
    }
  ]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
        
        // Fetch stats: total sales, order count, average rating, customer count
        await fetchStats(sellerId);
        
        // Fetch revenue data for chart
        await fetchRevenueData(sellerId);
        
        // Fetch category data for pie chart
        await fetchCategoryData(sellerId);
        
        // Fetch recent orders
        await fetchRecentOrders(sellerId);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch stats (sales, orders, rating, customers)
  const fetchStats = async (sellerId: string) => {
    try {
      // Fetch total sales
      const { data: salesData, error: salesError } = await supabase
        .from('order_items')
        .select('total_price, product_id, products:product_id(seller_id)')
        .eq('products.seller_id', sellerId);
      
      if (salesError) throw salesError;
      
      const totalSales = salesData?.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0) || 0;
      const formattedSales = `₱${totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      // Fetch order count
      const { data: orders, error: ordersError } = await supabase
        .from('order_items')
        .select('order_id, product_id, products:product_id(seller_id)')
        .eq('products.seller_id', sellerId);
      
      if (ordersError) throw ordersError;
      
      // Count unique order IDs
      const uniqueOrderIds = new Set(orders?.map(order => order.order_id) || []);
      const orderCount = uniqueOrderIds.size;
      
      // Fetch average rating
      const { data: ratingData, error: ratingError } = await supabase
        .from('reviews')
        .select('rating, product_id, products:product_id(seller_id)')
        .eq('products.seller_id', sellerId);
      
      if (ratingError) throw ratingError;
      
      let avgRating = 0;
      let reviewCount = 0;
      
      if (ratingData && ratingData.length > 0) {
        const totalRating = ratingData.reduce((sum, review) => sum + (review.rating || 0), 0);
        reviewCount = ratingData.length;
        avgRating = totalRating / reviewCount;
      }
      
      // Fetch customer count
      const { data: customersData, error: customersError } = await supabase
        .from('seller_customers')
        .select('customer_id')
        .eq('seller_id', sellerId);
      
      if (customersError) throw customersError;
      
      const customerCount = customersData?.length || 0;
      
      // Get previous month data for trends
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const oneMonthAgoStr = oneMonthAgo.toISOString();
      
      // Previous month sales
      const { data: prevSalesData, error: prevSalesError } = await supabase
        .from('order_items')
        .select('total_price, product_id, products:product_id(seller_id), orders:order_id(created_at)')
        .eq('products.seller_id', sellerId)
        .lt('orders.created_at', oneMonthAgoStr);
      
      if (prevSalesError) throw prevSalesError;
      
      const prevMonthSales = prevSalesData?.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0) || 0;
      
      // Calculate sales trend
      const salesTrend = prevMonthSales > 0 ? (totalSales - prevMonthSales) / prevMonthSales * 100 : 0;
      const salesTrendString = `${salesTrend > 0 ? '↑' : '↓'} ${Math.abs(salesTrend).toFixed(0)}% from last month`;
      
      // Update stats state
      setStats([
        { 
          title: "Total Sales", 
          value: formattedSales, 
          description: salesTrendString, 
          trend: salesTrend >= 0 ? "up" : "down",
          icon: <DollarSign className="h-5 w-5 text-blue-500" /> 
        },
        { 
          title: "Orders", 
          value: orderCount.toString(), 
          description: "From all time",
          trend: "neutral", 
          icon: <ShoppingBag className="h-5 w-5 text-orange-500" /> 
        },
        { 
          title: "Rating", 
          value: `${avgRating.toFixed(1)}/5`, 
          description: `Based on ${reviewCount} reviews`, 
          trend: "neutral",
          icon: <Star className="h-5 w-5 text-yellow-500" /> 
        },
        { 
          title: "Customers", 
          value: customerCount.toString(), 
          description: "Unique buyers",
          trend: "neutral", 
          icon: <Users className="h-5 w-5 text-green-500" /> 
        }
      ]);
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error("Failed to load statistics");
    }
  };

  // Fetch revenue data for bar chart
  const fetchRevenueData = async (sellerId: string) => {
    try {
      // Get the last 6 months
      const months = [];
      const today = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push({
          name: month.toLocaleString('default', { month: 'short' }),
          startDate: month.toISOString(),
          endDate: new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString()
        });
      }
      
      const revenueByMonth: RevenueData[] = [];
      
      // For each month, calculate total revenue
      for (const month of months) {
        const { data: monthRevenue, error } = await supabase
          .from('order_items')
          .select('total_price, product_id, products:product_id(seller_id), orders:order_id(created_at)')
          .eq('products.seller_id', sellerId)
          .gte('orders.created_at', month.startDate)
          .lte('orders.created_at', month.endDate);
          
        if (error) throw error;
        
        const totalMonthRevenue = monthRevenue?.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0) || 0;
        
        revenueByMonth.push({
          name: month.name,
          value: Math.round(totalMonthRevenue)
        });
      }
      
      setRevenueData(revenueByMonth);
      
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error("Failed to load revenue chart data");
    }
  };

  // Fetch category data for pie chart
  const fetchCategoryData = async (sellerId: string) => {
    try {
      // Get all categories with products from this seller
      const { data: productsData, error } = await supabase
        .from('products')
        .select('id, category_id, categories:category_id(name)')
        .eq('seller_id', sellerId);
      
      if (error) throw error;
      
      // Count products by category
      const categoryCounts: { [key: string]: number } = {};
      
      productsData?.forEach(product => {
        const categoryName = product.categories?.name || 'Uncategorized';
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      });
      
      // Convert to chart data format
      const categoryChartData: CategoryData[] = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        value: count
      }));
      
      setCategoryData(categoryChartData.length > 0 ? categoryChartData : [
        { name: 'No Products', value: 1 }
      ]);
      
    } catch (error) {
      console.error('Error fetching category data:', error);
      toast.error("Failed to load category chart data");
    }
  };

  // Fetch recent orders
  const fetchRecentOrders = async (sellerId: string) => {
    try {
      // Get recent orders for this seller's products
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          unit_price,
          total_price,
          products:product_id(name, seller_id),
          orders:order_id(created_at, buyer_id, status, profiles:buyer_id(full_name))
        `)
        .eq('products.seller_id', sellerId)
        .order('id', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Format order data
      const formattedOrders: RecentOrder[] = orderItems?.map(item => ({
        id: item.order_id,
        customer: item.orders?.profiles?.full_name || 'Anonymous',
        product: item.products?.name || 'Unknown Product',
        amount: `₱${parseFloat(item.total_price).toLocaleString('en-PH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
        status: item.orders?.status || 'Processing',
        date: new Date(item.orders?.created_at || '').toLocaleDateString('en-PH')
      })) || [];
      
      setRecentOrders(formattedOrders);
      
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      toast.error("Failed to load recent orders");
    }
  };

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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard 
            key={index}
            title={stat.title} 
            value={stat.value} 
            description={stat.description} 
            trend={stat.trend}
            icon={stat.icon} 
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₱${value}`, 'Revenue']} />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
            <CardDescription>Distribution of products across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon, trend = 'neutral' }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="rounded-full p-2 bg-muted">
            {icon}
          </div>
          {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
          {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-500" />}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className={`text-xs mt-1 ${
            trend === 'up' ? 'text-green-500' : 
            trend === 'down' ? 'text-red-500' : 
            'text-muted-foreground'
          }`}>
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerOverview;
