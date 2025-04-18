import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

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
      // This is where you'd look it up based on the sellerId
      const { data: sellerData } = await stripe.accounts.list({ 
        limit: 1,
        email: 'seller@example.com' // This would be a lookup based on sellerId
      });
      
      if (sellerData && sellerData.length > 0) {
        const applicationFeeAmount = Math.round(amountInCents * 0.05); // 5% platform fee
        
        paymentIntentParams = {
          ...paymentIntentParams,
          transfer_data: {
            destination: sellerData[0].id,
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
} 