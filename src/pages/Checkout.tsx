
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/components/buyer/shopping/Cart';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: ''
  });

  // If cart is empty, redirect to home
  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/');
    }
  }, [items, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    for (const key in shippingInfo) {
      if (!shippingInfo[key as keyof typeof shippingInfo]) {
        toast.error(`Please enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    setIsProcessing(true);

    try {
      // In a real app, we would handle the payment process here
      // For Stripe: Redirect to Stripe checkout or use Stripe Elements
      // For COD: Simply process the order
      
      if (paymentMethod === 'stripe') {
        // Simulate Stripe checkout process
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Normally we'd redirect to Stripe here
      } else {
        // Process COD order
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Order success flow
      toast.success('Order placed successfully!');
      clearCart();
      navigate('/buyer/orders');
      
    } catch (error) {
      toast.error('There was a problem processing your payment.');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const shippingFee = 150;
  const totalWithShipping = totalPrice + shippingFee;

  if (items.length === 0) {
    return null; // Don't render anything while redirecting
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-16">
        <Button 
          variant="ghost" 
          className="mb-6 pl-0" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Shopping
        </Button>
        
        <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>
                  Enter where you want your order to be delivered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName"
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      placeholder="123 Street Name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="province">Province</Label>
                      <Input 
                        id="province"
                        name="province"
                        value={shippingInfo.province}
                        onChange={handleInputChange}
                        placeholder="Province"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input 
                        id="postalCode"
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleInputChange}
                        placeholder="1234"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        placeholder="+63 912 345 6789"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Choose how you want to pay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value: 'stripe' | 'cod') => setPaymentMethod(value)}>
                  <div className="flex items-center space-x-2 border rounded-md p-4 mb-3 cursor-pointer">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-muted-foreground">Pay securely with your card</div>
                    </Label>
                    <div className="flex gap-2">
                      <div className="h-8 w-12 rounded-md bg-muted flex items-center justify-center text-xs">Visa</div>
                      <div className="h-8 w-12 rounded-md bg-muted flex items-center justify-center text-xs">MC</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                    </Label>
                    <div className="h-8 w-12 rounded-md bg-muted flex items-center justify-center text-xs">COD</div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-muted-foreground flex-1">
                        {item.quantity} x {item.name.length > 20 
                          ? `${item.name.substring(0, 20)}...` 
                          : item.name}
                      </span>
                      <span>₱{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₱{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span>₱{shippingFee.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>₱{totalWithShipping.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Place Order • ₱${totalWithShipping.toLocaleString()}`}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Checkout;
