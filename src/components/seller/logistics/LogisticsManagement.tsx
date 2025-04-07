
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  Truck, 
  Package, 
  Calendar as CalendarIcon, 
  Clock, 
  Map, 
  FileText, 
  MoreVertical, 
  Eye, 
  Download, 
  Printer
} from 'lucide-react';

const LogisticsManagement = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const deliveries = [
    {
      id: "DEL-001",
      order_id: "ORD-5436",
      customer: "Juan Dela Cruz",
      address: "123 Main St, Manila, Philippines",
      status: "scheduled",
      date: "2025-04-09T10:00:00Z",
      courier: "FastTrack Delivery"
    },
    {
      id: "DEL-002",
      order_id: "ORD-5442",
      customer: "Maria Santos",
      address: "456 Oak Ave, Quezon City, Philippines",
      status: "in_transit",
      date: "2025-04-08T14:30:00Z",
      courier: "SpeedShip"
    },
    {
      id: "DEL-003",
      order_id: "ORD-5448",
      customer: "Antonio Reyes",
      address: "789 Pine St, Cebu City, Philippines",
      status: "delivered",
      date: "2025-04-07T11:15:00Z",
      courier: "FastTrack Delivery"
    },
    {
      id: "DEL-004",
      order_id: "ORD-5453",
      customer: "Elena Moreno",
      address: "234 Cedar Rd, Davao City, Philippines",
      status: "failed",
      date: "2025-04-06T16:00:00Z",
      courier: "SpeedShip"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Scheduled</Badge>;
      case 'in_transit':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">In Transit</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Delivered</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logistics & Delivery</h1>
        <p className="text-muted-foreground">Manage your shipping, tracking, and delivery options</p>
      </div>

      <Tabs defaultValue="deliveries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="shipping">Shipping Rates</TabsTrigger>
          <TabsTrigger value="couriers">Courier Services</TabsTrigger>
          <TabsTrigger value="settings">Logistics Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Couriers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Couriers</SelectItem>
                  <SelectItem value="fasttrack">FastTrack Delivery</SelectItem>
                  <SelectItem value="speedship">SpeedShip</SelectItem>
                  <SelectItem value="expressdeliver">Express Deliver</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full sm:w-auto">
              <Truck className="mr-2 h-4 w-4" />
              Schedule Delivery
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="hidden md:table-cell">Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Courier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.id}</TableCell>
                      <TableCell>{delivery.order_id}</TableCell>
                      <TableCell className="hidden md:table-cell">{delivery.customer}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(delivery.date), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">{delivery.courier}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Map className="mr-2 h-4 w-4" />Track Delivery
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />Download Label
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />Print Manifest
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Rates</CardTitle>
              <CardDescription>
                Configure your shipping rates based on weight, distance, and delivery options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base-rate">Base Shipping Rate (₱)</Label>
                  <Input id="base-rate" type="number" defaultValue="100" />
                  <p className="text-sm text-muted-foreground">
                    Starting rate for all deliveries
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight-rate">Per Kg Rate (₱)</Label>
                  <Input id="weight-rate" type="number" defaultValue="20" />
                  <p className="text-sm text-muted-foreground">
                    Additional cost per kilogram
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Regional Shipping Rates</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead>Base Rate (₱)</TableHead>
                      <TableHead>Additional Per Kg (₱)</TableHead>
                      <TableHead>Estimated Delivery</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Metro Manila</TableCell>
                      <TableCell>80</TableCell>
                      <TableCell>15</TableCell>
                      <TableCell>1-2 days</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Luzon (Other)</TableCell>
                      <TableCell>120</TableCell>
                      <TableCell>25</TableCell>
                      <TableCell>2-4 days</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Visayas</TableCell>
                      <TableCell>150</TableCell>
                      <TableCell>30</TableCell>
                      <TableCell>3-5 days</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Mindanao</TableCell>
                      <TableCell>180</TableCell>
                      <TableCell>35</TableCell>
                      <TableCell>4-7 days</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="couriers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Courier Services</CardTitle>
              <CardDescription>
                Manage your connected delivery services and APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-4 border rounded-lg gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 p-2 rounded-md">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">FastTrack Delivery</h3>
                      <p className="text-sm text-muted-foreground">National coverage with same-day options</p>
                    </div>
                  </div>
                  <Badge>Connected</Badge>
                </div>
                
                <div className="flex items-center p-4 border rounded-lg gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 p-2 rounded-md">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">SpeedShip</h3>
                      <p className="text-sm text-muted-foreground">Affordable delivery for small packages</p>
                    </div>
                  </div>
                  <Badge>Connected</Badge>
                </div>
                
                <div className="flex items-center p-4 border rounded-lg gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 p-2 rounded-md">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">Express Deliver</h3>
                      <p className="text-sm text-muted-foreground">Premium service with real-time tracking</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logistics Settings</CardTitle>
              <CardDescription>
                Configure delivery preferences and packaging options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-courier">Default Courier Service</Label>
                <Select defaultValue="fasttrack">
                  <SelectTrigger id="default-courier">
                    <SelectValue placeholder="Select courier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fasttrack">FastTrack Delivery</SelectItem>
                    <SelectItem value="speedship">SpeedShip</SelectItem>
                    <SelectItem value="expressdeliver">Express Deliver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pickup-address">Pickup Address</Label>
                <Textarea 
                  id="pickup-address" 
                  rows={3}
                  defaultValue="123 Business Street, Sample City, 1000 Philippines"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-person">Contact Person</Label>
                  <Input id="contact-person" defaultValue="Juan Seller" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-number">Contact Number</Label>
                  <Input id="contact-number" defaultValue="+63 912 345 6789" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogisticsManagement;
