
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/components/buyer/shopping/Cart';
import { Order } from '@/components/buyer/orders/types';
import { toast } from 'sonner';

export async function createOrder(items: CartItem[], shippingAddress: string, billingAddress: string, paymentMethod: string) {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be signed in to place an order');
    }
    
    // Calculate total amount
    const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
    
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: paymentMethod,
        status: 'processing',
        payment_status: 'paid'
      } as any) // Using type assertion to bypass TypeScript error temporarily
      .select()
      .single();
      
    if (orderError || !order) {
      throw new Error(`Failed to create order: ${orderError?.message || 'Unknown error'}`);
    }
    
    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems as any); // Using type assertion to bypass TypeScript error temporarily
      
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
        date:created_at, 
        total:total_amount, 
        status,
        tracking_number,
        tracking_url,
        estimated_delivery,
        order_items!inner (
          product:product_id (
            name,
            products:id (
              images:product_images (
                url
              )
            )
          ),
          quantity,
          unit_price
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }
    
    // Transform the data to match the Order type
    return (orders || []).map((order: any) => {
      const items = order.order_items.map((item: any) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.unit_price,
        image: item.product.products.images[0]?.url || ''
      }));
      
      return {
        id: order.id,
        date: order.date,
        items: items,
        total: order.total,
        status: order.status,
        tracking: order.tracking_number ? {
          id: order.tracking_number,
          courier: 'Shipping Partner',
          url: order.tracking_url || '',
          estimatedDelivery: order.estimated_delivery || '',
          updates: []
        } : undefined
      };
    });
  } catch (error) {
    console.error('Fetching orders failed:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to fetch your orders');
    throw error;
  }
}
