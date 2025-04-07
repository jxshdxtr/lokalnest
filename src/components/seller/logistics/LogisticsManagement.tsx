
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Truck, Package, MapPin, Map, Plus } from 'lucide-react';

const mockDeliveries = [
  {
    id: '1',
    orderId: 'ORD-001',
    customer: 'John Doe',
    address: 'Unit 1234, Building A, Metro Manila',
    status: 'scheduled',
    carrier: 'J&T Express',
    scheduledDate: '2025-04-15T10:00:00',
    trackingNumber: 'JT12345678PH'
  },
  {
    id: '2',
    orderId: 'ORD-003',
    customer: 'Maria Santos',
    address: '123 Main Street, Cebu City',
    status: 'in_transit',
    carrier: 'LBC Express',
    scheduledDate: '2025-04-08T14:30:00',
    trackingNumber: 'LBC87654321PH'
  },
  {
    id: '3',
    orderId: 'ORD-007',
    customer: 'Roberto Garcia',
    address: '456 Park Avenue, Davao City',
    status: 'delivered',
    carrier: 'Ninja Van',
    scheduledDate: '2025-04-02T09:15:00',
    trackingNumber: 'NV13579086PH'
  }
];

const carriers = [
  { id: 'jt', name: 'J&T Express', baseRate: 100, perKgRate: 20 },
  { id: 'lbc', name: 'LBC Express', baseRate: 120, perKgRate: 25 },
  { id: 'ninja', name: 'Ninja Van', baseRate: 110, perKgRate: 22 },
  { id: 'grab', name: 'Grab Express', baseRate: 150, perKgRate: 30 }
];

const LogisticsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('deliveries');
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [packageWeight, setPackageWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [shippingFee, setShippingFee] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Scheduled</span>;
      case 'in_transit':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">In Transit</span>;
      case 'delivered':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Delivered</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  const calculateShippingFee = () => {
    if (!selectedCarrier || !packageWeight || !distance) {
      toast.error('Please fill in all fields to calculate shipping fee');
      return;
    }
    
    const carrier = carriers.find(c => c.id === selectedCarrier);
    if (!carrier) return;
    
    const weight = parseFloat(packageWeight);
    const distanceKm = parseFloat(distance);
    
    // Simple formula: base rate + (weight * per kg rate) + (0.5 * distance)
    const fee = carrier.baseRate + (weight * carrier.perKgRate) + (0.5 * distanceKm);
    setShippingFee(fee);
    
    toast.success('Shipping fee calculated successfully');
  };
  
  const scheduleDelivery = () => {
    toast.success('Delivery scheduled successfully');
    setActiveTab('deliveries');
  };
  
  const handleTrackingUpdate = (deliveryId: string) => {
    toast.success('Tracking information updated and notification sent to customer');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Logistics & Delivery</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="deliveries">
            <Truck className="h-4 w-4 mr-2" />
            Deliveries
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Package className="h-4 w-4 mr-2" />
            Shipping Fees
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="deliveries" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Scheduled Deliveries</CardTitle>
              <CardDescription>
                View and manage all scheduled and in-progress deliveries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Carrier</TableHead>
                    <TableHead className="hidden md:table-cell">Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.orderId}</TableCell>
                      <TableCell>
                        <div>
                          <div>{delivery.customer}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {delivery.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{delivery.carrier}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(delivery.scheduledDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleTrackingUpdate(delivery.id)}>
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Delivery</CardTitle>
              <CardDescription>
                Set up delivery for orders through our integrated courier partners.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_id">Order ID</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ord001">Order #001</SelectItem>
                      <SelectItem value="ord002">Order #002</SelectItem>
                      <SelectItem value="ord003">Order #003</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="carrier">Courier Service</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select courier" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map(carrier => (
                        <SelectItem key={carrier.id} value={carrier.id}>
                          {carrier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup_date">Pickup Date</Label>
                  <Input type="date" id="pickup_date" min={new Date().toISOString().split('T')[0]} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pickup_time">Pickup Time</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9am-12pm)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (1pm-5pm)</SelectItem>
                      <SelectItem value="evening">Evening (6pm-8pm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions</Label>
                <Input id="notes" placeholder="Any special instructions for the courier" />
              </div>
              
              <div className="flex justify-end">
                <Button type="button" onClick={scheduleDelivery}>
                  <Truck className="h-4 w-4 mr-2" />
                  Schedule Delivery
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Calculate Shipping Fees</CardTitle>
              <CardDescription>
                Estimate shipping costs based on weight, distance, and courier.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carrier_calc">Courier Service</Label>
                  <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select courier" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map(carrier => (
                        <SelectItem key={carrier.id} value={carrier.id}>
                          {carrier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Package Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    placeholder="Enter weight" 
                    min="0.1" 
                    step="0.1"
                    value={packageWeight}
                    onChange={(e) => setPackageWeight(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input 
                    id="distance" 
                    type="number" 
                    placeholder="Enter distance" 
                    min="1" 
                    step="1"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Button onClick={calculateShippingFee}>
                  Calculate Fee
                </Button>
                
                {shippingFee !== null && (
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Estimated Shipping Fee:</div>
                    <div className="text-2xl font-bold">₱{shippingFee.toFixed(2)}</div>
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

export default LogisticsManagement;
