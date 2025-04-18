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
        // Additional fields you might want to update
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
} 