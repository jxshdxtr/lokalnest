import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/components/buyer/shopping/Cart';
import { Order } from '@/components/buyer/orders/types';
import { toast } from 'sonner';

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function createOrder(items: CartItem[], shippingAddress: string, billingAddress: string, paymentMethod: string) {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be signed in to place an order');
    }
    
    // Calculate total amount
    const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingFee = 150;
    const totalWithShipping = totalAmount + shippingFee;
    
    // For Stripe payments, we'll set payment_status to 'pending' initially
    // For COD, we'll set it to 'awaiting_payment'
    const paymentStatus = paymentMethod === 'stripe' ? 'pending' : 'awaiting_payment';
    
    // Get seller_id from the first item (assuming all items are from the same seller)
    // In a multi-seller checkout, this would need to be handled differently
    const potentialSellerId = items[0]?.seller || null;
    
    // Validate that the seller_id is in a proper UUID format
    // If it's not a valid UUID, don't include it in the order
    const orderData: any = {
      buyer_id: user.id,
      total_amount: totalWithShipping,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      payment_method: paymentMethod,
      status: 'processing',
      payment_status: paymentStatus,
      created_at: new Date().toISOString() // Ensure created_at is set
    };
    
    // Only add seller_id if it's a valid UUID
    if (potentialSellerId && typeof potentialSellerId === 'string' && isValidUUID(potentialSellerId)) {
      orderData.seller_id = potentialSellerId;
    }
    
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
      
    if (orderError || !order) {
      throw new Error(`Failed to create order: ${orderError?.message || 'Unknown error'}`);
    }
    
    // Create order items ensuring we only use product_id not the whole product object
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) {
      throw new Error(`Failed to add order items: ${itemsError.message}`);
    }
    
    return order;
  } catch (error) {
    console.error('Order creation failed:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to create your order');
    throw error;
  }
}

export async function updateOrderPaymentStatus(orderId: string, paymentIntentId: string, status: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_intent_id: paymentIntentId,
        payment_status: status
      })
      .eq('id', orderId);
      
    if (error) {
      throw new Error(`Failed to update order payment status: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Order payment status update failed:', error);
    throw error;
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be signed in to view orders');
    }
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id, 
        created_at, 
        total_amount, 
        status,
        payment_status,
        payment_method,
        tracking_number,
        tracking_url,
        estimated_delivery,
        order_items (
          product_id,
          quantity,
          unit_price
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }
    
    // Fetch product details separately to avoid the relationship conflict
    const orderWithItems = await Promise.all((orders || []).map(async (order: any) => {
      // Get product details for each order item
      const orderItems = await Promise.all(order.order_items.map(async (item: any) => {
        const { data: product } = await supabase
          .from('products')
          .select('name, id')
          .eq('id', item.product_id)
          .single();
          
        // Get the first image for this product
        const { data: images } = await supabase
          .from('product_images')
          .select('url')
          .eq('product_id', item.product_id)
          .limit(1);
          
        return {
          name: product?.name || 'Product Name Unavailable',
          quantity: item.quantity,
          price: item.unit_price,
          image: images && images.length > 0 ? images[0].url : ''
        };
      }));
      
      return {
        id: order.id,
        date: order.created_at,
        items: orderItems,
        total: order.total_amount,
        status: order.status,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        tracking: order.tracking_number ? {
          id: order.tracking_number,
          courier: 'Shipping Partner',
          url: order.tracking_url || '',
          estimatedDelivery: order.estimated_delivery || '',
          updates: []
        } : undefined
      };
    }));
    
    return orderWithItems;
  } catch (error) {
    console.error('Fetching orders failed:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to fetch your orders');
    throw error;
  }
}
