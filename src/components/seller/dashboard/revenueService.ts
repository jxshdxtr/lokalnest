
import { supabase } from '@/integrations/supabase/client';
import { RevenueData } from './types';

export async function fetchRevenueData(sellerId: string): Promise<RevenueData[]> {
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
    
    // For each month, calculate total revenue with simpler queries
    for (const month of months) {
      const { data: monthRevenue, error } = await supabase
        .from('order_items')
        .select('total_price, products:product_id(seller_id), orders:order_id(created_at)')
        .eq('products.seller_id', sellerId)
        .gte('orders.created_at', month.startDate)
        .lte('orders.created_at', month.endDate);
        
      if (error) throw error;
      
      let totalMonthRevenue = 0;
      
      monthRevenue?.forEach(item => {
        const price = typeof item.total_price === 'string' 
          ? parseFloat(item.total_price) 
          : (item.total_price || 0);
        totalMonthRevenue += price;
      });
      
      revenueByMonth.push({
        name: month.name,
        value: Math.round(totalMonthRevenue)
      });
    }
    
    return revenueByMonth;
    
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
}
