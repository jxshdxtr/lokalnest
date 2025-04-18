import React, { useState } from 'react';
import { 
  CreditCard,
  Clock, 
  CheckCircle2, 
  XCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: 'card' | 'cod';
  name: string;
  last4?: string;
  expiry?: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
}

const BuyerPayments = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "pm_1",
      type: 'card',
      name: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: "pm_2",
      type: 'cod',
      name: 'Cash on Delivery',
      isDefault: false
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx_1",
      date: "2023-10-25",
      amount: 1500,
      description: "Order #ORD-8294",
      status: 'completed',
      paymentMethod: 'Visa ending in 4242'
    },
    {
      id: "tx_2",
      date: "2023-10-15",
      amount: 1200,
      description: "Order #ORD-7392",
      status: 'completed',
      paymentMethod: 'Cash on Delivery'
    },
    {
      id: "tx_3",
      date: "2023-09-30",
      amount: 900,
      description: "Order #ORD-6104",
      status: 'pending',
      paymentMethod: 'Visa ending in 4242'
    }
  ]);

  const [newCardDetails, setNewCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: ""
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card");

  const handleSetDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(
      paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    toast.success("Default payment method updated");
  };

  const handleRemovePaymentMethod = (id: string) => {
    const updatedMethods = paymentMethods.filter(method => method.id !== id);
    
    // If we removed the default method, set a new default
    if (paymentMethods.find(m => m.id === id)?.isDefault && updatedMethods.length > 0) {
      updatedMethods[0].isDefault = true;
    }
    
    setPaymentMethods(updatedMethods);
    toast.success("Payment method removed");
  };

  const handleAddPaymentMethod = () => {
    // In a real app, this would validate and process the card with Stripe
    if (selectedPaymentMethod === 'card') {
      // Validate card details
      if (!newCardDetails.name || !newCardDetails.number || !newCardDetails.expiry || !newCardDetails.cvc) {
        toast.error("Please fill in all card details");
        return;
      }

      const last4 = newCardDetails.number.slice(-4);
      
      const newCard: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        name: 'Visa', // In a real app, would determine card type
        last4,
        expiry: newCardDetails.expiry,
        isDefault: paymentMethods.length === 0
      };
      
      setPaymentMethods([...paymentMethods, newCard]);
      toast.success("Card added successfully");
    } else if (selectedPaymentMethod === 'cod') {
      if (!paymentMethods.some(method => method.type === 'cod')) {
        const newCOD: PaymentMethod = {
          id: `pm_${Date.now()}`,
          type: 'cod',
          name: 'Cash on Delivery',
          isDefault: paymentMethods.length === 0
        };
        
        setPaymentMethods([...paymentMethods, newCOD]);
        toast.success("Cash on Delivery added as a payment method");
      } else {
        toast.error("Cash on Delivery is already added");
      }
    }
    
    setIsDialogOpen(false);
    setNewCardDetails({
      name: "",
      number: "",
      expiry: "",
      cvc: ""
    });
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-500 dark:border-green-400 dark:text-green-400">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-500 dark:border-amber-400 dark:text-amber-400">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="border-red-500 text-red-500 dark:border-red-400 dark:text-red-400">Failed</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-semibold">Payments</h2>
          <p className="text-muted-foreground">Manage your payment methods and view transactions</p>
        </div>
      </div>

      <Tabs defaultValue="methods" className="space-y-4">
        <TabsList>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="methods" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new payment method to your account.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card-option" />
                      <Label htmlFor="card-option">Credit/Debit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod-option" />
                      <Label htmlFor="cod-option">Cash on Delivery</Label>
                    </div>
                  </RadioGroup>

                  {selectedPaymentMethod === 'card' && (
                    <div className="space-y-4 mt-4 border border-border rounded-md p-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Cardholder Name</Label>
                        <Input 
                          id="name" 
                          placeholder="John Doe"
                          value={newCardDetails.name}
                          onChange={(e) => setNewCardDetails({...newCardDetails, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="number">Card Number</Label>
                        <Input 
                          id="number" 
                          placeholder="4242 4242 4242 4242"
                          value={newCardDetails.number}
                          onChange={(e) => setNewCardDetails({...newCardDetails, number: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input 
                            id="expiry" 
                            placeholder="MM/YY"
                            value={newCardDetails.expiry}
                            onChange={(e) => setNewCardDetails({...newCardDetails, expiry: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input 
                            id="cvc" 
                            placeholder="123"
                            value={newCardDetails.cvc}
                            onChange={(e) => setNewCardDetails({...newCardDetails, cvc: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'cod' && (
                    <div className="mt-4 p-4 border border-border rounded-md">
                      <p className="text-sm">
                        By selecting Cash on Delivery, you agree to pay the full amount when your order is delivered to your address.
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddPaymentMethod}>Add Payment Method</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {method.type === 'card' ? (
                        <CreditCard className="h-10 w-10 text-blue-500 dark:text-blue-400 mr-4" />
                      ) : (
                        <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-4">
                          <span className="text-green-700 dark:text-green-400 font-bold">₱</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{method.name}{method.last4 ? ` •••• ${method.last4}` : ''}</h3>
                        {method.expiry && <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>}
                        {method.isDefault && <Badge variant="outline" className="mt-1">Default</Badge>}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!method.isDefault && (
                        <Button variant="outline" size="sm" onClick={() => handleSetDefaultPaymentMethod(method.id)}>
                          Set Default
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleRemovePaymentMethod(method.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {paymentMethods.length === 0 && (
              <div className="text-center py-10 border border-border rounded-lg">
                <p className="text-muted-foreground">No payment methods added yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-border rounded-md">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <h3 className="font-medium">{transaction.description}</h3>
                        <div className="ml-3 flex items-center">
                          {getStatusIcon(transaction.status)}
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{transaction.paymentMethod}</p>
                    </div>
                    <p className="font-semibold">₱{transaction.amount.toLocaleString()}</p>
                  </div>
                ))}
                
                {transactions.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuyerPayments;
