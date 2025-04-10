
import { supabase } from '@/integrations/supabase/client';
import { RecentOrder } from './types';

export async function fetchRecentOrders(sellerId: string): Promise<RecentOrder[]> {
  try {
    // First get all products from this seller
    const { data: sellerProducts, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', sellerId);
      
    if (productsError) {
      throw productsError;
    }
    
    if (!sellerProducts || sellerProducts.length === 0) {
      return [];
    }
    
    const productIds = sellerProducts.map(p => p.id);
    
    // Get order items for these products
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id, order_id, product_id, quantity, unit_price, total_price')
      .in('product_id', productIds)
      .limit(15);
      
    if (itemsError) {
      throw itemsError;
    }
    
    if (!orderItems || orderItems.length === 0) {
      return [];
    }
    
    // Get product details
    const { data: products, error: productDetailsError } = await supabase
      .from('products')
      .select('id, name')
      .in('id', orderItems.map(item => item.product_id));
      
    if (productDetailsError) {
      throw productDetailsError;
    }
    
    // Get order details
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, created_at, buyer_id, status')
      .in('id', orderItems.map(item => item.order_id))
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (ordersError) {
      throw ordersError;
    }
    
    // Get buyer details
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', orders.map(order => order.buyer_id));
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Continue without buyer names rather than failing
    }
    
    // Format order data
    const formattedOrders: RecentOrder[] = [];
    
    for (const order of orders) {
      // Find the first order item for this order (for simplicity)
      const orderItem = orderItems.find(item => item.order_id === order.id);
      if (!orderItem) continue;
      
      // Find the product
      const product = products.find(p => p.id === orderItem.product_id);
      if (!product) continue;
      
      // Find the buyer
      const buyer = profiles?.find(p => p.id === order.buyer_id);
      
      formattedOrders.push({
        id: order.id,
        customer: buyer?.full_name || 'Anonymous',
        product: product.name || 'Unknown Product',
        amount: `₱${parseFloat(orderItem.total_price.toString()).toLocaleString('en-PH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
        status: order.status || 'Processing',
        date: new Date(order.created_at || '').toLocaleDateString('en-PH')
      });
    }
    
    return formattedOrders;
    
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
}
