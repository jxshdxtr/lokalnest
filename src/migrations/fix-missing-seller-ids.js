import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOrdersWithMissingSellerId() {
  console.log('Starting migration to fix orders with missing seller IDs...');
  
  // Step 1: Find all orders without a seller_id
  const { data: ordersWithoutSeller, error: orderError } = await supabase
    .from('orders')
    .select('id')
    .is('seller_id', null);
  
  if (orderError) {
    console.error('Error fetching orders without seller_id:', orderError);
    return;
  }
  
  console.log(`Found ${ordersWithoutSeller.length} orders without a seller_id`);
  
  // Step 2: Process each order to determine the seller
  for (const order of ordersWithoutSeller) {
    try {
      console.log(`Processing order ${order.id}...`);
      
      // Step 2a: Get order items for this order
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id')
        .eq('order_id', order.id);
      
      if (itemsError || !orderItems || orderItems.length === 0) {
        console.error(`Error fetching items for order ${order.id}:`, itemsError || 'No items found');
        continue;
      }
      
      // Step 2b: Get the first product's seller (assuming all products in an order are from the same seller)
      const firstProductId = orderItems[0].product_id;
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('seller_id')
        .eq('id', firstProductId)
        .single();
      
      if (productError || !product || !product.seller_id) {
        console.error(`Error fetching product ${firstProductId} for order ${order.id}:`, productError || 'No seller_id found');
        continue;
      }
      
      // Step 2c: Update the order with the seller_id
      const { error: updateError } = await supabase
        .from('orders')
        .update({ seller_id: product.seller_id })
        .eq('id', order.id);
      
      if (updateError) {
        console.error(`Error updating order ${order.id} with seller_id:`, updateError);
        continue;
      }
      
      console.log(`Successfully updated order ${order.id} with seller_id ${product.seller_id}`);
    } catch (error) {
      console.error(`Unexpected error processing order ${order.id}:`, error);
    }
  }
  
  console.log('Migration completed.');
}

// Run the migration
fixOrdersWithMissingSellerId()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  }); 