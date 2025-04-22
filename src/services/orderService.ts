import { supabase } from '@/integrations/supabase/client';
import { Order, RawOrder, RawOrderItem, RawProductImage } from '@/components/buyer/orders/types';
import { toast } from 'sonner';
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
    
    // Add or update seller_customers record to establish the relationship
    // Only proceed if we have a valid seller ID
    if (potentialSellerId && typeof potentialSellerId === 'string' && isValidUUID(potentialSellerId)) {
      // First, get the profile ID for the customer (buyer)
      // This is needed because seller_customers.customer_id references public.profiles.id, not auth.users.id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !profileData) {
        console.error('Error finding profile for customer:', profileError);
        // Continue with order creation even if we can't update the seller_customers table
      } else {
        const customerId = profileData.id;
        const currentDate = new Date().toISOString();
        
        // Now check if a seller-customer relationship already exists
        const { data: existingRecord } = await supabase
          .from('seller_customers')
          .select('*')
          .eq('seller_id', potentialSellerId)
          .eq('customer_id', customerId)
          .single();
        
        if (existingRecord) {
          // Update existing record
          await supabase
            .from('seller_customers')
            .update({
              total_orders: (existingRecord.total_orders || 0) + 1,
              total_spent: (existingRecord.total_spent || 0) + totalWithShipping,
              last_purchase_date: currentDate,
              updated_at: currentDate,
              status: 'active' // Mark as active since they just placed an order
            })
            .eq('id', existingRecord.id);
        } else {
          // Create new record
          await supabase
            .from('seller_customers')
            .insert({
              seller_id: potentialSellerId,
              customer_id: customerId, // Use the profile ID here
              total_orders: 1,
              total_spent: totalWithShipping,
              last_purchase_date: currentDate,
              created_at: currentDate,
              updated_at: currentDate,
              status: 'active',
              tags: []
            });
        }
      }
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
    // Get the current user's session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be signed in to view orders');
    }
    
    // First, get orders
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
          id,
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

    if (!orders || orders.length === 0) {
      return [];
    }

    const orderIds = orders.map(order => order.id);
    
    // Then, get order items with product info
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*, products:product_id(*)')
      .in('order_id', orderIds);
      
    if (itemsError) {
      throw new Error(`Failed to fetch order items: ${itemsError.message}`);
    }
    
    // Get product images for the ordered products
    const productIds = orderItems.map(item => item.product_id);
    const { data: productImages, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', productIds)
      .eq('is_primary', true);
      
    if (imagesError) {
      console.error('Failed to fetch product images:', imagesError);
      // Continue without images rather than failing completely
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
          image: images && images.length > 0 ? images[0].url : '',
          product_id: item.product_id // Include the product_id in the returned item
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

/**
 * Get products from delivered orders that haven't been reviewed yet
 * @returns Array of products that can be reviewed
 */
export async function getReviewableProducts() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('You must be signed in to view reviewable products');
    }
    
    const buyerId = user.id;
    
    // Step 1: Get all delivered orders for this user
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id, 
        created_at, 
        order_items (
          product_id
        )
      `)
      .eq('buyer_id', buyerId)
      .eq('status', 'delivered');
    
    if (ordersError) {
      throw new Error(`Failed to fetch delivered orders: ${ordersError.message}`);
    }
    
    // Step 2: Get all products from these orders
    const productIds = new Set<string>();
    const orderProductMap = new Map<string, { orderId: string, orderDate: string }>();
    
    orders.forEach(order => {
      order.order_items.forEach((item: { product_id: string }) => {
        productIds.add(item.product_id);
        // Store order info for each product
        orderProductMap.set(item.product_id, { 
          orderId: order.id, 
          orderDate: order.created_at 
        });
      });
    });
    
    if (productIds.size === 0) {
      return []; // No delivered products to review
    }
    
    // Step 3: Check which of these products have already been reviewed
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('product_id')
      .eq('buyer_id', buyerId)
      .in('product_id', Array.from(productIds));
    
    if (reviewsError) {
      throw new Error(`Failed to check reviewed products: ${reviewsError.message}`);
    }
    
    // Step 4: Filter out products that have already been reviewed
    const reviewedProductIds = new Set(reviews.map(review => review.product_id));
    const unreviewedProductIds = Array.from(productIds).filter(id => !reviewedProductIds.has(id));
    
    if (unreviewedProductIds.length === 0) {
      return []; // All products have been reviewed
    }
    
    // Step 5: Get details for the products that can be reviewed
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id, 
        name
      `)
      .in('id', unreviewedProductIds);
    
    if (productsError) {
      throw new Error(`Failed to fetch product details: ${productsError.message}`);
    }
    
    // Step 6: Fetch product images
    const productsWithImages = await Promise.all(products.map(async (product) => {
      const { data: images } = await supabase
        .from('product_images')
        .select('url')
        .eq('product_id', product.id)
        .limit(1);
      
      const orderInfo = orderProductMap.get(product.id) || { 
        orderId: '', 
        orderDate: new Date().toISOString() 
      };
      
      return {
        id: product.id,
        name: product.name,
        image: images && images.length > 0 ? images[0].url : '/placeholder.svg',
        orderId: orderInfo.orderId,
        orderDate: orderInfo.orderDate
      };
    }));
    
    return productsWithImages;
  } catch (error) {
    console.error('Error fetching reviewable products:', error);
    return [];
  }
}
