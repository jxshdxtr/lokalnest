import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '@/integrations/supabase/client';

const stripe = new Stripe('sk_test_51REPrMPAtuELrfs5vFwcH7NIvJQIpaeceqTK0wxijiw8iyn21VHWwBzYEc00P2QMdg6LHh6bIbM5ET9obFj74i2m00XKTYoxTk', {
  apiVersion: '2023-10-16',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();
      
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
        .from('user_profiles')
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
} 