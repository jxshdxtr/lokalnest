import { supabase } from '@/integrations/supabase/client';
import { SellerStats } from './types';

export async function fetchSellerStats(sellerId: string): Promise<SellerStats> {
  try {
    // Fetch total sales - use simpler queries and combine the data afterward
    const { data: salesData, error: salesError } = await supabase
      .from('order_items')
      .select('total_price, product_id')
      .eq('products.seller_id', sellerId)
      .select('total_price, products:product_id(seller_id)')
    
    if (salesError) throw salesError;
    
    const totalSales = salesData?.reduce((sum, item) => {
      // Ensure item.total_price is treated as a number
      const price = typeof item.total_price === 'string' 
        ? parseFloat(item.total_price) 
        : (item.total_price || 0);
      return sum + price;
    }, 0) || 0;
    
    const formattedSales = `₱${totalSales.toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
    
    // Fetch order count - separate query to avoid nesting issues
    const { data: orders, error: ordersError } = await supabase
      .from('order_items')
      .select('order_id, product_id, products:product_id(seller_id)')
      .eq('products.seller_id', sellerId);
    
    if (ordersError) throw ordersError;
    
    // Count unique order IDs using a Set
    const uniqueOrderIds = new Set();
    orders?.forEach(order => {
      if (order.order_id) {
        uniqueOrderIds.add(order.order_id);
      }
    });
    const orderCount = uniqueOrderIds.size;
    
    // Fetch average rating - separate query again
    const { data: ratingData, error: ratingError } = await supabase
      .from('reviews')
      .select('rating, product_id, products:product_id(seller_id)')
      .eq('products.seller_id', sellerId);
    
    if (ratingError) throw ratingError;
    
    let avgRating = 0;
    let reviewCount = 0;
    
    if (ratingData && ratingData.length > 0) {
      let totalRating = 0;
      ratingData.forEach(review => {
        if (typeof review.rating === 'number') {
          totalRating += review.rating;
        }
      });
      reviewCount = ratingData.length;
      avgRating = totalRating / reviewCount;
    }
    
    // Fetch customer count - separate query
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
    
    // Previous month sales - separate query
    const { data: prevSalesData, error: prevSalesError } = await supabase
      .from('order_items')
      .select('total_price, products:product_id(seller_id), orders:order_id(created_at)')
      .eq('products.seller_id', sellerId)
      .lt('orders.created_at', oneMonthAgoStr);
    
    if (prevSalesError) throw prevSalesError;
    
    const prevMonthSales = prevSalesData?.reduce((sum, item) => {
      const price = typeof item.total_price === 'string' 
        ? parseFloat(item.total_price) 
        : (item.total_price || 0);
      return sum + price;
    }, 0) || 0;
    
    // Calculate sales trend
    const salesTrend = prevMonthSales > 0 ? (totalSales - prevMonthSales) / prevMonthSales * 100 : 0;
    const salesTrendString = `${salesTrend > 0 ? '↑' : '↓'} ${Math.abs(salesTrend).toFixed(0)}% from last month`;
    
    // Return the stats
    return {
      sales: { 
        title: "Total Sales", 
        value: formattedSales, 
        description: salesTrendString, 
        trend: salesTrend >= 0 ? "up" : "down",
        iconName: "DollarSign",
        iconColor: "text-blue-500"
      },
      orders: { 
        title: "Orders", 
        value: orderCount.toString(), 
        description: "From all time",
        trend: "neutral", 
        iconName: "ShoppingBag",
        iconColor: "text-orange-500"
      },
      rating: { 
        title: "Rating", 
        value: `${avgRating.toFixed(1)}/5`, 
        description: `Based on ${reviewCount.toString()} reviews`, 
        trend: "neutral",
        iconName: "Star",
        iconColor: "text-yellow-500"
      },
      customers: { 
        title: "Customers", 
        value: customerCount.toString(), 
        description: "Unique buyers",
        trend: "neutral", 
        iconName: "Users",
        iconColor: "text-green-500"
      }
    };
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}
