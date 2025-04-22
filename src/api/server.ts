import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { supabase } from '../integrations/supabase/client.js';

const app = express();
const port = 5001; // Use a different port than your Vite dev server

// Stripe initialization
const stripe = new Stripe('sk_test_51REPrMPAtuELrfs5vFwcH7NIvJQIpaeceqTK0wxijiw8iyn21VHWwBzYEc00P2QMdg6LHh6bIbM5ET9obFj74i2m00XKTYoxTk', {
  apiVersion: '2025-03-31.basil',
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, sellerId, metadata } = req.body;

    // Validate the request
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Convert amount to cents/smallest currency unit
    const amountInCents = Math.round(amount * 100);

    let paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: 'php',
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true },
    };

    // If sellerId is provided, add transfer_data for direct payment to seller
    if (sellerId) {
      // You would need to have the seller's Stripe account ID stored in your database
      // Look up seller's Stripe account ID from database
      const { data: sellerData, error: sellerError } = await (supabase
        .from('user_profiles' as any)
        .select('stripe_account_id')
        .eq('user_id', sellerId)
        .single() as any);
        
      if (sellerError) {
        console.error('Error retrieving seller data:', sellerError);
      }
      
      if (sellerData?.stripe_account_id) {
        const applicationFeeAmount = Math.round(amountInCents * 0.05); // 5% platform fee
        
        paymentIntentParams = {
          ...paymentIntentParams,
          transfer_data: {
            destination: sellerData.stripe_account_id,
          },
          application_fee_amount: applicationFeeAmount,
        };
      }
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    // Return the client secret to the client
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      message: 'Error creating payment intent',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    // Validate the request
    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        message: `Payment not successful. Status: ${paymentIntent.status}`,
      });
    }

    // Update the order status in the database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_intent_id: paymentIntentId,
        status: 'processing',
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return res.status(500).json({
        message: 'Payment succeeded but order update failed',
        error: updateError.message,
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Payment confirmed and order updated',
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      message: 'Error confirming payment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/save-payment-method', async (req, res) => {
  try {
    const { paymentMethodId, userId } = req.body;

    // Validate the request
    if (!paymentMethodId) {
      return res.status(400).json({ message: 'Payment method ID is required' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get or create a Stripe customer for this user
    let customerId: string;
    
    // Check if the user already has a Stripe customer ID
    const { data: userData, error: userError } = await (supabase
      .from('user_profiles' as any)
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single() as any);
      
    if (userError && userError.code !== 'PGRST116') {
      return res.status(500).json({ 
        message: 'Error retrieving user data', 
        error: userError.message 
      });
    }
    
    if (userData?.stripe_customer_id) {
      customerId = userData.stripe_customer_id;
    } else {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        metadata: { userId }
      });
      
      customerId = customer.id;
      
      // Store the Stripe customer ID in the database
      const { error: updateError } = await supabase
        .from('user_profiles' as any)
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId
        });
        
      if (updateError) {
        console.error('Error saving customer ID:', updateError);
        return res.status(500).json({
          message: 'Error saving customer data',
          error: updateError.message
        });
      }
    }

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    // Set as the default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Payment method saved successfully',
    });
  } catch (error) {
    console.error('Error saving payment method:', error);
    res.status(500).json({
      message: 'Error saving payment method',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/setup-stripe-connect', async (req, res) => {
  try {
    const { userId, email, businessName, country = 'PH' } = req.body;

    // Validate the request
    if (!userId || !email) {
      return res.status(400).json({ message: 'User ID and email are required' });
    }

    // Check if the user is a seller
    const { data: sellerData, error: sellerError } = await (supabase
      .from('user_profiles' as any)
      .select('id, stripe_account_id')
      .eq('user_id', userId)
      .single() as any);

    if (sellerError && sellerError.code !== 'PGRST116') {
      return res.status(500).json({
        message: 'Error retrieving seller data',
        error: sellerError.message,
      });
    }

    if (!sellerData) {
      return res.status(404).json({ message: 'Seller account not found' });
    }

    // If the seller already has a Stripe account, return it
    if (sellerData && sellerData.stripe_account_id) {
      const account = await stripe.accounts.retrieve(sellerData.stripe_account_id);
      
      // Create an account link for the seller to complete their onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${req.headers.origin}/seller/dashboard?refresh=true`,
        return_url: `${req.headers.origin}/seller/dashboard?success=true`,
        type: 'account_onboarding',
      });

      return res.status(200).json({
        success: true,
        accountId: account.id,
        accountLink: accountLink.url,
      });
    }

    // Create a new Stripe Connect account for the seller
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: businessName || email.split('@')[0],
      },
      metadata: {
        sellerId: sellerData.id,
        userId,
      },
      country,
    });

    // Store the Stripe account ID in the database
    const { error: updateError } = await supabase
      .from('user_profiles' as any)
      .update({
        stripe_account_id: account.id,
      })
      .eq('id', sellerData.id);

    if (updateError) {
      console.error('Error updating seller with Stripe account ID:', updateError);
      await stripe.accounts.del(account.id);
      return res.status(500).json({
        message: 'Error saving Stripe account ID',
        error: updateError.message,
      });
    }

    // Create an account link for the seller to complete their onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.origin}/seller/dashboard?refresh=true`,
      return_url: `${req.headers.origin}/seller/dashboard?success=true`,
      type: 'account_onboarding',
    });

    res.status(200).json({
      success: true,
      accountId: account.id,
      accountLink: accountLink.url,
    });
  } catch (error) {
    console.error('Error setting up Stripe Connect:', error);
    res.status(500).json({
      message: 'Error setting up Stripe Connect',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});

export default app; 