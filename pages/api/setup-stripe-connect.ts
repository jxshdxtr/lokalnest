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
    const { userId, email, businessName, country = 'PH' } = req.body;

    // Validate the request
    if (!userId || !email) {
      return res.status(400).json({ message: 'User ID and email are required' });
    }

    // Check if the user is a seller
    const { data: sellerData, error: sellerError } = await supabase
      .from('sellers')
      .select('id, stripe_account_id')
      .eq('user_id', userId)
      .single();

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
    if (sellerData.stripe_account_id) {
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
      .from('sellers')
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
} 