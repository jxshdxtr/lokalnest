
import React, { useState } from 'react';
import { 
  Truck, 
  Package, 
  MapPin, 
  Globe, 
  ArrowUpDown,
  Search,
  Filter,
  Settings,
  Plus,
  Edit,
  Trash,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Map,
  Coins,
  Ship,
  Plane,
  FileText,
  DollarSign
} from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from '@/hooks/use-toast';

// Mock data for shipping partners
const shippingPartners = [
  {
    id: '1',
    name: 'Express Courier',
    type: 'domestic',
    trackingEnabled: true,
    areas: ['All Domestic'],
    deliveryTime: '1-2 days',
    pricing: {
      base: 10,
      perKg: 2
    },
    status: 'active',
    icon: 'truck'
  },
  {
    id: '2',
    name: 'Global Logistics',
    type: 'international',
    trackingEnabled: true,
    areas: ['North America', 'Europe', 'Asia'],
    deliveryTime: '5-7 days',
    pricing: {
      base: 25,
      perKg: 5
    },
    status: 'active',
    icon: 'globe'
  },
  {
    id: '3',
    name: 'Local Delivery',
    type: 'local',
    trackingEnabled: true,
    areas: ['Metropolitan Area'],
    deliveryTime: 'Same day',
    pricing: {
      base: 5,
      perKg: 1
    },
    status: 'active',
    icon: 'package'
  },
  {
    id: '4',
    name: 'Eco Shipping',
    type: 'domestic',
    trackingEnabled: false,
    areas: ['All Domestic'],
    deliveryTime: '3-5 days',
    pricing: {
      base: 8,
      perKg: 1.5
    },
    status: 'inactive',
    icon: 'truck'
  },
  {
    id: '5',
    name: 'Maritime Express',
    type: 'international',
    trackingEnabled: true,
    areas: ['Coastal Regions', 'Islands'],
    deliveryTime: '10-15 days',
    pricing: {
      base: 18,
      perKg: 3
    },
    status: 'active',
    icon: 'ship'
  },
];

// Mock data for delivery zones
const deliveryZones = [
  {
    id: '1',
    name: 'Zone A - Urban Centers',
    regions: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
    carriers: ['Express Courier', 'Local Delivery'],
    deliveryTime: '1-2 days',
    feeMultiplier: 1.0
  },
  {
    id: '2',
    name: 'Zone B - Suburban Areas',
    regions: ['Orange County', 'Westchester', 'Oakland', 'Fort Worth'],
    carriers: ['Express Courier', 'Eco Shipping'],
    deliveryTime: '2-3 days',
    feeMultiplier: 1.2
  },
  {
    id: '3',
    name: 'Zone C - Rural Areas',
    regions: ['Montana', 'Wyoming', 'North Dakota', 'Vermont'],
    carriers: ['Express Courier', 'Eco Shipping'],
    deliveryTime: '3-5 days',
    feeMultiplier: 1.5
  },
  {
    id: '4',
    name: 'Zone D - International Priority',
    regions: ['Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Australia'],
    carriers: ['Global Logistics'],
    deliveryTime: '5-7 days',
    feeMultiplier: 2.0
  },
  {
    id: '5',
    name: 'Zone E - International Standard',
    regions: ['Brazil', 'India', 'South Africa', 'Other Countries'],
    carriers: ['Global Logistics', 'Maritime Express'],
    deliveryTime: '10-15 days',
    feeMultiplier: 1.75
  },
];

