import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Stripe = require('stripe');

const app = express();
const port = 5001; 

// Middleware
app.use(cors());
app.use(express.json());

// Stripe initialization
const stripe = Stripe('sk_test_51REPrMPAtuELrfs5vFwcH7NIvJQIpaeceqTK0wxijiw8iyn21VHWwBzYEc00P2QMdg6LHh6bIbM5ET9obFj74i2m00XKTYoxTk');

// Simple test endpoint to check if the server is running
app.get('/', (req, res) => {
  res.send('Stripe API server is running');
});

// Create payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, metadata } = req.body;

    // Validate the request
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Convert amount to cents/smallest currency unit
    const amountInCents = Math.round(amount * 100);

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'php',
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true },
    });

    // Return the client secret to the client
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      message: 'Error creating payment intent',
      error: error.message || 'Unknown error' 
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});

export default app; 