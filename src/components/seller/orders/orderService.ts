
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from './types';

export async function fetchSellerOrders(): Promise<Order[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      throw new Error('You must be logged in to view orders');
    }

    // First, fetch all products for this seller
    const { data: sellerProducts, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', session.session.user.id);
      
    if (productsError) {
      throw productsError;
    }
    
    if (!sellerProducts || sellerProducts.length === 0) {
      return [];
    }
    
    const productIds = sellerProducts.map(p => p.id);
    
    // Get all order items for these products - using separate queries for better type safety
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id, order_id, product_id, quantity, unit_price, total_price')
      .in('product_id', productIds);
      
    if (itemsError) {
      throw itemsError;
    }
    
    if (!orderItems || orderItems.length === 0) {
      return [];
    }
    
    // Get product names
    const { data: products, error: productsDataError } = await supabase
      .from('products')
      .select('id, name')
      .in('id', orderItems.map(item => item.product_id));
      
    if (productsDataError) {
      throw productsDataError;
    }
    
    // Get product images
    const { data: productImages, error: imagesError } = await supabase
      .from('product_images')
      .select('product_id, url')
      .in('product_id', orderItems.map(item => item.product_id))
      .eq('is_primary', true);
      
    if (imagesError) {
      console.error('Error fetching product images:', imagesError);
      // Continue without images
    }
    
    // Get unique order IDs
    const orderIds = [...new Set(orderItems.map(item => item.order_id))];
    
    // Get order details
    const { data: orderDetails, error: ordersError } = await supabase
      .from('orders')
      .select('id, created_at, buyer_id, total_amount, status, payment_status, payment_method, shipping_address, profiles:buyer_id(full_name)')
      .in('id', orderIds);
      
    if (ordersError) {
      throw ordersError;
    }
    
    // Build complete orders with items
    const completeOrders: Order[] = orderDetails.map(order => {
      // Find all items for this order
      const items: OrderItem[] = orderItems
        .filter(item => item.order_id === order.id)
        .map(item => {
          // Find product name
          const product = products.find(p => p.id === item.product_id);
          // Find image for this item
          const imageData = productImages?.find(img => img.product_id === item.product_id);
          
          return {
            id: item.id,
            product_id: item.product_id,
            product_name: product?.name || 'Unknown Product',
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            image: imageData?.url
          };
        });
        
      return {
        id: order.id,
        date: order.created_at,
        buyer_id: order.buyer_id,
        buyer_name: order.profiles?.full_name || 'Customer',
        items,
        total: order.total_amount,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        shipping_address: order.shipping_address
      };
    });
    
    return completeOrders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}