// Mock data for recent shipments
const recentShipments = [
  {
    id: 'SHP-10045',
    orderNumber: 'ORD-45298',
    customer: {
      name: 'Alice Johnson',
      location: 'New York, NY'
    },
    items: [
      { name: 'Handmade Ceramic Vase', quantity: 1 },
      { name: 'Wooden Serving Bowl', quantity: 1 }
    ],
    carrier: 'Express Courier',
    status: 'delivered',
    shipping: {
      method: 'Standard',
      cost: 12.50,
      trackingNumber: 'EC728340598US'
    },
    dates: {
      ordered: '2023-10-12',
      shipped: '2023-10-13',
      delivered: '2023-10-14'
    }
  },
  {
    id: 'SHP-10044',
    orderNumber: 'ORD-45290',
    customer: {
      name: 'Robert Smith',
      location: 'London, UK'
    },
    items: [
      { name: 'Hand-painted Silk Scarf', quantity: 2 }
    ],
    carrier: 'Global Logistics',
    status: 'in_transit',
    shipping: {
      method: 'International Express',
      cost: 35.00,
      trackingNumber: 'GL192036472GB'
    },
    dates: {
      ordered: '2023-10-09',
      shipped: '2023-10-10',
      estimated_delivery: '2023-10-16'
    }
  },
  {
    id: 'SHP-10043',
    orderNumber: 'ORD-45285',
    customer: {
      name: 'Carlos Rodriguez',
      location: 'Miami, FL'
    },
    items: [
      { name: 'Artisan Coffee Beans', quantity: 3 },
      { name: 'Ceramic Coffee Mug', quantity: 2 }
    ],
    carrier: 'Local Delivery',
    status: 'out_for_delivery',
    shipping: {
      method: 'Same Day',
      cost: 8.00,
      trackingNumber: 'LD587614390US'
    },
    dates: {
      ordered: '2023-10-14',
      shipped: '2023-10-14',
      estimated_delivery: '2023-10-14'
    }
  },
  {
    id: 'SHP-10042',
    orderNumber: 'ORD-45279',
    customer: {
      name: 'Emily Wilson',
      location: 'Austin, TX'
    },
    items: [
      { name: 'Handwoven Wall Hanging', quantity: 1 }
    ],
    carrier: 'Eco Shipping',
    status: 'processing',
    shipping: {
      method: 'Eco Friendly',
      cost: 9.50,
      trackingNumber: 'N/A'
    },
    dates: {
      ordered: '2023-10-13',
      estimated_ship: '2023-10-15',
      estimated_delivery: '2023-10-18'
    }
  },
  {
    id: 'SHP-10041',
    orderNumber: 'ORD-45276',
    customer: {
      name: 'Michael Chan',
      location: 'San Francisco, CA'
    },
    items: [
      { name: 'Handmade Leather Wallet', quantity: 1 },
      { name: 'Artisan Soap Set', quantity: 1 }
    ],
    carrier: 'Express Courier',
    status: 'delivered',
    shipping: {
      method: 'Priority',
      cost: 15.75,
      trackingNumber: 'EC584762031US'
    },
    dates: {
      ordered: '2023-10-08',
      shipped: '2023-10-09',
      delivered: '2023-10-10'
    }
  },
];

