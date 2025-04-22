import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

interface StripeCardElementProps {
  clientSecret: string | null;
  isProcessing: boolean;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: Error) => void;
}

const StripeCardElement: React.FC<StripeCardElementProps> = ({
  clientSecret,
  isProcessing,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    // If this is a mock client secret (for testing), bypass Stripe API calls
    if (clientSecret.startsWith('mock_')) {
      console.log('Using mock payment flow for testing');
      // Extract the mock payment intent ID from the client secret
      const mockPaymentIntentId = clientSecret.split('_')[1];
      // Simulate successful payment
      setTimeout(() => {
        onSuccess(`mock_pi_${mockPaymentIntentId}`);
      }, 1000);
      return;
    }

    // Real Stripe implementation for production
    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError(new Error('Card element not found'));
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          // You can add billing details here if needed
        },
      },
    });

    if (error) {
      onError(new Error(error.message || 'Payment failed'));
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      onError(new Error(`Payment status: ${paymentIntent?.status || 'unknown'}`));
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4">
        <CardElement
          onChange={handleCardChange}
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      <Button
        type="button"
        disabled={!stripe || !elements || isProcessing || !cardComplete}
        onClick={handleSubmit}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Pay with Card'}
      </Button>
    </div>
  );
};

export default StripeCardElement; 