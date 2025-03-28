
import React, { useState } from 'react';
import { 
  Shield,
  AlertTriangle,
  Lock,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  BarChart3,
  Flag,
  RefreshCw,
  FileText,
  ToggleLeft,
  ToggleRight
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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';

// Mock data for security alerts
const securityAlerts = [
  {
    id: '1',
    type: 'suspicious_login',
    severity: 'high',
    message: 'Multiple failed login attempts detected',
    user: { id: '101', name: 'John Smith', email: 'john.smith@example.com' },
    ip: '192.168.1.45',
    timestamp: '2023-10-15T14:23:12',
    status: 'active'
  },
  {
    id: '2',
    type: 'unusual_activity',
    severity: 'medium',
    message: 'Unusual account activity detected',
    user: { id: '102', name: 'Jane Cooper', email: 'jane.cooper@example.com' },
    ip: '45.67.89.123',
    timestamp: '2023-10-14T08:45:30',
    status: 'active'
  },
  {
    id: '3',
    type: 'fraud_attempt',
    severity: 'high',
    message: 'Possible payment fraud detected',
    user: { id: '103', name: 'Michael Johnson', email: 'michael.j@example.com' },
    ip: '209.85.231.104',
    timestamp: '2023-10-13T18:12:45',
    status: 'resolved'
  },
  {
    id: '4',
    type: 'policy_violation',
    severity: 'low',
    message: 'Content policy violation in product description',
    user: { id: '104', name: 'Sarah Williams', email: 'sarah.w@example.com' },
    ip: '172.16.254.1',
    timestamp: '2023-10-12T11:30:18',
    status: 'active'
  },
  {
    id: '5',
    type: 'api_abuse',
    severity: 'medium',
    message: 'Excessive API calls detected',
    user: { id: '105', name: 'Tech Solutions', email: 'admin@techsolutions.com' },
    ip: '8.8.8.8',
    timestamp: '2023-10-11T09:15:40',
    status: 'resolved'
  },
];

// Mock data for review authenticity
const reviewsData = [
  {
    id: '1',
    product: { id: 'p101', name: 'Handmade Ceramic Bowl' },
    user: { id: 'u201', name: 'Alice Johnson' },
    rating: 5,
    content: 'Absolutely beautiful craftsmanship! This bowl is even better in person.',
    date: '2023-10-10',
    flags: 0,
    authenticity: 'verified'
  },
  {
    id: '2',
    product: { id: 'p102', name: 'Hand-woven Textile Wall Hanging' },
    user: { id: 'u202', name: 'Bob Smith' },
    rating: 1,
    content: 'Terrible quality. Nothing like the photos. Avoid this seller!',
    date: '2023-10-09',
    flags: 3,
    authenticity: 'suspicious'
  },
  {
    id: '3',
    product: { id: 'p103', name: 'Artisan Silver Earrings' },
    user: { id: 'u203', name: 'Catherine Lee' },
    rating: 5,
    content: 'Love these earrings! Perfect for any occasion and very well made.',
    date: '2023-10-08',
    flags: 2,
    authenticity: 'suspicious'
  },
  {
    id: '4',
    product: { id: 'p104', name: 'Organic Herb Bath Salts' },
    user: { id: 'u204', name: 'David Wilson' },
    rating: 4,
    content: 'Very relaxing bath salts with great scent. Would order again.',
    date: '2023-10-07',
    flags: 0,
    authenticity: 'verified'
  },
  {
    id: '5',
    product: { id: 'p105', name: 'Wooden Cutting Board' },
    user: { id: 'u205', name: 'Emma Harris' },
    rating: 5,
    content: 'This is my third purchase from this seller. Amazing quality as always!',
    date: '2023-10-06',
    flags: 0,
    authenticity: 'verified'
  },
];

// Mock data for compliance settings
const complianceSettings = [
  {
    id: 'gdpr',
    name: 'GDPR Compliance',
    description: 'Data protection and privacy for EU citizens',
    enabled: true,
    lastUpdated: '2023-09-15'
  },
  {
    id: 'ccpa',
    name: 'CCPA Compliance',
    description: 'California Consumer Privacy Act settings',
    enabled: true,
    lastUpdated: '2023-09-10'
  },
  {
    id: 'pci',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    enabled: true,
    lastUpdated: '2023-08-22'
  },
  {
    id: 'age_verification',
    name: 'Age Verification',
    description: 'Age verification for restricted products',
    enabled: false,
    lastUpdated: '2023-07-30'
  },
  {
    id: 'content_filtering',
    name: 'Content Filtering',
    description: 'Filter inappropriate content and language',
    enabled: true,
    lastUpdated: '2023-09-28'
  },
  {
    id: 'secure_checkout',
    name: 'Secure Checkout',
    description: 'Enhanced security measures for checkout process',
    enabled: true,
    lastUpdated: '2023-09-18'
  },
];

// Security score data
const securityScoreData = {
  overall: 82,
  categories: [
    { name: 'Authentication', score: 90 },
    { name: 'Data Protection', score: 85 },
    { name: 'Fraud Prevention', score: 75 },
    { name: 'Compliance', score: 80 },
    { name: 'Content Safety', score: 78 },
  ]
};

const SecurityCompliance = () => {
  const [alerts, setAlerts] = useState(securityAlerts);
  const [reviews, setReviews] = useState(reviewsData);
  const [settings, setSettings] = useState(complianceSettings);
  const [securityScore, setSecurityScore] = useState(securityScoreData);
  
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isAlertDetailsOpen, setIsAlertDetailsOpen] = useState(false);
  const [isReviewDetailsOpen, setIsReviewDetailsOpen] = useState(false);

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleAlertStatusChange = (alertId: string, newStatus: string) => {
    setAlerts(alerts.map(alert => {
      if (alert.id === alertId) {
        return { ...alert, status: newStatus };
      }
      return alert;
    }));

    toast({
      title: "Alert Updated",
      description: `Alert status changed to ${newStatus}.`,
    });
  };

  const handleReviewAuthenticity = (reviewId: string, authenticity: string) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return { ...review, authenticity };
      }
      return review;
    }));

    toast({
      title: "Review Updated",
      description: `Review marked as ${authenticity}.`,
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
    
    toast({
      title: "Review Deleted",
      description: "Review has been deleted successfully.",
      variant: "destructive",
    });
  };

  const handleToggleSetting = (settingId: string) => {
    setSettings(settings.map(setting => {
      if (setting.id === settingId) {
        return { 
          ...setting, 
          enabled: !setting.enabled,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return setting;
    }));

    const setting = settings.find(s => s.id === settingId);
    
    toast({
      title: setting?.name,
      description: `${setting?.name} has been ${setting?.enabled ? 'disabled' : 'enabled'}.`,
    });
  };

  const refreshSecurityScore = () => {
    // In a real application, this would call an API to recalculate the score
    toast({
      title: "Security Score Refreshed",
      description: "Security assessment has been updated.",
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="text-red-500 border-red-500">Active</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Investigating</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAuthenticityBadge = (authenticity: string) => {
    switch (authenticity) {
      case 'verified':
        return <Badge className="bg-green-500">Verified</Badge>;
      case 'suspicious':
        return <Badge variant="outline" className="text-red-500 border-red-500">Suspicious</Badge>;
      default:
        return <Badge variant="outline">{authenticity}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Security Overview</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="reviews">Review Authenticity</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Security Score</CardTitle>
                <CardDescription>Overall platform security assessment</CardDescription>
              </div>
              <Button variant="outline" onClick={refreshSecurityScore}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-2 mb-6">
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-muted">
                  <div className={`text-4xl font-bold ${getScoreColor(securityScore.overall)}`}>
                    {securityScore.overall}
                  </div>
                  <div className="absolute -bottom-2 bg-background px-2 text-sm font-medium">
                    out of 100
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {securityScore.categories.map((category) => (
                  <div key={category.name} className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{category.name}</span>
                      <span className={getScoreColor(category.score)}>{category.score}/100</span>
                    </div>
                    <Progress value={category.score} className={getProgressColor(category.score)} />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Last updated: Today at 09:15 AM
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Two-factor authentication</span>
                    <Badge className="bg-green-500">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Password policy</span>
                    <Badge className="bg-green-500">Strong</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Social logins</span>
                    <Badge variant="outline">Limited</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-indigo-500" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Encryption at rest</span>
                    <Badge className="bg-green-500">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>TLS/SSL</span>
                    <Badge className="bg-green-500">v1.3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data retention</span>
                    <Badge variant="outline">Compliant</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  Active Threats
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>High severity alerts</span>
                    <Badge variant="destructive">2</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Medium severity alerts</span>
                    <Badge variant="outline" className="text-amber-500 border-amber-500">3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Low severity alerts</span>
                    <Badge variant="outline" className="text-blue-500 border-blue-500">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Monitor and respond to security threats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative w-full sm:w-auto flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search alerts..."
                      className="pl-8 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="w-full sm:w-[130px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Severities</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[130px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alert</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No alerts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>
                            <div className="font-medium">{alert.message}</div>
                            <div className="text-xs text-muted-foreground">
                              {alert.type.replace('_', ' ')}
                            </div>
                          </TableCell>
                          <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                          <TableCell>
                            <div>{alert.user.name}</div>
                            <div className="text-xs text-muted-foreground">{alert.user.email}</div>
                          </TableCell>
                          <TableCell>{getStatusBadge(alert.status)}</TableCell>
                          <TableCell>
                            {new Date(alert.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {alert.status === 'active' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-amber-500 border-amber-500"
                                  onClick={() => handleAlertStatusChange(alert.id, 'investigating')}
                                >
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  Investigate
                                </Button>
                              )}
                              {(alert.status === 'active' || alert.status === 'investigating') && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-green-500 border-green-500"
                                  onClick={() => handleAlertStatusChange(alert.id, 'resolved')}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Resolve
                                </Button>
                              )}
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAlert(alert);
                                  setIsAlertDetailsOpen(true);
                                }}
                              >
                                Details
                              </Button>
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
        
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Authenticity</CardTitle>
              <CardDescription>Validate and manage product reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative w-full sm:w-auto flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reviews..."
                      className="pl-8 w-full"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">All Reviews</SelectItem>
                          <SelectItem value="flagged">Flagged</SelectItem>
                          <SelectItem value="suspicious">Suspicious</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Review</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div className="font-medium">{review.user.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{review.content}</div>
                          <div className="text-xs text-muted-foreground">{review.date}</div>
                        </TableCell>
                        <TableCell>{review.product.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={review.rating >= 3 ? 'text-amber-500' : 'text-red-500'}>
                              {review.rating}/5
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {review.flags > 0 ? (
                            <Badge variant="outline" className="text-red-500 border-red-500">
                              <Flag className="h-3 w-3 mr-1" />
                              {review.flags}
                            </Badge>
                          ) : (
                            <div className="text-sm text-muted-foreground">None</div>
                          )}
                        </TableCell>
                        <TableCell>{getAuthenticityBadge(review.authenticity)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedReview(review);
                                setIsReviewDetailsOpen(true);
                              }}
                            >
                              Details
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleReviewAuthenticity(review.id, 'verified')}
                                  className="text-green-500"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Verify Review
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleReviewAuthenticity(review.id, 'suspicious')}
                                  className="text-red-500"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Mark as Suspicious
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="text-red-500"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Delete Review
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Settings</CardTitle>
              <CardDescription>Manage regulatory compliance settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {settings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-base font-medium">{setting.name}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                      <div className="text-xs text-muted-foreground">
                        Last updated: {setting.lastUpdated}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Switch
                        id={setting.id}
                        checked={setting.enabled}
                        onCheckedChange={() => handleToggleSetting(setting.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Compliance Documentation</CardTitle>
              <CardDescription>Access compliance policies and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Privacy Policy', updated: '2023-10-01', type: 'pdf' },
                  { name: 'Terms of Service', updated: '2023-09-15', type: 'pdf' },
                  { name: 'GDPR Compliance Guide', updated: '2023-08-22', type: 'doc' },
                  { name: 'Data Protection Policy', updated: '2023-09-30', type: 'pdf' },
                ].map((doc, idx) => (
                  <Button key={idx} variant="outline" className="h-auto justify-start p-4 flex-col items-start gap-1">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                      <span className="text-xs font-normal px-2 py-1 rounded-full bg-muted">
                        {doc.type.toUpperCase()}
                      </span>
                    </div>
                    <span className="w-full text-xs text-muted-foreground text-left mt-1">
                      Updated: {doc.updated}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Details Dialog */}
      <Dialog open={isAlertDetailsOpen} onOpenChange={setIsAlertDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Security Alert Details</DialogTitle>
            <DialogDescription>Detailed information about this security alert</DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Alert ID</div>
                  <div className="text-sm">{selectedAlert.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Type</div>
                  <div className="text-sm capitalize">{selectedAlert.type.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Severity</div>
                  <div className="text-sm">{getSeverityBadge(selectedAlert.severity)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="text-sm">{getStatusBadge(selectedAlert.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Timestamp</div>
                  <div className="text-sm">
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">IP Address</div>
                  <div className="text-sm">{selectedAlert.ip}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Message</div>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {selectedAlert.message}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">User</div>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium">{selectedAlert.user.name}</div>
                  <div className="text-sm">{selectedAlert.user.email}</div>
                  <div className="text-xs text-muted-foreground">ID: {selectedAlert.user.id}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Recommended Action</div>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {selectedAlert.severity === 'high' ? (
                    "Immediate investigation required. Consider temporary account suspension pending review."
                  ) : selectedAlert.severity === 'medium' ? (
                    "Investigate within 24 hours. Monitor account activity closely."
                  ) : (
                    "Review when convenient. No immediate action required."
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAlertDetailsOpen(false)}>
              Close
            </Button>
            {selectedAlert && selectedAlert.status === 'active' && (
              <>
                <Button 
                  variant="outline" 
                  className="text-amber-500 border-amber-500"
                  onClick={() => {
                    handleAlertStatusChange(selectedAlert.id, 'investigating');
                    setIsAlertDetailsOpen(false);
                  }}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Investigate
                </Button>
                <Button 
                  variant="outline" 
                  className="text-green-500 border-green-500"
                  onClick={() => {
                    handleAlertStatusChange(selectedAlert.id, 'resolved');
                    setIsAlertDetailsOpen(false);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Details Dialog */}
      <Dialog open={isReviewDetailsOpen} onOpenChange={setIsReviewDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>Detailed information about this review</DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Reviewer</div>
                  <div className="text-sm">{selectedReview.user.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Date</div>
                  <div className="text-sm">{selectedReview.date}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Rating</div>
                  <div className="text-sm">{selectedReview.rating}/5</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="text-sm">{getAuthenticityBadge(selectedReview.authenticity)}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Product</div>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  <div className="font-medium">{selectedReview.product.name}</div>
                  <div className="text-xs text-muted-foreground">ID: {selectedReview.product.id}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Review Content</div>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {selectedReview.content}
                </div>
              </div>
              
              {selectedReview.flags > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Flag Reasons</div>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                    <ul className="list-disc pl-5">
                      <li>Suspicious review pattern</li>
                      <li>Conflicting with verified purchases</li>
                      {selectedReview.flags > 2 && <li>Excessive praise/criticism</li>}
                    </ul>
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Authenticity Check</div>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  <div className="flex items-center justify-between">
                    <span>User has verified purchase</span>
                    <Badge variant={selectedReview.authenticity === 'verified' ? 'default' : 'outline'}>
                      {selectedReview.authenticity === 'verified' ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span>Account age</span>
                    <Badge variant="outline">6 months</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span>Previous reviews</span>
                    <Badge variant="outline">4</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsReviewDetailsOpen(false)}>
              Close
            </Button>
            {selectedReview && (
              <>
                <Button 
                  variant="outline" 
                  className="text-green-500 border-green-500"
                  onClick={() => {
                    handleReviewAuthenticity(selectedReview.id, 'verified');
                    setIsReviewDetailsOpen(false);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Verify
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-500 border-red-500"
                  onClick={() => {
                    handleReviewAuthenticity(selectedReview.id, 'suspicious');
                    setIsReviewDetailsOpen(false);
                  }}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Flag
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityCompliance;