const Logistics = () => {
  const [partners, setPartners] = useState(shippingPartners);
  const [zones, setZones] = useState(deliveryZones);
  const [shipments, setShipments] = useState(recentShipments);
  
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isPartnerDetailsOpen, setIsPartnerDetailsOpen] = useState(false);
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isZoneDetailsOpen, setIsZoneDetailsOpen] = useState(false);
  const [isShipmentDetailsOpen, setIsShipmentDetailsOpen] = useState(false);
  const [isShippingCalculatorOpen, setIsShippingCalculatorOpen] = useState(false);

  const [calculatorWeight, setCalculatorWeight] = useState(1);
  const [calculatorZone, setCalculatorZone] = useState('1');
  const [calculatorCarrier, setCalculatorCarrier] = useState('1');
  
  // Filter shipments based on search and filters
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch = 
      shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCarrier = carrierFilter === 'all' || shipment.carrier === carrierFilter;
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    
    return matchesSearch && matchesCarrier && matchesStatus;
  });

  const handlePartnerStatusChange = (partnerId: string, status: string) => {
    setPartners(partners.map(partner => {
      if (partner.id === partnerId) {
        return { ...partner, status };
      }
      return partner;
    }));

    toast({
      title: "Partner Updated",
      description: `Partner status changed to ${status}.`,
    });
  };

  const handleDeletePartner = (partnerId: string) => {
    setPartners(partners.filter(partner => partner.id !== partnerId));
    
    toast({
      title: "Partner Deleted",
      description: "Shipping partner has been deleted successfully.",
      variant: "destructive",
    });
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones(zones.filter(zone => zone.id !== zoneId));
    
    toast({
      title: "Zone Deleted",
      description: "Delivery zone has been deleted successfully.",
      variant: "destructive",
    });
  };

  const updateShipmentStatus = (shipmentId: string, status: string) => {
    setShipments(shipments.map(shipment => {
      if (shipment.id === shipmentId) {
        return { ...shipment, status };
      }
      return shipment;
    }));

    toast({
      title: "Shipment Updated",
      description: `Shipment status changed to ${status.replace('_', ' ')}.`,
    });
  };

  const calculateShippingCost = () => {
    const zone = zones.find(z => z.id === calculatorZone);
    const carrier = partners.find(p => p.id === calculatorCarrier);
    
    if (!zone || !carrier) return 0;
    
    const baseCost = carrier.pricing.base;
    const weightCost = carrier.pricing.perKg * calculatorWeight;
    const zoneMultiplier = zone.feeMultiplier;
    
    return (baseCost + weightCost) * zoneMultiplier;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'in_transit':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">In Transit</Badge>;
      case 'out_for_delivery':
        return <Badge className="bg-indigo-500">Out for Delivery</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Processing</Badge>;
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCarrierIcon = (iconType: string) => {
    switch (iconType) {
      case 'truck':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'globe':
        return <Globe className="h-4 w-4 text-indigo-500" />;
      case 'package':
        return <Package className="h-4 w-4 text-amber-500" />;
      case 'ship':
        return <Ship className="h-4 w-4 text-blue-500" />;
      case 'plane':
        return <Plane className="h-4 w-4 text-purple-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Logistics Overview</TabsTrigger>
          <TabsTrigger value="carriers">Shipping Partners</TabsTrigger>
          <TabsTrigger value="zones">Delivery Zones</TabsTrigger>
          <TabsTrigger value="tracking">Shipment Tracking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-blue-500" />
                  Active Carriers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {partners.filter(p => p.status === 'active').length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Out of {partners.length} configured carriers
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                  Delivery Zones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {zones.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Covering both domestic and international
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Package className="h-4 w-4 mr-2 text-amber-500" />
                  Recent Shipments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {shipments.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  In the last 7 days
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Shipping Tools</CardTitle>
              <CardDescription>Quick access to shipping functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto flex-col items-center justify-center p-6 gap-2"
                  onClick={() => setIsShippingCalculatorOpen(true)}
                >
                  <Coins className="h-8 w-8 text-amber-500" />
                  <div className="font-medium">Shipping Calculator</div>
                  <div className="text-xs text-muted-foreground text-center">
                    Calculate shipping costs
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex-col items-center justify-center p-6 gap-2"
                >
                  <Map className="h-8 w-8 text-indigo-500" />
                  <div className="font-medium">Coverage Map</div>
                  <div className="text-xs text-muted-foreground text-center">
                    View shipping coverage
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex-col items-center justify-center p-6 gap-2"
                >
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                  <div className="font-medium">Shipping Analytics</div>
                  <div className="text-xs text-muted-foreground text-center">
                    View delivery performance
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex-col items-center justify-center p-6 gap-2"
                >
                  <FileText className="h-8 w-8 text-green-500" />
                  <div className="font-medium">Shipping Policies</div>
                  <div className="text-xs text-muted-foreground text-center">
                    Manage shipping rules
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Shipments</CardTitle>
              <CardDescription>Latest order shipments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.slice(0, 3).map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>
                        <div className="font-medium">{shipment.id}</div>
                        <div className="text-xs text-muted-foreground">{shipment.orderNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div>{shipment.customer.name}</div>
                        <div className="text-xs text-muted-foreground">{shipment.customer.location}</div>
                      </TableCell>
                      <TableCell>{shipment.carrier}</TableCell>
                      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell>
                        <div>{shipment.dates.ordered}</div>
                        {shipment.status === 'delivered' && (
                          <div className="text-xs text-muted-foreground">
                            Delivered: {shipment.dates.delivered}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setIsShipmentDetailsOpen(true);
                          }}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Shipments
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="carriers" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Shipping Partners</CardTitle>
                <CardDescription>Manage integrated shipping carriers</CardDescription>
              </div>
              <Button onClick={() => setIsAddPartnerOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Partner
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Delivery Time</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCarrierIcon(partner.icon)}
                          <div className="font-medium">{partner.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {partner.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{partner.deliveryTime}</TableCell>
                      <TableCell>
                        {partner.trackingEnabled ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {partner.status === 'inactive' ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-500"
                              onClick={() => handlePartnerStatusChange(partner.id, 'active')}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handlePartnerStatusChange(partner.id, 'inactive')}
                            >
                              Deactivate
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPartner(partner);
                              setIsPartnerDetailsOpen(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ArrowUpDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedPartner(partner);
                                setIsPartnerDetailsOpen(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" /> Edit Partner
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeletePartner(partner.id)}
                                className="text-red-500"
                              >
                                <Trash className="h-4 w-4 mr-2" /> Delete Partner
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="zones" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Delivery Zones</CardTitle>
                <CardDescription>Configure shipping regions and rates</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Zone
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map((zone) => (
                  <Card key={zone.id} className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{zone.name}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedZone(zone);
                              setIsZoneDetailsOpen(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" /> Edit Zone
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteZone(zone.id)}
                              className="text-red-500"
                            >
                              <Trash className="h-4 w-4 mr-2" /> Delete Zone
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-muted-foreground">Delivery Time</div>
                          <div className="font-medium">{zone.deliveryTime}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Fee Multiplier</div>
                          <div className="font-medium">{zone.feeMultiplier}x</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Available Carriers</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {zone.carriers.map((carrier, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {carrier}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        variant="outline" 
                        className="w-full text-xs" 
                        size="sm"
                        onClick={() => {
                          setSelectedZone(zone);
                          setIsZoneDetailsOpen(true);
                        }}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {zone.regions.length} regions
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipment Tracking</CardTitle>
              <CardDescription>Track and manage order shipments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative w-full sm:w-auto flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search shipments..."
                      className="pl-8 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={carrierFilter} onValueChange={setCarrierFilter}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Carriers</SelectItem>
                          {partners.map((partner) => (
                            <SelectItem key={partner.id} value={partner.name}>
                              {partner.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No shipments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredShipments.map((shipment) => (
                        <TableRow key={shipment.id}>
                          <TableCell>
                            <div className="font-medium">{shipment.id}</div>
                            <div className="text-xs text-muted-foreground">{shipment.orderNumber}</div>
                          </TableCell>
                          <TableCell>
                            <div>{shipment.customer.name}</div>
                            <div className="text-xs text-muted-foreground">{shipment.customer.location}</div>
                          </TableCell>
                          <TableCell>{shipment.carrier}</TableCell>
                          <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                          <TableCell>
                            {shipment.shipping.trackingNumber !== 'N/A' ? (
                              <div className="text-xs font-mono bg-muted p-1 rounded">
                                {shipment.shipping.trackingNumber}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">Not available</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedShipment(shipment);
                                  setIsShipmentDetailsOpen(true);
                                }}
                              >
                                Details
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <ArrowUpDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {shipment.status === 'processing' && (
                                    <DropdownMenuItem 
                                      onClick={() => updateShipmentStatus(shipment.id, 'in_transit')}
                                    >
                                      Mark as Shipped
                                    </DropdownMenuItem>
                                  )}
                                  {shipment.status === 'in_transit' && (
                                    <DropdownMenuItem 
                                      onClick={() => updateShipmentStatus(shipment.id, 'out_for_delivery')}
                                    >
                                      Mark as Out for Delivery
                                    </DropdownMenuItem>
                                  )}
                                  {(shipment.status === 'in_transit' || shipment.status === 'out_for_delivery') && (
                                    <DropdownMenuItem 
                                      onClick={() => updateShipmentStatus(shipment.id, 'delivered')}
                                    >
                                      Mark as Delivered
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>
                                    Print Label
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Partner Details Dialog */}
      <Dialog open={isPartnerDetailsOpen} onOpenChange={setIsPartnerDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Shipping Partner Details</DialogTitle>
            <DialogDescription>Configure shipping carrier settings</DialogDescription>
          </DialogHeader>
          
          {selectedPartner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partnerName">Partner Name</Label>
                  <Input 
                    id="partnerName" 
                    value={selectedPartner.name}
                    onChange={(e) => setSelectedPartner({ 
                      ...selectedPartner, 
                      name: e.target.value 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnerType">Type</Label>
                  <Select 
                    value={selectedPartner.type}
                    onValueChange={(value) => setSelectedPartner({ 
                      ...selectedPartner, 
                      type: value 
                    })}
                  >
                    <SelectTrigger id="partnerType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domestic">Domestic</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Delivery Time</Label>
                  <Input 
                    id="deliveryTime" 
                    value={selectedPartner.deliveryTime}
                    onChange={(e) => setSelectedPartner({ 
                      ...selectedPartner, 
                      deliveryTime: e.target.value 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnerIcon">Icon</Label>
                  <Select 
                    value={selectedPartner.icon}
                    onValueChange={(value) => setSelectedPartner({ 
                      ...selectedPartner, 
                      icon: value 
                    })}
                  >
                    <SelectTrigger id="partnerIcon">
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="globe">Globe</SelectItem>
                      <SelectItem value="package">Package</SelectItem>
                      <SelectItem value="ship">Ship</SelectItem>
                      <SelectItem value="plane">Plane</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="trackingEnabled">Tracking Enabled</Label>
                  <Switch 
                    id="trackingEnabled" 
                    checked={selectedPartner.trackingEnabled}
                    onCheckedChange={(checked) => setSelectedPartner({ 
                      ...selectedPartner, 
                      trackingEnabled: checked 
                    })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enable tracking integration with this shipping carrier
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="areas">Delivery Areas</Label>
                <Input 
                  id="areas" 
                  value={selectedPartner.areas.join(', ')}
                  onChange={(e) => setSelectedPartner({ 
                    ...selectedPartner, 
                    areas: e.target.value.split(',').map(area => area.trim()) 
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of delivery areas
                </p>
              </div>

              <div className="space-y-2">
                <Label>Pricing</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice" className="text-xs">Base Price ($)</Label>
                    <Input 
                      id="basePrice" 
                      type="number"
                      value={selectedPartner.pricing.base}
                      onChange={(e) => setSelectedPartner({ 
                        ...selectedPartner, 
                        pricing: {
                          ...selectedPartner.pricing,
                          base: parseFloat(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perKgPrice" className="text-xs">Per Kg Price ($)</Label>
                    <Input 
                      id="perKgPrice" 
                      type="number"
                      value={selectedPartner.pricing.perKg}
                      onChange={(e) => setSelectedPartner({ 
                        ...selectedPartner, 
                        pricing: {
                          ...selectedPartner.pricing,
                          perKg: parseFloat(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsPartnerDetailsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setPartners(partners.map(partner => 
                partner.id === selectedPartner.id ? selectedPartner : partner
              ));
              setIsPartnerDetailsOpen(false);
              
              toast({
                title: "Partner Updated",
                description: "Shipping partner has been updated successfully.",
              });
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Partner Dialog */}
      <Dialog open={isAddPartnerOpen} onOpenChange={setIsAddPartnerOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Shipping Partner</DialogTitle>
            <DialogDescription>Configure a new shipping carrier</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPartnerName">Partner Name</Label>
                <Input id="newPartnerName" placeholder="e.g., Fast Express" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPartnerType">Type</Label>
                <Select defaultValue="domestic">
                  <SelectTrigger id="newPartnerType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic">Domestic</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newDeliveryTime">Delivery Time</Label>
                <Input id="newDeliveryTime" placeholder="e.g., 2-3 days" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPartnerIcon">Icon</Label>
                <Select defaultValue="truck">
                  <SelectTrigger id="newPartnerIcon">
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="globe">Globe</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                    <SelectItem value="ship">Ship</SelectItem>
                    <SelectItem value="plane">Plane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="newTrackingEnabled">Tracking Enabled</Label>
                <Switch id="newTrackingEnabled" defaultChecked={true} />
              </div>
              <p className="text-xs text-muted-foreground">
                Enable tracking integration with this shipping carrier
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newAreas">Delivery Areas</Label>
              <Input id="newAreas" placeholder="e.g., North America, Europe" />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of delivery areas
              </p>
            </div>

            <div className="space-y-2">
              <Label>Pricing</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newBasePrice" className="text-xs">Base Price ($)</Label>
                  <Input id="newBasePrice" type="number" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPerKgPrice" className="text-xs">Per Kg Price ($)</Label>
                  <Input id="newPerKgPrice" type="number" placeholder="2" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddPartnerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // In a real app, we would validate and save the new partner
              setIsAddPartnerOpen(false);
              
              toast({
                title: "Partner Added",
                description: "New shipping partner has been added successfully.",
              });
            }}>
              Add Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zone Details Dialog */}
      <Dialog open={isZoneDetailsOpen} onOpenChange={setIsZoneDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Delivery Zone Details</DialogTitle>
            <DialogDescription>Configure shipping zone settings</DialogDescription>
          </DialogHeader>
          
          {selectedZone && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zoneName">Zone Name</Label>
                <Input 
                  id="zoneName" 
                  value={selectedZone.name}
                  onChange={(e) => setSelectedZone({ 
                    ...selectedZone, 
                    name: e.target.value 
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoneDeliveryTime">Delivery Time</Label>
                <Input 
                  id="zoneDeliveryTime" 
                  value={selectedZone.deliveryTime}
                  onChange={(e) => setSelectedZone({ 
                    ...selectedZone, 
                    deliveryTime: e.target.value 
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoneFeeMultiplier">Fee Multiplier</Label>
                <Input 
                  id="zoneFeeMultiplier" 
                  type="number"
                  step="0.1"
                  value={selectedZone.feeMultiplier}
                  onChange={(e) => setSelectedZone({ 
                    ...selectedZone, 
                    feeMultiplier: parseFloat(e.target.value) 
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Multiplier applied to the base shipping rate
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoneRegions">Regions</Label>
                <Input 
                  id="zoneRegions" 
                  value={selectedZone.regions.join(', ')}
                  onChange={(e) => setSelectedZone({ 
                    ...selectedZone, 
                    regions: e.target.value.split(',').map(region => region.trim()) 
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of regions covered by this zone
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoneCarriers">Available Carriers</Label>
                <div className="flex flex-wrap gap-2 pt-2">
                  {partners.map((partner) => (
                    <div key={partner.id} className="flex items-center space-x-2">
                      <Switch 
                        id={`carrier-${partner.id}`}
                        checked={selectedZone.carriers.includes(partner.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedZone({
                              ...selectedZone,
                              carriers: [...selectedZone.carriers, partner.name]
                            });
                          } else {
                            setSelectedZone({
                              ...selectedZone,
                              carriers: selectedZone.carriers.filter(c => c !== partner.name)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`carrier-${partner.id}`} className="text-sm">
                        {partner.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsZoneDetailsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setZones(zones.map(zone => 
                zone.id === selectedZone.id ? selectedZone : zone
              ));
              setIsZoneDetailsOpen(false);
              
              toast({
                title: "Zone Updated",
                description: "Delivery zone has been updated successfully.",
              });
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipment Details Dialog */}
      <Dialog open={isShipmentDetailsOpen} onOpenChange={setIsShipmentDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
            <DialogDescription>View and manage shipment information</DialogDescription>
          </DialogHeader>
          
          {selectedShipment && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Shipment ID</div>
                  <div className="font-medium">{selectedShipment.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Order Number</div>
                  <div className="font-medium">{selectedShipment.orderNumber}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div>{getStatusBadge(selectedShipment.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Shipping Method</div>
                  <div className="font-medium">{selectedShipment.shipping.method}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Customer</div>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <div className="font-medium">{selectedShipment.customer.name}</div>
                  <div className="text-sm">{selectedShipment.customer.location}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Items</div>
                <div className="mt-1 p-3 bg-muted rounded-md space-y-2">
                  {selectedShipment.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Carrier</div>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <div className="font-medium">{selectedShipment.carrier}</div>
                  <div className="text-sm">
                    {selectedShipment.shipping.trackingNumber !== 'N/A' ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span>Tracking:</span>
                        <span className="font-mono bg-background px-2 py-1 rounded text-xs">
                          {selectedShipment.shipping.trackingNumber}
                        </span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No tracking available</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Timeline</div>
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="w-24 text-xs text-muted-foreground pt-0.5">
                      Ordered
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{selectedShipment.dates.ordered}</span>
                    </div>
                  </div>
                  
                  {selectedShipment.dates.shipped && (
                    <div className="flex gap-4">
                      <div className="w-24 text-xs text-muted-foreground pt-0.5">
                        Shipped
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{selectedShipment.dates.shipped}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedShipment.status === 'out_for_delivery' && (
                    <div className="flex gap-4">
                      <div className="w-24 text-xs text-muted-foreground pt-0.5">
                        Out for Delivery
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Today</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedShipment.dates.delivered ? (
                    <div className="flex gap-4">
                      <div className="w-24 text-xs text-muted-foreground pt-0.5">
                        Delivered
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{selectedShipment.dates.delivered}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="w-24 text-xs text-muted-foreground pt-0.5">
                        {selectedShipment.status === 'out_for_delivery' 
                          ? 'Expected Delivery' 
                          : 'Estimated Delivery'}
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedShipment.status === 'processing' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-blue-500" />
                        )}
                        <span>
                          {selectedShipment.dates.estimated_delivery || 'Pending'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Shipping Cost</div>
                  <div className="flex items-center mt-1">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{selectedShipment.shipping.cost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsShipmentDetailsOpen(false)}>
              Close
            </Button>
            {selectedShipment && selectedShipment.status !== 'delivered' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>Update Status</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {selectedShipment.status === 'processing' && (
                    <DropdownMenuItem 
                      onClick={() => {
                        updateShipmentStatus(selectedShipment.id, 'in_transit');
                        setIsShipmentDetailsOpen(false);
                      }}
                    >
                      Mark as Shipped
                    </DropdownMenuItem>
                  )}
                  {selectedShipment.status === 'in_transit' && (
                    <DropdownMenuItem 
                      onClick={() => {
                        updateShipmentStatus(selectedShipment.id, 'out_for_delivery');
                        setIsShipmentDetailsOpen(false);
                      }}
                    >
                      Mark as Out for Delivery
                    </DropdownMenuItem>
                  )}
                  {(selectedShipment.status === 'in_transit' || selectedShipment.status === 'out_for_delivery') && (
                    <DropdownMenuItem 
                      onClick={() => {
                        updateShipmentStatus(selectedShipment.id, 'delivered');
                        setIsShipmentDetailsOpen(false);
                      }}
                    >
                      Mark as Delivered
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipping Calculator Dialog */}
      <Dialog open={isShippingCalculatorOpen} onOpenChange={setIsShippingCalculatorOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Shipping Calculator</DialogTitle>
            <DialogDescription>Calculate shipping fees</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calcWeight">Package Weight (kg)</Label>
              <Input 
                id="calcWeight" 
                type="number"
                value={calculatorWeight}
                onChange={(e) => setCalculatorWeight(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calcZone">Delivery Zone</Label>
              <Select 
                value={calculatorZone}
                onValueChange={setCalculatorZone}
              >
                <SelectTrigger id="calcZone">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calcCarrier">Shipping Carrier</Label>
              <Select 
                value={calculatorCarrier}
                onValueChange={setCalculatorCarrier}
              >
                <SelectTrigger id="calcCarrier">
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {partners.filter(p => p.status === 'active').map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted p-4 rounded-md">
              <div className="text-sm text-muted-foreground">Estimated Shipping Cost</div>
              <div className="text-2xl font-bold mt-1">
                ${calculateShippingCost().toFixed(2)}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsShippingCalculatorOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Logistics;
